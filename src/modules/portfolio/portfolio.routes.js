import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.middleware.js';
import { portfolioContactRateLimiter } from '../../middlewares/rate-limit.middleware.js';
import { portfolioImageUpload, portfolioProfileUpload } from '../../middlewares/upload.middleware.js';
import * as portfolioController from './portfolio.controller.js';

export const portfolioRouter = Router();

portfolioRouter.get('/public/:profileId', portfolioController.getPublicPortfolio);
portfolioRouter.post('/contact-submissions', portfolioContactRateLimiter, portfolioController.createContactMessage);
portfolioRouter.use(authenticate);
portfolioRouter.get('/dashboard', portfolioController.getDashboard);
portfolioRouter.get('/profile', portfolioController.getProfile);
portfolioRouter.patch('/profile', portfolioProfileUpload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resumeFile', maxCount: 1 },
]), portfolioController.saveProfile);
portfolioRouter.get('/contact-submissions', portfolioController.getContactMessages);
portfolioRouter.patch('/contact-submissions/:id', portfolioController.updateContactMessage);
portfolioRouter.delete('/contact-submissions/:id', portfolioController.deleteContactMessage);
portfolioRouter.get('/projects', portfolioController.getProjects);
portfolioRouter.post('/projects', portfolioImageUpload.single('image'), portfolioController.createProject);
portfolioRouter.get('/projects/:id', portfolioController.getProject);
portfolioRouter.patch('/projects/:id/order', portfolioController.moveProject);
portfolioRouter.patch('/projects/:id', portfolioImageUpload.single('image'), portfolioController.updateProject);
portfolioRouter.delete('/projects/:id', portfolioController.deleteProject);
portfolioRouter.get('/skills', portfolioController.getSkills);
portfolioRouter.post('/skills', portfolioController.createSkill);
portfolioRouter.patch('/skills/:id', portfolioController.updateSkill);
portfolioRouter.delete('/skills/:id', portfolioController.deleteSkill);
portfolioRouter.get('/experiences', portfolioController.getExperiences);
portfolioRouter.post('/experiences', portfolioController.createExperience);
portfolioRouter.patch('/experiences/:id', portfolioController.updateExperience);
portfolioRouter.delete('/experiences/:id', portfolioController.deleteExperience);
