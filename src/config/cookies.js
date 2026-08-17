import { env } from './env.js';

const isProduction = env.nodeEnv === 'production';
const sharedCookieOptions = {
  httpOnly: true,
  path: '/',
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
};

export const accessCookieOptions = {
  ...sharedCookieOptions,
  maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions = {
  ...sharedCookieOptions,
  maxAge: env.jwtRefreshCookieDays * 24 * 60 * 60 * 1000,
};
