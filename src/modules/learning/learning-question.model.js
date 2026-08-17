import mongoose from 'mongoose';

import { QUESTION_STATUSES } from './learning.constants.js';

const questionSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningTopic',
      required: [true, 'Learning Topic is required'],
      index: true,
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: [1000, 'Question cannot exceed 1000 characters'],
    },
    context: {
      type: String,
      trim: true,
      maxlength: [5000, 'Context cannot exceed 5000 characters'],
      default: '',
    },
    answer: {
      type: String,
      trim: true,
      maxlength: [10000, 'Answer cannot exceed 10000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: { values: QUESTION_STATUSES, message: 'Invalid question status' },
      default: 'Unanswered',
    },
  },
  { timestamps: true, versionKey: false },
);

questionSchema.index({ topic: 1, status: 1, updatedAt: -1 });

export const LearningQuestion = mongoose.model('LearningQuestion', questionSchema);
