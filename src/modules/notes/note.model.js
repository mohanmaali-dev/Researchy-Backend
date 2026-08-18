import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      trim: true,
      default: '',
      maxlength: 50000,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 20,
        message: 'A note cannot have more than 20 tags',
      },
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

noteSchema.index({ user: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });

export const Note = mongoose.model('Note', noteSchema);
