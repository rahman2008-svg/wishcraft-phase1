import { useState } from 'react';
import { Check, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { THEME_COLORS, ANIMATION_EFFECTS } from '../../constants/wishOptions';
import { updateWishRequest } from '../../api/wish.api';

const CustomizeStep = ({ wishId, theme, animationSettings, onThemeChange, onAnimationChange, onBack, onNext }) => {
  const [isSaving, setIsSaving] = useState(false);
  const selectedColor = theme?.color || THEME_COLORS[0].value;
  const selectedEffect = animationSettings?.effect || 'none';

  const persist = async (nextTheme, nextAnimation) => {
    setIsSaving(true);
    try {
      await updateWishRequest(wishId, { theme: nextTheme, animationSettings: nextAnimation });
    } catch (err) {
      toast.error('Could not save your customization.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorSelect = (color) => {
    const nextTheme = { ...theme, color };
    onThemeChange(nextTheme);
    persist(nextTheme, { effect: selectedEffect });
  };

  const handleEffectSelect = (effect) => {
    const nextAnimation = { effect };
    onAnimationChange(nextAnimation);
    persist({ ...theme, color: selectedColor }, nextAnimation);
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Make it yours</h2>
      <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
        Pick an accent color and a celebration effect for the page.
      </p>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium">Accent color</p>
        <div className="flex flex-wrap gap-3">
          {THEME_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => handleColorSelect(c.value)}
              aria-label={c.label}
              className="flex h-11 w-11 items-center justify-center rounded-full shadow-glass transition hover:scale-110"
              style={{ backgroundColor: c.value }}
            >
              {selectedColor === c.value && <Check size={18} className="text-white" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-2 text-sm font-medium">Celebration effect</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ANIMATION_EFFECTS.map((effect) => (
            <button
              key={effect.value}
              type="button"
              onClick={() => handleEffectSelect(effect.value)}
              className={`glass-panel rounded-2xl px-4 py-3 text-sm font-medium transition hover:-translate-y-0.5 ${
                selectedEffect === effect.value ? 'ring-2 ring-wish-violet-500' : ''
              }`}
            >
              {effect.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button type="button" onClick={onNext} disabled={isSaving} className="btn-primary">
          <Palette size={16} /> Continue
        </button>
      </div>
    </div>
  );
};

export default CustomizeStep;
