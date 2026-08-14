import mongoose from 'mongoose';

export const BUSINESS_STATUSES = ['Prospect', 'Contacted', 'Visited', 'Active', 'Inactive'];

const requiredText = (field, maximumLength) => ({
  type: String,
  required: [true, `${field} is required`],
  trim: true,
  maxlength: [maximumLength, `${field} cannot exceed ${maximumLength} characters`],
});

const optionalText = (maximumLength) => ({
  type: String,
  trim: true,
  maxlength: [maximumLength, `Value cannot exceed ${maximumLength} characters`],
  default: '',
});

const businessSchema = new mongoose.Schema(
  {
    companyName: requiredText('Business/company name', 150),
    businessType: requiredText('Business type', 100),
    industry: requiredText('Industry', 100),
    location: requiredText('Location', 200),
    contactPerson: requiredText('Contact person', 120),
    contactNumber: requiredText('Contact number', 50),
    email: {
      ...optionalText(254),
      lowercase: true,
      validate: {
        validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Email must be valid',
      },
    },
    website: optionalText(300),
    // Kept for older records created before contact fields were separated.
    contactInformation: optionalText(300),
    generalNotes: {
      type: String,
      trim: true,
      maxlength: [5000, 'General notes cannot exceed 5000 characters'],
      default: '',
    },
    dateVisitedOrResearched: {
      type: Date,
      required: [true, 'Date visited/researched is required'],
    },
    status: {
      type: String,
      enum: {
        values: BUSINESS_STATUSES,
        message: 'Status must be Prospect, Contacted, Visited, Active, or Inactive',
      },
      default: 'Prospect',
    },
  },
  { timestamps: true, versionKey: false },
);

businessSchema.index({ createdAt: -1 });

export const Business = mongoose.model('Business', businessSchema);
