import apiClient from './axiosClient';

export const createWishRequest = (payload) => apiClient.post('/wishes', payload).then((res) => res.data);

export const listMyWishesRequest = (params = {}) =>
  apiClient.get('/wishes/mine', { params }).then((res) => res.data);

export const getWishRequest = (id) => apiClient.get(`/wishes/${id}`).then((res) => res.data);

export const updateWishRequest = (id, payload) =>
  apiClient.patch(`/wishes/${id}`, payload).then((res) => res.data);

export const publishWishRequest = (id) => apiClient.patch(`/wishes/${id}/publish`).then((res) => res.data);

export const unpublishWishRequest = (id) => apiClient.patch(`/wishes/${id}/unpublish`).then((res) => res.data);

export const deleteWishRequest = (id) => apiClient.delete(`/wishes/${id}`).then((res) => res.data);

export const getPublicWishRequest = (slug) => apiClient.get(`/wishes/public/${slug}`).then((res) => res.data);

export const attachMediaRequest = (wishId, payload) =>
  apiClient.post(`/wishes/${wishId}/media`, payload).then((res) => res.data);

export const removeMediaRequest = (wishId, mediaId) =>
  apiClient.delete(`/wishes/${wishId}/media/${mediaId}`).then((res) => res.data);

export default {
  createWishRequest,
  listMyWishesRequest,
  getWishRequest,
  updateWishRequest,
  publishWishRequest,
  unpublishWishRequest,
  deleteWishRequest,
  getPublicWishRequest,
  attachMediaRequest,
  removeMediaRequest,
};
