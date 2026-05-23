import type { AccentKey } from "@/types/venture";

/**
 * Minimal className combiner. Avoids pulling in clsx/tailwind-merge for what is
 * a small, predictable codebase — falsy values are dropped, the rest joined.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Accent hex values — the JS-side mirror of the `accent.*` Tailwind colours.
 * Needed where Tailwind classes can't reach: SVG strokes, inline gradients,
 * and Framer Motion style props in the constellation.
 */
export const accentHex: Record<AccentKey, string> = {
  cyan: "#3ce6d6",
  indigo: "#7c8bff",
  violet: "#a78bff",
  emerald: "#34e0a1",
  amber: "#ffb454",
  sky: "#5cc6ff",
  rose: "#ff7eb6",
};

export function getAccentHex(accent: AccentKey): string {
  return accentHex[accent];
}

/** Turn a hex colour into an rgba() string at the given alpha. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
