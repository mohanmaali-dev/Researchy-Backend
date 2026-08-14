import { User } from '../modules/users/user.model.js';

export const authorize =
  (...roles) =>
  async (request, _response, next) => {
    const user = await User.findById(request.userId).select('role isActive');

    if (!user || !user.isActive) {
      const error = new Error('User account is not available');
      error.statusCode = 401;
      return next(error);
    }

    if (!roles.includes(user.role)) {
      const error = new Error('You do not have permission to perform this action');
      error.statusCode = 403;
      return next(error);
    }

    return next();
  };
