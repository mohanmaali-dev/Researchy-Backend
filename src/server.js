import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const start = async () => {
  await connectDatabase();
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });
};

start().catch((error) => {
  logger.error(error.message);
  process.exit(1);
});
