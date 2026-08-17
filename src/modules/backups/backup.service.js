import mongoose from 'mongoose';

import { Business } from '../businesses/business.model.js';
import { Contact } from '../contacts/contact.model.js';
import { Conversation } from '../conversations/conversation.model.js';
import { FollowUp } from '../follow-ups/follow-up.model.js';
import { LearningEntry } from '../learning/learning-entry.model.js';
import { LearningPractice } from '../learning/learning-practice.model.js';
import { LearningQuestion } from '../learning/learning-question.model.js';
import { LearningResource } from '../learning/learning-resource.model.js';
import { LearningTopic } from '../learning/learning-topic.model.js';
import { Note } from '../notes/note.model.js';
import { Opportunity } from '../opportunities/opportunity.model.js';
import { Problem } from '../problems/problem.model.js';

export const BACKUP_FORMAT = '3v-workspace-backup';
export const BACKUP_VERSION = 1;

const MAXIMUM_RECORDS_PER_COLLECTION = 10000;

const collections = [
  { key: 'businesses', model: Business },
  { key: 'contacts', model: Contact },
  { key: 'conversations', model: Conversation },
  { key: 'problems', model: Problem },
  { key: 'opportunities', model: Opportunity },
  { key: 'followUps', model: FollowUp },
  { key: 'learningTopics', model: LearningTopic },
  { key: 'learningEntries', model: LearningEntry },
  { key: 'learningResources', model: LearningResource },
  { key: 'learningPractices', model: LearningPractice },
  { key: 'learningQuestions', model: LearningQuestion },
  { key: 'notes', model: Note, privateToUser: true },
];

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureBackupShape = (backup) => {
  if (!backup || typeof backup !== 'object' || Array.isArray(backup)) {
    throw createError('Choose a valid 3V Workspace backup file');
  }

  if (backup.format !== BACKUP_FORMAT || backup.version !== BACKUP_VERSION) {
    throw createError('This backup format or version is not supported');
  }

  if (!backup.data || typeof backup.data !== 'object' || Array.isArray(backup.data)) {
    throw createError('The backup does not contain workspace data');
  }
};

const validateCollection = async ({ key, model, privateToUser }, data, userId) => {
  const records = data[key] ?? [];
  if (!Array.isArray(records)) throw createError(`Backup collection "${key}" must be a list`);
  if (records.length > MAXIMUM_RECORDS_PER_COLLECTION) {
    throw createError(`Backup collection "${key}" is too large`);
  }

  const validatedRecords = [];
  const recordIds = new Set();
  for (const record of records) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      throw createError(`Backup collection "${key}" contains an invalid record`);
    }
    if (!mongoose.isValidObjectId(record._id)) {
      throw createError(`Backup collection "${key}" contains an invalid record ID`);
    }
    const recordId = String(record._id);
    if (recordIds.has(recordId)) {
      throw createError(`Backup collection "${key}" contains a duplicate record ID`);
    }
    recordIds.add(recordId);

    const safeRecord = privateToUser ? { ...record, user: userId } : record;
    const document = new model(safeRecord);
    await document.validate();
    validatedRecords.push(document.toObject({ depopulate: true, versionKey: false }));
  }

  return validatedRecords;
};

export const createBackup = async (userId) => {
  const dataEntries = await Promise.all(
    collections.map(async ({ key, model, privateToUser }) => {
      const filter = privateToUser ? { user: userId } : {};
      let records = await model.find(filter).sort({ _id: 1 }).lean();
      if (privateToUser) {
        records = records.map(({ user: _user, ...record }) => record);
      }
      return [key, records];
    }),
  );
  const data = Object.fromEntries(dataEntries);

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    data,
    summary: Object.fromEntries(
      Object.entries(data).map(([key, records]) => [key, records.length]),
    ),
  };
};

export const restoreBackup = async (backup, userId) => {
  ensureBackupShape(backup);

  const validatedCollections = {};
  for (const collection of collections) {
    validatedCollections[collection.key] = await validateCollection(
      collection,
      backup.data,
      userId,
    );
  }

  for (const { key, model, privateToUser } of collections) {
    const records = validatedCollections[key];
    if (!records.length) continue;

    const operations = records.map((record) => ({
      replaceOne: {
        filter: privateToUser ? { _id: record._id, user: userId } : { _id: record._id },
        replacement: record,
        upsert: true,
      },
    }));
    await model.bulkWrite(operations, { ordered: true, timestamps: false });
  }

  return {
    restoredAt: new Date().toISOString(),
    counts: Object.fromEntries(
      Object.entries(validatedCollections).map(([key, records]) => [key, records.length]),
    ),
  };
};
