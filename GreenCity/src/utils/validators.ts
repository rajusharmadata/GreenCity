/**
 * Form Validation Utilities
 * Comprehensive validation functions for form inputs
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface ValidationRule {
  validate: (value: any) => ValidationResult;
  required?: boolean;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { valid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { valid: false, message: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  
  if (name.trim().length > 50) {
    return { valid: false, message: 'Name must not exceed 50 characters' };
  }
  
  return { valid: true };
};

// Required field validation
export const validateRequired = (value: any, fieldName: string = 'This field'): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  return { valid: true };
};

// Phone number validation
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { valid: false, message: 'Phone number is required' };
  }
  
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Please enter a valid phone number' };
  }
  
  return { valid: true };
};

// URL validation
export const validateUrl = (url: string): ValidationResult => {
  if (!url || url.trim() === '') {
    return { valid: false, message: 'URL is required' };
  }
  
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, message: 'Please enter a valid URL' };
  }
};

// Number validation
export const validateNumber = (value: any, min?: number, max?: number): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: 'This field is required' };
  }
  
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, message: 'Please enter a valid number' };
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, message: `Value must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, message: `Value must be at most ${max}` };
  }
  
  return { valid: true };
};

// Min length validation
export const validateMinLength = (value: string, min: number): ValidationResult => {
  if (!value || value.length < min) {
    return { valid: false, message: `Must be at least ${min} characters` };
  }
  return { valid: true };
};

// Max length validation
export const validateMaxLength = (value: string, max: number): ValidationResult => {
  if (value && value.length > max) {
    return { valid: false, message: `Must not exceed ${max} characters` };
  }
  return { valid: true };
};

// Match validation (for password confirmation)
export const validateMatch = (value: string, matchValue: string, fieldName: string = 'Password'): ValidationResult => {
  if (value !== matchValue) {
    return { valid: false, message: `${fieldName} does not match` };
  }
  return { valid: true };
};

// Date validation
export const validateDate = (date: string): ValidationResult => {
  if (!date || date.trim() === '') {
    return { valid: false, message: 'Date is required' };
  }
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { valid: false, message: 'Please enter a valid date' };
  }
  
  return { valid: true };
};

// Age validation
export const validateAge = (birthDate: string, minAge: number = 13, maxAge: number = 120): ValidationResult => {
  const dateValidation = validateDate(birthDate);
  if (!dateValidation.valid) {
    return dateValidation;
  }
  
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return { valid: false, message: `You must be at least ${minAge} years old` };
  }
  
  if (age < minAge) {
    return { valid: false, message: `You must be at least ${minAge} years old` };
  }
  
  if (age > maxAge) {
    return { valid: false, message: `Please enter a valid birth date` };
  }
  
  return { valid: true };
};

// Select validation
export const validateSelect = (value: any, options: any[]): ValidationResult => {
  if (!value || value === '') {
    return { valid: false, message: 'Please select an option' };
  }
  
  if (!options.includes(value)) {
    return { valid: false, message: 'Please select a valid option' };
  }
  
  return { valid: true };
};

// File validation
export const validateFile = (file: any, maxSize: number = 5 * 1024 * 1024, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif']): ValidationResult => {
  if (!file) {
    return { valid: false, message: 'Please select a file' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, message: `File size must not exceed ${maxSize / 1024 / 1024}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  
  return { valid: true };
};

// Multi-field validation
export const validateForm = (formData: Record<string, any>, validationRules: Record<string, (value: any) => ValidationResult>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.keys(validationRules).forEach(field => {
    const result = validationRules[field](formData[field]);
    if (!result.valid && result.message) {
      errors[field] = result.message;
    }
  });
  
  return errors;
};

// Password strength indicator
export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  feedback: string;
} => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) {
    return { strength: 'weak', score, feedback: 'Weak password' };
  } else if (score <= 4) {
    return { strength: 'medium', score, feedback: 'Medium strength' };
  } else if (score <= 5) {
    return { strength: 'strong', score, feedback: 'Strong password' };
  } else {
    return { strength: 'very-strong', score, feedback: 'Very strong password' };
  }
};
