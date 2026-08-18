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

const RESULT_LIMIT = 6;
const LEARNING_LIMIT = 8;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fieldsMatch = (fields, regex) => ({ $or: fields.map((field) => ({ [field]: regex })) });
const text = (value, fallback = '') => String(value || fallback).trim();

const result = (id, title, subtitle, path, updatedAt) => ({
  id,
  title: text(title, 'Untitled'),
  subtitle: text(subtitle),
  path,
  updatedAt,
});

const group = (key, label, results) => ({ key, label, results });

export const search = async (rawQuery, userId) => {
  const query = text(rawQuery);
  if (query.length < 2) return { query, groups: [], totalResults: 0 };
  if (query.length > 100) {
    const error = new Error('Search cannot exceed 100 characters');
    error.statusCode = 400;
    throw error;
  }

  const regex = new RegExp(escapeRegex(query), 'i');
  const businessFilter = fieldsMatch(
    ['companyName', 'businessType', 'industry', 'location', 'contactPerson'],
    regex,
  );
  const problemFilter = fieldsMatch(['title', 'description', 'tags'], regex);

  const [
    businesses,
    matchingBusinessIds,
    contacts,
    problems,
    matchingProblemIds,
    topics,
    entries,
    resources,
    practices,
    questions,
    notes,
  ] = await Promise.all([
    Business.find(businessFilter).sort({ updatedAt: -1 }).limit(RESULT_LIMIT).lean(),
    Business.find(businessFilter).distinct('_id'),
    Contact.find(
      fieldsMatch(['fullName', 'companyName', 'role', 'email', 'phoneNumber', 'location'], regex),
    )
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    Problem.find(problemFilter)
      .populate('business', 'companyName')
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    Problem.find(problemFilter).distinct('_id'),
    LearningTopic.find({
      archivedAt: null,
      ...fieldsMatch(['title', 'category', 'description', 'tags'], regex),
    })
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    LearningEntry.find(fieldsMatch(['title', 'notes', 'keyTakeaway', 'tags'], regex))
      .populate('topic', 'title')
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    LearningResource.find(fieldsMatch(['title', 'notes', 'url', 'type'], regex))
      .populate('topic', 'title')
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    LearningPractice.find(
      fieldsMatch(['title', 'practiceGoal', 'whatHappened', 'wentWell', 'wentWrong'], regex),
    )
      .populate('topic', 'title')
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    LearningQuestion.find(fieldsMatch(['question', 'context', 'answer'], regex))
      .populate('topic', 'title')
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    Note.find({ user: userId, ...fieldsMatch(['title', 'content', 'tags'], regex) })
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
  ]);

  const [conversations, opportunities, followUps] = await Promise.all([
    Conversation.find({
      $or: [
        ...fieldsMatch(
          ['personName', 'personRole', 'rawConversationNotes', 'importantObservations'],
          regex,
        ).$or,
        ...(matchingBusinessIds.length ? [{ business: { $in: matchingBusinessIds } }] : []),
      ],
    })
      .populate('business', 'companyName')
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    Opportunity.find({
      $or: [
        ...fieldsMatch(['whyValuable', 'marketPotential', 'notes'], regex).$or,
        ...(matchingProblemIds.length ? [{ problem: { $in: matchingProblemIds } }] : []),
        ...(matchingBusinessIds.length ? [{ business: { $in: matchingBusinessIds } }] : []),
      ],
    })
      .populate('problem', 'title')
      .populate('business', 'companyName')
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    FollowUp.find({
      $or: [
        ...fieldsMatch(['reason', 'notes'], regex).$or,
        ...(matchingBusinessIds.length ? [{ business: { $in: matchingBusinessIds } }] : []),
      ],
    })
      .populate('business', 'companyName')
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
  ]);

  const learningResults = [
    ...topics.map((item) =>
      result(
        item._id,
        item.title,
        `Topic · ${item.category}`,
        `/learning/topics/${item._id}`,
        item.updatedAt,
      ),
    ),
    ...entries.map((item) =>
      result(
        item._id,
        item.title,
        `Entry · ${item.topic?.title || 'Learning'}`,
        `/learning/entries/${item._id}`,
        item.updatedAt,
      ),
    ),
    ...resources.map((item) =>
      result(
        item._id,
        item.title,
        `Resource · ${item.topic?.title || item.type}`,
        `/learning/resources/${item._id}`,
        item.updatedAt,
      ),
    ),
    ...practices.map((item) =>
      result(
        item._id,
        item.title,
        `Practice · ${item.topic?.title || 'Learning'}`,
        `/learning/practice/${item._id}`,
        item.updatedAt,
      ),
    ),
    ...questions.map((item) =>
      result(
        item._id,
        item.question,
        `Question · ${item.topic?.title || 'Learning'}`,
        `/learning/questions/${item._id}`,
        item.updatedAt,
      ),
    ),
  ]
    .sort((first, second) => new Date(second.updatedAt) - new Date(first.updatedAt))
    .slice(0, LEARNING_LIMIT);

  const groups = [
    group(
      'businesses',
      'Businesses',
      businesses.map((item) =>
        result(
          item._id,
          item.companyName,
          [item.industry, item.location].filter(Boolean).join(' · '),
          `/businesses/${item._id}`,
          item.updatedAt,
        ),
      ),
    ),
    group(
      'contacts',
      'Contacts',
      contacts.map((item) =>
        result(
          item._id,
          item.fullName,
          item.companyName || item.role,
          `/contacts/${item._id}`,
          item.updatedAt,
        ),
      ),
    ),
    group(
      'conversations',
      'Conversations',
      conversations.map((item) =>
        result(
          item._id,
          item.personName,
          [item.personRole, item.business?.companyName].filter(Boolean).join(' · '),
          `/conversations/${item._id}`,
          item.updatedAt,
        ),
      ),
    ),
    group(
      'problems',
      'Problems',
      problems.map((item) =>
        result(
          item._id,
          item.title,
          item.business?.companyName,
          `/problems/${item._id}`,
          item.updatedAt,
        ),
      ),
    ),
    group(
      'opportunities',
      'Opportunities',
      opportunities.map((item) =>
        result(
          item._id,
          item.problem?.title,
          item.business?.companyName,
          `/opportunities/${item._id}`,
          item.updatedAt,
        ),
      ),
    ),
    group(
      'followUps',
      'Follow-ups',
      followUps.map((item) =>
        result(
          item._id,
          item.reason,
          item.business?.companyName,
          `/follow-ups/${item._id}`,
          item.updatedAt,
        ),
      ),
    ),
    group('learning', 'Learning', learningResults),
    group(
      'notes',
      'Notes',
      notes.map((item) =>
        result(item._id, item.title, item.content, `/notes/${item._id}`, item.updatedAt),
      ),
    ),
  ].filter((item) => item.results.length);

  return {
    query,
    groups,
    totalResults: groups.reduce((total, item) => total + item.results.length, 0),
  };
};
