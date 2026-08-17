import mongoose from 'mongoose';

const normalizeTags = (tags) =>
  Array.isArray(tags)
    ? [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))]
    : tags;

const entrySchema = new mongoose.Schema(
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
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [15000, 'Notes cannot exceed 15000 characters'],
      default: '',
    },
    keyTakeaway: {
      type: String,
      required: [true, 'Key takeaway is required'],
      trim: true,
      maxlength: [3000, 'Key takeaway cannot exceed 3000 characters'],
    },
    entryDate: { type: Date, required: [true, 'Date is required'] },
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
        message: 'An entry cannot have more than 20 tags',
      },
    },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

entrySchema.index({ topic: 1, entryDate: -1, createdAt: -1 });

export const LearningEntry = mongoose.model('LearningEntry', entrySchema);
