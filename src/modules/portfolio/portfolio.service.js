import mongoose from 'mongoose';

import {
  PortfolioCertification,
  PortfolioContactMessage,
  PortfolioEducation,
  PortfolioExperience,
  PortfolioProfile,
  PortfolioProject,
  PortfolioService,
  PortfolioSkill,
  PortfolioTestimonial,
} from './portfolio.model.js';
import { deleteProjectImage, deleteTestimonialImage } from './portfolio-image.service.js';

const PROJECT_STATUSES = ['Draft', 'Published'];
const EXPERIENCE_STATUSES = ['Draft', 'Published'];
const CONTACT_MESSAGE_STATUSES = ['New', 'Read'];
const CONTENT_STATUSES = ['Draft', 'Published'];
const SKILL_CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'AI & Automation', 'Tools', 'Other'];
const SERVICE_TYPES = ['Web Development', 'Frontend', 'Backend & API', 'Full Stack', 'Consulting', 'Automation', 'Other'];
const PROJECT_TYPES = ['E-commerce', 'LMS', 'SaaS', 'Portfolio', 'Business Website', 'Dashboard', 'Mobile App', 'API / Backend', 'Other'];
const PROJECT_SOURCES = ['Personal Project', 'Client Project', 'Company Project', 'Collaborative Project'];
const PROFILE_FIELDS = [
  'fullName', 'professionalTitle', 'shortBio', 'about', 'email', 'phone', 'location',
  'profileImageUrl', 'resumeUrl', 'githubUrl', 'linkedinUrl', 'instagramUrl', 'xUrl',
  'whatsappNumber', 'whatsappMessage', 'availabilityText',
  'showGithub', 'showLinkedin', 'showInstagram', 'showX',
];
const PROJECT_FIELDS = [
  'title', 'shortDescription', 'description', 'technologies', 'githubUrl', 'liveUrl',
  'projectType', 'customProjectType', 'projectSource', 'organizationName',
  'imageUrl', 'imagePublicId', 'featured', 'status', 'displayOrder',
];
const SKILL_FIELDS = ['name', 'category', 'displayOrder', 'visible'];
const EXPERIENCE_FIELDS = [
  'company', 'position', 'location', 'startDate', 'endDate', 'currentlyWorking',
  'description', 'achievements', 'status', 'displayOrder',
];
const CONTACT_MESSAGE_FIELDS = ['fullName', 'email', 'phone', 'subject', 'message'];
const EDUCATION_FIELDS = [
  'institution', 'degree', 'fieldOfStudy', 'location', 'startDate', 'endDate',
  'currentlyStudying', 'description', 'achievements', 'status', 'displayOrder',
];
const CERTIFICATION_FIELDS = [
  'name', 'issuingOrganization', 'issueDate', 'expirationDate', 'doesNotExpire',
  'credentialId', 'credentialUrl', 'description', 'status', 'displayOrder',
];
const SERVICE_FIELDS = [
  'title', 'shortDescription', 'description', 'serviceType', 'features', 'priceLabel',
  'deliveryTime', 'featured', 'status', 'displayOrder',
];
const TESTIMONIAL_FIELDS = ['personName', 'personRole', 'company', 'message', 'imageUrl', 'imagePublicId', 'featured', 'status', 'displayOrder'];

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const cleanText = (value) => (typeof value === 'string' ? value.trim().replace(/\r\n/g, '\n') : value);
const cleanData = (data, allowedFields) => allowedFields.reduce((result, field) => {
  if (data[field] !== undefined) result[field] = cleanText(data[field]);
  return result;
}, {});
const ensureId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) throw createError(`Invalid ${label} ID`);
};
const ensureBoolean = (value, label) => {
  if (value !== undefined && typeof value !== 'boolean') throw createError(`${label} must be true or false`);
};
const ensureOrder = (value) => {
  if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > 9999)) {
    throw createError('Display order must be a whole number between 0 and 9999');
  }
};
const ensureUrl = (value, label) => {
  if (!value) return;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
  } catch {
    throw createError(`${label} must be a valid web address`);
  }
};
const ensureImageUrl = (value) => {
  if (!value) return;
  if (/^\/[^/]+\/portfolio\/images\/[a-f\d]{24}$/i.test(value)) return;
  ensureUrl(value, 'Image URL');
};
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const positiveInteger = (value, fallback, label) => {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw createError(`${label} must be a positive integer`);
  return parsed;
};

