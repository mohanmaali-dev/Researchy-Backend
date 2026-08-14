import mongoose from 'mongoose';

export const FOLLOW_UP_STATUSES = ['Pending', 'Completed', 'Cancelled'];

export const getStartOfTodayUtc = (now = new Date()) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

export const isFollowUpOverdue = (followUp, now = new Date()) =>
  followUp.status === 'Pending' &&
  new Date(followUp.followUpDate).getTime() < getStartOfTodayUtc(now).getTime();

const followUpSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business is required'],
      index: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null,
      index: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null,
      index: true,
    },
    followUpDate: {
      type: Date,
      required: [true, 'Follow-up date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason/title is required'],
      trim: true,
      maxlength: [250, 'Reason/title cannot exceed 250 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: FOLLOW_UP_STATUSES,
        message: 'Status must be Pending, Completed, or Cancelled',
      },
      default: 'Pending',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

followUpSchema.index({ status: 1, followUpDate: 1 });
followUpSchema.index({ business: 1, followUpDate: 1 });
followUpSchema.index({ opportunity: 1, followUpDate: 1 });

export const FollowUp = mongoose.model('FollowUp', followUpSchema);
