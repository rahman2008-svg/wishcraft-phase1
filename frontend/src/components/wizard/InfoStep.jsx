import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const infoSchema = z.object({
  recipientName: z.string().trim().min(1, 'Required').max(120),
  senderName: z.string().trim().min(1, 'Required').max(120),
  title: z.string().trim().min(1, 'Required').max(150),
  message: z.string().trim().min(1, 'Required').max(5000),
  eventDate: z.string().optional(),
  location: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email('Invalid email').or(z.literal('')).optional(),
  website: z.string().trim().url('Invalid URL').or(z.literal('')).optional(),
  googleMapsUrl: z.string().trim().url('Invalid URL').or(z.literal('')).optional(),
  countdownEnabled: z.boolean().optional(),
});

const InfoStep = ({ defaultValues, onSubmit, isSubmitting, onBack }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      recipientName: '',
      senderName: '',
      title: '',
      message: '',
      eventDate: '',
      location: '',
      phone: '',
      email: '',
      website: '',
      googleMapsUrl: '',
      countdownEnabled: false,
      ...defaultValues,
    },
  });

  const hasEventDate = Boolean(watch('eventDate'));

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="font-display text-2xl font-semibold">Tell us about the occasion</h2>
      <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
        This becomes the heart of your wish page.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Recipient name *</label>
          <input className="input-field" placeholder="Sadia Rahman" {...register('recipientName')} />
          {errors.recipientName && <p className="field-error">{errors.recipientName.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Sender name *</label>
          <input className="input-field" placeholder="Aariz" {...register('senderName')} />
          {errors.senderName && <p className="field-error">{errors.senderName.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">Title *</label>
          <input className="input-field" placeholder="Happy Birthday, Sadia!" {...register('title')} />
          {errors.title && <p className="field-error">{errors.title.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">Message *</label>
          <textarea
            className="input-field min-h-[120px] resize-y"
            placeholder="Wishing you the most joyful year yet…"
            {...register('message')}
          />
          {errors.message && <p className="field-error">{errors.message.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Event date</label>
          <input type="datetime-local" className="input-field" {...register('eventDate')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Location</label>
          <input className="input-field" placeholder="Dhaka, Bangladesh" {...register('location')} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Phone</label>
          <input className="input-field" placeholder="+8801XXXXXXXXX" {...register('phone')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Contact email</label>
          <input className="input-field" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Website</label>
          <input className="input-field" placeholder="https://example.com" {...register('website')} />
          {errors.website && <p className="field-error">{errors.website.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Google Maps link</label>
          <input className="input-field" placeholder="https://maps.google.com/…" {...register('googleMapsUrl')} />
          {errors.googleMapsUrl && <p className="field-error">{errors.googleMapsUrl.message}</p>}
        </div>

        <label className="glass-panel flex items-center justify-between rounded-2xl px-4 py-3 sm:col-span-2">
          <span className="text-sm font-medium">
            Show a countdown timer
            {!hasEventDate && (
              <span className="ml-2 text-xs text-wish-ink-700/50 dark:text-wish-ink-100/40">
                (add an event date to enable)
              </span>
            )}
          </span>
          <input
            type="checkbox"
            disabled={!hasEventDate}
            className="h-5 w-5 accent-wish-violet-600"
            {...register('countdownEnabled')}
          />
        </label>
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Creating draft…' : 'Continue'}
        </button>
      </div>
    </form>
  );
};

export default InfoStep;
