import { accessCookieOptions, refreshCookieOptions } from '../../config/cookies.js';
import { env } from '../../config/env.js';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './auth.constants.js';
import * as authService from './auth.service.js';

const setAuthCookies = (response, accessToken, refreshToken) => {
  response.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions);
  response.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
};

export const register = async (request, response) => {
  const result = await authService.register(request.body);
  setAuthCookies(response, result.accessToken, result.refreshToken);

  return response.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result.user,
    meta: { requiresEmailVerification: env.requireEmailVerification },
  });
};

export const login = async (request, response) => {
  const result = await authService.login(request.body);
  setAuthCookies(response, result.accessToken, result.refreshToken);

  return response.status(200).json({
    success: true,
    message: 'Login successful',
    data: result.user,
    meta: { requiresEmailVerification: result.requiresEmailVerification },
  });
};

export const logout = async (request, response) => {
  await authService.logout(request.cookies[REFRESH_COOKIE]);
  response.clearCookie(ACCESS_COOKIE, accessCookieOptions);
  response.clearCookie(REFRESH_COOKIE, refreshCookieOptions);

  return response.status(200).json({ success: true, message: 'Logout successful' });
};

export const refresh = async (request, response) => {
  const tokens = await authService.refresh(request.cookies[REFRESH_COOKIE]);
  setAuthCookies(response, tokens.accessToken, tokens.refreshToken);

  return response.status(200).json({ success: true, message: 'Token refreshed' });
};

export const getCurrentUser = async (request, response) => {
  const user = await authService.getCurrentUser(request.userId);
  return response.status(200).json({ success: true, message: 'User fetched', data: user });
};

export const changePassword = async (request, response) => {
  const { currentPassword, newPassword } = request.body;
  await authService.changePassword(request.userId, currentPassword, newPassword);
  response.clearCookie(ACCESS_COOKIE, accessCookieOptions);
  response.clearCookie(REFRESH_COOKIE, refreshCookieOptions);

  return response.status(200).json({
    success: true,
    message: 'Password changed. Please log in again.',
  });
};

export const forgotPassword = async (request, response) => {
  await authService.forgotPassword(request.body.email);
  return response.status(200).json({
    success: true,
    message: 'If the email exists, a reset link has been sent',
  });
};

export const resetPassword = async (request, response) => {
  const { token, password } = request.body;
  await authService.resetPassword(token, password);
  return response.status(200).json({ success: true, message: 'Password reset successful' });
};

export const sendVerificationEmail = async (request, response) => {
  const emailSent = await authService.sendVerificationEmail(request.userId);

  return response.status(200).json({
    success: true,
    message: emailSent ? 'Verification email sent' : 'Email is already verified',
  });
};

export const verifyEmail = async (request, response) => {
  await authService.verifyEmail(request.body.token);
  return response.status(200).json({ success: true, message: 'Email verified successfully' });
};
