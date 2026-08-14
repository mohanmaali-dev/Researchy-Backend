import mongoose from 'mongoose';

import { normalizeProblemTitle, Problem } from '../problems/problem.model.js';
import {
  DIFFICULTY_LEVELS,
  Opportunity,
  OPPORTUNITY_STATUSES,
  VALIDATION_STATUSES,
} from './opportunity.model.js';
import { calculateOpportunityScore } from './opportunity-score.js';

const OPPORTUNITY_FIELDS = [
  'whyValuable',
  'marketPotential',
  'difficulty',
  'validationStatus',
  'notes',
  'status',
];

const REQUIRED_FIELDS = [
  'whyValuable',
  'marketPotential',
  'difficulty',
  'validationStatus',
  'status',
];

const PROBLEM_SCORE_FIELDS =
  'business conversation title description currentProcess tags painLevel frequency timeImpact financialImpact existingSoftware willingnessToPay status';

const POPULATE_OPTIONS = [
  { path: 'problem', select: PROBLEM_SCORE_FIELDS },
  { path: 'business', select: 'companyName' },
  { path: 'conversation', select: 'conversationDate personName personRole' },
];

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

const cleanOpportunityData = (data) =>
  OPPORTUNITY_FIELDS.reduce((cleaned, field) => {
    if (data[field] !== undefined) {
      cleaned[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
    }

    return cleaned;
  }, {});

const validateOpportunityData = (data, isCreating = false) => {
  if (isCreating) {
    const missingField = REQUIRED_FIELDS.find(
      (field) => data[field] === undefined || data[field] === '',
    );

    if (missingField) {
      throw createError(`${missingField} is required`, 400);
    }
  }

  for (const field of REQUIRED_FIELDS) {
    if (data[field] !== undefined && data[field] === '') {
      throw createError(`${field} is required`, 400);
    }
  }

  if (data.difficulty !== undefined && !DIFFICULTY_LEVELS.includes(data.difficulty)) {
    throw createError('Invalid difficulty', 400);
  }

  if (data.validationStatus !== undefined && !VALIDATION_STATUSES.includes(data.validationStatus)) {
    throw createError('Invalid validation status', 400);
  }

  if (data.status !== undefined && !OPPORTUNITY_STATUSES.includes(data.status)) {
    throw createError('Invalid opportunity status', 400);
  }
};

const getProblem = async (problemId) => {
  ensureValidId(problemId, 'problem');
  const problem = await Problem.findById(problemId).select(PROBLEM_SCORE_FIELDS);

  if (!problem) {
    throw createError('Problem not found', 404);
  }

  return problem;
};

const getUniqueBusinessCount = async (problem) => {
  const patternConditions = [
    {
      $expr: {
        $eq: [normalizedTitleExpression, normalizeProblemTitle(problem.title)],
      },
    },
  ];

  if (problem.tags?.length) {
    patternConditions.unshift({ tags: { $in: problem.tags } });
  }

  const businessIds = await Problem.distinct('business', { $or: patternConditions });
  return Math.max(1, businessIds.length);
};

const buildScore = async (problem, difficulty) => {
  const uniqueBusinessCount = await getUniqueBusinessCount(problem);
  return calculateOpportunityScore({ problem, difficulty, uniqueBusinessCount });
};

const refreshOpportunityScore = async (opportunity) => {
  if (!opportunity.problem) {
    throw createError('Linked Problem not found', 404);
  }

  const score = await buildScore(opportunity.problem, opportunity.difficulty);
  const currentBreakdown = opportunity.scoreBreakdown?.toObject
    ? opportunity.scoreBreakdown.toObject()
    : opportunity.scoreBreakdown;
  const scoreChanged =
    opportunity.opportunityScore !== score.total ||
    JSON.stringify(currentBreakdown) !== JSON.stringify(score.breakdown);

  if (scoreChanged) {
    opportunity.opportunityScore = score.total;
    opportunity.scoreBreakdown = score.breakdown;
    await opportunity.save();
  }

  return opportunity;
};

export const createOpportunity = async (data) => {
  if (!data.problem) {
    throw createError('Linked Problem is required', 400);
  }

  const cleanedData = cleanOpportunityData(data);
  validateOpportunityData(cleanedData, true);
  const problem = await getProblem(data.problem);

  if (await Opportunity.exists({ problem: problem._id })) {
    throw createError('An opportunity already exists for this Problem', 409);
  }

  const score = await buildScore(problem, cleanedData.difficulty);

  try {
    const opportunity = await Opportunity.create({
      ...cleanedData,
      problem: problem._id,
      business: problem.business,
      conversation: problem.conversation,
      opportunityScore: score.total,
      scoreBreakdown: score.breakdown,
    });

    return opportunity.populate(POPULATE_OPTIONS);
  } catch (error) {
    if (error.code === 11000) {
      throw createError('An opportunity already exists for this Problem', 409);
    }

    throw error;
  }
};

export const getOpportunities = async () => {
  const opportunities = await Opportunity.find().populate(POPULATE_OPTIONS);
  const refreshedOpportunities = await Promise.all(opportunities.map(refreshOpportunityScore));

  return refreshedOpportunities.sort(
    (first, second) =>
      second.opportunityScore - first.opportunityScore || second.createdAt - first.createdAt,
  );
};

export const getOpportunityByProblem = async (problemId) => {
  ensureValidId(problemId, 'problem');
  const opportunity = await Opportunity.findOne({ problem: problemId }).populate(POPULATE_OPTIONS);

  return opportunity ? refreshOpportunityScore(opportunity) : null;
};

export const getOpportunityById = async (opportunityId) => {
  ensureValidId(opportunityId, 'opportunity');
  const opportunity = await Opportunity.findById(opportunityId).populate(POPULATE_OPTIONS);

  if (!opportunity) {
    throw createError('Opportunity not found', 404);
  }

  return refreshOpportunityScore(opportunity);
};

export const updateOpportunity = async (opportunityId, data) => {
  ensureValidId(opportunityId, 'opportunity');
  const cleanedData = cleanOpportunityData(data);

  if (Object.keys(cleanedData).length === 0) {
    throw createError('Provide at least one opportunity field to update', 400);
  }

  validateOpportunityData(cleanedData);
  const opportunity = await Opportunity.findById(opportunityId).populate(POPULATE_OPTIONS);

  if (!opportunity) {
    throw createError('Opportunity not found', 404);
  }

  for (const [field, value] of Object.entries(cleanedData)) {
    opportunity[field] = value;
  }

  const score = await buildScore(opportunity.problem, opportunity.difficulty);
  opportunity.opportunityScore = score.total;
  opportunity.scoreBreakdown = score.breakdown;
  await opportunity.save();

  return opportunity;
};

export const deleteOpportunity = async (opportunityId) => {
  ensureValidId(opportunityId, 'opportunity');
  const opportunity = await Opportunity.findByIdAndDelete(opportunityId);

  if (!opportunity) {
    throw createError('Opportunity not found', 404);
  }
};
