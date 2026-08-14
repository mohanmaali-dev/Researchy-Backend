import mongoose from 'mongoose';

export const WILLINGNESS_TO_PAY_OPTIONS = ['Yes', 'No', 'Unknown'];
export const PROBLEM_STATUSES = ['Open', 'In Review', 'Validated', 'Resolved', 'Dismissed'];

export const normalizeTag = (tag) =>
  typeof tag === 'string' ? tag.trim().toLowerCase().replace(/\s+/g, ' ') : '';

export const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return tags;

  return [...new Set(tags.map(normalizeTag).filter(Boolean))];
};

export const normalizeProblemTitle = (title) =>
  typeof title === 'string' ? title.trim().toLowerCase().replace(/\s+/g, ' ') : '';

const requiredText = (field, maximumLength) => ({
  type: String,
  required: [true, `${field} is required`],
  trim: true,
  maxlength: [maximumLength, `${field} cannot exceed ${maximumLength} characters`],
});

const optionalText = (field, maximumLength) => ({
  type: String,
  trim: true,
  maxlength: [maximumLength, `${field} cannot exceed ${maximumLength} characters`],
  default: '',
});

const problemSchema = new mongoose.Schema(
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
      required: [true, 'Conversation is required'],
      index: true,
    },
    title: requiredText('Problem title', 200),
    normalizedTitle: {
      type: String,
      trim: true,
      lowercase: true,
      select: false,
      index: true,
    },
    description: requiredText('Description', 10000),
    currentProcess: requiredText('Current process/current solution', 5000),
    frequency: requiredText('Frequency', 200),
    painLevel: {
      type: Number,
      required: [true, 'Pain level is required'],
      min: [1, 'Pain level must be at least 1'],
      max: [10, 'Pain level cannot exceed 10'],
      validate: {
        validator: Number.isInteger,
        message: 'Pain level must be a whole number',
      },
    },
    timeImpact: requiredText('Time impact', 500),
    financialImpact: optionalText('Financial impact', 500),
    existingSoftware: optionalText('Existing software or tool', 300),
    willingnessToPay: {
      type: String,
      enum: {
        values: WILLINGNESS_TO_PAY_OPTIONS,
        message: 'Willingness to pay must be Yes, No, or Unknown',
      },
      default: 'Unknown',
    },
    notes: optionalText('Notes', 5000),
    status: {
      type: String,
      enum: {
        values: PROBLEM_STATUSES,
        message: 'Status must be Open, In Review, Validated, Resolved, or Dismissed',
      },
      default: 'Open',
    },
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
        message: 'A problem cannot have more than 20 tags',
      },
    },
  },
  { timestamps: true, versionKey: false },
);

problemSchema.index({ conversation: 1, createdAt: -1 });
problemSchema.index({ business: 1, createdAt: -1 });

problemSchema.pre('validate', function setNormalizedTitle() {
  if (this.isModified('title')) {
    this.normalizedTitle = normalizeProblemTitle(this.title);
  }
});

export const Problem = mongoose.model('Problem', problemSchema);
