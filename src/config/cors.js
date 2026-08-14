import { env } from './env.js';

export const corsOptions = {
  origin: env.corsOrigins,
  credentials: true,
};
