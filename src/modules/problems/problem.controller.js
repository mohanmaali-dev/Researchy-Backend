import * as problemService from './problem.service.js';

export const createProblem = async (request, response) => {
  const problem = await problemService.createProblem(request.body);

  return response.status(201).json({
    success: true,
    message: 'Problem created successfully',
    data: problem,
  });
};

export const getProblems = async (request, response) => {
  const problems = await problemService.getProblems({
    businessId: request.query.businessId,
    conversationId: request.query.conversationId,
  });

  return response.status(200).json({
    success: true,
    message: 'Problems fetched successfully',
    data: problems,
  });
};

export const getProblemById = async (request, response) => {
  const problem = await problemService.getProblemById(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Problem fetched successfully',
    data: problem,
  });
};

export const getProblemPatterns = async (_request, response) => {
  const patterns = await problemService.getProblemPatterns();

  return response.status(200).json({
    success: true,
    message: 'Problem patterns fetched successfully',
    data: patterns,
  });
};

export const getProblemPatternDetails = async (request, response) => {
  const patternDetails = await problemService.getProblemPatternDetails({
    type: request.query.type,
    key: request.query.key,
  });

  return response.status(200).json({
    success: true,
    message: 'Problem pattern details fetched successfully',
    data: patternDetails,
  });
};

export const updateProblem = async (request, response) => {
  const problem = await problemService.updateProblem(request.params.id, request.body);

  return response.status(200).json({
    success: true,
    message: 'Problem updated successfully',
    data: problem,
  });
};

export const deleteProblem = async (request, response) => {
  await problemService.deleteProblem(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Problem deleted successfully',
  });
};
