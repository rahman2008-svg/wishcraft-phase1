import { Sparkles } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-wish-gradient text-white shadow-glow">
        <Sparkles size={22} strokeWidth={2.5} />
      </span>
      <p className="font-display text-sm text-wish-ink-700 dark:text-wish-ink-100/70">
        Gathering your wishes…
      </p>
    </div>
  );
};

export default LoadingScreen;
