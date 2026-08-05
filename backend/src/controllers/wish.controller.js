import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as wishService from '../services/wish.service.js';

export const createWish = asyncHandler(async (req, res) => {
  const wish = await wishService.createWish(req.user.id, req.body);
  return new ApiResponse(
    201,
    { wish, shareUrl: `/w/${wish.slug}` },
    'Wish page created as a draft'
  ).send(res);
});

export const listMyWishes = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

  const result = await wishService.listMyWishes(req.user.id, { status, page, limit });
  return new ApiResponse(200, result, 'Your wishes retrieved').send(res);
});

export const getWish = asyncHandler(async (req, res) => {
  const wish = await wishService.getWishForOwner(req.params.id, req.user.id);
  return new ApiResponse(200, { wish }, 'Wish page retrieved').send(res);
});

export const updateWish = asyncHandler(async (req, res) => {
  const wish = await wishService.updateWish(req.params.id, req.user.id, req.body);
  return new ApiResponse(200, { wish }, 'Wish page updated').send(res);
});

export const publishWish = asyncHandler(async (req, res) => {
  const wish = await wishService.publishWish(req.params.id, req.user.id);
  return new ApiResponse(200, { wish, shareUrl: `/w/${wish.slug}` }, 'Wish page published').send(res);
});

export const unpublishWish = asyncHandler(async (req, res) => {
  const wish = await wishService.unpublishWish(req.params.id, req.user.id);
  return new ApiResponse(200, { wish }, 'Wish page moved back to drafts').send(res);
});

export const deleteWish = asyncHandler(async (req, res) => {
  await wishService.deleteWish(req.params.id, req.user.id);
  return new ApiResponse(200, null, 'Wish page deleted').send(res);
});

export const getPublicWish = asyncHandler(async (req, res) => {
  const wish = await wishService.getPublicWishBySlug(req.params.slug);
  return new ApiResponse(200, { wish }, 'Wish page retrieved').send(res);
});

export const attachMedia = asyncHandler(async (req, res) => {
  const media = await wishService.attachMedia(req.params.id, req.user.id, req.body);
  return new ApiResponse(201, { media }, 'Media attached to wish page').send(res);
});

export const removeMedia = asyncHandler(async (req, res) => {
  await wishService.removeMedia(req.params.id, req.params.mediaId, req.user.id);
  return new ApiResponse(200, null, 'Media removed').send(res);
});

export default {
  createWish,
  listMyWishes,
  getWish,
  updateWish,
  publishWish,
  unpublishWish,
  deleteWish,
  getPublicWish,
  attachMedia,
  removeMedia,
};
