import { env } from './env.js';

export const accessCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: env.jwtRefreshCookieDays * 24 * 60 * 60 * 1000,
};
