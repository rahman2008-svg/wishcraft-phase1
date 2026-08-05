import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import prisma from '../config/db.js';

/**
 * Requires a valid Bearer access token. Attaches the authenticated user
 * (minus password) to req.user.
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw ApiError.unauthorized('Authentication token missing');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired', [{ code: 'TOKEN_EXPIRED' }]);
    }
    throw ApiError.unauthorized('Invalid authentication token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatarUrl: true,
      bio: true,
      website: true,
      socialLinks: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Account no longer exists or is disabled');
  }

  req.user = user;
  next();
});

/**
 * Optional auth — attaches req.user if a valid token is present, but never
 * throws if it's missing or invalid. Useful for endpoints that behave
 * differently for logged-in vs anonymous users (e.g. public wish pages).
 */
export const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, name: true, avatarUrl: true, role: true },
    });
    if (user) req.user = user;
  } catch (err) {
    // Silently ignore — this middleware never blocks the request.
  }

  next();
});

/**
 * Restricts access to admins only. Must run after requireAuth.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
};

export default { requireAuth, attachUserIfPresent, requireAdmin };
