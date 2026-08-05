import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES];
  if (!allTypes.includes(file.mimetype)) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
  }
  return cb(null, true);
};

// A generous shared limit — precise per-type limits are enforced in the
// controller after multer hands off the file, since multer's own limits
// apply before we know which category (image/video/audio) we're dealing with.
export const uploadSingleFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_VIDEO_BYTES },
}).single('file');

export const validateUploadedFileSize = (req, res, next) => {
  const file = req.file;
  if (!file) return next(ApiError.badRequest('No file was uploaded'));

  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype) && file.size > MAX_IMAGE_BYTES) {
    return next(ApiError.badRequest(`Image must be under ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`));
  }
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype) && file.size > MAX_VIDEO_BYTES) {
    return next(ApiError.badRequest(`Video must be under ${MAX_VIDEO_BYTES / (1024 * 1024)}MB`));
  }
  if (ALLOWED_AUDIO_TYPES.includes(file.mimetype) && file.size > MAX_AUDIO_BYTES) {
    return next(ApiError.badRequest(`Audio must be under ${MAX_AUDIO_BYTES / (1024 * 1024)}MB`));
  }

  return next();
};

export const resourceTypeForMimetype = (mimetype) => {
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) return 'video';
  if (ALLOWED_AUDIO_TYPES.includes(mimetype)) return 'video'; // Cloudinary treats audio under 'video' resource type
  return 'image';
};

export default { uploadSingleFile, validateUploadedFileSize, resourceTypeForMimetype };
