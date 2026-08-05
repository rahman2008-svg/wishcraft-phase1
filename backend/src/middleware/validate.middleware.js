import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

/**
 * Wraps a Zod schema (validating { body, query, params }) as Express
 * middleware. On success, the parsed/coerced values are written back onto
 * req so downstream handlers get clean, typed data.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.slice(1).join('.') || e.path.join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('Validation failed', errors));
    }
    next(err);
  }
};

export default validate;
