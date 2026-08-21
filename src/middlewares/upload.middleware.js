import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import multer from 'multer';

const isServerlessRuntime = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT,
);

export const uploadDirectory = isServerlessRuntime
  ? path.join(tmpdir(), 'researchy-uploads')
  : path.resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    mkdir(uploadDirectory, { recursive: true }, (error) => {
      callback(error, uploadDirectory);
    });
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname);
    callback(null, `${randomUUID()}${extension}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image files are allowed'));
    }

    return callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const portfolioImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const portfolioImageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_request, file, callback) => {
    if (!portfolioImageTypes.has(file.mimetype)) {
      const error = new Error('Images must be JPG, PNG, WEBP, or GIF files');
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const portfolioProfileUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_request, file, callback) => {
    const validProfileImage = file.fieldname === 'profileImage' && portfolioImageTypes.has(file.mimetype);
    const validResume = file.fieldname === 'resumeFile' && file.mimetype === 'application/pdf';
    if (!validProfileImage && !validResume) {
      const error = new Error(file.fieldname === 'resumeFile'
        ? 'Resume must be a PDF file'
        : 'Profile image must be a JPG, PNG, WEBP, or GIF file');
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 2,
  },
});
