import * as userService from './user.service.js';

export const createUser = async (request, response) => {
  const user = await userService.createUser(request.body);

  return response.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
    meta: {},
  });
};

export const getUsers = async (request, response) => {
  const result = await userService.getUsers(request.query);

  return response.status(200).json({
    success: true,
    message: 'Users fetched successfully',
    data: result.users,
    meta: result.pagination,
  });
};

export const getUser = async (request, response) => {
  const user = await userService.getUserById(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'User fetched successfully',
    data: user,
    meta: {},
  });
};

export const updateUser = async (request, response) => {
  const user = await userService.updateUser(request.params.id, request.body);

  return response.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
    meta: {},
  });
};

export const deleteUser = async (request, response) => {
  await userService.deleteUser(request.params.id);

  return response.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: null,
    meta: {},
  });
};
