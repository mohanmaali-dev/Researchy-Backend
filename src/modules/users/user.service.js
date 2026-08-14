import { User } from './user.model.js';
import { hashPassword } from '../../utils/password.js';

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createUser = async (data) => {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw createError('Email is already registered', 409);
  }

  const password = await hashPassword(data.password);
  return User.create({ ...data, password });
};

export const getUsers = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const search = query.search;
  const sortBy = ['name', 'email', 'role', 'createdAt', 'updatedAt'].includes(query.sortBy)
    ? query.sortBy
    : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const filters = {};

  if (query.role) filters.role = query.role;
  if (query.isActive !== undefined) filters.isActive = query.isActive === 'true';
  if (query.isEmailVerified !== undefined) {
    filters.isEmailVerified = query.isEmailVerified === 'true';
  }

  const databaseQuery = { ...filters };

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    databaseQuery.$or = [{ name: pattern }, { email: pattern }];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [users, total] = await Promise.all([
    User.find(databaseQuery).sort(sort).skip(skip).limit(limit).lean(),
    User.countDocuments(databaseQuery),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (id) => {
  const user = await User.findById(id).lean();

  if (!user) {
    throw createError('User not found', 404);
  }

  return user;
};

export const updateUser = async (id, data) => {
  if (data.email) {
    const existingUser = await User.findOne({ email: data.email, _id: { $ne: id } });

    if (existingUser) {
      throw createError('Email is already registered', 409);
    }
  }

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!user) {
    throw createError('User not found', 404);
  }

  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw createError('User not found', 404);
  }
};
