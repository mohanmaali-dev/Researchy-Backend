import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export const createAccessToken = (userId, sessionId) =>
  jwt.sign({ userId, sessionId }, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn });

export const createRefreshToken = (userId, sessionId) =>
  jwt.sign({ userId, sessionId }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);
