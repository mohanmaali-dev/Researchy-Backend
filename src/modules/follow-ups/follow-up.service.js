import mongoose from 'mongoose';

import { Business } from '../businesses/business.model.js';
import { Conversation } from '../conversations/conversation.model.js';
import { Opportunity } from '../opportunities/opportunity.model.js';
import {
  FollowUp,
  FOLLOW_UP_STATUSES,
  getStartOfTodayUtc,
  isFollowUpOverdue,
} from './follow-up.model.js';

const FOLLOW_UP_FIELDS = [
  'business',
  'conversation',
  'opportunity',
  'followUpDate',
  'reason',
  'notes',
  'status',
];

const POPULATE_OPTIONS = [
  { path: 'business', select: 'companyName' },
  { path: 'conversation', select: 'conversationDate personName personRole' },
  {
    path: 'opportunity',
    select: 'problem opportunityScore validationStatus',
    populate: { path: 'problem', select: 'title' },
  },
];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureValidId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError(`Invalid ${label} ID`, 400);
  }
};

const cleanFollowUpData = (data) =>
  FOLLOW_UP_FIELDS.reduce((cleaned, field) => {
    if (data[field] !== undefined) {
      if (['conversation', 'opportunity'].includes(field) && data[field] === '') {
        cleaned[field] = null;
      } else {
        cleaned[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
      }
    }

    return cleaned;
  }, {});

const validateFollowUpData = (data, isCreating = false) => {
  if (isCreating) {
    for (const field of ['business', 'followUpDate', 'reason', 'status']) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        throw createError(`${field} is required`, 400);
      }
    }
  }

  if (data.reason !== undefined && !data.reason) {
    throw createError('Reason/title is required', 400);
  }

  if (data.followUpDate !== undefined) {
    const date = new Date(data.followUpDate);

    if (Number.isNaN(date.getTime())) {
      throw createError('Follow-up date must be a valid date', 400);
    }
  }

  if (data.status !== undefined && !FOLLOW_UP_STATUSES.includes(data.status)) {
    throw createError('Invalid follow-up status', 400);
  }
};

const validateRelationships = async ({ business, conversation, opportunity }) => {
  ensureValidId(business, 'business');
  if (conversation) ensureValidId(conversation, 'conversation');
  if (opportunity) ensureValidId(opportunity, 'opportunity');

  const [businessExists, conversationRecord, opportunityRecord] = await Promise.all([
    Business.exists({ _id: business }),
    conversation ? Conversation.findById(conversation).select('business').lean() : null,
    opportunity ? Opportunity.findById(opportunity).select('business').lean() : null,
  ]);

  if (!businessExists) {
    throw createError('Business not found', 404);
  }

  if (conversation && !conversationRecord) {
    throw createError('Conversation not found', 404);
  }

  if (opportunity && !opportunityRecord) {
    throw createError('Opportunity not found', 404);
  }

  if (conversationRecord && conversationRecord.business.toString() !== business.toString()) {
    throw createError('Selected Conversation does not belong to the selected Business', 400);
  }

  if (opportunityRecord && opportunityRecord.business.toString() !== business.toString()) {
    throw createError('Selected Opportunity does not belong to the selected Business', 400);
  }
};

const applyStatusDates = (followUp, previousStatus) => {
  if (followUp.status === 'Completed') {
    if (previousStatus !== 'Completed' || !followUp.completedAt) {
      followUp.completedAt = new Date();
    }
  } else {
    followUp.completedAt = null;
  }
};

const toFollowUpResponse = (followUp) => {
  const value = followUp.toObject ? followUp.toObject() : followUp;
  return { ...value, isOverdue: isFollowUpOverdue(value) };
};

const getFollowUpDocument = async (followUpId) => {
  ensureValidId(followUpId, 'follow-up');
  const followUp = await FollowUp.findById(followUpId);

  if (!followUp) {
    throw createError('Follow-up not found', 404);
  }

  return followUp;
};

export const createFollowUp = async (data) => {
  const cleanedData = cleanFollowUpData(data);
  validateFollowUpData(cleanedData, true);
  await validateRelationships(cleanedData);

  const followUp = new FollowUp(cleanedData);
  applyStatusDates(followUp);
  await followUp.save();
  await followUp.populate(POPULATE_OPTIONS);

  return toFollowUpResponse(followUp);
};

export const getFollowUps = async ({
  status,
  businessId,
  opportunityId,
  upcoming = false,
  limit,
} = {}) => {
  const filters = {};
  const today = getStartOfTodayUtc();

  if (status && ![...FOLLOW_UP_STATUSES, 'Overdue'].includes(status)) {
    throw createError('Invalid follow-up filter', 400);
  }

  if (businessId) {
    ensureValidId(businessId, 'business');
    filters.business = businessId;
  }

  if (opportunityId) {
    ensureValidId(opportunityId, 'opportunity');
    filters.opportunity = opportunityId;
  }

  if (upcoming) {
    filters.status = 'Pending';
    filters.followUpDate = { $gte: today };
  } else if (status === 'Overdue') {
    filters.status = 'Pending';
    filters.followUpDate = { $lt: today };
  } else if (status) {
    filters.status = status;
  }

  const query = FollowUp.find(filters)
    .sort({ followUpDate: 1, createdAt: 1 })
    .populate(POPULATE_OPTIONS);
  if (limit) query.limit(limit);

  const followUps = await query;

  return followUps.map(toFollowUpResponse);
};

export const getUpcomingFollowUps = (limit) => getFollowUps({ upcoming: true, limit });

export const getFollowUpById = async (followUpId) => {
  const followUp = await getFollowUpDocument(followUpId);
  await followUp.populate(POPULATE_OPTIONS);
  return toFollowUpResponse(followUp);
};

export const updateFollowUp = async (followUpId, data) => {
  const followUp = await getFollowUpDocument(followUpId);
  const cleanedData = cleanFollowUpData(data);

  if (Object.keys(cleanedData).length === 0) {
    throw createError('Provide at least one follow-up field to update', 400);
  }

  validateFollowUpData(cleanedData);
  const previousStatus = followUp.status;

  for (const [field, value] of Object.entries(cleanedData)) {
    followUp[field] = value;
  }

  validateFollowUpData(followUp.toObject(), true);
  await validateRelationships(followUp);
  applyStatusDates(followUp, previousStatus);
  await followUp.save();
  await followUp.populate(POPULATE_OPTIONS);

  return toFollowUpResponse(followUp);
};

export const completeFollowUp = async (followUpId) => {
  const followUp = await getFollowUpDocument(followUpId);
  const previousStatus = followUp.status;
  followUp.status = 'Completed';
  applyStatusDates(followUp, previousStatus);
  await followUp.save();
  await followUp.populate(POPULATE_OPTIONS);
  return toFollowUpResponse(followUp);
};

export const reopenFollowUp = async (followUpId) => {
  const followUp = await getFollowUpDocument(followUpId);
  followUp.status = 'Pending';
  applyStatusDates(followUp);
  await followUp.save();
  await followUp.populate(POPULATE_OPTIONS);
  return toFollowUpResponse(followUp);
};

export const deleteFollowUp = async (followUpId) => {
  ensureValidId(followUpId, 'follow-up');
  const followUp = await FollowUp.findByIdAndDelete(followUpId);

  if (!followUp) {
    throw createError('Follow-up not found', 404);
  }
};
