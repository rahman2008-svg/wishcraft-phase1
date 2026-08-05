import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const SALT_ROUNDS = 12;

const publicUserSelect = {
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
  createdAt: true,
};

const issueTokenPair = (user) => {
  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
};

export const registerUser = async ({ name, username, email, password }) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });

  if (existing) {
    if (existing.email === email) throw ApiError.conflict('An account with this email already exists');
    throw ApiError.conflict('This username is already taken');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, username, email, password: hashedPassword },
  });

  const { accessToken, refreshToken } = issueTokenPair(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(refreshToken, SALT_ROUNDS), lastLoginAt: new Date() },
  });

  const { password: _pw, refreshToken: _rt, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};

export const loginUser = async ({ identifier, password }) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
    },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const { accessToken, refreshToken } = issueTokenPair(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(refreshToken, SALT_ROUNDS), lastLoginAt: new Date() },
  });

  const { password: _pw, refreshToken: _rt, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};

export const refreshTokens = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw ApiError.unauthorized('Refresh token missing');
  }

  let payload;
  try {
    payload = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  if (!user || !user.refreshToken || !user.isActive) {
    throw ApiError.unauthorized('Session no longer valid, please log in again');
  }

  const tokenMatches = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
  if (!tokenMatches) {
    // Possible token reuse/theft — invalidate the stored token defensively.
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: null } });
    throw ApiError.unauthorized('Session no longer valid, please log in again');
  }

  const { accessToken, refreshToken: newRefreshToken } = issueTokenPair(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(newRefreshToken, SALT_ROUNDS) },
  });

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const updateProfile = async (userId, updates) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: publicUserSelect,
  });
  return user;
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) throw ApiError.badRequest('Current password is incorrect');

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, refreshToken: null },
  });
};

export default {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  getCurrentUser,
  updateProfile,
  changePassword,
};
