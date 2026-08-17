import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.middleware.js';
import * as controller from './learning.controller.js';

export const learningRouter = Router();

learningRouter.use(authenticate);

learningRouter.get('/dashboard', controller.getDashboard);
learningRouter.get('/topic-options', controller.getTopicOptions);
learningRouter.get('/takeaways', controller.getTakeaways);

learningRouter.get('/topics', controller.getTopics);
learningRouter.post('/topics', controller.createTopic);
learningRouter.get('/topics/:id', controller.getTopicById);
learningRouter.patch('/topics/:id', controller.updateTopic);
learningRouter.delete('/topics/:id', controller.deleteTopic);
learningRouter.patch('/topics/:id/restore', controller.restoreTopic);
learningRouter.delete('/topics/:id/permanent', controller.permanentlyDeleteTopic);

learningRouter.get('/entries', controller.getEntries);
learningRouter.post('/entries', controller.createEntry);
learningRouter.get('/entries/:id', controller.getEntryById);
learningRouter.patch('/entries/:id', controller.updateEntry);
learningRouter.delete('/entries/:id', controller.deleteEntry);

learningRouter.get('/resources', controller.getResources);
learningRouter.post('/resources', controller.createResource);
learningRouter.get('/resources/:id', controller.getResourceById);
learningRouter.patch('/resources/:id', controller.updateResource);
learningRouter.delete('/resources/:id', controller.deleteResource);

learningRouter.get('/practice', controller.getPracticeItems);
learningRouter.post('/practice', controller.createPractice);
learningRouter.get('/practice/:id', controller.getPracticeById);
learningRouter.patch('/practice/:id', controller.updatePractice);
learningRouter.delete('/practice/:id', controller.deletePractice);

learningRouter.get('/questions', controller.getQuestions);
learningRouter.post('/questions', controller.createQuestion);
learningRouter.get('/questions/:id', controller.getQuestionById);
learningRouter.patch('/questions/:id', controller.updateQuestion);
learningRouter.delete('/questions/:id', controller.deleteQuestion);
