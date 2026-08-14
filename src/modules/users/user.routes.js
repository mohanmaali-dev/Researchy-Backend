import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import * as userController from './user.controller.js';

export const userRouter = Router();

userRouter.use(authenticate, authorize('admin'));

userRouter.get('/', userController.getUsers);
userRouter.post('/', userController.createUser);
userRouter.get('/:id', userController.getUser);
userRouter.patch('/:id', userController.updateUser);
userRouter.delete('/:id', userController.deleteUser);
