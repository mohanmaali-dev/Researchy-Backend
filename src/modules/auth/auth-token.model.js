import mongoose from 'mongoose';

const authTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false },
);

export const AuthToken = mongoose.model('AuthToken', authTokenSchema);
