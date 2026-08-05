import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as templateService from '../services/template.service.js';

export const listTemplates = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const templates = await templateService.listTemplates({ category });
  return new ApiResponse(200, { templates, count: templates.length }, 'Templates retrieved').send(res);
});

export const getTemplate = asyncHandler(async (req, res) => {
  const template = await templateService.getTemplateBySlug(req.params.slug);
  return new ApiResponse(200, { template }, 'Template retrieved').send(res);
});

export default { listTemplates, getTemplate };
