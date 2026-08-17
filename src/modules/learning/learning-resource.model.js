import mongoose from 'mongoose';

import { RESOURCE_STATUSES, RESOURCE_TYPES } from './learning.constants.js';

const resourceSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningTopic',
      required: [true, 'Learning Topic is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [250, 'Title cannot exceed 250 characters'],
    },
    type: {
      type: String,
      enum: { values: RESOURCE_TYPES, message: 'Invalid resource type' },
      default: 'Other',
    },
    url: {
      type: String,
      trim: true,
      maxlength: [1000, 'URL cannot exceed 1000 characters'],
      default: '',
      validate: {
        validator: (value) => !value || /^https?:\/\//i.test(value),
        message: 'URL must start with http:// or https://',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: { values: RESOURCE_STATUSES, message: 'Invalid resource status' },
      default: 'Saved',
    },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

resourceSchema.index({ topic: 1, status: 1, createdAt: -1 });

export const LearningResource = mongoose.model('LearningResource', resourceSchema);
