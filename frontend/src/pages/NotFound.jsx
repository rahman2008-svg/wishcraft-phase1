import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel-strong max-w-md rounded-3xl p-10"
      >
        <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-wish-gradient text-white shadow-glow">
          <Sparkles size={22} strokeWidth={2.5} />
        </span>
        <h1 className="font-display text-6xl font-semibold text-wish-violet-600 dark:text-wish-amber-300">
          404
        </h1>
        <h2 className="mt-2 font-display text-xl font-semibold">This wish hasn&apos;t been made yet</h2>
        <p className="mt-2 text-sm text-wish-ink-700 dark:text-wish-ink-100/70">
          The page you&apos;re looking for doesn&apos;t exist, or the link may have been mistyped.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          <Home size={16} /> Back to home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
