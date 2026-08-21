import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.middleware.js';
import * as demoDataController from './demo-data.controller.js';

export const demoDataRouter = Router();

demoDataRouter.post('/', authenticate, demoDataController.createDemoData);
demoDataRouter.post('/contacts', authenticate, demoDataController.createDemoContacts);
demoDataRouter.post('/learning', authenticate, demoDataController.createDemoLearningData);
demoDataRouter.post('/portfolio', authenticate, demoDataController.createDemoPortfolioData);
