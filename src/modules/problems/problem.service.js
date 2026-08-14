import mongoose from 'mongoose';

import { Business } from '../businesses/business.model.js';
import { Conversation } from '../conversations/conversation.model.js';
import {
  normalizeProblemTitle,
  normalizeTag,
  normalizeTags,
  Problem,
  PROBLEM_STATUSES,
  WILLINGNESS_TO_PAY_OPTIONS,
} from './problem.model.js';

const PROBLEM_FIELDS = [
  'title',
  'description',
  'currentProcess',
  'frequency',
  'painLevel',
  'timeImpact',
  'financialImpact',
  'existingSoftware',
  'willingnessToPay',
  'notes',
  'status',
  'tags',
];

const REQUIRED_FIELDS = [
  'title',
  'description',
  'currentProcess',
  'frequency',
  'painLevel',
  'timeImpact',
  'willingnessToPay',
  'status',
];

const POPULATE_OPTIONS = [
  { path: 'business', select: 'companyName' },
  { path: 'conversation', select: 'conversationDate personName personRole' },
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

const cleanProblemData = (data) =>
  PROBLEM_FIELDS.reduce((cleaned, field) => {
    if (data[field] !== undefined) {
      if (field === 'tags') {
        cleaned.tags =
          Array.isArray(data.tags) && data.tags.every((tag) => typeof tag === 'string')
            ? normalizeTags(data.tags)
            : data.tags;
      } else {
        cleaned[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
      }
    }

    if (field === 'title' && cleaned.title !== undefined) {
      cleaned.normalizedTitle = normalizeProblemTitle(cleaned.title);
    }

    return cleaned;
  }, {});

const validateProblemData = (data, isCreating = false) => {
  if (isCreating) {
    const missingField = REQUIRED_FIELDS.find(
      (field) => data[field] === undefined || data[field] === null || data[field] === '',
    );

    if (missingField) {
      throw createError(`${missingField} is required`, 400);
    }
  }

  for (const field of REQUIRED_FIELDS.filter(
    (item) => item !== 'painLevel' && item !== 'willingnessToPay' && item !== 'status',
  )) {
    if (data[field] !== undefined && data[field] === '') {
      throw createError(`${field} is required`, 400);
    }
  }

  if (
    data.painLevel !== undefined &&
    (!Number.isInteger(data.painLevel) || data.painLevel < 1 || data.painLevel > 10)
  ) {
    throw createError('Pain level must be a whole number from 1 to 10', 400);
  }

  if (
    data.willingnessToPay !== undefined &&
    !WILLINGNESS_TO_PAY_OPTIONS.includes(data.willingnessToPay)
  ) {
    throw createError('Invalid willingness to pay', 400);
  }

  if (data.status !== undefined && !PROBLEM_STATUSES.includes(data.status)) {
    throw createError('Invalid problem status', 400);
  }

  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      throw createError('Tags must be an array', 400);
    }

    if (data.tags.length > 20) {
      throw createError('A problem cannot have more than 20 tags', 400);
    }

    if (data.tags.some((tag) => typeof tag !== 'string' || tag.length > 50)) {
      throw createError('Each tag must be text no longer than 50 characters', 400);
    }
  }
};

const normalizedTitleExpression = {
  $ifNull: [
    '$normalizedTitle',
    {
      $toLower: {
        $trim: { input: '$title' },
      },
    },
  ],
};

const patternProjection = (type) => ({
  $project: {
    _id: 0,
    type: { $literal: type },
    key: '$_id',
    name: '$_id',
    problemCount: 1,
    uniqueBusinessCount: { $size: '$businessIds' },
  },
});

const validateRelationship = async (businessId, conversationId) => {
  ensureValidId(businessId, 'business');
  ensureValidId(conversationId, 'conversation');

  const [business, conversation] = await Promise.all([
    Business.exists({ _id: businessId }),
    Conversation.findById(conversationId).select('business').lean(),
  ]);

  if (!business) {
    throw createError('Business not found', 404);
  }

  if (!conversation) {
    throw createError('Conversation not found', 404);
  }

  if (conversation.business.toString() !== businessId.toString()) {
    throw createError('Selected conversation does not belong to the selected business', 400);
  }
};

const ensureBusinessExists = async (businessId) => {
  ensureValidId(businessId, 'business');

  if (!(await Business.exists({ _id: businessId }))) {
    throw createError('Business not found', 404);
  }
};

const ensureConversationExists = async (conversationId) => {
  ensureValidId(conversationId, 'conversation');

  if (!(await Conversation.exists({ _id: conversationId }))) {
    throw createError('Conversation not found', 404);
  }
};

