import { motion } from 'framer-motion';
import { Crown, Loader2 } from 'lucide-react';
import { useTemplates } from '../../hooks/useTemplates';

const TemplateStep = ({ value, onSelect, onNext }) => {
  const { data: templates, isLoading, isError } = useTemplates();

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Pick a template</h2>
      <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
        You can fine-tune colors and fonts later — this sets the starting style.
      </p>

      {isLoading && (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
          <Loader2 size={16} className="animate-spin" /> Loading templates…
        </div>
      )}

      {isError && (
        <p className="mt-6 text-sm text-rose-500">
          Couldn&apos;t load templates right now. Check your connection and try again.
        </p>
      )}

      {!isLoading && !isError && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {templates.map((template) => {
            const isSelected = value === template.id;
            const bg = template.config?.background || '#1a1a2e';
            const accent = template.config?.accent || '#ffffff';

            return (
              <motion.button
                key={template.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onSelect(template);
                  onNext();
                }}
                className={`group relative flex h-40 flex-col justify-end overflow-hidden rounded-2xl p-4 text-left shadow-glass transition hover:-translate-y-1 ${
                  isSelected ? 'ring-2 ring-wish-violet-500' : ''
                }`}
                style={{ background: bg }}
              >
                {template.isPremium && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur">
                    <Crown size={11} /> Premium
                  </span>
                )}
                <span className="font-display text-base font-semibold" style={{ color: accent }}>
                  {template.name}
                </span>
                <span className="text-xs opacity-70" style={{ color: accent }}>
                  {template.category}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TemplateStep;
