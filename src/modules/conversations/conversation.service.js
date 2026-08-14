import mongoose from 'mongoose';

import { Business } from '../businesses/business.model.js';
import { Conversation } from './conversation.model.js';

const CONVERSATION_FIELDS = [
  'conversationDate',
  'personName',
  'personRole',
  'rawConversationNotes',
  'importantObservations',
  'followUpNotes',
];

const REQUIRED_FIELDS = ['conversationDate', 'personName', 'personRole', 'rawConversationNotes'];

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

const cleanConversationData = (data) =>
  CONVERSATION_FIELDS.reduce((cleaned, field) => {
    if (data[field] !== undefined) {
      cleaned[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
    }

    return cleaned;
  }, {});

const validateConversationData = (data, isCreating = false) => {
  if (isCreating) {
    const missingField = REQUIRED_FIELDS.find(
      (field) => data[field] === undefined || data[field] === '',
    );

    if (missingField) {
      throw createError(`${missingField} is required`, 400);
    }
  }

  for (const field of REQUIRED_FIELDS.filter((item) => item !== 'conversationDate')) {
    if (data[field] !== undefined && data[field] === '') {
      throw createError(`${field} is required`, 400);
    }
  }

  if (data.conversationDate !== undefined) {
    const date = new Date(data.conversationDate);

    if (Number.isNaN(date.getTime())) {
      throw createError('Conversation/visit date must be a valid date', 400);
    }
  }
};

const ensureBusinessExists = async (businessId) => {
  ensureValidId(businessId, 'business');

  if (!(await Business.exists({ _id: businessId }))) {
    throw createError('Business not found', 404);
  }
};

export const createConversation = async (data) => {
  if (!data.business) {
    throw createError('Business is required', 400);
  }

  ensureValidId(data.business, 'business');
  const cleanedData = cleanConversationData(data);
  validateConversationData(cleanedData, true);
  await ensureBusinessExists(data.business);

  const conversation = await Conversation.create({
    ...cleanedData,
    business: data.business,
  });

  return conversation.populate('business', 'companyName');
};

export const getConversationsByBusiness = async (businessId) => {
  await ensureBusinessExists(businessId);

  return Conversation.find({ business: businessId })
    .sort({ conversationDate: -1, createdAt: -1 })
    .populate('business', 'companyName')
    .lean();
};

export const getConversationById = async (conversationId) => {
  ensureValidId(conversationId, 'conversation');
  const conversation = await Conversation.findById(conversationId)
    .populate('business', 'companyName')
    .lean();

  if (!conversation) {
    throw createError('Conversation not found', 404);
  }

  return conversation;
};

export const updateConversation = async (conversationId, data) => {
  ensureValidId(conversationId, 'conversation');
  const cleanedData = cleanConversationData(data);

  if (Object.keys(cleanedData).length === 0) {
    throw createError('Provide at least one conversation field to update', 400);
  }

  validateConversationData(cleanedData);

  const conversation = await Conversation.findByIdAndUpdate(conversationId, cleanedData, {
    new: true,
    runValidators: true,
  }).populate('business', 'companyName');

  if (!conversation) {
    throw createError('Conversation not found', 404);
  }

  return conversation;
};

export const deleteConversation = async (conversationId) => {
  ensureValidId(conversationId, 'conversation');
  const conversation = await Conversation.findByIdAndDelete(conversationId);

  if (!conversation) {
    throw createError('Conversation not found', 404);
  }
};
