import { Router } from 'express';

import * as searchController from './search.controller.js';

export const searchRouter = Router();

searchRouter.get('/', searchController.search);
