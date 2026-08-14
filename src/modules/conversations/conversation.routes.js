import { Router } from 'express';

import * as conversationController from './conversation.controller.js';

export const conversationRouter = Router();

conversationRouter.get('/', conversationController.getConversations);
conversationRouter.get('/:id', conversationController.getConversationById);
conversationRouter.post('/', conversationController.createConversation);
conversationRouter.patch('/:id', conversationController.updateConversation);
conversationRouter.delete('/:id', conversationController.deleteConversation);
