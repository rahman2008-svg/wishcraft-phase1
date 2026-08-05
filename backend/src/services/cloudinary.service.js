import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Uploads a buffer (from multer memory storage) to Cloudinary via a
 * readable stream — avoids writing temp files to disk, which matters on
 * ephemeral filesystems like Render's.
 *
 * @param {Buffer} buffer
 * @param {object} options
 * @param {'image'|'video'} options.resourceType
 * @param {string} [options.folder] - subfolder under the base upload folder
 */
export const uploadBufferToCloudinary = (buffer, { resourceType = 'image', folder = '' } = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder ? `${env.cloudinary.uploadFolder}/${folder}` : env.cloudinary.uploadFolder,
        resource_type: resourceType,
        // Keep originals reasonably capped; templates + CSS handle final framing.
        transformation:
          resourceType === 'image' ? [{ width: 2000, height: 2000, crop: 'limit', quality: 'auto' }] : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    // Non-fatal — the DB record removal should still proceed even if the
    // remote asset was already gone or Cloudinary is briefly unavailable.
    // eslint-disable-next-line no-console
    console.error('[cloudinary] delete failed:', err.message);
    return null;
  }
};

/**
 * High-level helper used by controllers: validates a multer file object
 * exists, uploads it, and returns the shape the frontend needs.
 */
export const handleFileUpload = async (file, { resourceType = 'image', folder = '' } = {}) => {
  if (!file) {
    throw ApiError.badRequest('No file was uploaded');
  }

  const result = await uploadBufferToCloudinary(file.buffer, { resourceType, folder });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format,
    width: result.width,
    height: result.height,
    duration: result.duration,
    bytes: result.bytes,
  };
};

export default { uploadBufferToCloudinary, deleteFromCloudinary, handleFileUpload };
