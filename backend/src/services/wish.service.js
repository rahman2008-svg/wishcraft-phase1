import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { generateUniqueSlug } from '../utils/slugify.js';
import { getTemplateById } from './template.service.js';
import { deleteFromCloudinary } from './cloudinary.service.js';

const ownedWishOrThrow = async (wishId, userId) => {
  const wish = await prisma.wishPage.findUnique({ where: { id: wishId } });
  if (!wish) throw ApiError.notFound('Wish page not found');
  if (wish.userId !== userId) throw ApiError.forbidden('You do not have access to this wish page');
  return wish;
};

/**
 * Creates a new wish page as a DRAFT. All content fields are collected in
 * one step (per the Create Wish flow's "Enter Information" stage), so the
 * slug can be generated immediately from the recipient's name and the link
 * never changes afterward — permanent, as promised in the product spec.
 */
export const createWish = async (userId, payload) => {
  // Confirms the template exists and is active before we commit to it.
  await getTemplateById(payload.templateId);

  const slugSource = payload.slugHint || `${payload.recipientName}`;
  const slug = await generateUniqueSlug(slugSource);

  const wish = await prisma.wishPage.create({
    data: {
      userId,
      templateId: payload.templateId,
      eventType: payload.eventType,
      slug,
      recipientName: payload.recipientName,
      senderName: payload.senderName,
      title: payload.title,
      message: payload.message,
      eventDate: payload.eventDate ? new Date(payload.eventDate) : null,
      location: payload.location,
      phone: payload.phone,
      email: payload.email,
      website: payload.website,
      googleMapsUrl: payload.googleMapsUrl,
      countdownEnabled: Boolean(payload.countdownEnabled),
      status: 'DRAFT',
    },
    include: { template: true, media: true },
  });

  return wish;
};

export const listMyWishes = async (userId, { status, page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [wishes, total] = await Promise.all([
    prisma.wishPage.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      include: {
        template: { select: { id: true, name: true, slug: true, thumbnailUrl: true } },
        _count: { select: { comments: true, likes: true, media: true } },
      },
    }),
    prisma.wishPage.count({ where: { userId, ...(status ? { status } : {}) } }),
  ]);

  return {
    wishes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getWishForOwner = async (wishId, userId) => {
  const wish = await prisma.wishPage.findUnique({
    where: { id: wishId },
    include: { template: true, media: { orderBy: { order: 'asc' } }, _count: { select: { comments: true, likes: true } } },
  });
  if (!wish) throw ApiError.notFound('Wish page not found');
  if (wish.userId !== userId) throw ApiError.forbidden('You do not have access to this wish page');
  return wish;
};

export const updateWish = async (wishId, userId, updates) => {
  await ownedWishOrThrow(wishId, userId);

  if (updates.templateId) {
    await getTemplateById(updates.templateId);
  }

  const data = { ...updates };
  if (updates.eventDate !== undefined) {
    data.eventDate = updates.eventDate ? new Date(updates.eventDate) : null;
  }
  if (updates.theme) {
    data.theme = updates.theme;
  }
  if (updates.animationSettings) {
    data.animationSettings = updates.animationSettings;
  }

  const wish = await prisma.wishPage.update({
    where: { id: wishId },
    data,
    include: { template: true, media: { orderBy: { order: 'asc' } } },
  });

  return wish;
};

/**
 * Transitions a DRAFT wish page to PUBLISHED. Because all required content
 * fields are enforced at creation time, publishing never fails validation —
 * it's purely a status + timestamp transition.
 */
export const publishWish = async (wishId, userId) => {
  const wish = await ownedWishOrThrow(wishId, userId);

  if (wish.status === 'PUBLISHED') {
    return wish; // idempotent
  }

  return prisma.wishPage.update({
    where: { id: wishId },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
    include: { template: true, media: { orderBy: { order: 'asc' } } },
  });
};

export const unpublishWish = async (wishId, userId) => {
  await ownedWishOrThrow(wishId, userId);
  return prisma.wishPage.update({
    where: { id: wishId },
    data: { status: 'DRAFT' },
  });
};

export const deleteWish = async (wishId, userId) => {
  const wish = await prisma.wishPage.findUnique({
    where: { id: wishId },
    include: { media: true },
  });
  if (!wish) throw ApiError.notFound('Wish page not found');
  if (wish.userId !== userId) throw ApiError.forbidden('You do not have access to this wish page');

  // Best-effort cleanup of associated Cloudinary assets before the DB
  // record (and its cascading Media rows) is removed.
  await Promise.all(
    wish.media.map((m) => deleteFromCloudinary(m.publicId, m.type === 'VIDEO' ? 'video' : 'image'))
  );

  await prisma.wishPage.delete({ where: { id: wishId } });
};

/**
 * Public retrieval by slug — no auth. Only PUBLISHED pages are visible;
 * everything else (draft, archived, nonexistent) returns 404 so drafts
 * can never leak via a guessed or shared link.
 */
export const getPublicWishBySlug = async (slug) => {
  const wish = await prisma.wishPage.findUnique({
    where: { slug },
    include: {
      template: true,
      media: { orderBy: { order: 'asc' } },
      user: { select: { username: true, name: true, avatarUrl: true } },
    },
  });

  if (!wish || wish.status !== 'PUBLISHED') {
    throw ApiError.notFound('This wish page does not exist or is no longer available');
  }

  // Fire-and-forget view increment — doesn't block the response.
  prisma.wishPage
    .update({ where: { id: wish.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  return wish;
};

export const attachMedia = async (wishId, userId, mediaInput) => {
  await ownedWishOrThrow(wishId, userId);

  const currentCount = await prisma.media.count({ where: { wishPageId: wishId } });

  return prisma.media.create({
    data: {
      wishPageId: wishId,
      url: mediaInput.url,
      publicId: mediaInput.publicId,
      type: mediaInput.type,
      order: mediaInput.order ?? currentCount,
    },
  });
};

export const removeMedia = async (wishId, mediaId, userId) => {
  await ownedWishOrThrow(wishId, userId);

  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media || media.wishPageId !== wishId) {
    throw ApiError.notFound('Media item not found on this wish page');
  }

  await deleteFromCloudinary(media.publicId, media.type === 'VIDEO' ? 'video' : 'image');
  await prisma.media.delete({ where: { id: mediaId } });
};

export default {
  createWish,
  listMyWishes,
  getWishForOwner,
  updateWish,
  publishWish,
  unpublishWish,
  deleteWish,
  getPublicWishBySlug,
  attachMedia,
  removeMedia,
};
