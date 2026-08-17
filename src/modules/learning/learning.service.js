import mongoose from 'mongoose';

import {
  QUESTION_STATUSES,
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
  TOPIC_PRIORITIES,
  TOPIC_STATUSES,
} from './learning.constants.js';
import { LearningEntry } from './learning-entry.model.js';
import { LearningPractice } from './learning-practice.model.js';
import { LearningQuestion } from './learning-question.model.js';
import { LearningResource } from './learning-resource.model.js';
import { LearningTopic } from './learning-topic.model.js';

const TOPIC_FIELDS = [
  'title',
  'category',
  'description',
  'learningReason',
  'priority',
  'status',
  'startDate',
  'targetDate',
  'tags',
  'isPinned',
];
const ENTRY_FIELDS = ['topic', 'title', 'notes', 'keyTakeaway', 'entryDate', 'tags', 'isPinned'];
const RESOURCE_FIELDS = ['topic', 'title', 'type', 'url', 'notes', 'status', 'isPinned'];
const PRACTICE_FIELDS = [
  'topic',
  'title',
  'practiceGoal',
  'practiceDate',
  'whatHappened',
  'wentWell',
  'wentWrong',
  'improveNext',
  'status',
];
const QUESTION_FIELDS = ['topic', 'question', 'context', 'answer', 'status'];
const DEFAULT_PAGE_SIZE = 10;
const MAXIMUM_PAGE_SIZE = 50;

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureValidId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) throw createError(`Invalid ${label} ID`, 400);
};

const cleanData = (data, fields) =>
  fields.reduce((cleaned, field) => {
    if (data[field] !== undefined) {
      if (['targetDate'].includes(field) && data[field] === '') cleaned[field] = null;
      else cleaned[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
    }
    return cleaned;
  }, {});

const validateRequired = (data, requiredFields, isCreating) => {
  if (isCreating) {
    const missing = requiredFields.find(
      (field) => data[field] === undefined || data[field] === null || data[field] === '',
    );
    if (missing) throw createError(`${missing} is required`, 400);
  }

  const empty = requiredFields.find(
    (field) => data[field] !== undefined && (data[field] === null || data[field] === ''),
  );
  if (empty) throw createError(`${empty} is required`, 400);
};

const validateDates = (data, fields) => {
  fields.forEach(([field, label]) => {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      Number.isNaN(new Date(data[field]).getTime())
    ) {
      throw createError(`${label} must be a valid date`, 400);
    }
  });
};

const ensureTopic = async (topicId) => {
  ensureValidId(topicId, 'topic');
  if (!(await LearningTopic.exists({ _id: topicId })))
    throw createError('Learning Topic not found', 404);
};

const parsePositiveInteger = (value, fallback, field) => {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1)
    throw createError(`${field} must be a positive integer`, 400);
  return parsed;
};

const paginationValues = (options) => {
  const page = parsePositiveInteger(options.page, 1, 'Page');
  const requestedLimit = parsePositiveInteger(options.limit, DEFAULT_PAGE_SIZE, 'Limit');
  return { page, limit: Math.min(requestedLimit, MAXIMUM_PAGE_SIZE) };
};

const paginationResult = (page, limit, totalItems) => ({
  page,
  limit,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  hasPreviousPage: page > 1,
  hasNextPage: page * limit < totalItems,
});

const escapeRegularExpression = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createChild = async ({ Model, data, fields, required, dateFields = [] }) => {
  const cleaned = cleanData(data, fields);
  validateRequired(cleaned, required, true);
  validateDates(cleaned, dateFields);
  await ensureTopic(cleaned.topic);
  const record = await Model.create(cleaned);
  return record.populate('topic', 'title category status');
};

const getChild = async (Model, id, label) => {
  ensureValidId(id, label);
  const record = await Model.findById(id).populate('topic', 'title category status').lean();
  if (!record) throw createError(`${label} not found`, 404);
  return record;
};

