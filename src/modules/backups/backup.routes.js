import { Router } from 'express';

import * as backupController from './backup.controller.js';

export const backupRouter = Router();

backupRouter.get('/', backupController.downloadBackup);
backupRouter.post('/restore', backupController.restoreBackup);