const normalizeTechnologies = (technologies) => {
  if (technologies === undefined) return undefined;
  const items = Array.isArray(technologies) ? technologies : String(technologies).split(',');
  const unique = new Map();
  items.forEach((item) => {
    const cleaned = cleanText(item)?.replace(/\s+/g, ' ');
    if (!cleaned) return;
    if (cleaned.length > 60) throw createError('Technology names cannot exceed 60 characters');
    const key = cleaned.toLocaleLowerCase();
    if (!unique.has(key)) unique.set(key, cleaned);
  });
  if (unique.size > 30) throw createError('A project cannot have more than 30 technologies');
  return [...unique.values()];
};

const normalizeFeatures = (features) => {
  if (features === undefined) return undefined;
  const items = Array.isArray(features) ? features : String(features).split(/[\n,]/);
  const unique = new Map();
  items.forEach((item) => {
    const cleaned = cleanText(item)?.replace(/\s+/g, ' ');
    if (!cleaned) return;
    if (cleaned.length > 120) throw createError('Service features cannot exceed 120 characters');
    const key = cleaned.toLocaleLowerCase();
    if (!unique.has(key)) unique.set(key, cleaned);
  });
  if (unique.size > 20) throw createError('A service cannot have more than 20 features');
  return [...unique.values()];
};

const normalizeAchievements = (achievements) => {
  if (achievements === undefined) return undefined;
  const items = Array.isArray(achievements) ? achievements : String(achievements).split(/\n/);
  const unique = new Map();
  items.forEach((item) => {
    const cleaned = cleanText(item)?.replace(/\s+/g, ' ');
    if (!cleaned) return;
    if (cleaned.length > 240) throw createError('Achievements cannot exceed 240 characters each');
    const key = cleaned.toLocaleLowerCase();
    if (!unique.has(key)) unique.set(key, cleaned);
  });
  if (unique.size > 20) throw createError('A record cannot have more than 20 achievements');
  return [...unique.values()];
};

const validateProfile = (data) => {
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw createError('Enter a valid email address');
  if (data.phone && !/^\d{7,15}$/.test(data.phone)) throw createError('Mobile number must contain 7 to 15 digits only');
  if (data.whatsappNumber && !/^\d{7,15}$/.test(data.whatsappNumber)) throw createError('WhatsApp number must contain 7 to 15 digits only');
  [
    ['profileImageUrl', 'Profile image URL'], ['resumeUrl', 'Resume URL'], ['githubUrl', 'GitHub URL'],
    ['linkedinUrl', 'LinkedIn URL'], ['instagramUrl', 'Instagram URL'], ['xUrl', 'X URL'],
  ].forEach(([field, label]) => ensureUrl(data[field], label));
  ['showGithub', 'showLinkedin', 'showInstagram', 'showX'].forEach((field) => ensureBoolean(data[field], field));
};

const validateProject = (data, creating = false) => {
  if (creating && !data.title) throw createError('Project title is required');
  if (creating && !data.shortDescription) throw createError('Short description is required');
  if (data.title !== undefined && !data.title) throw createError('Project title is required');
  if (data.shortDescription !== undefined && !data.shortDescription) throw createError('Short description is required');
  if (data.projectType !== undefined && !PROJECT_TYPES.includes(data.projectType)) throw createError('Choose a valid project type');
  if (data.projectSource !== undefined && !PROJECT_SOURCES.includes(data.projectSource)) throw createError('Choose how this project was created');
  if (data.projectType === 'Other' && !data.customProjectType) throw createError('Enter the custom project type');
  if (data.projectType && data.projectType !== 'Other') data.customProjectType = '';
  if (data.projectSource === 'Personal Project') data.organizationName = '';
  if (data.status !== undefined && !PROJECT_STATUSES.includes(data.status)) throw createError('Project status must be Draft or Published');
  ensureBoolean(data.featured, 'Featured');
  ensureOrder(data.displayOrder);
  [['githubUrl', 'GitHub URL'], ['liveUrl', 'Live URL']].forEach(([field, label]) => ensureUrl(data[field], label));
  ensureImageUrl(data.imageUrl);
};

