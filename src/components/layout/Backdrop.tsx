/**
 * Global, fixed backdrop sitting behind every page. Pure CSS so it's cheap and
 * SSR-friendly: a faint grid masked to fade at the edges, plus slow-drifting
 * glow fields. Motion is disabled automatically under prefers-reduced-motion
 * (see globals.css).
 */
export function Backdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base"
    >
      {/* Faint grid, faded out toward the edges with a radial mask. */}
      <div
        className="absolute inset-0 bg-grid-faint bg-[size:54px_54px] opacity-[0.6]"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)",
        }}
      />

      {/* Drifting glow fields. */}
      <div className="absolute -left-32 -top-40 h-[34rem] w-[34rem] animate-drift rounded-full bg-accent-indigo/20 blur-[140px]" />
      <div className="absolute -right-32 top-24 h-[30rem] w-[30rem] animate-drift rounded-full bg-accent-violet/15 blur-[150px] [animation-delay:-3s]" />
      <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] animate-drift rounded-full bg-accent-cyan/10 blur-[150px] [animation-delay:-6s]" />

      {/* Top-down vignette to seat content. */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base/40 to-base" />
    </div>
  );
}
