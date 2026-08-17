import mongoose from 'mongoose';

import { TOPIC_PRIORITIES, TOPIC_STATUSES } from './learning.constants.js';

const normalizeTags = (tags) =>
  Array.isArray(tags)
    ? [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))]
    : tags;

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    learningReason: {
      type: String,
      trim: true,
      maxlength: [3000, 'Learning reason cannot exceed 3000 characters'],
      default: '',
    },
    priority: {
      type: String,
      enum: { values: TOPIC_PRIORITIES, message: 'Invalid priority' },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: { values: TOPIC_STATUSES, message: 'Invalid topic status' },
      default: 'Want to Learn',
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    targetDate: { type: Date, default: null },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: [50, 'Each tag cannot exceed 50 characters'],
        },
      ],
      default: [],
      set: normalizeTags,
      validate: {
        validator: (tags) => tags.length <= 20,
        message: 'A topic cannot have more than 20 tags',
      },
    },
    isPinned: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, versionKey: false },
);

topicSchema.index({ archivedAt: 1, status: 1, priority: 1, updatedAt: -1 });
topicSchema.index({ title: 1, _id: 1 });

export const LearningTopic = mongoose.model('LearningTopic', topicSchema);
