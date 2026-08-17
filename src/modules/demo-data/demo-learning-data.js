import { LearningEntry } from '../learning/learning-entry.model.js';
import { LearningPractice } from '../learning/learning-practice.model.js';
import { LearningQuestion } from '../learning/learning-question.model.js';
import { LearningResource } from '../learning/learning-resource.model.js';
import { LearningTopic } from '../learning/learning-topic.model.js';

const dateFromToday = (days) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days));
};

const topics = [
  {
    key: 'entrepreneurship',
    title: 'Entrepreneurship Basics (Demo)',
    category: 'Business',
    description: 'Learn how to find real problems and test useful business ideas.',
    learningReason: 'To make better decisions before spending time building a product.',
    priority: 'High',
    status: 'Learning',
    startDate: dateFromToday(-18),
    targetDate: dateFromToday(30),
    tags: ['validation', 'customers'],
  },
  {
    key: 'sales',
    title: 'B2B Sales Foundations (Demo)',
    category: 'Sales',
    description: 'Understand discovery calls, customer needs, and practical sales conversations.',
    learningReason: 'To speak with business owners clearly and learn without forcing a sale.',
    priority: 'High',
    status: 'Learning',
    startDate: dateFromToday(-12),
    targetDate: dateFromToday(24),
    tags: ['sales', 'discovery'],
  },
  {
    key: 'communication',
    title: 'Clear Communication (Demo)',
    category: 'Personal Skills',
    description: 'Practice explaining ideas simply and listening carefully.',
    learningReason: 'To reduce confusion in conversations and everyday work.',
    priority: 'Medium',
    status: 'Want to Learn',
    startDate: dateFromToday(3),
    targetDate: null,
    tags: ['communication', 'listening'],
  },
  {
    key: 'react',
    title: 'Practical React Patterns (Demo)',
    category: 'Technology',
    description: 'Learn reusable component and state-management patterns through small examples.',
    learningReason: 'To build frontend features that remain simple to maintain.',
    priority: 'Medium',
    status: 'Learning',
    startDate: dateFromToday(-25),
    targetDate: dateFromToday(20),
    tags: ['react', 'frontend'],
  },
  {
    key: 'finance',
    title: 'Finance for Small Business (Demo)',
    category: 'Finance',
    description: 'Understand cash flow, margins, and basic financial decisions.',
    learningReason: 'To evaluate a business using clear and practical numbers.',
    priority: 'Medium',
    status: 'Want to Learn',
    startDate: dateFromToday(7),
    targetDate: null,
    tags: ['finance', 'cash-flow'],
  },
  {
    key: 'system-design',
    title: 'System Design Essentials (Demo)',
    category: 'Technology',
    description: 'Review simple ways to design reliable and scalable applications.',
    learningReason: 'To make better technical choices without adding unnecessary complexity.',
    priority: 'Low',
    status: 'Learned',
    startDate: dateFromToday(-60),
    targetDate: dateFromToday(-5),
    tags: ['architecture', 'backend'],
  },
];

