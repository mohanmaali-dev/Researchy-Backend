import fs from 'node:fs/promises';
import path from 'node:path';

import mongoose from 'mongoose';

import { Note } from './note.model.js';

const NOTE_FIELDS = ['title', 'content', 'tags', 'isPinned', 'isArchived', 'image'];
const DEFAULT_PAGE_SIZE = 30;
const MAXIMUM_PAGE_SIZE = 100;

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureValidId = (noteId) => {
  if (!mongoose.isValidObjectId(noteId)) throw createError('Invalid note ID', 400);
};

const removeImage = async (image) => {
  if (!image) return;
  try {
    await fs.unlink(path.join(process.cwd(), image));
  } catch {
    // Legacy uploaded images may not exist after a deployment.
  }
};

const escapeRegularExpression = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePositiveInteger = (value, fallback, field) => {
  if (value === undefined || value === '') return fallback;
  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw createError(`${field} must be a positive integer`, 400);
  }
  return parsedValue;
};

const normalizeTags = (tags) => {
  if (tags === undefined) return undefined;
  if (!Array.isArray(tags)) throw createError('Tags must be a list', 400);

  const uniqueTags = new Map();
  tags.forEach((tag) => {
    if (typeof tag !== 'string') throw createError('Every tag must be text', 400);
    const cleanedTag = tag.trim().replace(/\s+/g, ' ');
    if (!cleanedTag) return;
    if (cleanedTag.length > 40) throw createError('Tags cannot exceed 40 characters', 400);
    const normalizedTag = cleanedTag.toLocaleLowerCase();
    if (!uniqueTags.has(normalizedTag)) uniqueTags.set(normalizedTag, cleanedTag);
  });

  const normalizedTags = [...uniqueTags.values()];
  if (normalizedTags.length > 20) throw createError('A note cannot have more than 20 tags', 400);
  return normalizedTags;
};

const cleanNoteData = (data) => {
  const cleanedData = NOTE_FIELDS.reduce((cleaned, field) => {
    if (data[field] === undefined) return cleaned;
    cleaned[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
    return cleaned;
  }, {});
  if (cleanedData.tags !== undefined) cleanedData.tags = normalizeTags(cleanedData.tags);
  return cleanedData;
};

const validateNoteData = (data, isCreating = false) => {
  if (isCreating && !data.title) throw createError('Note title is required', 400);
  if (data.title !== undefined && !data.title) throw createError('Note title is required', 400);
  if (data.title?.length > 200) throw createError('Note title cannot exceed 200 characters', 400);
  if (data.content?.length > 50000)
    throw createError('Note content cannot exceed 50000 characters', 400);
  if (data.isPinned !== undefined && typeof data.isPinned !== 'boolean') {
    throw createError('Pinned must be true or false', 400);
  }
  if (data.isArchived !== undefined && typeof data.isArchived !== 'boolean') {
    throw createError('Archived must be true or false', 400);
  }
};

export const createNote = async (userId, data) => {
  const cleanedData = cleanNoteData(data);
  validateNoteData(cleanedData, true);
  if (cleanedData.isArchived) cleanedData.archivedAt = new Date();
  return Note.create({ user: userId, ...cleanedData });
};

export const getNotes = async (userId, options = {}) => {
  const page = parsePositiveInteger(options.page, 1, 'Page');
  const requestedLimit = parsePositiveInteger(options.limit, DEFAULT_PAGE_SIZE, 'Limit');
  const limit = Math.min(requestedLimit, MAXIMUM_PAGE_SIZE);
  const search = typeof options.search === 'string' ? options.search.trim() : '';
  const status = typeof options.status === 'string' ? options.status.trim() : 'Active';
  const filter = { user: userId };

  if (!['Active', 'Archived', 'All'].includes(status)) {
    throw createError('Note status must be Active, Archived, or All', 400);
  }
  if (status !== 'All') filter.isArchived = status === 'Archived';

  if (search) {
    const expression = new RegExp(escapeRegularExpression(search), 'i');
    filter.$or = [{ title: expression }, { content: expression }, { tags: expression }];
  }

  const [notes, totalItems] = await Promise.all([
    Note.find(filter)
      .select('title content tags isPinned isArchived archivedAt image createdAt updatedAt')
      .sort({ isPinned: -1, updatedAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Note.countDocuments(filter),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    notes,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
};

export const getNoteById = async (userId, noteId) => {
  ensureValidId(noteId);
  const note = await Note.findOne({ _id: noteId, user: userId }).lean();
  if (!note) throw createError('Note not found', 404);
  return note;
};

export const updateNote = async (userId, noteId, data) => {
  ensureValidId(noteId);
  const cleanedData = cleanNoteData(data);
  if (!Object.keys(cleanedData).length) {
    throw createError('Provide at least one note field to update', 400);
  }
  validateNoteData(cleanedData);

  const note = await Note.findOne({ _id: noteId, user: userId });
  if (!note) throw createError('Note not found', 404);

  if (cleanedData.image && cleanedData.image !== note.image) await removeImage(note.image);
  Object.assign(note, cleanedData);
  if (cleanedData.isArchived !== undefined) {
    note.archivedAt = cleanedData.isArchived ? new Date() : null;
    if (cleanedData.isArchived) note.isPinned = false;
  }

  await note.save();
  return note;
};

export const deleteNote = async (userId, noteId) => {
  ensureValidId(noteId);
  const note = await Note.findOneAndDelete({ _id: noteId, user: userId });
  if (!note) throw createError('Note not found', 404);
  await removeImage(note.image);
};
