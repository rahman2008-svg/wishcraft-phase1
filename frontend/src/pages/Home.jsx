import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Cake, Heart, GraduationCap, Home as HomeIcon, Gift, Sparkles } from 'lucide-react';

const eventTypes = [
  { label: 'Birthday', icon: Cake },
  { label: 'Wedding', icon: Heart },
  { label: 'Anniversary', icon: Heart },
  { label: 'Graduation', icon: GraduationCap },
  { label: 'House Warming', icon: HomeIcon },
  { label: 'Engagement', icon: Gift },
];

const templates = [
  { name: 'Premium Dark', gradient: 'from-zinc-900 to-wish-violet-900', text: 'text-amber-300' },
  { name: 'Minimal White', gradient: 'from-white to-zinc-100', text: 'text-zinc-900' },
  { name: 'Luxury Gold', gradient: 'from-amber-100 to-yellow-600', text: 'text-yellow-950' },
  { name: 'Glass', gradient: 'from-indigo-400 to-purple-500', text: 'text-white' },
];

const stats = [
  { value: '120K+', label: 'Wishes created' },
  { value: '2.4M', label: 'Pages viewed' },
  { value: '190', label: 'Countries reached' },
  { value: '11', label: 'Premium templates' },
];

const faqs = [
  {
    q: 'Do I need an account to view a wish page?',
    a: 'No — anyone with the link can view a published wish page. You only need an account to create and manage your own.',
  },
  {
    q: 'Can I change my link after publishing?',
    a: 'Your permanent link stays the same once published, so it never breaks once shared. You can still edit the content behind it anytime.',
  },
  {
    q: 'Is WishCraft free to use?',
    a: 'Yes. Core templates and features are free. Premium templates unlock additional styles and customization.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const Home = () => {
  return (
    <div className="px-4">
      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center pt-16 text-center sm:pt-24">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-wish-violet-700 dark:text-wish-violet-200"
        >
          <Sparkles size={13} /> Now with 11 premium templates
        </motion.span>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl"
        >
          Every wish deserves a
          <span className="block bg-wish-gradient bg-clip-text text-transparent">
            beautiful place to live.
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 max-w-xl text-balance text-lg text-wish-ink-700 dark:text-wish-ink-100/80"
        >
          Design a greeting page for any occasion, add photos, video, and music,
          then share one permanent link that never expires.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link to="/register" className="btn-primary">
            Create your wish <ArrowRight size={16} />
          </Link>
          <a href="#templates" className="btn-secondary">
            Explore templates
          </a>
        </motion.div>
      </section>

      {/* Event types */}
      <section className="mx-auto mt-24 max-w-6xl">
        <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">
          What are you celebrating?
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {eventTypes.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="glass-panel flex flex-col items-center gap-2 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-1"
            >
              <Icon size={22} className="text-wish-violet-600 dark:text-wish-violet-300" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="mx-auto mt-24 max-w-6xl scroll-mt-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Featured templates</h2>
          <span className="text-sm text-wish-ink-700 dark:text-wish-ink-100/60">11 styles, endlessly customizable</span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {templates.map((t) => (
            <div
              key={t.name}
              className={`flex h-48 flex-col justify-end rounded-2xl bg-gradient-to-br p-4 shadow-glass ${t.gradient}`}
            >
              <span className={`font-display text-lg font-semibold ${t.text}`}>{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section id="explore" className="mx-auto mt-24 max-w-6xl scroll-mt-24">
        <div className="glass-panel-strong grid grid-cols-2 gap-6 rounded-3xl px-8 py-10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-semibold text-wish-violet-600 dark:text-wish-amber-300">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-wish-ink-700 dark:text-wish-ink-100/60">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-24 max-w-3xl pb-8">
        <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-8 space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className="glass-panel group rounded-2xl px-5 py-4">
              <summary className="cursor-pointer list-none font-medium marker:content-none">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-wish-ink-700 dark:text-wish-ink-100/70">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Pricing anchor placeholder section for nav target */}
      <section id="pricing" className="sr-only" aria-hidden="true" />
    </div>
  );
};

export default Home;
