import { body, validationResult } from 'express-validator';

export const validatePostCreation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((images) => images.length <= 10)
    .withMessage('Maximum 10 images allowed'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object'),
];

export const validatePostUpdate = [
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
];

export const validateCommentCreation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Content must be between 1 and 1000 characters'),
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
