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
    },
    content: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

export const Note = mongoose.model('Note', noteSchema);
