/**
 * WishCraft's signature ambient backdrop — three slow-drifting gradient
 * orbs behind a subtle mesh, visible through the glassmorphism panels.
 * This is the one recurring visual motif tying every page together.
 */
const AmbientBackground = () => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-wish-ink-50 dark:bg-wish-ink-950">
      <div className="absolute inset-0 dark:bg-wish-mesh-dark" />
      <div className="absolute inset-0 bg-wish-gradient-soft opacity-70 dark:opacity-0 transition-opacity duration-500" />

      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-wish-violet-500/30 blur-3xl animate-orb-float" />
      <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-wish-pink-500/25 blur-3xl animate-orb-float-slow" />
      <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-wish-amber-400/20 blur-3xl animate-orb-float" />

      <div className="absolute inset-0 backdrop-blur-[100px]" />
    </div>
  );
};

export default AmbientBackground;
