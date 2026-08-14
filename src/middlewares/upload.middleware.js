import { randomUUID } from 'node:crypto';
import path from 'node:path';

import multer from 'multer';

const storage = multer.diskStorage({
  destination: 'uploads/',
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