const entries = [
  {
    topic: 'entrepreneurship',
    title: 'Finding real problems (Demo)',
    notes: 'Look for repeated manual work, delays, mistakes, and costly workarounds.',
    keyTakeaway:
      'A useful business idea starts with a real repeated problem, not with a feature I want to build.',
    entryDate: dateFromToday(-10),
    tags: ['problems', 'validation'],
  },
  {
    topic: 'entrepreneurship',
    title: 'Customer interview questions (Demo)',
    notes: 'Ask about recent behaviour and actual examples instead of imaginary future choices.',
    keyTakeaway:
      'Ask what the person did last time. Past behaviour gives stronger evidence than polite opinions.',
    entryDate: dateFromToday(-6),
    tags: ['interviews'],
  },
  {
    topic: 'sales',
    title: 'Discovery before pitching (Demo)',
    notes: 'Use the first conversation to understand the workflow and the cost of the problem.',
    keyTakeaway:
      'A discovery conversation should create understanding before it creates a proposal.',
    entryDate: dateFromToday(-8),
    tags: ['discovery', 'listening'],
  },
  {
    topic: 'sales',
    title: 'Simple follow-up messages (Demo)',
    notes: 'Keep the message short, include context, and ask for one clear next action.',
    keyTakeaway: 'A good follow-up makes the next step obvious and easy to answer.',
    entryDate: dateFromToday(-3),
    tags: ['follow-up'],
  },
  {
    topic: 'react',
    title: 'Keep state close to usage (Demo)',
    notes: 'Do not move state upward until more than one part of the interface needs it.',
    keyTakeaway:
      'Local state keeps components easier to understand; lift it only when sharing is necessary.',
    entryDate: dateFromToday(-7),
    tags: ['state', 'components'],
  },
  {
    topic: 'react',
    title: 'Small reusable components (Demo)',
    notes: 'Extract a component when it has a clear responsibility or repeated behaviour.',
    keyTakeaway:
      'Reuse should reduce repetition and confusion, not create a generic component for every possible case.',
    entryDate: dateFromToday(-2),
    tags: ['components'],
  },
  {
    topic: 'system-design',
    title: 'Design for current needs (Demo)',
    notes: 'Start with known requirements and leave clear places for future change.',
    keyTakeaway:
      'Simple architecture that solves today’s problem is often safer than predicting every future requirement.',
    entryDate: dateFromToday(-20),
    tags: ['architecture'],
  },
  {
    topic: 'finance',
    title: 'Cash flow is not profit (Demo)',
    notes:
      'Timing of money entering and leaving matters even when the business is profitable on paper.',
    keyTakeaway:
      'A profitable business can still struggle if cash is not available when bills are due.',
    entryDate: dateFromToday(-1),
    tags: ['cash-flow'],
  },
];

const resources = [
  {
    topic: 'entrepreneurship',
    title: 'Customer Discovery Guide (Demo)',
    type: 'Article',
    url: 'https://example.com/customer-discovery',
    notes: 'A short checklist for preparing interviews.',
    status: 'Completed',
  },
  {
    topic: 'entrepreneurship',
    title: 'The Mom Test (Demo)',
    type: 'Book',
    url: '',
    notes: 'Useful guidance for asking questions that produce honest evidence.',
    status: 'In Progress',
  },
  {
    topic: 'sales',
    title: 'Discovery Call Notes (Demo)',
    type: 'Documentation',
    url: 'https://example.com/discovery-notes',
    notes: 'Reusable questions for business conversations.',
    status: 'Saved',
  },
  {
    topic: 'sales',
    title: 'B2B Sales Conversation (Demo)',
    type: 'Video',
    url: 'https://example.com/sales-video',
    notes: 'Example of a calm problem-focused conversation.',
    status: 'In Progress',
  },
  {
    topic: 'react',
    title: 'React Documentation (Demo)',
    type: 'Documentation',
    url: 'https://react.dev',
    notes: 'Primary reference for component and state concepts.',
    status: 'In Progress',
  },
  {
    topic: 'communication',
    title: 'Listening Skills Notes (Demo)',
    type: 'Article',
    url: 'https://example.com/listening',
    notes: 'Simple reminders for active listening.',
    status: 'Saved',
  },
  {
    topic: 'finance',
    title: 'Small Business Cash Flow Course (Demo)',
    type: 'Course',
    url: 'https://example.com/cash-flow-course',
    notes: 'Introductory cash-flow examples.',
    status: 'Saved',
  },
  {
    topic: 'system-design',
    title: 'System Design Primer (Demo)',
    type: 'Other',
    url: 'https://example.com/system-design',
    notes: 'Reference for common architecture decisions.',
    status: 'Completed',
  },
];

