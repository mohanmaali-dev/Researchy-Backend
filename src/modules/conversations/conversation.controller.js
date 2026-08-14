import * as conversationService from './conversation.service.js';

export const createConversation = async (request, response) => {
  const conversation = await conversationService.createConversation(request.body);

  return response.status(201).json({
    success: true,
    message: 'Conversation created successfully',
    data: conversation,
  });
};

export const getConversations = async (request, response) => {
  if (!request.query.businessId) {
    const error = new Error('businessId query parameter is required');
    error.statusCode = 400;
    throw error;
  }

  const conversations = await conversationService.getConversationsByBusiness(
    request.query.businessId,
  );

  return response.status(200).json({
    success: true,
    message: 'Conversations fetched successfully',
    data: conversations,
  });
};

export const getConversationById = async (request, response) => {
  const conversation = await conversationService.getConversationById(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Conversation fetched successfully',
    data: conversation,
  });
};

export const updateConversation = async (request, response) => {
  const conversation = await conversationService.updateConversation(
    request.params.id,
    request.body,
  );

  return response.status(200).json({
    success: true,
    message: 'Conversation updated successfully',
    data: conversation,
  });
};

export const deleteConversation = async (request, response) => {
  await conversationService.deleteConversation(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Conversation deleted successfully',
  });
};
