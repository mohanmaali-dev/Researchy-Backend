import { Business } from '../businesses/business.model.js';
import { Conversation } from '../conversations/conversation.model.js';
import { getFollowUps, getUpcomingFollowUps } from '../follow-ups/follow-up.service.js';
import { FollowUp, getStartOfTodayUtc } from '../follow-ups/follow-up.model.js';
import { Opportunity } from '../opportunities/opportunity.model.js';
import { Problem } from '../problems/problem.model.js';
import { getProblemPatterns } from '../problems/problem.service.js';

const DASHBOARD_LIMIT = 5;
const RECENT_PER_TYPE = 2;

const getReferenceDate = (value) => {
  if (!value) return getStartOfTodayUtc();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const error = new Error('Dashboard date must use YYYY-MM-DD format');
    error.statusCode = 400;
    throw error;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    const error = new Error('Dashboard date must be a valid date');
    error.statusCode = 400;
    throw error;
  }

  return date;
};

const getStartOfWeekUtc = (now = new Date()) => {
  const today = getStartOfTodayUtc(now);
  const daysSinceMonday = (today.getUTCDay() + 6) % 7;
  today.setUTCDate(today.getUTCDate() - daysSinceMonday);
  return today;
};

const getStrongOpportunities = () =>
  Opportunity.find()
    .sort({ opportunityScore: -1, createdAt: -1 })
    .limit(DASHBOARD_LIMIT)
    .select('problem business opportunityScore validationStatus difficulty createdAt')
    .populate([
      { path: 'problem', select: 'title' },
      { path: 'business', select: 'companyName' },
    ])
    .lean();

const getRecentRecords = async () => {
  const [businesses, conversations, problems, opportunities] = await Promise.all([
    Business.find()
      .sort({ createdAt: -1 })
      .limit(RECENT_PER_TYPE)
      .select('companyName createdAt')
      .lean(),
    Conversation.find()
      .sort({ createdAt: -1 })
      .limit(RECENT_PER_TYPE)
      .select('business personName personRole createdAt')
      .populate('business', 'companyName')
      .lean(),
    Problem.find()
      .sort({ createdAt: -1 })
      .limit(RECENT_PER_TYPE)
      .select('business title createdAt')
      .populate('business', 'companyName')
      .lean(),
    Opportunity.find()
      .sort({ createdAt: -1 })
      .limit(RECENT_PER_TYPE)
      .select('problem business createdAt')
      .populate([
        { path: 'problem', select: 'title' },
        { path: 'business', select: 'companyName' },
      ])
      .lean(),
  ]);

  return [
    ...businesses.map((business) => ({
      type: 'business',
      id: business._id,
      title: business.companyName,
      subtitle: 'Business added',
      createdAt: business.createdAt,
      path: `/businesses/${business._id}`,
    })),
    ...conversations.map((conversation) => ({
      type: 'conversation',
      id: conversation._id,
      title: conversation.personName,
      subtitle: `${conversation.personRole} · ${conversation.business?.companyName || 'Business unavailable'}`,
      createdAt: conversation.createdAt,
      path: `/conversations/${conversation._id}`,
    })),
    ...problems.map((problem) => ({
      type: 'problem',
      id: problem._id,
      title: problem.title,
      subtitle: problem.business?.companyName || 'Business unavailable',
      createdAt: problem.createdAt,
      path: `/problems/${problem._id}`,
    })),
    ...opportunities.map((opportunity) => ({
      type: 'opportunity',
      id: opportunity._id,
      title: opportunity.problem?.title || 'Opportunity',
      subtitle: opportunity.business?.companyName || 'Business unavailable',
      createdAt: opportunity.createdAt,
      path: `/opportunities/${opportunity._id}`,
    })),
  ]
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
    .slice(0, DASHBOARD_LIMIT + 1);
};

export const getDashboard = async (date) => {
  const referenceDate = getReferenceDate(date);
  const weekStart = getStartOfWeekUtc(referenceDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const [
    totalBusinesses,
    totalConversations,
    totalProblems,
    totalOpportunities,
    pendingFollowUps,
    overdueFollowUps,
    businessesThisWeek,
    conversationsThisWeek,
    problemsThisWeek,
    opportunitiesThisWeek,
    strongOpportunities,
    repeatedProblems,
    upcoming,
    overdue,
    recentActivity,
  ] = await Promise.all([
    Business.countDocuments(),
    Conversation.countDocuments(),
    Problem.countDocuments(),
    Opportunity.countDocuments(),
    FollowUp.countDocuments({ status: 'Pending' }),
    FollowUp.countDocuments({ status: 'Pending', followUpDate: { $lt: referenceDate } }),
    Business.countDocuments({ dateVisitedOrResearched: { $gte: weekStart, $lt: weekEnd } }),
    Conversation.countDocuments({ conversationDate: { $gte: weekStart, $lt: weekEnd } }),
    Problem.countDocuments({ createdAt: { $gte: weekStart, $lt: weekEnd } }),
    Opportunity.countDocuments({ createdAt: { $gte: weekStart, $lt: weekEnd } }),
    getStrongOpportunities(),
    getProblemPatterns({ limit: DASHBOARD_LIMIT }),
    getUpcomingFollowUps(DASHBOARD_LIMIT, referenceDate),
    getFollowUps({ status: 'Overdue', limit: DASHBOARD_LIMIT, referenceDate }),
    getRecentRecords(),
  ]);

  return {
    referenceDate,
    summary: {
      totalBusinesses,
      totalConversations,
      totalProblems,
      totalOpportunities,
      pendingFollowUps,
      overdueFollowUps,
    },
    researchProgress: {
      businessesThisWeek,
      conversationsThisWeek,
      problemsThisWeek,
      opportunitiesThisWeek,
    },
    strongOpportunities,
    repeatedProblems,
    followUps: { upcoming, overdue },
    recentActivity,
  };
};

export { getStartOfWeekUtc };