const validateSkill = (data, creating = false) => {
  if (creating && !data.name) throw createError('Skill name is required');
  if (data.name !== undefined && !data.name) throw createError('Skill name is required');
  if (data.category !== undefined && !SKILL_CATEGORIES.includes(data.category)) throw createError('Choose a valid skill category');
  ensureOrder(data.displayOrder);
  ensureBoolean(data.visible, 'Visible');
};

const validateMonth = (value, label, required = false) => {
  if (required && !value) throw createError(`${label} is required`);
  if (value && !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) throw createError(`${label} must use YYYY-MM format`);
};

const validateExperience = (data, creating = false) => {
  if (creating && !data.company) throw createError('Company is required');
  if (creating && !data.position) throw createError('Position is required');
  if (data.company !== undefined && !data.company) throw createError('Company is required');
  if (data.position !== undefined && !data.position) throw createError('Position is required');
  validateMonth(data.startDate, 'Start date', creating);
  validateMonth(data.endDate, 'End date');
  ensureBoolean(data.currentlyWorking, 'Currently working');
  if (data.status !== undefined && !EXPERIENCE_STATUSES.includes(data.status)) throw createError('Experience status must be Draft or Published');
  ensureOrder(data.displayOrder);
  if (data.currentlyWorking) data.endDate = '';
  if (data.startDate && data.endDate && data.endDate < data.startDate) throw createError('End date cannot be before start date');
};

const validateEducation = (data, creating = false) => {
  if (creating && !data.institution) throw createError('Institution is required');
  if (creating && !data.degree) throw createError('Degree or qualification is required');
  if (data.institution !== undefined && !data.institution) throw createError('Institution is required');
  if (data.degree !== undefined && !data.degree) throw createError('Degree or qualification is required');
  validateMonth(data.startDate, 'Start date', creating);
  validateMonth(data.endDate, 'End date');
  ensureBoolean(data.currentlyStudying, 'Currently studying');
  if (data.status !== undefined && !CONTENT_STATUSES.includes(data.status)) throw createError('Education status must be Draft or Published');
  ensureOrder(data.displayOrder);
  if (data.currentlyStudying) data.endDate = '';
  if (data.startDate && data.endDate && data.endDate < data.startDate) throw createError('End date cannot be before start date');
};

const validateCertification = (data, creating = false) => {
  if (creating && !data.name) throw createError('Certification name is required');
  if (creating && !data.issuingOrganization) throw createError('Issuing organization is required');
  if (data.name !== undefined && !data.name) throw createError('Certification name is required');
  if (data.issuingOrganization !== undefined && !data.issuingOrganization) throw createError('Issuing organization is required');
  validateMonth(data.issueDate, 'Issue date', creating);
  validateMonth(data.expirationDate, 'Expiration date');
  ensureBoolean(data.doesNotExpire, 'Does not expire');
  if (data.status !== undefined && !CONTENT_STATUSES.includes(data.status)) throw createError('Certification status must be Draft or Published');
  ensureOrder(data.displayOrder);
  ensureUrl(data.credentialUrl, 'Credential URL');
  if (data.doesNotExpire) data.expirationDate = '';
  if (data.issueDate && data.expirationDate && data.expirationDate < data.issueDate) throw createError('Expiration date cannot be before issue date');
};

