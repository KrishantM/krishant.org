import type { AccentKey } from "@/types/venture";

/**
 * Minimal className combiner. Avoids pulling in clsx/tailwind-merge for what is
 * a small, predictable codebase — falsy values are dropped, the rest joined.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Amber-honey accent hex values — the JS-side source for SVG strokes, inline
 * gradients, and node glows. A warm, harmonious family tuned to read on both
 * the espresso-dark and paper-light themes.
 */
export const accentHex: Record<AccentKey, string> = {
  amber: "#ffb454",
  honey: "#f6c453",
  orange: "#ff9d3d",
  caramel: "#e08a3a",
  gold: "#e0a92e",
  copper: "#c9742e",
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
