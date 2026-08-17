import mongoose from 'mongoose';

import { Business, BUSINESS_STATUSES } from './business.model.js';

const BUSINESS_FIELDS = [
  'companyName',
  'businessType',
  'industry',
  'location',
  'contactPerson',
  'contactNumber',
  'email',
  'website',
  'contactInformation',
  'generalNotes',
  'dateVisitedOrResearched',
  'status',
];

const REQUIRED_FIELDS = [
  'companyName',
  'businessType',
  'industry',
  'location',
  'contactPerson',
  'contactNumber',
  'dateVisitedOrResearched',
  'status',
];

const DEFAULT_BUSINESS_TYPES = [
  'Distributor',
  'E-commerce business',
  'Manufacturer',
  'Partnership',
  'Private limited company',
  'Retail store',
  'Service provider',
  'Sole proprietorship',
  'Wholesale business',
];

const DEFAULT_INDUSTRIES = [
  'Construction',
  'Education',
  'Food and beverage',
  'Healthcare',
  'Logistics',
  'Manufacturing',
  'Professional services',
  'Real estate',
  'Retail',
  'Technology',
];

const BUSINESS_SORTS = {
  newest: { createdAt: -1 },
  updated: { updatedAt: -1 },
  oldest: { createdAt: 1 },
  name: { companyName: 1, _id: 1 },
};

const DEFAULT_PAGE_SIZE = 10;
const MAXIMUM_PAGE_SIZE = 50;

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureValidId = (businessId) => {
  if (!mongoose.isValidObjectId(businessId)) {
    throw createError('Invalid business ID', 400);
  }
};

const escapeRegularExpression = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePositiveInteger = (value, fallback, field) => {
  if (value === undefined || value === '') return fallback;

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw createError(`${field} must be a positive integer`, 400);
  }

  return parsedValue;
};

