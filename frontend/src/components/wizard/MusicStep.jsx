import { useState } from 'react';
import { Music4 } from 'lucide-react';
import toast from 'react-hot-toast';
import FileUploader from './FileUploader';
import { updateWishRequest } from '../../api/wish.api';

const MusicStep = ({ wishId, musicUrl, onMusicChange, onBack, onNext }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleUploaded = async (result) => {
    setIsSaving(true);
    try {
      await updateWishRequest(wishId, { musicUrl: result.url });
      onMusicChange(result.url);
    } catch (err) {
      toast.error('Could not save the track. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    try {
      await updateWishRequest(wishId, { musicUrl: null });
      onMusicChange(null);
    } catch (err) {
      toast.error('Could not remove the track. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Background music</h2>
      <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
        Optional — a short track that plays softly while the page is viewed.
      </p>

      <div className="mt-6 max-w-md">
        <FileUploader
          label="Music track"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
          folder="music"
          maxSizeLabel="MP3, WAV, or OGG — up to 15MB"
          currentUrl={musicUrl}
          onUploaded={handleUploaded}
          onRemove={isSaving ? undefined : handleRemove}
        />
        {musicUrl && (
          <audio controls src={musicUrl} className="mt-3 w-full">
            <track kind="captions" />
          </audio>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button type="button" onClick={onNext} disabled={isSaving} className="btn-primary">
          <Music4 size={16} /> Continue
        </button>
      </div>
    </div>
  );
};

export default MusicStep;
