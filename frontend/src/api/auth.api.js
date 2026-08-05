import apiClient from './axiosClient';

export const registerRequest = (payload) => apiClient.post('/auth/register', payload).then((res) => res.data);

export const loginRequest = (payload) => apiClient.post('/auth/login', payload).then((res) => res.data);

export const logoutRequest = () => apiClient.post('/auth/logout').then((res) => res.data);

export const refreshRequest = () => apiClient.post('/auth/refresh').then((res) => res.data);

export const getMeRequest = () => apiClient.get('/auth/me').then((res) => res.data);

export const updateProfileRequest = (payload) => apiClient.patch('/auth/me', payload).then((res) => res.data);

export const changePasswordRequest = (payload) =>
  apiClient.patch('/auth/me/password', payload).then((res) => res.data);

export default {
  registerRequest,
  loginRequest,
  logoutRequest,
  refreshRequest,
  getMeRequest,
  updateProfileRequest,
  changePasswordRequest,
};
