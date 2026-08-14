import mongoose from 'mongoose';

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

const conversationSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business is required'],
      index: true,
    },
    conversationDate: {
      type: Date,
      required: [true, 'Conversation/visit date is required'],
    },
    personName: requiredText('Person name', 120),
    personRole: requiredText('Person role/designation', 120),
    rawConversationNotes: requiredText('Raw conversation notes', 15000),
    importantObservations: optionalText('Important observations', 10000),
    followUpNotes: optionalText('Follow-up notes', 10000),
  },
  { timestamps: true, versionKey: false },
);

conversationSchema.index({ business: 1, conversationDate: -1, createdAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
