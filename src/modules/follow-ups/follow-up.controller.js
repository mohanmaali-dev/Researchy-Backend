import * as followUpService from './follow-up.service.js';

export const createFollowUp = async (request, response) => {
  const followUp = await followUpService.createFollowUp(request.body);
  return response
    .status(201)
    .json({ success: true, message: 'Follow-up created successfully', data: followUp });
};

export const getFollowUps = async (request, response) => {
  const followUps = await followUpService.getFollowUps({
    status: request.query.status,
    businessId: request.query.businessId,
    opportunityId: request.query.opportunityId,
  });
  return response
    .status(200)
    .json({ success: true, message: 'Follow-ups fetched successfully', data: followUps });
};

export const getUpcomingFollowUps = async (_request, response) => {
  const followUps = await followUpService.getUpcomingFollowUps();
  return response
    .status(200)
    .json({ success: true, message: 'Upcoming follow-ups fetched successfully', data: followUps });
};

export const getFollowUpById = async (request, response) => {
  const followUp = await followUpService.getFollowUpById(request.params.id);
  return response
    .status(200)
    .json({ success: true, message: 'Follow-up fetched successfully', data: followUp });
};

export const updateFollowUp = async (request, response) => {
  const followUp = await followUpService.updateFollowUp(request.params.id, request.body);
  return response
    .status(200)
    .json({ success: true, message: 'Follow-up updated successfully', data: followUp });
};

export const completeFollowUp = async (request, response) => {
  const followUp = await followUpService.completeFollowUp(request.params.id);
  return response
    .status(200)
    .json({ success: true, message: 'Follow-up completed successfully', data: followUp });
};

export const reopenFollowUp = async (request, response) => {
  const followUp = await followUpService.reopenFollowUp(request.params.id);
  return response
    .status(200)
    .json({ success: true, message: 'Follow-up reopened successfully', data: followUp });
};

export const deleteFollowUp = async (request, response) => {
  await followUpService.deleteFollowUp(request.params.id);
  return response.status(200).json({ success: true, message: 'Follow-up deleted successfully' });
};
