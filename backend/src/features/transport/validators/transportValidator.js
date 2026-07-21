import { body, validationResult } from 'express-validator';

export const validateTransportEntry = [
  body('agencyName')
    .trim()
    .notEmpty()
    .withMessage('Agency name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Agency name must be between 2 and 100 characters'),
  
  body('transportType')
    .trim()
    .notEmpty()
    .withMessage('Transport type is required')
    .isIn(['bus', 'train', 'metro', 'tram', 'ferry', 'other'])
    .withMessage('Invalid transport type'),
  
  body('from')
    .trim()
    .notEmpty()
    .withMessage('Origin is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Origin must be between 2 and 100 characters'),
  
  body('to')
    .trim()
    .notEmpty()
    .withMessage('Destination is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination must be between 2 and 100 characters'),
  
  body('departureTimes')
    .isArray({ min: 1 })
    .withMessage('At least one departure time is required')
    .custom((times) => {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return times.every(time => timeRegex.test(time));
    })
    .withMessage('Invalid time format. Use HH:MM format'),
  
  body('fare')
    .notEmpty()
    .withMessage('Fare is required')
    .isFloat({ min: 0 })
    .withMessage('Fare must be a positive number'),
  
  body('frequency')
    .optional()
    .isIn(['daily', 'weekdays', 'weekends', 'custom'])
    .withMessage('Invalid frequency'),
  
  body('contactInfo')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Contact info must not exceed 200 characters'),
];

export const validateTransportQuery = [
  body('from')
    .trim()
    .notEmpty()
    .withMessage('Origin is required')
    .isLength({ min: 2 })
    .withMessage('Origin must be at least 2 characters'),
  
  body('to')
    .trim()
    .notEmpty()
    .withMessage('Destination is required')
    .isLength({ min: 2 })
    .withMessage('Destination must be at least 2 characters'),
  
  body('transportType')
    .optional()
    .trim()
    .isIn(['bus', 'train', 'metro', 'tram', 'ferry', 'other'])
    .withMessage('Invalid transport type'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};
