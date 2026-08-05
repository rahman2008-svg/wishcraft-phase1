import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import StepIndicator from '../components/wizard/StepIndicator';
import EventStep from '../components/wizard/EventStep';
import TemplateStep from '../components/wizard/TemplateStep';
import InfoStep from '../components/wizard/InfoStep';
import MediaStep from '../components/wizard/MediaStep';
import MusicStep from '../components/wizard/MusicStep';
import CustomizeStep from '../components/wizard/CustomizeStep';
import PreviewPublishStep from '../components/wizard/PreviewPublishStep';
import ShareStep from '../components/wizard/ShareStep';
import { createWishRequest } from '../api/wish.api';

const STEP_LABELS = ['Event', 'Template', 'Info', 'Media', 'Music', 'Customize', 'Preview', 'Share'];

const initialState = {
  eventType: null,
  template: null,
  wishId: null,
  wishData: {
    recipientName: '',
    senderName: '',
    title: '',
    message: '',
    eventDate: null,
    location: '',
    coverPhotoUrl: null,
    theme: {},
    animationSettings: {},
  },
  gallery: [],
  musicUrl: null,
  publishedWish: null,
};

const CreateWish = () => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState(initialState);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  const goTo = (n) => setStep(Math.min(Math.max(n, 1), STEP_LABELS.length));
  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const handleInfoSubmit = async (values) => {
    setIsCreatingDraft(true);
    try {
      const payload = {
        eventType: state.eventType,
        templateId: state.template.id,
        recipientName: values.recipientName,
        senderName: values.senderName,
        title: values.title,
        message: values.message,
        eventDate: values.eventDate ? new Date(values.eventDate).toISOString() : undefined,
        location: values.location || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        website: values.website || undefined,
        googleMapsUrl: values.googleMapsUrl || undefined,
        countdownEnabled: Boolean(values.countdownEnabled),
      };

      const result = await createWishRequest(payload);
      const wish = result.data.wish;

      setState((prev) => ({
        ...prev,
        wishId: wish.id,
        wishData: { ...prev.wishData, ...values, eventDate: payload.eventDate || null },
      }));
      toast.success('Draft created — link reserved!');
      next();
    } catch (err) {
      const message = err.response?.data?.message || 'Could not create your wish. Please try again.';
      toast.error(message);
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const stepProps = { onBack: back, onNext: next };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-2 text-center">
        <h1 className="font-display text-3xl font-semibold">Create your wish</h1>
        <p className="mt-1 text-sm text-wish-ink-700 dark:text-wish-ink-100/60">
          Eight quick steps to a page you&apos;ll love sharing.
        </p>
      </div>

      <div className="mt-8">
        <StepIndicator steps={STEP_LABELS} currentStep={step} />
      </div>

      <div className="glass-panel-strong rounded-3xl p-6 sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <EventStep
                value={state.eventType}
                onSelect={(eventType) => setState((prev) => ({ ...prev, eventType }))}
                onNext={next}
              />
            )}

            {step === 2 && (
              <TemplateStep
                value={state.template?.id}
                onSelect={(template) => setState((prev) => ({ ...prev, template }))}
                onNext={next}
              />
            )}

            {step === 3 && (
              <InfoStep
                defaultValues={state.wishData}
                isSubmitting={isCreatingDraft}
                onSubmit={handleInfoSubmit}
                onBack={back}
              />
            )}

            {step === 4 && (
              <MediaStep
                wishId={state.wishId}
                coverPhotoUrl={state.wishData.coverPhotoUrl}
                gallery={state.gallery}
                onCoverChange={(coverPhotoUrl) =>
                  setState((prev) => ({ ...prev, wishData: { ...prev.wishData, coverPhotoUrl } }))
                }
                onGalleryChange={(gallery) => setState((prev) => ({ ...prev, gallery }))}
                {...stepProps}
              />
            )}

            {step === 5 && (
              <MusicStep
                wishId={state.wishId}
                musicUrl={state.musicUrl}
                onMusicChange={(musicUrl) => setState((prev) => ({ ...prev, musicUrl }))}
                {...stepProps}
              />
            )}

            {step === 6 && (
              <CustomizeStep
                wishId={state.wishId}
                theme={state.wishData.theme}
                animationSettings={state.wishData.animationSettings}
                onThemeChange={(theme) =>
                  setState((prev) => ({ ...prev, wishData: { ...prev.wishData, theme } }))
                }
                onAnimationChange={(animationSettings) =>
                  setState((prev) => ({ ...prev, wishData: { ...prev.wishData, animationSettings } }))
                }
                {...stepProps}
              />
            )}

            {step === 7 && (
              <PreviewPublishStep
                wishId={state.wishId}
                wishData={state.wishData}
                template={state.template}
                onBack={back}
                onPublished={(publishedWish) => {
                  setState((prev) => ({ ...prev, publishedWish }));
                  next();
                }}
              />
            )}

            {step === 8 && state.publishedWish && <ShareStep wish={state.publishedWish} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateWish;
