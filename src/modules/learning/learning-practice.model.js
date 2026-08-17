import mongoose from 'mongoose';

import { PRACTICE_STATUSES } from './learning.constants.js';

const optionalText = (field, maximumLength) => ({
  type: String,
  trim: true,
  maxlength: [maximumLength, `${field} cannot exceed ${maximumLength} characters`],
  default: '',
});

const practiceSchema = new mongoose.Schema(
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
    practiceGoal: {
      type: String,
      required: [true, 'What you want to practice is required'],
      trim: true,
      maxlength: [5000, 'Practice goal cannot exceed 5000 characters'],
    },
    practiceDate: { type: Date, required: [true, 'Date is required'] },
    whatHappened: optionalText('What happened', 5000),
    wentWell: optionalText('What went well', 5000),
    wentWrong: optionalText('What went wrong', 5000),
    improveNext: optionalText('What to improve next time', 5000),
    status: {
      type: String,
      enum: { values: PRACTICE_STATUSES, message: 'Invalid practice status' },
      default: 'Planned',
    },
  },
  { timestamps: true, versionKey: false },
);

practiceSchema.index({ topic: 1, practiceDate: -1, createdAt: -1 });

export const LearningPractice = mongoose.model('LearningPractice', practiceSchema);
