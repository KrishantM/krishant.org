/**
 * Sidebar icons — small line-art SVGs with characterful hover animations.
 *
 * Each icon's animated parts are tagged with `data-anim="..."`. The hover
 * trigger lives in `globals.css` so the components stay simple and the
 * animations are easy to read in one place. All animations are
 * `prefers-reduced-motion` aware.
 *
 * Icons are 24×24, stroke-based, `currentColor`, so they tint with the
 * sidebar's active / hover colour state.
 */

import type { CSSProperties } from "react";

interface IconProps {
  className?: string;
}

const baseProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Ventures — three stacked blocks; the top block lifts on hover. */
export function VenturesIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <rect x="4" y="14.5" width="16" height="5" rx="1.2" />
      <rect x="5.5" y="9" width="13" height="5" rx="1.2" data-anim="venture-mid" />
      <rect x="7" y="3.5" width="10" height="5" rx="1.2" data-anim="venture-top" />
    </svg>
  );
}

/** Map — central node + three satellites rotating around it on hover. */
export function MapIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <g data-anim="map-orbit">
        <line x1="12" y1="12" x2="12" y2="4" />
        <line x1="12" y1="12" x2="19" y2="16" />
        <line x1="12" y1="12" x2="5" y2="16" />
        <circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="19" cy="16" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="5" cy="16" r="1.6" fill="currentColor" stroke="none" />
      </g>
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Credentials — a circular medal with a star, framed by ribbon-tails.
 * On hover the medal pops + tilts, and a small burst of confetti dots
 * radiates outward. Each confetti dot has its own --dx / --dy so they
 * all share one keyframe.
 */
export function CredentialsIcon({ className }: IconProps) {
  // x, y, colour-stop are decorative. Six dots fanned out around the medal.
  const confetti: Array<{ dx: string; dy: string; delay: string }> = [
    { dx: "-8px", dy: "-7px", delay: "0s" },
    { dx: "8px", dy: "-7px", delay: "0.04s" },
    { dx: "-9px", dy: "1px", delay: "0.08s" },
    { dx: "9px", dy: "1px", delay: "0.02s" },
    { dx: "-4px", dy: "-10px", delay: "0.06s" },
    { dx: "4px", dy: "-10px", delay: "0.1s" },
  ];

  return (
    <svg {...baseProps} className={className} aria-hidden>
      <g data-anim="medal">
        <circle cx="12" cy="10" r="6" />
        <path
          d="M12 6.8 l1.05 2.15 2.37 0.34 -1.71 1.67 0.4 2.36 -2.11 -1.11 -2.11 1.11 0.4 -2.36 -1.71 -1.67 2.37 -0.34 z"
          strokeWidth="1.2"
        />
      </g>
      <path d="M9 15.5 L8 21 L12 18.8 L16 21 L15 15.5" />
      {confetti.map((c, i) => (
        <circle
          key={i}
          cx="12"
          cy="10"
          r="0.85"
          fill="currentColor"
          stroke="none"
          data-anim="confetti"
          style={
            {
              "--dx": c.dx,
              "--dy": c.dy,
              "--delay": c.delay,
            } as CSSProperties
          }
        />
      ))}
    </svg>
  );
}

/**
 * About — a cartoon face. Defaults to a neutral straight-line mouth and
 * animates to a smile on hover. Eyes are slightly oversized for the
 * friendlier read.
 */
export function AboutIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <circle cx="9.3" cy="10.5" r="0.95" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="10.5" r="0.95" fill="currentColor" stroke="none" />
      <path d="M9 15 L15 15" data-anim="smile" />
    </svg>
  );
}

/**
 * Connect — a paper plane that flies a small arc and loops back to its
 * starting position on hover. Pure CSS keyframe (see globals.css).
 */
export function ConnectIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <g data-anim="plane">
        <path d="M3 11.5 L21 4 L14 21 L11.5 13.5 Z" />
        <path d="M11.5 13.5 L21 4" />
      </g>
    </svg>
  );
}
