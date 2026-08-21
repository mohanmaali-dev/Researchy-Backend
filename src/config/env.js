import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5174')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  apiPrefix: process.env.API_PREFIX || '/api',
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '10kb',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
  emailHost: process.env.EMAIL_HOST,
  emailEnabled: process.env.EMAIL_ENABLED === 'true',
  requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
  emailPort: Number(process.env.EMAIL_PORT) || 587,
  emailSecure: process.env.EMAIL_SECURE === 'true',
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailFrom: process.env.EMAIL_FROM,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5174',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  jwtRefreshCookieDays: Number(process.env.JWT_REFRESH_COOKIE_DAYS) || 7,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
