import { z } from 'zod';

const usernameRegex = /^[a-z0-9_]{3,30}$/;

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name must be at most 80 characters'),
    username: z
      .string({ required_error: 'Username is required' })
      .trim()
      .toLowerCase()
      .regex(
        usernameRegex,
        'Username must be 3-30 characters: lowercase letters, numbers, underscores only'
      ),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .toLowerCase()
      .email('Enter a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z
      .string({ required_error: 'Email or username is required' })
      .trim()
      .min(1, 'Email or username is required'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    bio: z.string().trim().max(300).optional(),
    website: z.string().trim().url('Website must be a valid URL').or(z.literal('')).optional(),
    socialLinks: z
      .object({
        instagram: z.string().trim().max(200).optional(),
        facebook: z.string().trim().max(200).optional(),
        twitter: z.string().trim().max(200).optional(),
        tiktok: z.string().trim().max(200).optional(),
      })
      .partial()
      .optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
  }),
});

export default {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};
