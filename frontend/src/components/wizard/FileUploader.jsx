import { useRef, useState } from 'react';
import { UploadCloud, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadFileRequest } from '../../api/media.api';

/**
 * Handles the full upload lifecycle for one file: pick -> upload with
 * progress -> hand the Cloudinary result back to the caller via onUploaded.
 */
const FileUploader = ({
  accept,
  folder,
  label,
  hint,
  onUploaded,
  currentUrl,
  onRemove,
  maxSizeLabel,
  compact = false,
}) => {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    try {
      const result = await uploadFileRequest(file, { folder, onProgress: setProgress });
      onUploaded(result.data);
      if (label) toast.success(`${label} uploaded`);
    } catch (err) {
      const message = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label={label || 'Add photo'}
        className="glass-panel flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-wish-violet-300/50 text-wish-violet-600 transition hover:border-wish-violet-500 disabled:opacity-60 dark:border-white/10 dark:text-wish-violet-300"
      >
        {isUploading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <UploadCloud size={18} />
        )}
        <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      </button>
    );
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      {hint && <p className="mb-2 text-xs text-wish-ink-700/60 dark:text-wish-ink-100/40">{hint}</p>}

      {currentUrl ? (
        <div className="glass-panel flex items-center justify-between rounded-2xl px-4 py-3">
          <span className="truncate text-sm text-wish-ink-700 dark:text-wish-ink-100/80">
            {currentUrl.split('/').pop()}
          </span>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${label}`}
              className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="glass-panel flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-wish-violet-300/50 px-4 py-8 text-center transition hover:border-wish-violet-500 disabled:opacity-60 dark:border-white/10"
        >
          {isUploading ? (
            <>
              <Loader2 size={22} className="animate-spin text-wish-violet-600 dark:text-wish-violet-300" />
              <span className="text-sm">{progress}%</span>
            </>
          ) : (
            <>
              <UploadCloud size={22} className="text-wish-violet-600 dark:text-wish-violet-300" />
              <span className="text-sm font-medium">Click to upload</span>
              {maxSizeLabel && (
                <span className="text-xs text-wish-ink-700/50 dark:text-wish-ink-100/40">{maxSizeLabel}</span>
              )}
            </>
          )}
        </button>
      )}

      <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
    </div>
  );
};

export default FileUploader;