const updateChild = async ({ Model, id, data, fields, required, label, dateFields = [] }) => {
  ensureValidId(id, label);
  const cleaned = cleanData(data, fields);
  if (!Object.keys(cleaned).length)
    throw createError(`Provide at least one ${label.toLowerCase()} field to update`, 400);
  validateRequired(cleaned, required, false);
  validateDates(cleaned, dateFields);
  if (cleaned.topic !== undefined) await ensureTopic(cleaned.topic);
  const record = await Model.findByIdAndUpdate(id, cleaned, {
    new: true,
    runValidators: true,
  }).populate('topic', 'title category status');
  if (!record) throw createError(`${label} not found`, 404);
  return record;
};

const deleteChild = async (Model, id, label) => {
  ensureValidId(id, label);
  if (!(await Model.findByIdAndDelete(id))) throw createError(`${label} not found`, 404);
};

export const createTopic = async (data) => {
  const cleaned = cleanData(data, TOPIC_FIELDS);
  validateRequired(cleaned, ['title', 'category', 'startDate'], true);
  validateDates(cleaned, [
    ['startDate', 'Start date'],
    ['targetDate', 'Target date'],
  ]);
  return LearningTopic.create(cleaned);
};

export const getTopics = async (options = {}) => {
  const { page, limit } = paginationValues(options);
  const filter = {
    archivedAt: options.archived === 'true' ? { $ne: null } : null,
  };
  const search = typeof options.search === 'string' ? options.search.trim() : '';
  const status = typeof options.status === 'string' ? options.status.trim() : '';
  const priority = typeof options.priority === 'string' ? options.priority.trim() : '';
  const category = typeof options.category === 'string' ? options.category.trim() : '';

  if (status && status !== 'All') {
    if (!TOPIC_STATUSES.includes(status)) throw createError('Invalid topic status', 400);
    filter.status = status;
  }
  if (priority && priority !== 'All') {
    if (!TOPIC_PRIORITIES.includes(priority)) throw createError('Invalid priority', 400);
    filter.priority = priority;
  }
  if (category && category !== 'All')
    filter.category = new RegExp(`^${escapeRegularExpression(category)}$`, 'i');
  if (search) {
    const expression = new RegExp(escapeRegularExpression(search), 'i');
    filter.$or = [
      { title: expression },
      { category: expression },
      { description: expression },
      { tags: expression },
    ];
  }

  if (options.pinned === 'true') filter.isPinned = true;

  const sort = typeof options.sort === 'string' ? options.sort : 'recent';
  const allowedSorts = ['recent', 'priority', 'status', 'startDate', 'targetDate', 'title'];
  if (!allowedSorts.includes(sort)) throw createError('Invalid topic sort option', 400);

  const sortFields = {
    recent: { updatedAt: -1, createdAt: -1 },
    startDate: { startDate: -1, updatedAt: -1 },
    targetDate: { targetDate: 1, updatedAt: -1 },
    title: { title: 1, _id: 1 },
  };
  const rankBranches =
    sort === 'priority'
      ? [
          { case: { $eq: ['$priority', 'High'] }, then: 1 },
          { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
          { case: { $eq: ['$priority', 'Low'] }, then: 3 },
        ]
      : [
          { case: { $eq: ['$status', 'Learning'] }, then: 1 },
          { case: { $eq: ['$status', 'Want to Learn'] }, then: 2 },
          { case: { $eq: ['$status', 'Learned'] }, then: 3 },
        ];
  const pipeline = [{ $match: filter }];
  if (sort === 'priority' || sort === 'status') {
    pipeline.push(
      { $addFields: { sortRank: { $switch: { branches: rankBranches, default: 4 } } } },
      { $sort: { sortRank: 1, updatedAt: -1 } },
      { $unset: 'sortRank' },
    );
  } else pipeline.push({ $sort: sortFields[sort] });
  pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

  const [topics, totalItems] = await Promise.all([
    LearningTopic.aggregate(pipeline),
    LearningTopic.countDocuments(filter),
  ]);
  return { records: topics, pagination: paginationResult(page, limit, totalItems) };
};

export const getTopicOptions = async () => ({
  categories: (await LearningTopic.distinct('category'))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b)),
  tags: [...(await LearningTopic.distinct('tags')), ...(await LearningEntry.distinct('tags'))]
    .filter(Boolean)
    .filter((tag, index, values) => values.indexOf(tag) === index)
    .sort((a, b) => a.localeCompare(b)),
});

