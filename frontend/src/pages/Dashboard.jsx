import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlusCircle, LayoutGrid, BarChart3, Bell, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMyWishes } from '../hooks/useWishes';

const Dashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useMyWishes();

  const publishedCount = data?.wishes?.filter((w) => w.status === 'PUBLISHED').length ?? 0;
  const draftCount = data?.wishes?.filter((w) => w.status === 'DRAFT').length ?? 0;

  const sections = [
    {
      label: 'My Wishes',
      icon: LayoutGrid,
      description: isLoading
        ? 'Loading your wish pages…'
        : `${data?.pagination?.total ?? 0} total · ${publishedCount} published · ${draftCount} drafts`,
      to: '/dashboard/wishes',
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      description: 'Track views, visitors, and shares — arriving in a later phase.',
    },
    {
      label: 'Notifications',
      icon: Bell,
      description: 'Comments and activity on your wish pages will land here.',
    },
    {
      label: 'Settings',
      icon: Settings,
      description: 'Manage your profile, username, and account security.',
    },
  ];

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
        <Link to="/create" className="btn-primary self-start sm:self-auto">
          <PlusCircle size={17} /> Create a wish
        </Link>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map(({ label, icon: Icon, description, to }) => {
          const content = (
            <>
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-wish-violet-500/10 text-wish-violet-600 dark:text-wish-violet-300">
                {isLoading && label === 'My Wishes' ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
              </span>
              <h2 className="font-display text-lg font-semibold">{label}</h2>
              <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">{description}</p>
            </>
          );

          return to ? (
            <Link key={label} to={to} className="glass-panel rounded-2xl p-6 transition hover:-translate-y-0.5">
              {content}
            </Link>
          ) : (
            <div key={label} className="glass-panel rounded-2xl p-6 opacity-80">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
