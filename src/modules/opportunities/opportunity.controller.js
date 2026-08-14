import * as opportunityService from './opportunity.service.js';

export const createOpportunity = async (request, response) => {
  const opportunity = await opportunityService.createOpportunity(request.body);

  return response.status(201).json({
    success: true,
    message: 'Opportunity created successfully',
    data: opportunity,
  });
};

export const getOpportunities = async (_request, response) => {
  const opportunities = await opportunityService.getOpportunities();

  return response.status(200).json({
    success: true,
    message: 'Opportunities fetched successfully',
    data: opportunities,
  });
};

export const getOpportunityByProblem = async (request, response) => {
  const opportunity = await opportunityService.getOpportunityByProblem(request.params.problemId);

  return response.status(200).json({
    success: true,
    message: opportunity ? 'Opportunity fetched successfully' : 'No opportunity for this Problem',
    data: opportunity,
  });
};

export const getOpportunityById = async (request, response) => {
  const opportunity = await opportunityService.getOpportunityById(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Opportunity fetched successfully',
    data: opportunity,
  });
};

export const updateOpportunity = async (request, response) => {
  const opportunity = await opportunityService.updateOpportunity(request.params.id, request.body);

  return response.status(200).json({
    success: true,
    message: 'Opportunity updated successfully',
    data: opportunity,
  });
};

export const deleteOpportunity = async (request, response) => {
  await opportunityService.deleteOpportunity(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Opportunity deleted successfully',
  });
};