const validateService = (data, creating = false) => {
  if (creating && !data.title) throw createError('Service title is required');
  if (creating && !data.shortDescription) throw createError('Short description is required');
  if (data.title !== undefined && !data.title) throw createError('Service title is required');
  if (data.shortDescription !== undefined && !data.shortDescription) throw createError('Short description is required');
  if (data.serviceType !== undefined && !SERVICE_TYPES.includes(data.serviceType)) throw createError('Choose a valid service type');
  if (data.status !== undefined && !CONTENT_STATUSES.includes(data.status)) throw createError('Service status must be Draft or Published');
  ensureBoolean(data.featured, 'Featured');
  ensureOrder(data.displayOrder);
};

const validateTestimonial = (data, creating = false) => {
  if (creating && !data.personName) throw createError('Person name is required');
  if (creating && !data.message) throw createError('Testimonial message is required');
  if (data.personName !== undefined && !data.personName) throw createError('Person name is required');
  if (data.message !== undefined && !data.message) throw createError('Testimonial message is required');
  if (data.status !== undefined && !CONTENT_STATUSES.includes(data.status)) throw createError('Testimonial status must be Draft or Published');
  ensureBoolean(data.featured, 'Featured');
  ensureOrder(data.displayOrder);
  ensureImageUrl(data.imageUrl);
};

const profileProgress = (profile) => {
  const checks = [
    ['Full name', profile?.fullName],
    ['Professional title', profile?.professionalTitle],
    ['Short introduction', profile?.shortBio],
    ['About section', profile?.about],
    ['Profile image', profile?.profileImageUrl],
    ['Resume', profile?.resumeUrl],
    ['Contact method', profile?.email || profile?.phone],
    ['Location', profile?.location],
    ['Social link', profile?.githubUrl || profile?.linkedinUrl || profile?.instagramUrl || profile?.xUrl],
    ['Availability', profile?.availabilityText],
  ];
  const completed = checks.filter(([, value]) => Boolean(value)).length;
  return { percentage: completed * 10, completed, total: checks.length, missing: checks.filter(([, value]) => !value).map(([label]) => label) };
};

export const getDashboard = async (userId) => {
  const [projects, skills, experiences, educations, certifications, services, testimonials, featured, published, drafts, newMessages, profile, recentProjects] = await Promise.all([
    PortfolioProject.countDocuments({ user: userId }),
    PortfolioSkill.countDocuments({ user: userId }),
    PortfolioExperience.countDocuments({ user: userId }),
    PortfolioEducation.countDocuments({ user: userId }),
    PortfolioCertification.countDocuments({ user: userId }),
    PortfolioService.countDocuments({ user: userId }),
    PortfolioTestimonial.countDocuments({ user: userId }),
    PortfolioProject.countDocuments({ user: userId, featured: true }),
    PortfolioProject.countDocuments({ user: userId, status: 'Published' }),
    PortfolioProject.countDocuments({ user: userId, status: 'Draft' }),
    PortfolioContactMessage.countDocuments({ user: userId, status: 'New' }),
    PortfolioProfile.findOne({ user: userId }).select('-profileImagePublicId -resumePublicId').lean(),
    PortfolioProject.find({ user: userId }).select('title shortDescription status featured updatedAt').sort({ updatedAt: -1 }).limit(5).lean(),
  ]);
  return { counts: { projects, skills, experiences, educations, certifications, services, testimonials, featured, published, drafts, newMessages }, profile, profileProgress: profileProgress(profile), recentProjects };
};

