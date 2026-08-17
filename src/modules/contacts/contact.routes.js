import { Router } from 'express';

import * as contactController from './contact.controller.js';

export const contactRouter = Router();

contactRouter.get('/', contactController.getContacts);
contactRouter.get('/:id', contactController.getContactById);
contactRouter.post('/', contactController.createContact);
contactRouter.patch('/:id', contactController.updateContact);
contactRouter.delete('/:id', contactController.deleteContact);
