import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const listTemplates = async ({ category } = {}) => {
  return prisma.template.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
};

export const getTemplateBySlug = async (slug) => {
  const template = await prisma.template.findUnique({ where: { slug } });
  if (!template || !template.isActive) {
    throw ApiError.notFound('Template not found');
  }
  return template;
};

export const getTemplateById = async (id) => {
  const template = await prisma.template.findUnique({ where: { id } });
  if (!template || !template.isActive) {
    throw ApiError.notFound('Selected template is not available');
  }
  return template;
};

export default { listTemplates, getTemplateBySlug, getTemplateById };