export const getPublicPortfolio = async (profileId) => {
  ensureId(profileId, 'profile');
  const profileDocument = await PortfolioProfile.findById(profileId).lean();
  if (!profileDocument) throw createError('Portfolio not found', 404);
  const userId = profileDocument.user;
  const [projects, skills, experiences, educations, certifications, services, testimonials] = await Promise.all([
    PortfolioProject.find({ user: userId, status: 'Published' }).select('-user -imagePublicId').sort({ displayOrder: 1, updatedAt: -1 }).lean(),
    PortfolioSkill.find({ user: userId, visible: { $ne: false } }).select('-user -normalizedName').sort({ category: 1, displayOrder: 1, name: 1 }).lean(),
    PortfolioExperience.find({ user: userId, status: 'Published' }).select('-user').sort({ displayOrder: 1, startDate: -1 }).lean(),
    PortfolioEducation.find({ user: userId, status: 'Published' }).select('-user').sort({ displayOrder: 1, startDate: -1 }).lean(),
    PortfolioCertification.find({ user: userId, status: 'Published' }).select('-user').sort({ displayOrder: 1, issueDate: -1 }).lean(),
    PortfolioService.find({ user: userId, status: 'Published' }).select('-user').sort({ displayOrder: 1, featured: -1, updatedAt: -1 }).lean(),
    PortfolioTestimonial.find({ user: userId, status: 'Published' }).select('-user -imagePublicId').sort({ displayOrder: 1, featured: -1, updatedAt: -1 }).lean(),
  ]);
  const profile = { ...profileDocument };
  delete profile.user;
  delete profile.profileImagePublicId;
  delete profile.resumePublicId;
  if (profile.showGithub === false) profile.githubUrl = '';
  if (profile.showLinkedin === false) profile.linkedinUrl = '';
  if (profile.showInstagram === false) profile.instagramUrl = '';
  if (profile.showX === false) profile.xUrl = '';
  delete profile.showGithub;
  delete profile.showLinkedin;
  delete profile.showInstagram;
  delete profile.showX;
  return { profile, projects, skills, experiences, educations, certifications, services, testimonials };
};

export const getProfile = async (userId) => PortfolioProfile.findOne({ user: userId }).select('-profileImagePublicId -resumePublicId').lean();
export const getProfileAssetState = async (userId) => PortfolioProfile.findOne({ user: userId }).select('profileImageUrl profileImagePublicId resumeUrl resumePublicId').lean();
export const saveProfile = async (userId, input, assetData = {}) => {
  const data = cleanData(input, PROFILE_FIELDS);
  ['profileImageUrl', 'profileImagePublicId', 'resumeUrl', 'resumePublicId'].forEach((field) => {
    if (Object.hasOwn(assetData, field)) data[field] = assetData[field];
  });
  validateProfile(data);
  return PortfolioProfile.findOneAndUpdate(
    { user: userId }, { $set: data, $setOnInsert: { user: userId } },
    { new: true, upsert: true, runValidators: true },
  );
};

export const createContactMessage = async (input) => {
  const recipientEmail = cleanText(input.recipientEmail || '').toLocaleLowerCase();
  const profileId = cleanText(input.profileId || '');
  if (!profileId && (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail))) {
    throw createError('A valid portfolio recipient email is required');
  }
  if (profileId) ensureId(profileId, 'profile');
  const profile = await PortfolioProfile.findOne(profileId ? { _id: profileId } : { email: recipientEmail }).select('user').lean();
  if (!profile) throw createError('Portfolio recipient not found', 404);

  const data = cleanData(input, CONTACT_MESSAGE_FIELDS);
  if (!data.fullName) throw createError('Name is required');
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw createError('Enter a valid email address');
  if (data.phone && !/^\d{7,15}$/.test(data.phone)) throw createError('Phone number must contain 7 to 15 digits only');
  if (!data.message) throw createError('Message is required');
  return PortfolioContactMessage.create({ user: profile.user, ...data, email: data.email.toLocaleLowerCase() });
};

