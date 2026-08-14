import { Router } from 'express';

import * as problemController from './problem.controller.js';

export const problemRouter = Router();

problemRouter.get('/', problemController.getProblems);
problemRouter.get('/patterns', problemController.getProblemPatterns);
problemRouter.get('/patterns/details', problemController.getProblemPatternDetails);
problemRouter.get('/:id', problemController.getProblemById);
problemRouter.post('/', problemController.createProblem);
problemRouter.patch('/:id', problemController.updateProblem);
problemRouter.delete('/:id', problemController.deleteProblem);
