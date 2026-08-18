import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';
import * as noteController from './note.controller.js';

export const noteRouter = Router();

noteRouter.use(authenticate);

noteRouter.get('/', noteController.getNotes);
noteRouter.post('/', upload.single('image'), noteController.createNote);
noteRouter.get('/:id', noteController.getNoteById);
noteRouter.patch('/:id', upload.single('image'), noteController.updateNote);
noteRouter.delete('/:id', noteController.deleteNote);
