import { verifyAccessToken } from '../utils/jwt.js';
import { AuthToken } from '../modules/auth/auth-token.model.js';

export const authenticate = async (request, _response, next) => {
  try {
    const bearerToken = request.headers.authorization?.split(' ')[1];
    const token = request.cookies.accessToken || bearerToken;

    if (!token) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      return next(error);
    }

    const payload = verifyAccessToken(token);
    const session = payload.sessionId
      ? await AuthToken.findOne({ _id: payload.sessionId, user: payload.userId }).select(
          'lastUsedAt',
        )
      : null;
    if (!session) {
      const error = new Error('Session is no longer active');
      error.statusCode = 401;
      return next(error);
    }

    request.userId = payload.userId;
    request.sessionId = payload.sessionId;
    if (!session.lastUsedAt || Date.now() - session.lastUsedAt.getTime() > 5 * 60 * 1000) {
      await AuthToken.updateOne({ _id: session._id }, { lastUsedAt: new Date() });
    }
    return next();
  } catch {
    const error = new Error('Invalid or expired access token');
    error.statusCode = 401;
    return next(error);
  }
};
