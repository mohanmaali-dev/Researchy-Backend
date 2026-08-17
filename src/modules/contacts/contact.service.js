import mongoose from 'mongoose';

import { Business } from '../businesses/business.model.js';
import { Contact, CONTACT_STATUSES, CONTACT_TYPES } from './contact.model.js';

const CONTACT_FIELDS = [
  'fullName',
  'phoneNumber',
  'email',
  'business',
  'companyName',
  'role',
  'contactType',
  'location',
  'notes',
  'lastContactedDate',
  'nextFollowUpDate',
  'status',
];

const DEFAULT_PAGE_SIZE = 10;
const MAXIMUM_PAGE_SIZE = 50;

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureValidId = (id, label = 'contact') => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError(`Invalid ${label} ID`, 400);
  }
};

const parsePositiveInteger = (value, fallback, field) => {
  if (value === undefined || value === '') return fallback;

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw createError(`${field} must be a positive integer`, 400);
  }

  return parsedValue;
};

const escapeRegularExpression = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const cleanContactData = (data) =>
  CONTACT_FIELDS.reduce((cleaned, field) => {
    if (data[field] !== undefined) {
      if (field === 'business' && data[field] === '') cleaned[field] = null;
      else cleaned[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
    }

    return cleaned;
  }, {});

const validateDate = (value, label) => {
  if (value === undefined || value === null || value === '') return;

  if (Number.isNaN(new Date(value).getTime())) {
    throw createError(`${label} must be a valid date`, 400);
  }
};

const validateContactData = (data, isCreating = false) => {
  if (isCreating && !data.fullName) throw createError('Full name is required', 400);
  if (data.fullName !== undefined && !data.fullName) {
    throw createError('Full name is required', 400);
  }

  if (data.contactType !== undefined && !CONTACT_TYPES.includes(data.contactType)) {
    throw createError('Invalid contact type', 400);
  }

  if (data.status !== undefined && !CONTACT_STATUSES.includes(data.status)) {
    throw createError('Status must be Active or Inactive', 400);
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw createError('Email must be valid', 400);
  }

  if (data.phoneNumber && !/^\d+$/.test(data.phoneNumber)) {
    throw createError('Phone number can contain digits only', 400);
  }

  validateDate(data.lastContactedDate, 'Last contacted date');
  validateDate(data.nextFollowUpDate, 'Next follow-up date');
};

const getBusiness = async (businessId) => {
  if (!businessId) return null;
  ensureValidId(businessId, 'business');

  const business = await Business.findById(businessId).select('companyName').lean();
  if (!business) throw createError('Business not found', 404);
  return business;
};

export const createContact = async (data) => {
  const cleanedData = cleanContactData(data);
  validateContactData(cleanedData, true);
  const business = await getBusiness(cleanedData.business);

  if (business && !cleanedData.companyName) cleanedData.companyName = business.companyName;

  const contact = await Contact.create(cleanedData);
  return contact.populate('business', 'companyName');
};

export const getContacts = async (options = {}) => {
  const page = parsePositiveInteger(options.page, 1, 'Page');
  const requestedLimit = parsePositiveInteger(options.limit, DEFAULT_PAGE_SIZE, 'Limit');
  const limit = Math.min(requestedLimit, MAXIMUM_PAGE_SIZE);
  const search = typeof options.search === 'string' ? options.search.trim() : '';
  const contactType = typeof options.contactType === 'string' ? options.contactType.trim() : '';
  const status = typeof options.status === 'string' ? options.status.trim() : '';
  const filter = {};

  if (contactType && contactType !== 'All') {
    if (!CONTACT_TYPES.includes(contactType)) throw createError('Invalid contact type', 400);
    filter.contactType = contactType;
  }

  if (status && status !== 'All') {
    if (!CONTACT_STATUSES.includes(status)) throw createError('Invalid contact status', 400);
    filter.status = status;
  }

  if (search) {
    const searchExpression = new RegExp(escapeRegularExpression(search), 'i');
    filter.$or = [
      { fullName: searchExpression },
      { companyName: searchExpression },
      { phoneNumber: searchExpression },
      { email: searchExpression },
    ];
  }

  const [contacts, totalItems] = await Promise.all([
    Contact.find(filter)
      .sort({ fullName: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('business', 'companyName')
      .lean(),
    Contact.countDocuments(filter),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    contacts,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
};

export const getContactById = async (contactId) => {
  ensureValidId(contactId);
  const contact = await Contact.findById(contactId).populate('business', 'companyName').lean();

  if (!contact) throw createError('Contact not found', 404);
  return contact;
};

export const updateContact = async (contactId, data) => {
  ensureValidId(contactId);
  const cleanedData = cleanContactData(data);

  if (Object.keys(cleanedData).length === 0) {
    throw createError('Provide at least one contact field to update', 400);
  }

  validateContactData(cleanedData);
  const business =
    cleanedData.business !== undefined ? await getBusiness(cleanedData.business) : null;
  if (business && cleanedData.companyName === '') cleanedData.companyName = business.companyName;

  const contact = await Contact.findByIdAndUpdate(contactId, cleanedData, {
    new: true,
    runValidators: true,
  }).populate('business', 'companyName');

  if (!contact) throw createError('Contact not found', 404);
  return contact;
};

export const deleteContact = async (contactId) => {
  ensureValidId(contactId);
  const contact = await Contact.findByIdAndDelete(contactId);
  if (!contact) throw createError('Contact not found', 404);
};
