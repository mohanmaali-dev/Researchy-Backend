import * as contactService from './contact.service.js';

export const createContact = async (request, response) => {
  const contact = await contactService.createContact(request.body);

  return response.status(201).json({
    success: true,
    message: 'Contact created successfully',
    data: contact,
  });
};

export const getContacts = async (request, response) => {
  const result = await contactService.getContacts(request.query);

  return response.status(200).json({
    success: true,
    message: 'Contacts fetched successfully',
    data: result.contacts,
    pagination: result.pagination,
  });
};

export const getContactById = async (request, response) => {
  const contact = await contactService.getContactById(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Contact fetched successfully',
    data: contact,
  });
};

export const updateContact = async (request, response) => {
  const contact = await contactService.updateContact(request.params.id, request.body);

  return response.status(200).json({
    success: true,
    message: 'Contact updated successfully',
    data: contact,
  });
};

export const deleteContact = async (request, response) => {
  await contactService.deleteContact(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Contact deleted successfully',
  });
};