export const getContactMessages = async (userId, options = {}) => {
  const page = positiveInteger(options.page, 1, 'Page');
  const limit = Math.min(positiveInteger(options.limit, 10, 'Limit'), 50);
  const status = cleanText(options.status || 'All');
  const search = cleanText(options.search || '');
  if (!['All', ...CONTACT_MESSAGE_STATUSES].includes(status)) throw createError('Choose a valid message status');
  const filter = { user: userId };
  if (status !== 'All') filter.status = status;
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ fullName: regex }, { email: regex }, { phone: regex }, { subject: regex }, { message: regex }];
  }
  const [messages, totalItems] = await Promise.all([
    PortfolioContactMessage.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    PortfolioContactMessage.countDocuments(filter),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return { messages, pagination: { page, limit, totalItems, totalPages, hasPreviousPage: page > 1, hasNextPage: page < totalPages } };
};

export const updateContactMessage = async (userId, id, input) => {
  ensureId(id, 'contact message');
  if (!CONTACT_MESSAGE_STATUSES.includes(input.status)) throw createError('Message status must be New or Read');
  const message = await PortfolioContactMessage.findOneAndUpdate(
    { _id: id, user: userId },
    { status: input.status },
    { new: true, runValidators: true },
  );
  if (!message) throw createError('Contact message not found', 404);
  return message;
};

export const deleteContactMessage = async (userId, id) => {
  ensureId(id, 'contact message');
  const message = await PortfolioContactMessage.findOneAndDelete({ _id: id, user: userId });
  if (!message) throw createError('Contact message not found', 404);
};

export const getProjects = async (userId, options = {}) => {
  const page = positiveInteger(options.page, 1, 'Page');
  const limit = Math.min(positiveInteger(options.limit, 10, 'Limit'), 50);
  const status = cleanText(options.status || 'All');
  const search = cleanText(options.search || '');
  if (!['All', ...PROJECT_STATUSES].includes(status)) throw createError('Choose a valid project status');
  const filter = { user: userId };
  if (status !== 'All') filter.status = status;
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: regex }, { shortDescription: regex }, { technologies: regex }, { projectType: regex }, { customProjectType: regex }, { projectSource: regex }, { organizationName: regex }];
  }
  const [projects, totalItems] = await Promise.all([
    PortfolioProject.find(filter).sort({ displayOrder: 1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    PortfolioProject.countDocuments(filter),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return { projects, pagination: { page, limit, totalItems, totalPages, hasPreviousPage: page > 1, hasNextPage: page < totalPages } };
};

export const getProject = async (userId, id) => {
  ensureId(id, 'project');
  const project = await PortfolioProject.findOne({ _id: id, user: userId }).lean();
  if (!project) throw createError('Project not found', 404);
  return project;
};
export const createProject = async (userId, input) => {
  const data = cleanData(input, PROJECT_FIELDS);
  data.technologies = normalizeTechnologies(data.technologies) || [];
  validateProject(data, true);
  return PortfolioProject.create({ user: userId, ...data });
};
export const updateProject = async (userId, id, input) => {
  ensureId(id, 'project');
  const data = cleanData(input, PROJECT_FIELDS);
  if (data.technologies !== undefined) data.technologies = normalizeTechnologies(data.technologies);
  if (!Object.keys(data).length) throw createError('Provide a project field to update');
  validateProject(data);
  const project = await PortfolioProject.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });
  if (!project) throw createError('Project not found', 404);
  return project;
};
export const moveProject = async (userId, id, direction) => {
  ensureId(id, 'project');
  if (!['up', 'down'].includes(direction)) throw createError('Direction must be up or down');
  const projects = await PortfolioProject.find({ user: userId }).select('_id').sort({ displayOrder: 1, updatedAt: -1 }).lean();
  const currentIndex = projects.findIndex((project) => String(project._id) === String(id));
  if (currentIndex < 0) throw createError('Project not found', 404);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= projects.length) return PortfolioProject.findOne({ _id: id, user: userId }).lean();
  const [project] = projects.splice(currentIndex, 1);
  projects.splice(targetIndex, 0, project);
  await PortfolioProject.bulkWrite(projects.map((item, index) => ({
    updateOne: { filter: { _id: item._id, user: userId }, update: { $set: { displayOrder: index } } },
  })));
  return PortfolioProject.findOne({ _id: id, user: userId }).lean();
};
export const deleteProject = async (userId, id) => {
  ensureId(id, 'project');
  const project = await PortfolioProject.findOne({ _id: id, user: userId });
  if (!project) throw createError('Project not found', 404);
  await deleteProjectImage(project.imagePublicId);
  await project.deleteOne();
};

