import apiClient from './axiosClient';

/**
 * Uploads a single file to Cloudinary via the backend's generic upload
 * endpoint. Returns { url, publicId, resourceType, format, width, height,
 * duration, bytes }.
 *
 * @param {File} file
 * @param {object} [options]
 * @param {string} [options.folder] - e.g. 'cover', 'gallery', 'music'
 * @param {(percent: number) => void} [options.onProgress]
 */
export const uploadFileRequest = (file, { folder, onProgress } = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) formData.append('folder', folder);

  return apiClient
    .post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    })
    .then((res) => res.data);
};

export default { uploadFileRequest };
