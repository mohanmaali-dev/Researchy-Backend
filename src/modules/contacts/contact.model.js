import mongoose from 'mongoose';

export const CONTACT_TYPES = [
  'Customer',
  'Potential Customer',
  'Business Owner',
  'Supplier',
  'Professional',
  'Other',
];

export const CONTACT_STATUSES = ['Active', 'Inactive'];

const optionalText = (field, maximumLength) => ({
  type: String,
  trim: true,
  maxlength: [maximumLength, `${field} cannot exceed ${maximumLength} characters`],
  default: '',
});

const contactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [120, 'Full name cannot exceed 120 characters'],
    },
    phoneNumber: {
      ...optionalText('Phone number', 50),
      validate: {
        validator: (value) => !value || /^\d+$/.test(value),
        message: 'Phone number can contain digits only',
      },
    },
    email: {
      ...optionalText('Email', 254),
      lowercase: true,
      validate: {
        validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Email must be valid',
      },
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      default: null,
      index: true,
    },
    companyName: optionalText('Company/business name', 150),
    role: optionalText('Role/designation', 120),
    contactType: {
      type: String,
      enum: {
        values: CONTACT_TYPES,
        message: 'Invalid contact type',
      },
      default: 'Other',
    },
    location: optionalText('Location', 200),
    notes: optionalText('Notes', 5000),
    lastContactedDate: {
      type: Date,
      default: null,
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: CONTACT_STATUSES,
        message: 'Status must be Active or Inactive',
      },
      default: 'Active',
    },
  },
  { timestamps: true, versionKey: false },
);

contactSchema.index({ fullName: 1, _id: 1 });
contactSchema.index({ contactType: 1, status: 1 });

export const Contact = mongoose.model('Contact', contactSchema);