export const getSkills = async (userId) => PortfolioSkill.find({ user: userId }).sort({ category: 1, displayOrder: 1, name: 1 }).lean();
export const createSkill = async (userId, input) => {
  const data = cleanData(input, SKILL_FIELDS);
  validateSkill(data, true);
  try {
    return await PortfolioSkill.create({ user: userId, ...data, normalizedName: data.name.toLocaleLowerCase() });
  } catch (error) {
    if (error.code === 11000) throw createError('This skill already exists', 409);
    throw error;
  }
};
export const updateSkill = async (userId, id, input) => {
  ensureId(id, 'skill');
  const data = cleanData(input, SKILL_FIELDS);
  if (!Object.keys(data).length) throw createError('Provide a skill field to update');
  validateSkill(data);
  if (data.name) data.normalizedName = data.name.toLocaleLowerCase();
  try {
    const skill = await PortfolioSkill.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });
    if (!skill) throw createError('Skill not found', 404);
    return skill;
  } catch (error) {
    if (error.code === 11000) throw createError('This skill already exists', 409);
    throw error;
  }
};
export const deleteSkill = async (userId, id) => {
  ensureId(id, 'skill');
  const skill = await PortfolioSkill.findOneAndDelete({ _id: id, user: userId });
  if (!skill) throw createError('Skill not found', 404);
};

export const getExperiences = async (userId) => PortfolioExperience.find({ user: userId }).sort({ displayOrder: 1, startDate: -1 }).lean();
export const createExperience = async (userId, input) => {
  const data = cleanData(input, EXPERIENCE_FIELDS);
  data.achievements = normalizeAchievements(data.achievements) || [];
  validateExperience(data, true);
  return PortfolioExperience.create({ user: userId, ...data });
};
export const updateExperience = async (userId, id, input) => {
  ensureId(id, 'experience');
  const data = cleanData(input, EXPERIENCE_FIELDS);
  if (data.achievements !== undefined) data.achievements = normalizeAchievements(data.achievements);
  if (!Object.keys(data).length) throw createError('Provide an experience field to update');
  validateExperience(data);
  const experience = await PortfolioExperience.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });
  if (!experience) throw createError('Experience not found', 404);
  return experience;
};
export const deleteExperience = async (userId, id) => {
  ensureId(id, 'experience');
  const experience = await PortfolioExperience.findOneAndDelete({ _id: id, user: userId });
  if (!experience) throw createError('Experience not found', 404);
};

export const getEducations = async (userId) => PortfolioEducation.find({ user: userId }).sort({ displayOrder: 1, startDate: -1 }).lean();
export const createEducation = async (userId, input) => {
  const data = cleanData(input, EDUCATION_FIELDS);
  data.achievements = normalizeAchievements(data.achievements) || [];
  validateEducation(data, true);
  return PortfolioEducation.create({ user: userId, ...data });
};
export const updateEducation = async (userId, id, input) => {
  ensureId(id, 'education');
  const data = cleanData(input, EDUCATION_FIELDS);
  if (data.achievements !== undefined) data.achievements = normalizeAchievements(data.achievements);
  if (!Object.keys(data).length) throw createError('Provide an education field to update');
  validateEducation(data);
  const education = await PortfolioEducation.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });
  if (!education) throw createError('Education record not found', 404);
  return education;
};
export const deleteEducation = async (userId, id) => {
  ensureId(id, 'education');
  const education = await PortfolioEducation.findOneAndDelete({ _id: id, user: userId });
  if (!education) throw createError('Education record not found', 404);
};

export const getCertifications = async (userId) => PortfolioCertification.find({ user: userId }).sort({ displayOrder: 1, issueDate: -1 }).lean();
export const createCertification = async (userId, input) => {
  const data = cleanData(input, CERTIFICATION_FIELDS);
  validateCertification(data, true);
  return PortfolioCertification.create({ user: userId, ...data });
};
export const updateCertification = async (userId, id, input) => {
  ensureId(id, 'certification');
  const data = cleanData(input, CERTIFICATION_FIELDS);
  if (!Object.keys(data).length) throw createError('Provide a certification field to update');
  validateCertification(data);
  const certification = await PortfolioCertification.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });
  if (!certification) throw createError('Certification not found', 404);
  return certification;
};
export const deleteCertification = async (userId, id) => {
  ensureId(id, 'certification');
  const certification = await PortfolioCertification.findOneAndDelete({ _id: id, user: userId });
  if (!certification) throw createError('Certification not found', 404);
};