export const getTopicById = async (id) => {
  ensureValidId(id, 'topic');
  const topic = await LearningTopic.findById(id).lean();
  if (!topic) throw createError('Learning Topic not found', 404);
  const [entries, resources, practice, questions] = await Promise.all([
    LearningEntry.countDocuments({ topic: id }),
    LearningResource.countDocuments({ topic: id }),
    LearningPractice.countDocuments({ topic: id }),
    LearningQuestion.countDocuments({ topic: id }),
  ]);
  return { ...topic, contentCounts: { entries, resources, practice, questions } };
};

export const updateTopic = async (id, data) => {
  ensureValidId(id, 'topic');
  const cleaned = cleanData(data, TOPIC_FIELDS);
  if (!Object.keys(cleaned).length)
    throw createError('Provide at least one topic field to update', 400);
  validateRequired(cleaned, ['title', 'category', 'startDate'], false);
  validateDates(cleaned, [
    ['startDate', 'Start date'],
    ['targetDate', 'Target date'],
  ]);
  const topic = await LearningTopic.findByIdAndUpdate(id, cleaned, {
    new: true,
    runValidators: true,
  });
  if (!topic) throw createError('Learning Topic not found', 404);
  return topic;
};

export const deleteTopic = async (id) => {
  ensureValidId(id, 'topic');
  const topic = await LearningTopic.findByIdAndUpdate(
    id,
    { archivedAt: new Date(), isPinned: false },
    { new: true },
  );
  if (!topic) throw createError('Learning Topic not found', 404);
  return topic;
};

export const restoreTopic = async (id) => {
  ensureValidId(id, 'topic');
  const topic = await LearningTopic.findByIdAndUpdate(id, { archivedAt: null }, { new: true });
  if (!topic) throw createError('Learning Topic not found', 404);
  return topic;
};

export const permanentlyDeleteTopic = async (id) => {
  ensureValidId(id, 'topic');
  const topic = await LearningTopic.findByIdAndDelete(id);
  if (!topic) throw createError('Learning Topic not found', 404);
  await Promise.all([
    LearningEntry.deleteMany({ topic: id }),
    LearningResource.deleteMany({ topic: id }),
    LearningPractice.deleteMany({ topic: id }),
    LearningQuestion.deleteMany({ topic: id }),
  ]);
};

export const createEntry = (data) =>
  createChild({
    Model: LearningEntry,
    data,
    fields: ENTRY_FIELDS,
    required: ['topic', 'title', 'keyTakeaway', 'entryDate'],
    label: 'Learning Entry',
    dateFields: [['entryDate', 'Date']],
  });
