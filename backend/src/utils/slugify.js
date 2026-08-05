import prisma from '../config/db.js';

/**
 * Converts arbitrary text into a URL-safe slug: lowercase, ASCII,
 * hyphen-separated, no leading/trailing/duplicate hyphens.
 */
export const slugify = (text) => {
  return (text || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
};

/**
 * Generates a slug that is guaranteed unique against WishPage.slug.
 * On collision, appends -2, -3, -4... until a free slug is found, per the
 * product spec: rahman2027 -> rahman2027-2 -> rahman2027-3
 *
 * @param {string} baseText - text to slugify as the starting point
 * @param {string} [excludeId] - a WishPage id to ignore (used when
 *   re-slugging an existing record so it doesn't collide with itself)
 */
export const generateUniqueSlug = async (baseText, excludeId = null) => {
  const base = slugify(baseText) || 'wish';
  let candidate = base;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.wishPage.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter += 1;
  }
};

export default { slugify, generateUniqueSlug };