export const getServices = async (userId) => PortfolioService.find({ user: userId }).sort({ displayOrder: 1, updatedAt: -1 }).lean();
export const createService = async (userId, input) => {
  const data = cleanData(input, SERVICE_FIELDS);
  data.features = normalizeFeatures(data.features) || [];
  validateService(data, true);
  return PortfolioService.create({ user: userId, ...data });
};
export const updateService = async (userId, id, input) => {
  ensureId(id, 'service');
  const data = cleanData(input, SERVICE_FIELDS);
  if (data.features !== undefined) data.features = normalizeFeatures(data.features);
  if (!Object.keys(data).length) throw createError('Provide a service field to update');
  validateService(data);
  const service = await PortfolioService.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });
  if (!service) throw createError('Service not found', 404);
  return service;
};
export const deleteService = async (userId, id) => {
  ensureId(id, 'service');
  const service = await PortfolioService.findOneAndDelete({ _id: id, user: userId });
  if (!service) throw createError('Service not found', 404);
};

export const getTestimonials = async (userId) => PortfolioTestimonial.find({ user: userId }).sort({ displayOrder: 1, updatedAt: -1 }).lean();
export const getTestimonial = async (userId, id) => {
  ensureId(id, 'testimonial');
  const testimonial = await PortfolioTestimonial.findOne({ _id: id, user: userId }).lean();
  if (!testimonial) throw createError('Testimonial not found', 404);
  return testimonial;
};
export const createTestimonial = async (userId, input) => {
  const data = cleanData(input, TESTIMONIAL_FIELDS);
  validateTestimonial(data, true);
  return PortfolioTestimonial.create({ user: userId, ...data });
};
export const updateTestimonial = async (userId, id, input) => {
  ensureId(id, 'testimonial');
  const data = cleanData(input, TESTIMONIAL_FIELDS);
  if (!Object.keys(data).length) throw createError('Provide a testimonial field to update');
  validateTestimonial(data);
  const testimonial = await PortfolioTestimonial.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });
  if (!testimonial) throw createError('Testimonial not found', 404);
  return testimonial;
};
export const deleteTestimonial = async (userId, id) => {
  ensureId(id, 'testimonial');
  const testimonial = await PortfolioTestimonial.findOneAndDelete({ _id: id, user: userId });
  if (!testimonial) throw createError('Testimonial not found', 404);
  return testimonial;
};

const BULK_DELETE_MODELS = {
  projects: PortfolioProject,
  skills: PortfolioSkill,
  experiences: PortfolioExperience,
  educations: PortfolioEducation,
  certifications: PortfolioCertification,
  services: PortfolioService,
  testimonials: PortfolioTestimonial,
  contactMessages: PortfolioContactMessage,
};

export const bulkDelete = async (userId, entity, ids) => {
  const model = BULK_DELETE_MODELS[entity];
  if (!model) throw createError('Choose a valid Portfolio section');
  if (!Array.isArray(ids) || !ids.length) throw createError('Choose at least one record to delete');
  if (ids.length > 100) throw createError('You can delete up to 100 records at a time');
  const uniqueIds = [...new Set(ids.map(String))];
  if (uniqueIds.some((id) => !mongoose.isValidObjectId(id))) throw createError('One or more selected records are invalid');

  if (entity === 'projects' || entity === 'testimonials') {
    const records = await model.find({ _id: { $in: uniqueIds }, user: userId }).select('imagePublicId').lean();
    const removeImage = entity === 'projects' ? deleteProjectImage : deleteTestimonialImage;
    await Promise.allSettled(records.map((record) => removeImage(record.imagePublicId)));
  }

  const result = await model.deleteMany({ _id: { $in: uniqueIds }, user: userId });
  return { deletedCount: result.deletedCount, entity };
};
