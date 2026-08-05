import { Router } from 'express';
import * as wishController from '../controllers/wish.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createWishSchema,
  updateWishSchema,
  attachMediaSchema,
  listWishesQuerySchema,
} from '../validators/wish.validator.js';

const router = Router();

// --- Public (no auth) ---
// Mounted before the :id routes below at the app level via a distinct path
// (see routes/index.js -> /wishes/public/:slug) to avoid ambiguity with
// the owner-only /wishes/:id route.
router.get('/public/:slug', wishController.getPublicWish);

// --- Owner-only ---
router.use(requireAuth);

router.post('/', validate(createWishSchema), wishController.createWish);
router.get('/mine', validate(listWishesQuerySchema), wishController.listMyWishes);
router.get('/:id', wishController.getWish);
router.patch('/:id', validate(updateWishSchema), wishController.updateWish);
router.patch('/:id/publish', wishController.publishWish);
router.patch('/:id/unpublish', wishController.unpublishWish);
router.delete('/:id', wishController.deleteWish);

router.post('/:id/media', validate(attachMediaSchema), wishController.attachMedia);
router.delete('/:id/media/:mediaId', wishController.removeMedia);

export default router;
