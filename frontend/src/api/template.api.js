import apiClient from './axiosClient';

export const listTemplatesRequest = (category) =>
  apiClient.get('/templates', { params: category ? { category } : {} }).then((res) => res.data);

export const getTemplateRequest = (slug) => apiClient.get(`/templates/${slug}`).then((res) => res.data);

export default { listTemplatesRequest, getTemplateRequest };
