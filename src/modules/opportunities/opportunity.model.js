import mongoose from 'mongoose';

export const VALIDATION_STATUSES = ['Not Validated', 'Researching', 'Validated', 'Rejected'];
export const OPPORTUNITY_STATUSES = ['Active', 'On Hold', 'Closed'];
export const DIFFICULTY_LEVELS = ['Low', 'Medium', 'High'];

const scoreComponentSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true },
  },
  { _id: false },
);

const scoreBreakdownSchema = new mongoose.Schema(
  {
    pain: { type: scoreComponentSchema, required: true },
    frequency: { type: scoreComponentSchema, required: true },
    impact: { type: scoreComponentSchema, required: true },
    willingness: { type: scoreComponentSchema, required: true },
    repeatedDemand: { type: scoreComponentSchema, required: true },
    ease: { type: scoreComponentSchema, required: true },
    uniqueBusinessCount: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const requiredText = (field, maximumLength) => ({
  type: String,
  required: [true, `${field} is required`],
  trim: true,
  maxlength: [maximumLength, `${field} cannot exceed ${maximumLength} characters`],
});

const opportunitySchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: [true, 'Linked Problem is required'],
      unique: true,
    },
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
    whyValuable: requiredText('Why this opportunity looks valuable', 5000),
    marketPotential: requiredText('Market potential', 3000),
    difficulty: {
      type: String,
      enum: {
        values: DIFFICULTY_LEVELS,
        message: 'Difficulty must be Low, Medium, or High',
      },
      default: 'Medium',
    },
    validationStatus: {
      type: String,
      enum: {
        values: VALIDATION_STATUSES,
        message: 'Invalid validation status',
      },
      default: 'Not Validated',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
    },
    opportunityScore: {
      type: Number,
      required: true,
      min: [0, 'Opportunity score cannot be below 0'],
      max: [100, 'Opportunity score cannot exceed 100'],
    },
    scoreBreakdown: {
      type: scoreBreakdownSchema,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: OPPORTUNITY_STATUSES,
        message: 'Status must be Active, On Hold, or Closed',
      },
      default: 'Active',
    },
  },
  { timestamps: true, versionKey: false },
);

opportunitySchema.index({ opportunityScore: -1, createdAt: -1 });

export const Opportunity = mongoose.model('Opportunity', opportunitySchema);
