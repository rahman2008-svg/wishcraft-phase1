import { Router } from 'express';
import authRoutes from './auth.routes.js';
import templateRoutes from './template.routes.js';
import wishRoutes from './wish.routes.js';
import mediaRoutes from './media.routes.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

router.get('/health', (req, res) => {
  return new ApiResponse(200, { status: 'ok', timestamp: new Date().toISOString() }, 'WishCraft API is healthy').send(
    res
  );
});

router.use('/auth', authRoutes);
router.use('/templates', templateRoutes);
router.use('/wishes', wishRoutes);
router.use('/media', mediaRoutes);

// Future phases mount here, e.g.:
// router.use('/comments', commentRoutes);
// router.use('/admin', adminRoutes);

export default router;
