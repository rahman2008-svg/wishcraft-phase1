import { motion } from 'framer-motion';
import { EVENT_TYPES } from '../../constants/wishOptions';

const EventStep = ({ value, onSelect, onNext }) => {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">What are you celebrating?</h2>
      <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
        Choose the occasion for your wish page.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {EVENT_TYPES.map(({ value: eventValue, label, icon: Icon }) => {
          const isSelected = value === eventValue;
          return (
            <motion.button
              key={eventValue}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                onSelect(eventValue);
                onNext();
              }}
              className={`glass-panel flex flex-col items-center gap-2 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5 ${
                isSelected ? 'ring-2 ring-wish-violet-500' : ''
              }`}
            >
              <Icon size={22} className="text-wish-violet-600 dark:text-wish-violet-300" />
              <span className="text-sm font-medium">{label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default EventStep;
