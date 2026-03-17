/**
 * Utility to wrap async functions and catch any errors, passing them to the next middleware (error handler).
 * This eliminates the need for try...catch blocks in every controller method.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
