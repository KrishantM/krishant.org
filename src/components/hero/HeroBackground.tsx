/**
 * Hero-specific cinematic layer that sits on top of the global Backdrop. Adds a
 * bright central bloom and a sweeping conic shimmer to give the fold depth and
 * a sense of motion without any JavaScript.
 */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-[1]">
      {/* Central bloom behind the headline. */}
      <div className="absolute left-1/2 top-1/3 h-[28rem] w-[44rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial-fade opacity-70 blur-2xl" />

      {/* Slow conic shimmer ring. */}
      <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] max-w-[110vw] -translate-x-1/2 -translate-y-1/2 animate-pulseslow rounded-full opacity-40 [background:conic-gradient(from_0deg,transparent,rgba(124,139,255,0.25),transparent,rgba(60,230,214,0.18),transparent)] blur-3xl" />

      {/* Fine horizon line. */}
      <div className="absolute bottom-0 left-1/2 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}
