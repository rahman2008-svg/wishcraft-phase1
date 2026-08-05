import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const templates = [
  {
    name: 'Premium Dark',
    slug: 'premium-dark',
    category: 'Premium',
    description: 'Sleek dark theme with gold accents for elegant celebrations.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/wishcraft/templates/premium-dark.jpg',
    isPremium: true,
    config: { background: '#0b0b0f', accent: '#d4af37', font: 'Playfair Display' },
  },
  {
    name: 'Minimal White',
    slug: 'minimal-white',
    category: 'Minimal',
    description: 'Clean, airy, and modern — lets your message take center stage.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/wishcraft/templates/minimal-white.jpg',
    isPremium: false,
    config: { background: '#ffffff', accent: '#111827', font: 'Inter' },
  },
  {
    name: 'Luxury Gold',
    slug: 'luxury-gold',
    category: 'Premium',
    description: 'Opulent gold foil textures for weddings and anniversaries.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/wishcraft/templates/luxury-gold.jpg',
    isPremium: true,
    config: { background: '#1a1400', accent: '#f5d576', font: 'Cormorant Garamond' },
  },
  {
    name: 'Cute',
    slug: 'cute',
    category: 'Fun',
    description: 'Playful pastel palette with bouncy animations.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/wishcraft/templates/cute.jpg',
    isPremium: false,
    config: { background: '#fff0f6', accent: '#ff6fa5', font: 'Quicksand' },
  },
  {
    name: 'Glass',
    slug: 'glass',
    category: 'Modern',
    description: 'Frosted glassmorphism cards over vibrant gradients.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/wishcraft/templates/glass.jpg',
    isPremium: false,
    config: { background: 'linear-gradient(135deg,#667eea,#764ba2)', accent: '#ffffff', font: 'Poppins' },
  },
  {
    name: 'Floral',
    slug: 'floral',
    category: 'Nature',
    description: 'Hand-illustrated florals for weddings and baby showers.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/wishcraft/templates/floral.jpg',
    isPremium: false,
    config: { background: '#fdf6ec', accent: '#a3623d', font: 'Lora' },
  },
  {
    name: 'Kids',
    slug: 'kids',
    category: 'Fun',
    description: 'Bright colors and cartoon shapes for children\'s birthdays.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/wishcraft/templates/kids.jpg',
    isPremium: false,
    config: { background: '#fff9db', accent: '#4dabf7', font: 'Baloo 2' },
  },
  {
    name: 'Islamic',
    slug: 'islamic',
    category: 'Cultural',
    description: 'Geometric patterns for Eid, Ramadan, and religious occasions.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/wishcraft/templates/islamic.jpg',
    isPremium: false,
    config: { background: '#0c2b26', accent: '#c9a15a', font: 'Amiri' },
  },
  {
    name: 'Corporate',
    slug: 'corporate',
    category: 'Professional',
    description: 'Polished and professional for workplace celebrations.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/wishcraft/templates/corporate.jpg',
    isPremium: false,
    config: { background: '#f4f6f8', accent: '#1e3a8a', font: 'Inter' },
  },
  {
    name: 'Neon',
    slug: 'neon',
    category: 'Modern',
    description: 'High-energy neon glow for parties and farewells.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/wishcraft/templates/neon.jpg',
    isPremium: true,
    config: { background: '#08000f', accent: '#39ff14', font: 'Orbitron' },
  },
  {
    name: 'Nature',
    slug: 'nature',
    category: 'Nature',
    description: 'Earthy greens and organic textures.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/wishcraft/templates/nature.jpg',
    isPremium: false,
    config: { background: '#eef7ee', accent: '#2f6b3a', font: 'Merriweather' },
  },
];

async function main() {
  console.log('[seed] Seeding templates...');
  for (const template of templates) {
    await prisma.template.upsert({
      where: { slug: template.slug },
      update: template,
      create: template,
    });
  }
  console.log(`[seed] Upserted ${templates.length} templates.`);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@wishcraft.app';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: 'WishCraft Admin',
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
      },
    });
    console.log(`[seed] Created admin account: ${adminEmail} (change this password immediately)`);
  } else {
    console.log('[seed] Admin account already exists, skipping.');
  }
}

main()
  .catch((err) => {
    console.error('[seed] Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
