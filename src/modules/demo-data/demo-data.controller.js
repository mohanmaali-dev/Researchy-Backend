import { upsertDemoData } from '../../scripts/seed-demo-data.js';
import { upsertDemoContacts } from './demo-contact-data.js';
import { upsertDemoLearningData } from './demo-learning-data.js';

export const createDemoData = async (_request, response) => {
  const counts = await upsertDemoData();

  return response.status(201).json({
    success: true,
    message: 'Demo data is ready',
    data: counts,
  });
};

export const createDemoContacts = async (_request, response) => {
  const counts = await upsertDemoContacts();

  return response.status(201).json({
    success: true,
    message: 'Demo contacts are ready',
    data: counts,
  });
};

export const createDemoLearningData = async (_request, response) => {
  const counts = await upsertDemoLearningData();

  return response.status(201).json({
    success: true,
    message: 'Demo Learning data is ready',
    data: counts,
  });
};
