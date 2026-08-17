import * as service from './learning.service.js';

const sendCreated = (response, message, data) =>
  response.status(201).json({ success: true, message, data });
const sendData = (response, message, data, pagination) =>
  response
    .status(200)
    .json({ success: true, message, data, ...(pagination ? { pagination } : {}) });
const sendDeleted = (response, message) => response.status(200).json({ success: true, message });

export const getDashboard = async (_request, response) =>
  sendData(
    response,
    'Learning dashboard fetched successfully',
    await service.getLearningDashboard(),
  );
export const getTopicOptions = async (_request, response) =>
  sendData(response, 'Learning options fetched successfully', await service.getTopicOptions());
export const createTopic = async (request, response) =>
  sendCreated(
    response,
    'Learning Topic created successfully',
    await service.createTopic(request.body),
  );
export const getTopics = async (request, response) => {
  const result = await service.getTopics(request.query);
  return sendData(
    response,
    'Learning Topics fetched successfully',
    result.records,
    result.pagination,
  );
};
export const getTopicById = async (request, response) =>
  sendData(
    response,
    'Learning Topic fetched successfully',
    await service.getTopicById(request.params.id),
  );
export const updateTopic = async (request, response) =>
  sendData(
    response,
    'Learning Topic updated successfully',
    await service.updateTopic(request.params.id, request.body),
  );
export const deleteTopic = async (request, response) => {
  await service.deleteTopic(request.params.id);
  return sendDeleted(response, 'Learning Topic archived successfully');
};
export const restoreTopic = async (request, response) =>
  sendData(
    response,
    'Learning Topic restored successfully',
    await service.restoreTopic(request.params.id),
  );
export const permanentlyDeleteTopic = async (request, response) => {
  await service.permanentlyDeleteTopic(request.params.id);
  return sendDeleted(response, 'Learning Topic permanently deleted');
};

export const createEntry = async (request, response) =>
  sendCreated(
    response,
    'Learning Entry created successfully',
    await service.createEntry(request.body),
  );
export const getEntries = async (request, response) => {
  const result = await service.getEntries(request.query);
  return sendData(
    response,
    'Learning Entries fetched successfully',
    result.records,
    result.pagination,
  );
};
export const getEntryById = async (request, response) =>
  sendData(
    response,
    'Learning Entry fetched successfully',
    await service.getEntryById(request.params.id),
  );
export const updateEntry = async (request, response) =>
  sendData(
    response,
    'Learning Entry updated successfully',
    await service.updateEntry(request.params.id, request.body),
  );
export const deleteEntry = async (request, response) => {
  await service.deleteEntry(request.params.id);
  return sendDeleted(response, 'Learning Entry deleted successfully');
};

export const createResource = async (request, response) =>
  sendCreated(
    response,
    'Resource created successfully',
    await service.createResource(request.body),
  );
export const getResources = async (request, response) => {
  const result = await service.getResources(request.query);
  return sendData(response, 'Resources fetched successfully', result.records, result.pagination);
};
export const getResourceById = async (request, response) =>
  sendData(
    response,
    'Resource fetched successfully',
    await service.getResourceById(request.params.id),
  );
export const updateResource = async (request, response) =>
  sendData(
    response,
    'Resource updated successfully',
    await service.updateResource(request.params.id, request.body),
  );
export const deleteResource = async (request, response) => {
  await service.deleteResource(request.params.id);
  return sendDeleted(response, 'Resource deleted successfully');
};

export const createPractice = async (request, response) =>
  sendCreated(
    response,
    'Practice created successfully',
    await service.createPractice(request.body),
  );
export const getPracticeItems = async (request, response) => {
  const result = await service.getPracticeItems(request.query);
  return sendData(
    response,
    'Practice items fetched successfully',
    result.records,
    result.pagination,
  );
};
export const getPracticeById = async (request, response) =>
  sendData(
    response,
    'Practice fetched successfully',
    await service.getPracticeById(request.params.id),
  );
export const updatePractice = async (request, response) =>
  sendData(
    response,
    'Practice updated successfully',
    await service.updatePractice(request.params.id, request.body),
  );
export const deletePractice = async (request, response) => {
  await service.deletePractice(request.params.id);
  return sendDeleted(response, 'Practice deleted successfully');
};

export const createQuestion = async (request, response) =>
  sendCreated(
    response,
    'Question created successfully',
    await service.createQuestion(request.body),
  );
export const getQuestions = async (request, response) => {
  const result = await service.getQuestions(request.query);
  return sendData(response, 'Questions fetched successfully', result.records, result.pagination);
};
export const getQuestionById = async (request, response) =>
  sendData(
    response,
    'Question fetched successfully',
    await service.getQuestionById(request.params.id),
  );
export const updateQuestion = async (request, response) =>
  sendData(
    response,
    'Question updated successfully',
    await service.updateQuestion(request.params.id, request.body),
  );
export const deleteQuestion = async (request, response) => {
  await service.deleteQuestion(request.params.id);
  return sendDeleted(response, 'Question deleted successfully');
};

export const getTakeaways = async (request, response) => {
  const result = await service.getKeyTakeaways(request.query);
  return sendData(
    response,
    'Key Takeaways fetched successfully',
    result.records,
    result.pagination,
  );
};
