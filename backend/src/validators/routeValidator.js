import { body, validationResult } from 'express-validator';

export const validateEcoRouteCreation = [
  body('origin')
    .trim()
    .notEmpty()
    .withMessage('Origin is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Origin must be between 2 and 100 characters'),
  
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination must be between 2 and 100 characters'),
  
  body('transportMode')
    .trim()
    .notEmpty()
    .withMessage('Transport mode is required')
    .isIn(['walking', 'cycling', 'public_transport', 'electric_vehicle', 'other'])
    .withMessage('Invalid transport mode'),
  
  body('distance')
    .notEmpty()
    .withMessage('Distance is required')
    .isFloat({ min: 0 })
    .withMessage('Distance must be a positive number'),
  
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive integer'),
  
  body('carbonSaved')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbon saved must be a positive number'),
  
  body('waypoints')
    .optional()
    .isArray()
    .withMessage('Waypoints must be an array'),
];

export const validateRouteQuery = [
  body('origin')
    .trim()
    .notEmpty()
    .withMessage('Origin is required'),
  
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required'),
  
  body('transportMode')
    .optional()
    .isIn(['walking', 'cycling', 'public_transport', 'electric_vehicle', 'other'])
    .withMessage('Invalid transport mode'),
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
