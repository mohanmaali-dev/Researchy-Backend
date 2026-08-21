import mongoose from 'mongoose';

const ownedFields = {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
};

const optionalUrl = {
  type: String,
  trim: true,
  default: '',
  maxlength: 1000,
};

const portfolioProfileSchema = new mongoose.Schema(
  {
    ...ownedFields,
    fullName: { type: String, trim: true, default: '', maxlength: 120 },
    professionalTitle: { type: String, trim: true, default: '', maxlength: 180 },
    shortBio: { type: String, trim: true, default: '', maxlength: 500 },
    about: { type: String, trim: true, default: '', maxlength: 10000 },
    email: { type: String, trim: true, lowercase: true, default: '', maxlength: 254 },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: 15,
      match: [/^\d*$/, 'Mobile number must contain digits only'],
    },
    location: { type: String, trim: true, default: '', maxlength: 200 },
    profileImageUrl: optionalUrl,
    profileImagePublicId: { type: String, trim: true, default: '', maxlength: 500 },
    resumeUrl: optionalUrl,
    resumePublicId: { type: String, trim: true, default: '', maxlength: 500 },
    githubUrl: optionalUrl,
    linkedinUrl: optionalUrl,
    instagramUrl: optionalUrl,
    xUrl: optionalUrl,
    whatsappNumber: {
      type: String,
      trim: true,
      default: '',
      maxlength: 15,
      match: [/^\d*$/, 'WhatsApp number must contain digits only'],
    },
    whatsappMessage: { type: String, trim: true, default: '', maxlength: 500 },
    availabilityText: { type: String, trim: true, default: '', maxlength: 160 },
    showGithub: { type: Boolean, default: true },
    showLinkedin: { type: Boolean, default: true },
    showInstagram: { type: Boolean, default: true },
    showX: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

portfolioProfileSchema.index({ user: 1 }, { unique: true });
portfolioProfileSchema.index({ email: 1 });

const portfolioProjectSchema = new mongoose.Schema(
  {
    ...ownedFields,
    title: { type: String, required: true, trim: true, maxlength: 180 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 400 },
    description: { type: String, trim: true, default: '', maxlength: 15000 },
    projectType: {
      type: String,
      enum: ['E-commerce', 'LMS', 'SaaS', 'Portfolio', 'Business Website', 'Dashboard', 'Mobile App', 'API / Backend', 'Other'],
      default: 'Other',
    },
    customProjectType: { type: String, trim: true, default: '', maxlength: 120 },
    projectSource: {
      type: String,
      enum: ['Personal Project', 'Client Project', 'Company Project', 'Collaborative Project'],
      default: 'Personal Project',
    },
    organizationName: { type: String, trim: true, default: '', maxlength: 180 },
    technologies: {
      type: [String],
      default: [],
      validate: {
        validator: (items) => items.length <= 30,
        message: 'A project cannot have more than 30 technologies',
      },
    },
    githubUrl: optionalUrl,
    liveUrl: optionalUrl,
    imageUrl: optionalUrl,
    imagePublicId: { type: String, trim: true, default: '', maxlength: 500 },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft', index: true },
    displayOrder: { type: Number, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true, versionKey: false },
);

portfolioProjectSchema.index({ user: 1, status: 1, displayOrder: 1, updatedAt: -1 });

const portfolioSkillSchema = new mongoose.Schema(
  {
    ...ownedFields,
    name: { type: String, required: true, trim: true, maxlength: 80 },
    normalizedName: { type: String, required: true, trim: true, lowercase: true, maxlength: 80 },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'AI & Automation', 'Tools', 'Other'],
      default: 'Other',
    },
    displayOrder: { type: Number, default: 0, min: 0, max: 9999 },
    visible: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

portfolioSkillSchema.index({ user: 1, normalizedName: 1 }, { unique: true });
portfolioSkillSchema.index({ user: 1, category: 1, displayOrder: 1 });

const portfolioExperienceSchema = new mongoose.Schema(
  {
    ...ownedFields,
    company: { type: String, required: true, trim: true, maxlength: 180 },
    position: { type: String, required: true, trim: true, maxlength: 180 },
    location: { type: String, trim: true, default: '', maxlength: 200 },
    startDate: { type: String, required: true, trim: true, maxlength: 7 },
    endDate: { type: String, trim: true, default: '', maxlength: 7 },
    currentlyWorking: { type: Boolean, default: false },
    description: { type: String, trim: true, default: '', maxlength: 10000 },
    achievements: {
      type: [{ type: String, trim: true, maxlength: 240 }],
      default: [],
      validate: { validator: (items) => items.length <= 20, message: 'Experience cannot have more than 20 achievements' },
    },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published', index: true },
    displayOrder: { type: Number, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true, versionKey: false },
);

portfolioExperienceSchema.index({ user: 1, displayOrder: 1, startDate: -1 });

const portfolioEducationSchema = new mongoose.Schema(
  {
    ...ownedFields,
    institution: { type: String, required: true, trim: true, maxlength: 180 },
    degree: { type: String, required: true, trim: true, maxlength: 180 },
    fieldOfStudy: { type: String, trim: true, default: '', maxlength: 180 },
    location: { type: String, trim: true, default: '', maxlength: 200 },
    startDate: { type: String, required: true, trim: true, maxlength: 7 },
    endDate: { type: String, trim: true, default: '', maxlength: 7 },
    currentlyStudying: { type: Boolean, default: false },
    description: { type: String, trim: true, default: '', maxlength: 5000 },
    achievements: {
      type: [{ type: String, trim: true, maxlength: 240 }],
      default: [],
      validate: { validator: (items) => items.length <= 20, message: 'Education cannot have more than 20 achievements' },
    },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published', index: true },
    displayOrder: { type: Number, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true, versionKey: false },
);

portfolioEducationSchema.index({ user: 1, displayOrder: 1, startDate: -1 });

const portfolioCertificationSchema = new mongoose.Schema(
  {
    ...ownedFields,
    name: { type: String, required: true, trim: true, maxlength: 180 },
    issuingOrganization: { type: String, required: true, trim: true, maxlength: 180 },
    issueDate: { type: String, required: true, trim: true, maxlength: 7 },
    expirationDate: { type: String, trim: true, default: '', maxlength: 7 },
    doesNotExpire: { type: Boolean, default: false },
    credentialId: { type: String, trim: true, default: '', maxlength: 300 },
    credentialUrl: optionalUrl,
    description: { type: String, trim: true, default: '', maxlength: 5000 },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published', index: true },
    displayOrder: { type: Number, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true, versionKey: false },
);

portfolioCertificationSchema.index({ user: 1, displayOrder: 1, issueDate: -1 });

const portfolioServiceSchema = new mongoose.Schema(
  {
    ...ownedFields,
    title: { type: String, required: true, trim: true, maxlength: 180 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 400 },
    description: { type: String, trim: true, default: '', maxlength: 10000 },
    serviceType: {
      type: String,
      enum: ['Web Development', 'Frontend', 'Backend & API', 'Full Stack', 'Consulting', 'Automation', 'Other'],
      default: 'Web Development',
    },
    features: {
      type: [String],
      default: [],
      validate: {
        validator: (items) => items.length <= 20,
        message: 'A service cannot have more than 20 features',
      },
    },
    priceLabel: { type: String, trim: true, default: '', maxlength: 120 },
    deliveryTime: { type: String, trim: true, default: '', maxlength: 120 },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft', index: true },
    displayOrder: { type: Number, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true, versionKey: false },
);

portfolioServiceSchema.index({ user: 1, status: 1, displayOrder: 1 });

const portfolioTestimonialSchema = new mongoose.Schema(
  {
    ...ownedFields,
    personName: { type: String, required: true, trim: true, maxlength: 120 },
    personRole: { type: String, trim: true, default: '', maxlength: 180 },
    company: { type: String, trim: true, default: '', maxlength: 180 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    imageUrl: optionalUrl,
    imagePublicId: { type: String, trim: true, default: '', maxlength: 500 },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft', index: true },
    displayOrder: { type: Number, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true, versionKey: false },
);

portfolioTestimonialSchema.index({ user: 1, status: 1, displayOrder: 1 });

const portfolioContactMessageSchema = new mongoose.Schema(
  {
    ...ownedFields,
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: 15,
      match: [/^\d*$/, 'Phone number must contain digits only'],
    },
    subject: { type: String, trim: true, default: '', maxlength: 180 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['New', 'Read'], default: 'New', index: true },
  },
  { timestamps: true, versionKey: false },
);

portfolioContactMessageSchema.index({ user: 1, status: 1, createdAt: -1 });

export const PortfolioProfile = mongoose.model('PortfolioProfile', portfolioProfileSchema);
export const PortfolioProject = mongoose.model('PortfolioProject', portfolioProjectSchema);
export const PortfolioSkill = mongoose.model('PortfolioSkill', portfolioSkillSchema);
export const PortfolioExperience = mongoose.model('PortfolioExperience', portfolioExperienceSchema);
export const PortfolioEducation = mongoose.model('PortfolioEducation', portfolioEducationSchema);
export const PortfolioCertification = mongoose.model('PortfolioCertification', portfolioCertificationSchema);
export const PortfolioService = mongoose.model('PortfolioService', portfolioServiceSchema);
export const PortfolioTestimonial = mongoose.model('PortfolioTestimonial', portfolioTestimonialSchema);
export const PortfolioContactMessage = mongoose.model('PortfolioContactMessage', portfolioContactMessageSchema);
