import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { handleFileUpload } from '../services/cloudinary.service.js';
import { resourceTypeForMimetype } from '../middleware/upload.middleware.js';

/**
 * Generic upload endpoint: accepts one multipart file, uploads it to
 * Cloudinary, and returns the URL/publicId. It intentionally does NOT
 * write to the database — callers (the frontend wish wizard) decide how to
 * use the result: set it as WishPage.coverPhotoUrl/musicUrl via PATCH
 * /wishes/:id, or attach it as a gallery item via POST /wishes/:id/media.
 */
export const uploadFile = asyncHandler(async (req, res) => {
  const resourceType = resourceTypeForMimetype(req.file.mimetype);
  const folder = req.body.folder && /^[a-z0-9_-]{1,40}$/i.test(req.body.folder) ? req.body.folder : 'uploads';

  const result = await handleFileUpload(req.file, { resourceType, folder });

  return new ApiResponse(201, result, 'File uploaded successfully').send(res);
});

export default { uploadFile };