export const createProblem = async (data) => {
  if (!data.business) {
    throw createError('Business is required', 400);
  }

  if (!data.conversation) {
    throw createError('Conversation is required', 400);
  }

  ensureValidId(data.business, 'business');
  ensureValidId(data.conversation, 'conversation');
  const cleanedData = cleanProblemData(data);
  validateProblemData(cleanedData, true);
  await validateRelationship(data.business, data.conversation);

  const problem = await Problem.create({
    ...cleanedData,
    business: data.business,
    conversation: data.conversation,
  });

  return problem.populate(POPULATE_OPTIONS);
};

export const getProblems = async ({ businessId, conversationId }) => {
  if (!businessId && !conversationId) {
    throw createError('businessId or conversationId query parameter is required', 400);
  }

  const filters = {};

  if (businessId && conversationId) {
    await validateRelationship(businessId, conversationId);
    filters.business = businessId;
    filters.conversation = conversationId;
  } else if (conversationId) {
    await ensureConversationExists(conversationId);
    filters.conversation = conversationId;
  } else {
    await ensureBusinessExists(businessId);
    filters.business = businessId;
  }

  return Problem.find(filters).sort({ createdAt: -1 }).populate(POPULATE_OPTIONS).lean();
};

export const getProblemById = async (problemId) => {
  ensureValidId(problemId, 'problem');
  const problem = await Problem.findById(problemId).populate(POPULATE_OPTIONS).lean();

  if (!problem) {
    throw createError('Problem not found', 404);
  }

  return problem;
};

export const getProblemPatterns = async ({ limit } = {}) => {
  const limitStages = limit
    ? [{ $sort: { uniqueBusinessCount: -1, problemCount: -1, name: 1 } }, { $limit: limit }]
    : [];
  const [tagPatterns, titlePatterns] = await Promise.all([
    Problem.aggregate([
      { $match: { 'tags.0': { $exists: true } } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          problemCount: { $sum: 1 },
          businessIds: { $addToSet: '$business' },
        },
      },
      patternProjection('tag'),
      { $match: { uniqueBusinessCount: { $gte: 2 } } },
      ...limitStages,
    ]),
    Problem.aggregate([
      { $addFields: { patternKey: normalizedTitleExpression } },
      {
        $group: {
          _id: '$patternKey',
          problemCount: { $sum: 1 },
          businessIds: { $addToSet: '$business' },
        },
      },
      patternProjection('title'),
      { $match: { uniqueBusinessCount: { $gte: 2 } } },
      ...limitStages,
    ]),
  ]);

  const patterns = [...tagPatterns, ...titlePatterns].sort(
    (first, second) =>
      second.uniqueBusinessCount - first.uniqueBusinessCount ||
      second.problemCount - first.problemCount ||
      first.name.localeCompare(second.name),
  );

  return limit ? patterns.slice(0, limit) : patterns;
};

export const getProblemPatternDetails = async ({ type, key }) => {
  if (!['tag', 'title'].includes(type)) {
    throw createError('Pattern type must be tag or title', 400);
  }

  const normalizedKey = type === 'tag' ? normalizeTag(key) : normalizeProblemTitle(key);

  if (!normalizedKey) {
    throw createError('Pattern key is required', 400);
  }

  const filters =
    type === 'tag'
      ? { tags: normalizedKey }
      : { $expr: { $eq: [normalizedTitleExpression, normalizedKey] } };

  const problems = await Problem.find(filters)
    .sort({ createdAt: -1 })
    .populate(POPULATE_OPTIONS)
    .lean();

  const businessMap = new Map();

  for (const problem of problems) {
    if (problem.business) {
      businessMap.set(problem.business._id.toString(), problem.business);
    }
  }

  const businesses = [...businessMap.values()].sort((first, second) =>
    first.companyName.localeCompare(second.companyName),
  );

  return {
    pattern: {
      type,
      key: normalizedKey,
      name: normalizedKey,
      problemCount: problems.length,
      uniqueBusinessCount: businesses.length,
    },
    problems,
    businesses,
  };
};

export const updateProblem = async (problemId, data) => {
  ensureValidId(problemId, 'problem');
  const cleanedData = cleanProblemData(data);

  if (Object.keys(cleanedData).length === 0) {
    throw createError('Provide at least one problem field to update', 400);
  }

  validateProblemData(cleanedData);

  const problem = await Problem.findByIdAndUpdate(problemId, cleanedData, {
    new: true,
    runValidators: true,
  }).populate(POPULATE_OPTIONS);

  if (!problem) {
    throw createError('Problem not found', 404);
  }

  return problem;
};

export const deleteProblem = async (problemId) => {
  ensureValidId(problemId, 'problem');
  const problem = await Problem.findByIdAndDelete(problemId);

  if (!problem) {
    throw createError('Problem not found', 404);
  }
};
