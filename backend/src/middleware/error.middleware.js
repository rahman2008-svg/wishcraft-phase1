import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

const mapPrismaError = (err) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = Array.isArray(err.meta?.target)
          ? err.meta.target.join(', ')
          : err.meta?.target || 'field';
        return ApiError.conflict(`A record with this ${target} already exists`);
      }
      case 'P2025':
        return ApiError.notFound('Record not found');
      case 'P2003':
        return ApiError.badRequest('Invalid reference to a related record');
      default:
        return ApiError.internal('Database request failed');
    }
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    return ApiError.badRequest('Invalid data provided to the database');
  }
  return null;
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const prismaMapped = mapPrismaError(err);
    if (prismaMapped) {
      error = prismaMapped;
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Invalid or expired token');
    } else {
      error = new ApiError(err.statusCode || 500, err.message || 'Something went wrong', [], false);
    }
  }

  if (!error.isOperational && env.nodeEnv !== 'test') {
    // eslint-disable-next-line no-console
    console.error('[unexpected error]', err);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
  };

  if (!env.isProduction) {
    response.stack = err.stack;
  }

  res.status(error.statusCode || 500).json(response);
};

export default { notFoundHandler, errorHandler };
