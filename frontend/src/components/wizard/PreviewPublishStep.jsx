import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { publishWishRequest } from '../../api/wish.api';

const formatDate = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return null;
  }
};

const PreviewPublishStep = ({ wishId, wishData, template, onBack, onPublished }) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const accentColor = wishData.theme?.color || template?.config?.accent || '#7c3aed';
  const backgroundStyle = template?.config?.background || '#1a1a2e';

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const result = await publishWishRequest(wishId);
      toast.success('Your wish page is live!');
      onPublished(result.data.wish);
    } catch (err) {
      toast.error('Could not publish right now. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Preview & publish</h2>
      <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
        Here&apos;s how your wish page will look. Publish when you&apos;re ready to share it.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mt-6 max-w-sm overflow-hidden rounded-3xl shadow-glass-lg"
        style={{ background: backgroundStyle }}
      >
        {wishData.coverPhotoUrl && (
          <img src={wishData.coverPhotoUrl} alt="" className="h-48 w-full object-cover" />
        )}
        <div className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: accentColor }}>
            To {wishData.recipientName}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-white">{wishData.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/80">{wishData.message}</p>

          {wishData.eventDate && (
            <div className="mt-4 flex items-center gap-1.5 text-xs text-white/60">
              <Calendar size={13} /> {formatDate(wishData.eventDate)}
            </div>
          )}
          {wishData.location && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
              <MapPin size={13} /> {wishData.location}
            </div>
          )}

          <p className="mt-4 text-right text-sm italic text-white/70">— {wishData.senderName}</p>
        </div>
      </motion.div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button type="button" onClick={handlePublish} disabled={isPublishing} className="btn-primary">
          <Rocket size={16} /> {isPublishing ? 'Publishing…' : 'Publish wish'}
        </button>
      </div>
    </div>
  );
};

export default PreviewPublishStep;