const cleanBusinessData = (data) =>
  BUSINESS_FIELDS.reduce((cleaned, field) => {
    if (data[field] !== undefined) {
      cleaned[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
    }

    return cleaned;
  }, {});

const mergeAndSortOptions = (defaults, savedValues) => {
  const optionsByNormalizedValue = new Map();

  [...defaults, ...savedValues].forEach((value) => {
    const cleanedValue = typeof value === 'string' ? value.trim() : '';
    const normalizedValue = cleanedValue.toLocaleLowerCase();

    if (cleanedValue && !optionsByNormalizedValue.has(normalizedValue)) {
      optionsByNormalizedValue.set(normalizedValue, cleanedValue);
    }
  });

  return [...optionsByNormalizedValue.values()].sort((first, second) =>
    first.localeCompare(second, undefined, { sensitivity: 'base' }),
  );
};

const withLegacyContactFallbacks = (business) => {
  if (!business || business.contactNumber) return business;

  const legacyValue = business.contactInformation?.trim();
  if (!legacyValue) return business;

  const parts = legacyValue
    .split(/[·|;,]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const legacyEmail = parts.find((part) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part));
  const legacyWebsite = parts.find((part) => /^(https?:\/\/|www\.)/i.test(part));
  const legacyNumber = parts.find(
    (part) => /\d/.test(part) && part !== legacyEmail && part !== legacyWebsite,
  );

  return {
    ...business,
    contactNumber: legacyNumber || (!legacyEmail && !legacyWebsite ? legacyValue : ''),
    email: business.email || legacyEmail || '',
    website: business.website || legacyWebsite || '',
  };
};

const validateBusinessData = (data, isCreating = false) => {
  if (isCreating) {
    const missingField = REQUIRED_FIELDS.find(
      (field) => data[field] === undefined || data[field] === '',
    );

    if (missingField) {
      throw createError(`${missingField} is required`, 400);
    }
  }

  for (const field of REQUIRED_FIELDS.filter((item) => item !== 'dateVisitedOrResearched')) {
    if (data[field] !== undefined && data[field] === '') {
      throw createError(`${field} is required`, 400);
    }
  }

  if (data.status !== undefined && !BUSINESS_STATUSES.includes(data.status)) {
    throw createError('Invalid business status', 400);
  }

  if (data.dateVisitedOrResearched !== undefined) {
    const date = new Date(data.dateVisitedOrResearched);

    if (Number.isNaN(date.getTime())) {
      throw createError('Date visited/researched must be a valid date', 400);
    }
  }
};

export const createBusiness = async (data) => {
  const cleanedData = cleanBusinessData(data);
  validateBusinessData(cleanedData, true);
  return Business.create(cleanedData);
};

export const getBusinesses = async (options = {}) => {
  const usesPagination = ['page', 'limit', 'search', 'status', 'type', 'industry', 'sort'].some(
    (field) => options[field] !== undefined,
  );

  if (!usesPagination) {
    const businesses = await Business.find().sort({ createdAt: -1 }).lean();
    return businesses.map(withLegacyContactFallbacks);
  }

  const page = parsePositiveInteger(options.page, 1, 'Page');
  const requestedLimit = parsePositiveInteger(options.limit, DEFAULT_PAGE_SIZE, 'Limit');
  const limit = Math.min(requestedLimit, MAXIMUM_PAGE_SIZE);
  const filter = {};
  const search = typeof options.search === 'string' ? options.search.trim() : '';
  const status = typeof options.status === 'string' ? options.status.trim() : '';
  const businessType = typeof options.type === 'string' ? options.type.trim() : '';
  const industry = typeof options.industry === 'string' ? options.industry.trim() : '';
  const sortKey = BUSINESS_SORTS[options.sort] ? options.sort : 'newest';

  if (status && status !== 'All') {
    if (!BUSINESS_STATUSES.includes(status)) throw createError('Invalid business status', 400);
    filter.status = status;
  }

  if (businessType && businessType !== 'All') {
    filter.businessType = new RegExp(`^${escapeRegularExpression(businessType)}$`, 'i');
  }

  if (industry && industry !== 'All') {
    filter.industry = new RegExp(`^${escapeRegularExpression(industry)}$`, 'i');
  }

  if (search) {
    const searchExpression = new RegExp(escapeRegularExpression(search), 'i');
    filter.$or = [
      { companyName: searchExpression },
      { businessType: searchExpression },
      { industry: searchExpression },
      { location: searchExpression },
    ];
  }

  const [businesses, totalItems] = await Promise.all([
    Business.find(filter)
      .sort(BUSINESS_SORTS[sortKey])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Business.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    businesses: businesses.map(withLegacyContactFallbacks),
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

export const getBusinessOptions = async () => {
  const [savedBusinessTypes, savedIndustries] = await Promise.all([
    Business.distinct('businessType'),
    Business.distinct('industry'),
  ]);

  return {
    businessTypes: mergeAndSortOptions(DEFAULT_BUSINESS_TYPES, savedBusinessTypes),
    industries: mergeAndSortOptions(DEFAULT_INDUSTRIES, savedIndustries),
  };
};

export const getBusinessById = async (businessId) => {
  ensureValidId(businessId);
  const business = await Business.findById(businessId).lean();

  if (!business) {
    throw createError('Business not found', 404);
  }

  return withLegacyContactFallbacks(business);
};

export const updateBusiness = async (businessId, data) => {
  ensureValidId(businessId);
  const cleanedData = cleanBusinessData(data);

  if (Object.keys(cleanedData).length === 0) {
    throw createError('Provide at least one business field to update', 400);
  }

  validateBusinessData(cleanedData);

  const business = await Business.findByIdAndUpdate(businessId, cleanedData, {
    new: true,
    runValidators: true,
  });

  if (!business) {
    throw createError('Business not found', 404);
  }

  return business;
};

export const deleteBusiness = async (businessId) => {
  ensureValidId(businessId);
  const business = await Business.findByIdAndDelete(businessId);

  if (!business) {
    throw createError('Business not found', 404);
  }
};
