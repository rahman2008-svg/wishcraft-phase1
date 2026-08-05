import { Sparkles } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 px-4 pb-8">
      <div className="glass-panel mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 rounded-3xl px-8 py-6 text-sm text-wish-ink-700 dark:text-wish-ink-100/70 sm:flex-row">
        <div className="flex items-center gap-2 font-display text-base font-semibold text-wish-ink-900 dark:text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-wish-gradient text-white">
            <Sparkles size={12} strokeWidth={2.5} />
          </span>
          WishCraft
        </div>
        <p>© {year} WishCraft. Create • Share • Celebrate.</p>
      </div>
    </footer>
  );
};

export default Footer;
