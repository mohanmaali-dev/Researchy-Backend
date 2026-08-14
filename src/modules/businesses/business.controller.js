import * as businessService from './business.service.js';

export const createBusiness = async (request, response) => {
  const business = await businessService.createBusiness(request.body);

  return response.status(201).json({
    success: true,
    message: 'Business created successfully',
    data: business,
  });
};

export const getBusinesses = async (_request, response) => {
  const businesses = await businessService.getBusinesses();

  return response.status(200).json({
    success: true,
    message: 'Businesses fetched successfully',
    data: businesses,
  });
};

export const getBusinessOptions = async (_request, response) => {
  const options = await businessService.getBusinessOptions();

  return response.status(200).json({
    success: true,
    message: 'Business options fetched successfully',
    data: options,
  });
};

export const getBusinessById = async (request, response) => {
  const business = await businessService.getBusinessById(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Business fetched successfully',
    data: business,
  });
};

export const updateBusiness = async (request, response) => {
  const business = await businessService.updateBusiness(request.params.id, request.body);

  return response.status(200).json({
    success: true,
    message: 'Business updated successfully',
    data: business,
  });
};

export const deleteBusiness = async (request, response) => {
  await businessService.deleteBusiness(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Business deleted successfully',
  });
};
