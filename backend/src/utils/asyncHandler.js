/**
 * Wraps an async Express route handler so rejected promises are forwarded
 * to next(err) automatically instead of requiring try/catch everywhere.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
