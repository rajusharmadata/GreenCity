import { ApiError } from '../middleware/errorMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Base Controller class providing common functionality for all controllers
 * Implements consistent error handling, response formatting, and validation
 */
export class BaseController {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {*} errors - Additional error details
   */
  static sendError(res, message = 'Internal server error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Handle async controller with error handling
   * @param {Function} fn - Async controller function
   */
  static asyncHandler(fn) {
    return asyncHandler(fn);
  }

  /**
   * Validate request body against schema
   * @param {Object} req - Express request object
   * @param {Array} validationRules - Express validator rules
   */
  static async validateRequest(req, validationRules) {
    const { validationResult } = await import('express-validator');
    await Promise.all(validationRules.map(rule => rule.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', errors.array());
    }
  }

  /**
   * Parse pagination parameters
   * @param {Object} req - Express request object
   * @returns {Object} Pagination parameters
   */
  static getPagination(req) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Parse sort parameters
   * @param {Object} req - Express request object
   * @param {string} defaultSort - Default sort field (default: 'createdAt')
   * @param {string} defaultOrder - Default sort order (default: 'desc')
   * @returns {Object} Sort parameters
   */
  static getSort(req, defaultSort = 'createdAt', defaultOrder = 'desc') {
    const sortBy = req.query.sortBy || defaultSort;
    const sortOrder = req.query.sortOrder || defaultOrder;
    
    return {
      [sortBy]: sortOrder === 'asc' ? 1 : -1
    };
  }

  /**
   * Parse filter parameters
   * @param {Object} req - Express request object
   * @param {Array} allowedFields - Allowed filter fields
   * @returns {Object} Filter parameters
   */
  static getFilters(req, allowedFields = []) {
    const filters = {};
    
    allowedFields.forEach(field => {
      if (req.query[field]) {
        filters[field] = req.query[field];
      }
    });

    return filters;
  }

  /**
   * Handle not found error
   * @param {string} resource - Resource name
   * @param {string} identifier - Resource identifier
   */
  static handleNotFound(resource, identifier = 'id') {
    throw new ApiError(404, `${resource} not found with this ${identifier}`);
  }

  /**
   * Handle unauthorized access
   * @param {string} message - Error message
   */
  static handleUnauthorized(message = 'Unauthorized access') {
    throw new ApiError(401, message);
  }

  /**
   * Handle forbidden access
   * @param {string} message - Error message
   */
  static handleForbidden(message = 'Forbidden access') {
    throw new ApiError(403, message);
  }

  /**
   * Handle bad request
   * @param {string} message - Error message
   */
  static handleBadRequest(message = 'Bad request') {
    throw new ApiError(400, message);
  }

  /**
   * Handle conflict
   * @param {string} message - Error message
   */
  static handleConflict(message = 'Resource conflict') {
    throw new ApiError(409, message);
  }
}

export default BaseController;
