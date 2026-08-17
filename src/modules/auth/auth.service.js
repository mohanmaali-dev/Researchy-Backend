import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { env } from '../../config/env.js';
import { sendEmail } from '../../services/email.service.js';
import { comparePassword, hashPassword } from '../../utils/password.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { createRandomToken, hashToken } from '../../utils/token.js';
import { User } from '../users/user.model.js';
import { createUser } from '../users/user.service.js';
import { AuthToken } from './auth-token.model.js';
import { PasswordResetToken } from './password-reset-token.model.js';

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const saveRefreshToken = async (userId, sessionId, refreshToken, session = {}) => {
  const decoded = jwt.decode(refreshToken);

  await AuthToken.create({
    _id: sessionId,
    user: userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000),
    userAgent: session.userAgent || '',
    ipAddress: session.ipAddress || '',
    lastUsedAt: new Date(),
  });
};

const issueTokens = async (userId, session) => {
  const sessionId = new mongoose.Types.ObjectId();
  const accessToken = createAccessToken(userId, sessionId.toString());
  const refreshToken = createRefreshToken(userId, sessionId.toString());
  await saveRefreshToken(userId, sessionId, refreshToken, session);
  return { accessToken, refreshToken };
};

export const register = async (data, session) => {
  const user = await createUser(data);
  const tokens = await issueTokens(user.id, session);

  if (env.requireEmailVerification) {
    await sendVerificationEmail(user.id);
  }

  return { user, ...tokens };
};

export const login = async ({ email, password }, session) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await comparePassword(password, user.password))) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw createError('User account is inactive', 403);
  }

  const tokens = await issueTokens(user.id, session);
  user.password = undefined;

  if (env.requireEmailVerification && !user.isEmailVerified) {
    await sendVerificationEmail(user.id);
    return { user, ...tokens, requiresEmailVerification: true };
  }

  return { user, ...tokens, requiresEmailVerification: false };
};

export const logout = async (refreshToken) => {
  if (refreshToken) {
    await AuthToken.deleteOne({ tokenHash: hashToken(refreshToken) });
  }
};

export const refresh = async (refreshToken, session = {}) => {
  if (!refreshToken) {
    throw createError('Refresh token is required', 401);
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw createError('Invalid or expired refresh token', 401);
  }

  const storedToken = await AuthToken.findOneAndDelete({ tokenHash: hashToken(refreshToken) });
  const user = await User.findById(payload.userId);

  if (!storedToken || !user || !user.isActive) {
    throw createError('Refresh token is not valid', 401);
  }

  return issueTokens(user.id, {
    userAgent: session.userAgent || storedToken.userAgent,
    ipAddress: session.ipAddress || storedToken.ipAddress,
  });
};

export const getActiveSessions = async (userId, currentRefreshToken) => {
  const currentHash = currentRefreshToken ? hashToken(currentRefreshToken) : '';
  const sessions = await AuthToken.find({ user: userId, expiresAt: { $gt: new Date() } })
    .sort({ lastUsedAt: -1, createdAt: -1 })
    .select('tokenHash userAgent ipAddress lastUsedAt createdAt expiresAt')
    .lean();

  return sessions.map(({ tokenHash, ...session }) => ({
    ...session,
    isCurrent: Boolean(currentHash && tokenHash === currentHash),
  }));
};

export const revokeSession = async (userId, sessionId) => {
  const session = await AuthToken.findOneAndDelete({ _id: sessionId, user: userId });
  if (!session) throw createError('Session not found', 404);
  return session;
};

export const revokeOtherSessions = async (userId, currentRefreshToken) => {
  if (!currentRefreshToken) throw createError('Current session token is required', 400);
  const result = await AuthToken.deleteMany({
    user: userId,
    tokenHash: { $ne: hashToken(currentRefreshToken) },
  });
  return { revoked: result.deletedCount };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createError('User not found', 404);
  }

  return user;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user || !(await comparePassword(currentPassword, user.password))) {
    throw createError('Current password is incorrect', 400);
  }

  user.password = await hashPassword(newPassword);
  await user.save();
  await AuthToken.deleteMany({ user: userId });
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) return;

  await PasswordResetToken.deleteMany({ user: user.id, type: 'password-reset' });
  const token = createRandomToken();

  await PasswordResetToken.create({
    user: user.id,
    tokenHash: hashToken(token),
    type: 'password-reset',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  await sendEmail({
    to: user.email,
    subject: 'Reset your password',
    text: `${env.clientUrl}/reset-password?token=${token}`,
  });
};

export const resetPassword = async (token, password) => {
  const resetToken = await PasswordResetToken.findOne({
    tokenHash: hashToken(token),
    type: 'password-reset',
    expiresAt: { $gt: new Date() },
  });

  if (!resetToken) {
    throw createError('Reset token is invalid or expired', 400);
  }

  await User.findByIdAndUpdate(resetToken.user, { password: await hashPassword(password) });
  await PasswordResetToken.deleteOne({ _id: resetToken.id });
  await AuthToken.deleteMany({ user: resetToken.user });
};

export const sendVerificationEmail = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createError('User not found', 404);
  }

  if (user.isEmailVerified) {
    return false;
  }

  await PasswordResetToken.deleteMany({ user: user.id, type: 'email-verification' });
  const token = createRandomToken();

  await PasswordResetToken.create({
    user: user.id,
    tokenHash: hashToken(token),
    type: 'email-verification',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await sendEmail({
    to: user.email,
    subject: 'Verify your email',
    text: `${env.clientUrl}/verify-email?token=${token}`,
  });

  return true;
};

export const verifyEmail = async (token) => {
  const verificationToken = await PasswordResetToken.findOne({
    tokenHash: hashToken(token),
    type: 'email-verification',
    expiresAt: { $gt: new Date() },
  });

  if (!verificationToken) {
    throw createError('Verification token is invalid or expired', 400);
  }

  await User.findByIdAndUpdate(verificationToken.user, { isEmailVerified: true });
  await PasswordResetToken.deleteOne({ _id: verificationToken.id });
};