export const getEntries = async (options = {}) => {
  const { page, limit } = paginationValues(options);
  const filter = {};
  if (options.topicId) {
    await ensureTopic(options.topicId);
    filter.topic = options.topicId;
  } else filter.topic = { $in: await LearningTopic.find({ archivedAt: null }).distinct('_id') };
  const sorts = {
    recent: { entryDate: -1, createdAt: -1 },
    oldest: { entryDate: 1, createdAt: 1 },
    updated: { updatedAt: -1 },
    title: { title: 1 },
  };
  const sort = options.sort || 'recent';
  if (!sorts[sort]) throw createError('Invalid entry sort option', 400);
  const [records, totalItems] = await Promise.all([
    LearningEntry.find(filter)
      .sort(sorts[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('topic', 'title category status archivedAt')
      .lean(),
    LearningEntry.countDocuments(filter),
  ]);
  return { records, pagination: paginationResult(page, limit, totalItems) };
};
export const getEntryById = (id) => getChild(LearningEntry, id, 'Learning Entry');
export const updateEntry = (id, data) =>
  updateChild({
    Model: LearningEntry,
    id,
    data,
    fields: ENTRY_FIELDS,
    required: ['topic', 'title', 'keyTakeaway', 'entryDate'],
    label: 'Learning Entry',
    dateFields: [['entryDate', 'Date']],
  });
export const deleteEntry = (id) => deleteChild(LearningEntry, id, 'Learning Entry');

export const createResource = (data) =>
  createChild({
    Model: LearningResource,
    data,
    fields: RESOURCE_FIELDS,
    required: ['topic', 'title', 'type', 'status'],
    label: 'Resource',
  });
export const getResources = async (options = {}) => {
  const { page, limit } = paginationValues(options);
  const filter = {};
  if (options.topicId) {
    await ensureTopic(options.topicId);
    filter.topic = options.topicId;
  } else filter.topic = { $in: await LearningTopic.find({ archivedAt: null }).distinct('_id') };
  if (options.type && options.type !== 'All') {
    if (!RESOURCE_TYPES.includes(options.type)) throw createError('Invalid resource type', 400);
    filter.type = options.type;
  }
  if (options.status && options.status !== 'All') {
    if (!RESOURCE_STATUSES.includes(options.status))
      throw createError('Invalid resource status', 400);
    filter.status = options.status;
  }
  const [records, totalItems] = await Promise.all([
    LearningResource.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('topic', 'title category status')
      .lean(),
    LearningResource.countDocuments(filter),
  ]);
  return { records, pagination: paginationResult(page, limit, totalItems) };
};
export const getResourceById = (id) => getChild(LearningResource, id, 'Resource');
export const updateResource = (id, data) =>
  updateChild({
    Model: LearningResource,
    id,
    data,
    fields: RESOURCE_FIELDS,
    required: ['topic', 'title', 'type', 'status'],
    label: 'Resource',
  });
export const deleteResource = (id) => deleteChild(LearningResource, id, 'Resource');

export const createPractice = (data) =>
  createChild({
    Model: LearningPractice,
    data,
    fields: PRACTICE_FIELDS,
    required: ['topic', 'title', 'practiceGoal', 'practiceDate', 'status'],
    label: 'Practice',
    dateFields: [['practiceDate', 'Date']],
  });
export const getPracticeItems = async (options = {}) => {
  const { page, limit } = paginationValues(options);
  const filter = {};
  if (options.topicId) {
    await ensureTopic(options.topicId);
    filter.topic = options.topicId;
  } else filter.topic = { $in: await LearningTopic.find({ archivedAt: null }).distinct('_id') };
  const sorts = {
    recent: { practiceDate: -1, createdAt: -1 },
    upcoming: { practiceDate: 1, createdAt: -1 },
    updated: { updatedAt: -1 },
    title: { title: 1 },
  };
  const sort = options.sort || 'recent';
  if (!sorts[sort]) throw createError('Invalid practice sort option', 400);
  const [records, totalItems] = await Promise.all([
    LearningPractice.find(filter)
      .sort(sorts[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('topic', 'title category status archivedAt')
      .lean(),
    LearningPractice.countDocuments(filter),
  ]);
  return { records, pagination: paginationResult(page, limit, totalItems) };
};
export const getPracticeById = (id) => getChild(LearningPractice, id, 'Practice');
export const updatePractice = (id, data) =>
  updateChild({
    Model: LearningPractice,
    id,
    data,
    fields: PRACTICE_FIELDS,
    required: ['topic', 'title', 'practiceGoal', 'practiceDate', 'status'],
    label: 'Practice',
    dateFields: [['practiceDate', 'Date']],
  });
export const deletePractice = (id) => deleteChild(LearningPractice, id, 'Practice');

export const createQuestion = (data) =>
  createChild({
    Model: LearningQuestion,
    data,
    fields: QUESTION_FIELDS,
    required: ['topic', 'question', 'status'],
    label: 'Question',
  });
export const getQuestions = async (options = {}) => {
  const { page, limit } = paginationValues(options);
  const filter = {};
  if (options.topicId) {
    await ensureTopic(options.topicId);
    filter.topic = options.topicId;
  } else filter.topic = { $in: await LearningTopic.find({ archivedAt: null }).distinct('_id') };
  if (options.status && options.status !== 'All') {
    if (!QUESTION_STATUSES.includes(options.status))
      throw createError('Invalid question status', 400);
    filter.status = options.status;
  }
  const [records, totalItems] = await Promise.all([
    LearningQuestion.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('topic', 'title category status')
      .lean(),
    LearningQuestion.countDocuments(filter),
  ]);
  return { records, pagination: paginationResult(page, limit, totalItems) };
};
export const getQuestionById = (id) => getChild(LearningQuestion, id, 'Question');
export const updateQuestion = (id, data) =>
  updateChild({
    Model: LearningQuestion,
    id,
    data,
    fields: QUESTION_FIELDS,
    required: ['topic', 'question', 'status'],
    label: 'Question',
  });
export const deleteQuestion = (id) => deleteChild(LearningQuestion, id, 'Question');

export const getKeyTakeaways = async (options = {}) => {
  const { page, limit } = paginationValues(options);
  const filter = { keyTakeaway: { $ne: '' } };
  if (options.topicId) {
    await ensureTopic(options.topicId);
    filter.topic = options.topicId;
  } else filter.topic = { $in: await LearningTopic.find({ archivedAt: null }).distinct('_id') };
  const [records, totalItems] = await Promise.all([
    LearningEntry.find(filter)
      .sort({ entryDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('topic title keyTakeaway entryDate tags isPinned')
      .populate('topic', 'title category status')
      .lean(),
    LearningEntry.countDocuments(filter),
  ]);
  return { records, pagination: paginationResult(page, limit, totalItems) };
};

export const getLearningDashboard = async () => {
  const activeTopicIds = await LearningTopic.find({ archivedAt: null }).distinct('_id');
  const [
    continueLearning,
    topics,
    pinnedTopics,
    pinnedTakeaways,
    pinnedResources,
    recentTopics,
    recentEntries,
    recentPractice,
    recentQuestions,
  ] = await Promise.all([
    LearningTopic.find({ status: 'Learning', archivedAt: null })
      .sort({ priority: -1, updatedAt: -1 })
      .limit(6)
      .lean(),
    LearningTopic.find({ archivedAt: null }).sort({ updatedAt: -1 }).limit(8).lean(),
    LearningTopic.find({ archivedAt: null, isPinned: true })
      .sort({ updatedAt: -1 })
      .limit(4)
      .lean(),
    LearningEntry.find({ topic: { $in: activeTopicIds }, isPinned: true })
      .sort({ updatedAt: -1 })
      .limit(4)
      .select('topic title keyTakeaway entryDate')
      .populate('topic', 'title')
      .lean(),
    LearningResource.find({ topic: { $in: activeTopicIds }, isPinned: true })
      .sort({ updatedAt: -1 })
      .limit(4)
      .select('topic title type status')
      .populate('topic', 'title')
      .lean(),
    LearningTopic.find({ archivedAt: null })
      .sort({ updatedAt: -1 })
      .limit(4)
      .select('title updatedAt')
      .lean(),
    LearningEntry.find({ topic: { $in: activeTopicIds } })
      .sort({ updatedAt: -1 })
      .limit(4)
      .select('topic title updatedAt')
      .populate('topic', 'title')
      .lean(),
    LearningPractice.find({ topic: { $in: activeTopicIds } })
      .sort({ updatedAt: -1 })
      .limit(4)
      .select('topic title updatedAt')
      .populate('topic', 'title')
      .lean(),
    LearningQuestion.find({ topic: { $in: activeTopicIds } })
      .sort({ updatedAt: -1 })
      .limit(4)
      .select('topic question updatedAt')
      .populate('topic', 'title')
      .lean(),
  ]);

  const recentActivity = [
    ...recentTopics.map((item) => ({
      type: 'Topic',
      title: item.title,
      path: `/learning/topics/${item._id}`,
      updatedAt: item.updatedAt,
    })),
    ...recentEntries.map((item) => ({
      type: 'Entry',
      title: item.title,
      topicTitle: item.topic?.title,
      path: `/learning/entries/${item._id}`,
      updatedAt: item.updatedAt,
    })),
    ...recentPractice.map((item) => ({
      type: 'Practice',
      title: item.title,
      topicTitle: item.topic?.title,
      path: `/learning/practice/${item._id}`,
      updatedAt: item.updatedAt,
    })),
    ...recentQuestions.map((item) => ({
      type: 'Question',
      title: item.question,
      topicTitle: item.topic?.title,
      path: `/learning/questions/${item._id}`,
      updatedAt: item.updatedAt,
    })),
  ]
    .sort((first, second) => new Date(second.updatedAt) - new Date(first.updatedAt))
    .slice(0, 8);

  return {
    continueLearning,
    topics,
    pinnedTopics,
    pinnedTakeaways,
    pinnedResources,
    recentActivity,
  };
};
