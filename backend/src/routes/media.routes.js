import { Router } from 'express';
import * as mediaController from '../controllers/media.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadSingleFile, validateUploadedFileSize } from '../middleware/upload.middleware.js';

const router = Router();

router.post(
  '/upload',
  requireAuth,
  uploadSingleFile,
  validateUploadedFileSize,
  mediaController.uploadFile
);

export default router;
