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

      {/* Static warm glow fields — painted once (no infinite drift animation),
          so they don't force continuous repaints of large blurred layers. */}
      <div className="absolute -left-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-accent/20 blur-[110px]" />
      <div className="absolute -right-32 top-24 h-[28rem] w-[28rem] rounded-full bg-accent-gold/15 blur-[110px]" />

      {/* Top-down vignette to seat content. */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base/40 to-base" />
    </div>
  );
}
