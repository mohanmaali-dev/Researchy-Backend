import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = (request, _response, next) => {
  try {
    const bearerToken = request.headers.authorization?.split(' ')[1];
    const token = request.cookies.accessToken || bearerToken;

    if (!token) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      return next(error);
    }

    request.userId = verifyAccessToken(token).userId;
    return next();
  } catch {
    const error = new Error('Invalid or expired access token');
    error.statusCode = 401;
    return next(error);
  }
};
