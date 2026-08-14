import { Router } from 'express';

import * as followUpController from './follow-up.controller.js';

export const followUpRouter = Router();

followUpRouter.get('/', followUpController.getFollowUps);
followUpRouter.get('/upcoming', followUpController.getUpcomingFollowUps);
followUpRouter.get('/:id', followUpController.getFollowUpById);
followUpRouter.post('/', followUpController.createFollowUp);
followUpRouter.patch('/:id', followUpController.updateFollowUp);
followUpRouter.patch('/:id/complete', followUpController.completeFollowUp);
followUpRouter.patch('/:id/reopen', followUpController.reopenFollowUp);
followUpRouter.delete('/:id', followUpController.deleteFollowUp);
