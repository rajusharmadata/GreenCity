/**
 * Input Validation Utilities
 * Centralized validation functions for common data types
 */

import { ERROR_MESSAGES } from '../config/constants.js';

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Min 6 characters, should have mix of cases and numbers for better security
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters'
    };
  }
  return { valid: true };
};

/**
 * Validate MongoDB ObjectId format
 */
export const validateObjectId = (id) => {
  return /^[0-9a-f]{24}$/.test(id);
};

/**
 * Validate latitude
 */
export const validateLatitude = (lat) => {
  const latitude = parseFloat(lat);
  return latitude >= -90 && latitude <= 90;
};

/**
 * Validate longitude
 */
export const validateLongitude = (lng) => {
  const longitude = parseFloat(lng);
  return longitude >= -180 && longitude <= 180;
};

/**
 * Validate coordinates object
 */
export const validateCoordinates = (coords) => {
  if (!coords || typeof coords !== 'object') {
    return { valid: false, error: 'Invalid coordinates format' };
  }

  const { lat, lng } = coords;

  if (!validateLatitude(lat)) {
    return { valid: false, error: 'Invalid latitude' };
  }

  if (!validateLongitude(lng)) {
    return { valid: false, error: 'Invalid longitude' };
  }

  return { valid: true };
};

/**
 * Validate required fields
 */
export const validateRequiredFields = (obj, requiredFields) => {
  const missingFields = requiredFields.filter(field => !obj[field]);

  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  return { valid: true };
};

/**
 * Validate string length
 */
export const validateStringLength = (str, minLength = 1, maxLength = null) => {
  if (typeof str !== 'string' || str.trim().length < minLength) {
    return {
      valid: false,
      error: `String must be at least ${minLength} characters`
    };
  }

  if (maxLength && str.length > maxLength) {
    return {
      valid: false,
      error: `String must not exceed ${maxLength} characters`
    };
  }

  return { valid: true };
};

/**
 * Validate URL format
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate array of strings
 */
export const validateStringArray = (arr, minLength = 0) => {
  if (!Array.isArray(arr)) {
    return { valid: false, error: 'Must be an array' };
  }

  if (arr.length < minLength) {
    return { valid: false, error: `Array must have at least ${minLength} items` };
  }

  const nonStringItems = arr.filter(item => typeof item !== 'string');
  if (nonStringItems.length > 0) {
    return { valid: false, error: 'All array items must be strings' };
  }

  return { valid: true };
};

/**
 * Sanitize string input (trim and remove extra spaces)
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ');
};

/**
 * Sanitize object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
