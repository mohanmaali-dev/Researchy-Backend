import { v2 as cloudinary } from 'cloudinary';

import { env } from '../../config/env.js';

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true,
});

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureConfigured = () => {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw createError('Cloudinary image storage is not configured', 503);
  }
};

const hasValidImageSignature = (file) => {
  const bytes = file.buffer;
  if (file.mimetype === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.mimetype === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (file.mimetype === 'image/webp') return bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  if (file.mimetype === 'image/gif') return ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString());
  return false;
};

const saveImage = async (file, { folder, invalidMessage, uploadMessage, resultFields }) => {
  if (!file?.buffer) return null;
  ensureConfigured();
  if (!hasValidImageSignature(file)) {
    throw createError(invalidMessage, 400);
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        overwrite: false,
        unique_filename: true,
      },
      (error, uploadResult) => {
        if (error) reject(createError(uploadMessage, 502));
        else resolve(uploadResult);
      },
    );
    stream.end(file.buffer);
  });

  return resultFields(result);
};

export const saveProjectImage = (file) => saveImage(file, {
  folder: '3v-workspace/portfolio-projects',
  invalidMessage: 'The selected file is not a valid project image',
  uploadMessage: 'Project image could not be uploaded',
  resultFields: (result) => ({ imagePublicId: result.public_id, imageUrl: result.secure_url }),
});

export const saveProfileImage = (file) => {
  if (file?.size > 5 * 1024 * 1024) throw createError('Profile image cannot exceed 5 MB', 400);
  return saveImage(file, {
    folder: '3v-workspace/portfolio-profile',
    invalidMessage: 'The selected file is not a valid profile image',
    uploadMessage: 'Profile image could not be uploaded',
    resultFields: (result) => ({ profileImagePublicId: result.public_id, profileImageUrl: result.secure_url }),
  });
};

export const saveResumePdf = async (file) => {
  if (!file?.buffer) return null;
  ensureConfigured();
  if (file.mimetype !== 'application/pdf' || file.buffer.subarray(0, 5).toString() !== '%PDF-') {
    throw createError('The selected resume must be a valid PDF file', 400);
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: '3v-workspace/portfolio-resumes',
        resource_type: 'image',
        allowed_formats: ['pdf'],
        overwrite: false,
        unique_filename: true,
      },
      (error, uploadResult) => {
        if (error) reject(createError('Resume PDF could not be uploaded', 502));
        else resolve(uploadResult);
      },
    );
    stream.end(file.buffer);
  });

  return { resumePublicId: result.public_id, resumeUrl: result.secure_url };
};

const deleteImage = async (publicId) => {
  if (!publicId) return;
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });
};

export const deleteProjectImage = deleteImage;
export const deleteProfileImage = deleteImage;
export const deleteResumePdf = deleteImage;
