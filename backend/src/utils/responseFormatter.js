/**
 * Standardized API Response Formatter
 * Ensures consistent response structure across all endpoints
 */

import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Standard Success Response
 */
export const formatSuccessResponse = (
  data = null,
  message = SUCCESS_MESSAGES.FETCHED,
  statusCode = HTTP_STATUS.OK,
  meta = null
) => {
  const response = {
    success: true,
    statusCode,
    message,
    data
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
};

/**
 * Standard Error Response
 */
export const formatErrorResponse = (
  message = ERROR_MESSAGES.INTERNAL_ERROR,
  statusCode = HTTP_STATUS.INTERNAL_ERROR,
  details = null
) => {
  const response = {
    success: false,
    statusCode,
    message
  };

  if (details && process.env.NODE_ENV !== 'production') {
    response.details = details;
  }

  return response;
};

/**
 * Paginated Response
 */
export const formatPaginatedResponse = (
  data = [],
  totalCount = 0,
  page = 1,
  limit = 20,
  message = SUCCESS_MESSAGES.FETCHED
) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    success: true,
    statusCode: HTTP_STATUS.OK,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      pageSize: limit,
      hasNextPage,
      hasPrevPage
    }
  };
};

/**
 * Created Resource Response
 */
export const formatCreatedResponse = (data, message = SUCCESS_MESSAGES.CREATED) => {
  return formatSuccessResponse(data, message, HTTP_STATUS.CREATED);
};

/**
 * Updated Resource Response
 */
export const formatUpdatedResponse = (data, message = SUCCESS_MESSAGES.UPDATED) => {
  return formatSuccessResponse(data, message, HTTP_STATUS.OK);
};

/**
 * Deleted Resource Response
 */
export const formatDeletedResponse = (message = SUCCESS_MESSAGES.DELETED) => {
  return formatSuccessResponse(null, message, HTTP_STATUS.OK);
};

/**
 * Send formatted response
 */
export const sendResponse = (res, statusCode, data, message) => {
  res.status(statusCode).json(formatSuccessResponse(data, message, statusCode));
};

/**
 * Send formatted error response
 */
export const sendErrorResponse = (res, statusCode, message, details = null) => {
  res.status(statusCode).json(formatErrorResponse(message, statusCode, details));
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = (res, data, totalCount, page, limit, message) => {
  res.status(HTTP_STATUS.OK).json(
    formatPaginatedResponse(data, totalCount, page, limit, message)
  );
};
