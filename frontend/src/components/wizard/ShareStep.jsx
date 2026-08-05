import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, PartyPopper, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const buildShareLinks = (url, text) => ({
  whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  messenger: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=0&redirect_uri=${encodeURIComponent(url)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
});

const ShareStep = ({ wish }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/w/${wish.slug}`;
  const shareText = wish.title || 'Check out this wish I made on WishCraft!';
  const links = buildShareLinks(shareUrl, shareText);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
    shareUrl
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Could not copy — copy it manually instead');
    }
  };

  return (
    <div className="text-center">
      <motion.span
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-wish-gradient text-white shadow-glow"
      >
        <PartyPopper size={26} />
      </motion.span>

      <h2 className="font-display text-2xl font-semibold">It&apos;s live!</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
        Your permanent link is ready. Share it anywhere — it will never expire or change.
      </p>

      <div className="glass-panel-strong mx-auto mt-6 flex max-w-md items-center justify-between gap-3 rounded-full px-5 py-3">
        <span className="truncate text-sm font-medium text-wish-violet-700 dark:text-wish-violet-300">
          {shareUrl}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wish-gradient text-white"
          aria-label="Copy link"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>

      <img
        src={qrSrc}
        alt="QR code linking to your wish page"
        width={160}
        height={160}
        className="glass-panel mx-auto mt-6 rounded-2xl p-3"
      />

      <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-3">
        {[
          { key: 'whatsapp', label: 'WhatsApp' },
          { key: 'facebook', label: 'Facebook' },
          { key: 'messenger', label: 'Messenger' },
          { key: 'telegram', label: 'Telegram' },
          { key: 'x', label: 'X' },
        ].map((platform) => (
          <a
            key={platform.key}
            href={links[platform.key]}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary !px-4 !py-2 text-sm"
          >
            {platform.label}
          </a>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <ExternalLink size={16} /> View live page
        </a>
        <Link to="/dashboard/wishes" className="btn-secondary">
          Back to my wishes
        </Link>
      </div>
    </div>
  );
};

export default ShareStep;
