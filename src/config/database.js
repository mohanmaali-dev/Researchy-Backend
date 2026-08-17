import mongoose from 'mongoose';

import { env } from './env.js';
import { logger } from './logger.js';

let connectionPromise = null;

export const connectDatabase = async () => {
  if (!env.mongoUri) {
    const error = new Error('MONGODB_URI is not configured');
    error.statusCode = 500;
    throw error;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.mongoUri, {
        serverSelectionTimeoutMS: 10000,
      })
      .then(() => {
        logger.info('MongoDB connected');
        return mongoose.connection;
      });
  }

  const activeConnectionPromise = connectionPromise;

  try {
    return await activeConnectionPromise;
  } finally {
    if (connectionPromise === activeConnectionPromise) {
      connectionPromise = null;
    }
  }
};
