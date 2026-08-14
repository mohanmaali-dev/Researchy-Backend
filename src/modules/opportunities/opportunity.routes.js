import { Router } from 'express';

import * as opportunityController from './opportunity.controller.js';

export const opportunityRouter = Router();

opportunityRouter.get('/', opportunityController.getOpportunities);
opportunityRouter.get('/problem/:problemId', opportunityController.getOpportunityByProblem);
opportunityRouter.get('/:id', opportunityController.getOpportunityById);
opportunityRouter.post('/', opportunityController.createOpportunity);
opportunityRouter.patch('/:id', opportunityController.updateOpportunity);
opportunityRouter.delete('/:id', opportunityController.deleteOpportunity);
