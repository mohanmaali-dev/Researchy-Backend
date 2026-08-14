import { Router } from 'express';

import * as businessController from './business.controller.js';

export const businessRouter = Router();

businessRouter.get('/', businessController.getBusinesses);
businessRouter.get('/options', businessController.getBusinessOptions);
businessRouter.get('/:id', businessController.getBusinessById);
businessRouter.post('/', businessController.createBusiness);
businessRouter.patch('/:id', businessController.updateBusiness);
businessRouter.delete('/:id', businessController.deleteBusiness);
