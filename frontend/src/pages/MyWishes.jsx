import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PlusCircle, Copy, Eye, EyeOff, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useMyWishes, usePublishWish, useUnpublishWish, useDeleteWish } from '../hooks/useWishes';

const STATUS_STYLES = {
  DRAFT: 'bg-wish-ink-700/10 text-wish-ink-700 dark:bg-white/10 dark:text-wish-ink-100/70',
  PUBLISHED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  ARCHIVED: 'bg-wish-ink-700/10 text-wish-ink-700/60 dark:text-wish-ink-100/40',
};

const WishCard = ({ wish }) => {
  const publishMutation = usePublishWish();
  const unpublishMutation = useUnpublishWish();
  const deleteMutation = useDeleteWish();
  const shareUrl = `${window.location.origin}/w/${wish.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleTogglePublish = () => {
    const mutation = wish.status === 'PUBLISHED' ? unpublishMutation : publishMutation;
    mutation.mutate(wish.id, {
      onSuccess: () => toast.success(wish.status === 'PUBLISHED' ? 'Moved to drafts' : 'Published!'),
      onError: () => toast.error('Something went wrong. Please try again.'),
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${wish.title}"? This can't be undone.`)) return;
    deleteMutation.mutate(wish.id, {
      onSuccess: () => toast.success('Deleted'),
      onError: () => toast.error('Could not delete. Please try again.'),
    });
  };

  const isBusy = publishMutation.isPending || unpublishMutation.isPending || deleteMutation.isPending;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[wish.status]}`}>
            {wish.status}
          </span>
          <h3 className="mt-2 truncate font-display text-lg font-semibold">{wish.title}</h3>
          <p className="truncate text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
            For {wish.recipientName} · {wish.template?.name}
          </p>
        </div>
        {wish.template?.thumbnailUrl && (
          <div
            className="h-14 w-14 shrink-0 rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url(${wish.template.thumbnailUrl})` }}
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {wish.status === 'PUBLISHED' && (
          <>
            <button type="button" onClick={handleCopy} className="btn-secondary !px-3 !py-1.5 text-xs">
              <Copy size={13} /> Copy link
            </button>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary !px-3 !py-1.5 text-xs">
              <ExternalLink size={13} /> View
            </a>
          </>
        )}
        <button
          type="button"
          onClick={handleTogglePublish}
          disabled={isBusy}
          className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-50"
        >
          {isBusy ? (
            <Loader2 size={13} className="animate-spin" />
          ) : wish.status === 'PUBLISHED' ? (
            <EyeOff size={13} />
          ) : (
            <Eye size={13} />
          )}
          {wish.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isBusy}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 transition hover:bg-rose-500/20 disabled:opacity-50"
          aria-label="Delete wish"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};

const MyWishes = () => {
  const [status, setStatus] = useState(undefined);
  const { data, isLoading, isError } = useMyWishes(status ? { status } : {});

  const filters = [
    { label: 'All', value: undefined },
    { label: 'Drafts', value: 'DRAFT' },
    { label: 'Published', value: 'PUBLISHED' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold">My Wishes</h1>
          <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
            Everything you&apos;ve created, in one place.
          </p>
        </div>
        <Link to="/create" className="btn-primary self-start sm:self-auto">
          <PlusCircle size={17} /> Create a wish
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              status === f.value ? 'bg-wish-gradient text-white' : 'glass-panel text-wish-ink-700 dark:text-wish-ink-100/70'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="mt-16 flex justify-center text-wish-ink-700 dark:text-wish-ink-100/60">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {isError && (
        <p className="mt-16 text-center text-sm text-rose-500">Couldn&apos;t load your wishes. Please try again.</p>
      )}

      {!isLoading && !isError && data?.wishes?.length === 0 && (
        <div className="glass-panel mt-8 rounded-3xl p-12 text-center">
          <p className="font-display text-lg font-semibold">No wishes yet</p>
          <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
            Create your first one — it only takes a few minutes.
          </p>
          <Link to="/create" className="btn-primary mt-5 inline-flex">
            <PlusCircle size={17} /> Create a wish
          </Link>
        </div>
      )}

      {!isLoading && !isError && data?.wishes?.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.wishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWishes;
