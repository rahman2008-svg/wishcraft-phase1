import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import * as authService from '../services/auth.service.js';

const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  path: '/api',
};

const setRefreshCookie = (res, token) => {
  res.cookie(env.cookies.refreshCookieName, token, refreshCookieOptions);
};

const clearRefreshCookie = (res) => {
  res.clearCookie(env.cookies.refreshCookieName, { ...refreshCookieOptions, maxAge: 0 });
};

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
  setRefreshCookie(res, refreshToken);
  return new ApiResponse(201, { user, accessToken }, 'Account created successfully').send(res);
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  setRefreshCookie(res, refreshToken);
  return new ApiResponse(200, { user, accessToken }, 'Logged in successfully').send(res);
});

export const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[env.cookies.refreshCookieName];
  const { accessToken, refreshToken } = await authService.refreshTokens(incomingToken);
  setRefreshCookie(res, refreshToken);
  return new ApiResponse(200, { accessToken }, 'Token refreshed').send(res);
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user?.id) {
    await authService.logoutUser(req.user.id);
  }
  clearRefreshCookie(res);
  return new ApiResponse(200, null, 'Logged out successfully').send(res);
});

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Not authenticated');
  return new ApiResponse(200, { user: req.user }, 'Current user retrieved').send(res);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  return new ApiResponse(200, { user }, 'Profile updated successfully').send(res);
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  clearRefreshCookie(res);
  return new ApiResponse(200, null, 'Password changed successfully. Please log in again.').send(res);
});

export default { register, login, refresh, logout, getMe, updateProfile, changePassword };
