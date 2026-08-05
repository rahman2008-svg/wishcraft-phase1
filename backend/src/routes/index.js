import { Router } from 'express';
import authRoutes from './auth.routes.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

router.get('/health', (req, res) => {
  return new ApiResponse(200, { status: 'ok', timestamp: new Date().toISOString() }, 'WishCraft API is healthy').send(
    res
  );
});

router.use('/auth', authRoutes);

// Future phases mount here, e.g.:
// router.use('/wishes', wishRoutes);
// router.use('/templates', templateRoutes);
// router.use('/comments', commentRoutes);
// router.use('/media', mediaRoutes);
// router.use('/admin', adminRoutes);

export default router;
