import { motion } from 'framer-motion';
import { PlusCircle, LayoutGrid, BarChart3, Bell, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const sections = [
  { label: 'My Wishes', icon: LayoutGrid, description: 'View and manage the wish pages you\u2019ve created.' },
  { label: 'Analytics', icon: BarChart3, description: 'Track views, visitors, and shares once you publish.' },
  { label: 'Notifications', icon: Bell, description: 'Comments and activity on your wish pages land here.' },
  { label: 'Settings', icon: Settings, description: 'Manage your profile, username, and account security.' },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel-strong flex flex-col justify-between gap-6 rounded-3xl p-8 sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-sm text-wish-ink-700 dark:text-wish-ink-100/70">Welcome back,</p>
          <h1 className="font-display text-3xl font-semibold">{user?.name}</h1>
          <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">@{user?.username}</p>
        </div>
        <button type="button" className="btn-primary self-start sm:self-auto" disabled>
          <PlusCircle size={17} /> Create a wish
        </button>
      </motion.div>

      <p className="mt-4 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
        The wish creation flow ships in Phase 2 of the build. Your account and session are fully live —
        everything below is wired up and ready to receive real data next.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map(({ label, icon: Icon, description }) => (
          <div key={label} className="glass-panel rounded-2xl p-6">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-wish-violet-500/10 text-wish-violet-600 dark:text-wish-violet-300">
              <Icon size={18} />
            </span>
            <h2 className="font-display text-lg font-semibold">{label}</h2>
            <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
