import { Router } from 'express';

import { authRouter } from '../modules/auth/auth.routes.js';
import { businessRouter } from '../modules/businesses/business.routes.js';
import { conversationRouter } from '../modules/conversations/conversation.routes.js';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js';
import { followUpRouter } from '../modules/follow-ups/follow-up.routes.js';
import { noteRouter } from '../modules/notes/note.routes.js';
import { opportunityRouter } from '../modules/opportunities/opportunity.routes.js';
import { problemRouter } from '../modules/problems/problem.routes.js';
import { userRouter } from '../modules/users/user.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.status(200).json({
    success: true,
    message: 'Service is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    meta: {},
  });
});

apiRouter.use('/users', userRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/notes', noteRouter);
apiRouter.use('/businesses', businessRouter);
apiRouter.use('/conversations', conversationRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/problems', problemRouter);
apiRouter.use('/opportunities', opportunityRouter);
apiRouter.use('/follow-ups', followUpRouter);