const practiceItems = [
  {
    topic: 'sales',
    title: 'Talk with five business owners (Demo)',
    practiceGoal: 'Ask about their workflow without trying to sell anything.',
    practiceDate: dateFromToday(5),
    whatHappened: '',
    wentWell: '',
    wentWrong: '',
    improveNext: '',
    status: 'Planned',
  },
  {
    topic: 'sales',
    title: 'Run a discovery conversation (Demo)',
    practiceGoal: 'Understand one recent business problem using open questions.',
    practiceDate: dateFromToday(-4),
    whatHappened: 'The owner explained how quotations are prepared manually.',
    wentWell: 'I asked for a recent real example.',
    wentWrong: 'I suggested a solution too early.',
    improveNext: 'Ask two more follow-up questions before discussing solutions.',
    status: 'Completed',
  },
  {
    topic: 'communication',
    title: 'Explain one idea in two minutes (Demo)',
    practiceGoal: 'Explain a technical idea using plain language.',
    practiceDate: dateFromToday(8),
    whatHappened: '',
    wentWell: '',
    wentWrong: '',
    improveNext: '',
    status: 'Planned',
  },
  {
    topic: 'react',
    title: 'Refactor a large component (Demo)',
    practiceGoal: 'Split one component into small parts with clear responsibilities.',
    practiceDate: dateFromToday(-3),
    whatHappened: 'The form and list were separated into focused components.',
    wentWell: 'The main page became easier to read.',
    wentWrong: 'One component received too many props.',
    improveNext: 'Keep shared state closer to the two components that need it.',
    status: 'Completed',
  },
  {
    topic: 'finance',
    title: 'Create a monthly cash-flow example (Demo)',
    practiceGoal: 'Record expected incoming and outgoing cash for one sample month.',
    practiceDate: dateFromToday(10),
    whatHappened: '',
    wentWell: '',
    wentWrong: '',
    improveNext: '',
    status: 'Planned',
  },
];

const questions = [
  {
    topic: 'entrepreneurship',
    question: 'How many interviews are enough before testing a solution? (Demo)',
    context: 'I want enough evidence without waiting for perfect certainty.',
    answer: '',
    status: 'Unanswered',
  },
  {
    topic: 'entrepreneurship',
    question: 'What makes a problem urgent? (Demo)',
    context: 'Some problems are common but businesses still ignore them.',
    answer:
      'Urgency is stronger when the problem has a deadline, recurring cost, lost revenue, or operational risk.',
    status: 'Answered',
  },
  {
    topic: 'sales',
    question: 'When should I discuss pricing? (Demo)',
    context: 'Discussing it too early may distract from understanding the problem.',
    answer:
      'First understand the problem and desired outcome, then discuss a price range when both sides have enough context.',
    status: 'Partially Understood',
  },
  {
    topic: 'react',
    question: 'When should state move to a parent component? (Demo)',
    context: 'I want to avoid unnecessary shared state.',
    answer:
      'Move it when multiple children need the same source of truth or must coordinate changes.',
    status: 'Answered',
  },
  {
    topic: 'finance',
    question: 'Which monthly cash-flow numbers should I track first? (Demo)',
    context: 'Looking for the smallest useful starting set.',
    answer: '',
    status: 'Unanswered',
  },
  {
    topic: 'system-design',
    question: 'When is caching actually necessary? (Demo)',
    context: 'Caching adds invalidation and operational complexity.',
    answer:
      'Add it after measuring a repeatable performance bottleneck that caching can directly reduce.',
    status: 'Answered',
  },
];

const upsertChildren = async (Model, definitions, topicIds, identityField) => {
  for (const definition of definitions) {
    const { topic, ...data } = definition;
    const topicId = topicIds.get(topic);
    await Model.findOneAndUpdate(
      { topic: topicId, [identityField]: data[identityField] },
      { ...data, topic: topicId },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
    );
  }
};

export const upsertDemoLearningData = async () => {
  const topicIds = new Map();

  for (const { key, ...definition } of topics) {
    const topic = await LearningTopic.findOneAndUpdate({ title: definition.title }, definition, {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    });
    topicIds.set(key, topic._id);
  }

  await Promise.all([
    upsertChildren(LearningEntry, entries, topicIds, 'title'),
    upsertChildren(LearningResource, resources, topicIds, 'title'),
    upsertChildren(LearningPractice, practiceItems, topicIds, 'title'),
    upsertChildren(LearningQuestion, questions, topicIds, 'question'),
  ]);

  return {
    topics: topics.length,
    entries: entries.length,
    resources: resources.length,
    practiceItems: practiceItems.length,
    questions: questions.length,
  };
};
