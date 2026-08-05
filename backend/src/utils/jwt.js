import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Access tokens are short-lived and sent in the Authorization header on
 * every request. Refresh tokens are long-lived and stored in an httpOnly
 * cookie, used only to mint new access tokens.
 */

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
    issuer: env.jwt.issuer,
  });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
    issuer: env.jwt.issuer,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.jwt.accessSecret, { issuer: env.jwt.issuer });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.jwt.refreshSecret, { issuer: env.jwt.issuer });

export default {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
