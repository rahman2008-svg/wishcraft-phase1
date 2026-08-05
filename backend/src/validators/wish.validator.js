import { z } from 'zod';

export const EVENT_TYPES = [
  'BIRTHDAY',
  'WEDDING',
  'ANNIVERSARY',
  'GRADUATION',
  'BABY_SHOWER',
  'HOUSE_WARMING',
  'ENGAGEMENT',
  'FAREWELL',
  'CONGRATULATIONS',
  'THANK_YOU',
  'EID_MUBARAK',
  'RAMADAN',
  'CHRISTMAS',
  'NEW_YEAR',
  'VALENTINES_DAY',
  'FATHERS_DAY',
  'MOTHERS_DAY',
  'DIWALI',
  'CUSTOM',
];

const optionalUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .or(z.literal(''))
  .optional()
  .transform((v) => (v === '' ? undefined : v));

const optionalString = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === '' ? undefined : v));

// For fields where the client needs to explicitly CLEAR a previously-set
// value (cover photo, music, etc.) — accepts a URL, or null/'' to clear it.
// Unlike optionalUrl, both '' and null are preserved through to Prisma as
// `null` (which unsets the column) rather than collapsed to `undefined`
// (which Prisma would silently ignore, leaving the old value in place).
const clearableUrl = z
  .union([z.string().trim().url('Must be a valid URL'), z.literal(''), z.null()])
  .optional()
  .transform((v) => (v === '' || v === null ? null : v));

export const createWishSchema = z.object({
  body: z.object({
    eventType: z.enum(EVENT_TYPES, { required_error: 'Choose an event type' }),
    templateId: z.string({ required_error: 'Choose a template' }).uuid('Invalid template'),
    recipientName: z.string({ required_error: 'Recipient name is required' }).trim().min(1).max(120),
    senderName: z.string({ required_error: 'Sender name is required' }).trim().min(1).max(120),
    title: z.string({ required_error: 'Title is required' }).trim().min(1).max(150),
    message: z.string({ required_error: 'Message is required' }).trim().min(1).max(5000),
    eventDate: z.string().datetime().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
    location: optionalString(200),
    phone: optionalString(30),
    email: z.string().trim().email().optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
    website: optionalUrl,
    googleMapsUrl: optionalUrl,
    countdownEnabled: z.boolean().optional(),
    slugHint: optionalString(80), // optional custom text to base the slug on
  }),
});

export const updateWishSchema = z.object({
  body: z
    .object({
      templateId: z.string().uuid().optional(),
      recipientName: z.string().trim().min(1).max(120).optional(),
      senderName: z.string().trim().min(1).max(120).optional(),
      title: z.string().trim().min(1).max(150).optional(),
      message: z.string().trim().min(1).max(5000).optional(),
      eventDate: z.string().datetime().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
      location: optionalString(200),
      phone: optionalString(30),
      email: z.string().trim().email().optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
      website: optionalUrl,
      googleMapsUrl: optionalUrl,
      countdownEnabled: z.boolean().optional(),
      coverPhotoUrl: clearableUrl,
      recipientPhotoUrl: clearableUrl,
      musicUrl: clearableUrl,
      theme: z
        .object({
          color: z.string().trim().max(20).optional(),
          font: z.string().trim().max(60).optional(),
          cardStyle: z.string().trim().max(40).optional(),
          background: z.string().trim().max(200).optional(),
        })
        .partial()
        .optional(),
      animationSettings: z
        .object({
          effect: z
            .enum(['none', 'confetti', 'fireworks', 'floatingHearts', 'snow', 'stars', 'emojiRain'])
            .optional(),
        })
        .partial()
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'No fields provided to update' }),
});

export const attachMediaSchema = z.object({
  body: z.object({
    url: z.string().url('A valid media URL is required'),
    publicId: z.string().min(1, 'publicId is required'),
    type: z.enum(['IMAGE', 'VIDEO']),
    order: z.number().int().min(0).optional(),
  }),
});

export const listWishesQuerySchema = z.object({
  query: z.object({
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export default { createWishSchema, updateWishSchema, attachMediaSchema, listWishesQuerySchema, EVENT_TYPES };
