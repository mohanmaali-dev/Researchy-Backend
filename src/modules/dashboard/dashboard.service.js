import { Business } from '../businesses/business.model.js';
import { Conversation } from '../conversations/conversation.model.js';
import { getFollowUps, getUpcomingFollowUps } from '../follow-ups/follow-up.service.js';
import { FollowUp, getStartOfTodayUtc } from '../follow-ups/follow-up.model.js';
import { Opportunity } from '../opportunities/opportunity.model.js';
import { Problem } from '../problems/problem.model.js';
import { getProblemPatterns } from '../problems/problem.service.js';

const DASHBOARD_LIMIT = 5;
const RECENT_PER_TYPE = 2;

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

export const getDashboard = async () => {
  const today = getStartOfTodayUtc();
  const weekStart = getStartOfWeekUtc();

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
    FollowUp.countDocuments({ status: 'Pending', followUpDate: { $lt: today } }),
    Business.countDocuments({ dateVisitedOrResearched: { $gte: weekStart } }),
    Conversation.countDocuments({ conversationDate: { $gte: weekStart } }),
    Problem.countDocuments({ createdAt: { $gte: weekStart } }),
    Opportunity.countDocuments({ createdAt: { $gte: weekStart } }),
    getStrongOpportunities(),
    getProblemPatterns({ limit: DASHBOARD_LIMIT }),
    getUpcomingFollowUps(DASHBOARD_LIMIT),
    getFollowUps({ status: 'Overdue', limit: DASHBOARD_LIMIT }),
    getRecentRecords(),
  ]);

  return {
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
