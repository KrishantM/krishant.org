/**
 * The central type for everything Krishant is actively building.
 *
 * Intentionally named `Venture` (never `Project`) so the model, the nav label
 * ("Ventures"), and the section titles all speak the same language.
 */

/** Amber-honey accent keys — resolved to hex in src/lib/utils.ts (accentHex). */
export type AccentKey =
  | "amber"
  | "honey"
  | "orange"
  | "caramel"
  | "gold"
  | "copper";

export type VentureStatus = "Active" | "Building" | "Exploring";

export interface Venture {
  /** Display name, e.g. "Gradual". */
  name: string;
  /** URL-safe identifier used for /ventures/[slug] and internal references. */
  slug: string;
  /** External, public-facing URL. `null` when there is no public site yet. */
  url: string | null;
  /** Convenience alias for `url` — present so consumers can read either. */
  externalUrl: string | null;
  /** Short category line, e.g. "AI / Learning / Career Development". */
  category: string;
  status: VentureStatus;
  /** One-line essence used on cards and constellation nodes. */
  summary: string;
  /** A longer, still-tight paragraph for detail surfaces. */
  description: string;
  /** How Krishant relates to the venture, e.g. "Founder / Builder". */
  role: string;
  /** The themes the venture works across. */
  focusAreas: string[];
  /** Lightweight keywords for grouping / future filtering. */
  tags: string[];
  /** Accent colour key (see AccentKey). */
  accent: AccentKey;
  /** Whether the venture leads the grid / constellation. */
  featured: boolean;
  /** Slug of a parent venture (e.g. CreatorHQ) when this is a sub-brand. */
  parent: string | null;
  /** Whether an internal /ventures/[slug] detail page should be rendered. */
  hasInternalPage: boolean;
}
