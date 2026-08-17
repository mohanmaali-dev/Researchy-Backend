import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsOptions } from './config/cors.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/not-found.middleware.js';
import { globalRateLimiter } from './middlewares/rate-limit.middleware.js';
import { uploadDirectory } from './middlewares/upload.middleware.js';
import { apiRouter } from './routes/index.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(compression());
app.use(globalRateLimiter);
app.use(express.json({ limit: env.jsonBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: env.jsonBodyLimit }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDirectory));

app.use(morgan('dev'));

app.use(async (_request, _response, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(env.apiPrefix, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
