import { useState } from 'react';
import { X, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import FileUploader from './FileUploader';
import { attachMediaRequest, removeMediaRequest, updateWishRequest } from '../../api/wish.api';

const MediaStep = ({ wishId, coverPhotoUrl, gallery, onCoverChange, onGalleryChange, onBack, onNext }) => {
  const [isSavingCover, setIsSavingCover] = useState(false);

  const handleCoverUploaded = async (result) => {
    setIsSavingCover(true);
    try {
      await updateWishRequest(wishId, { coverPhotoUrl: result.url });
      onCoverChange(result.url);
    } catch (err) {
      toast.error('Could not save the cover photo. Please try again.');
    } finally {
      setIsSavingCover(false);
    }
  };

  const handleRemoveCover = async () => {
    setIsSavingCover(true);
    try {
      await updateWishRequest(wishId, { coverPhotoUrl: null });
      onCoverChange(null);
    } catch (err) {
      toast.error('Could not remove the cover photo. Please try again.');
    } finally {
      setIsSavingCover(false);
    }
  };

  const handleGalleryUploaded = async (result) => {
    try {
      const attachResult = await attachMediaRequest(wishId, {
        url: result.url,
        publicId: result.publicId,
        type: result.resourceType === 'video' ? 'VIDEO' : 'IMAGE',
      });
      onGalleryChange([...gallery, attachResult.data.media]);
    } catch (err) {
      toast.error('Could not add this to the gallery. Please try again.');
    }
  };

  const handleRemoveGalleryItem = async (mediaId) => {
    try {
      await removeMediaRequest(wishId, mediaId);
      onGalleryChange(gallery.filter((m) => m.id !== mediaId));
      toast.success('Removed');
    } catch (err) {
      toast.error('Could not remove that item.');
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Add photos & video</h2>
      <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
        A cover photo makes the biggest first impression — gallery items and video are optional.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FileUploader
          label="Cover photo"
          hint="Shown at the top of your wish page"
          accept="image/jpeg,image/png,image/webp,image/gif"
          folder="cover"
          maxSizeLabel="JPG, PNG, WebP, or GIF — up to 8MB"
          currentUrl={coverPhotoUrl}
          onUploaded={handleCoverUploaded}
          onRemove={isSavingCover ? undefined : handleRemoveCover}
        />

        <FileUploader
          label="Video (optional)"
          hint="Adds to your gallery below"
          accept="video/mp4,video/webm,video/quicktime"
          folder="gallery"
          maxSizeLabel="MP4, WebM, or MOV — up to 50MB"
          onUploaded={handleGalleryUploaded}
        />
      </div>

      <div className="mt-8">
        <p className="mb-2 text-sm font-medium">Gallery photos</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {gallery.map((item) => (
            <div key={item.id} className="glass-panel group relative aspect-square overflow-hidden rounded-xl">
              {item.type === 'VIDEO' ? (
                <video src={item.url} className="h-full w-full object-cover" muted />
              ) : (
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => handleRemoveGalleryItem(item.id)}
                aria-label="Remove"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          <FileUploader
            compact
            label="Add photo"
            accept="image/jpeg,image/png,image/webp,image/gif"
            folder="gallery"
            onUploaded={handleGalleryUploaded}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button type="button" onClick={onNext} disabled={isSavingCover} className="btn-primary">
          <ImagePlus size={16} /> Continue
        </button>
      </div>
    </div>
  );
};

export default MediaStep;
