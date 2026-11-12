import type { AccentKey } from "./venture";

/**
 * One member of the Surya family. Deliberately a "tool", not a "Project":
 * ventures stay `Venture` (src/types/venture.ts). The Surya family lives in
 * src/content/surya.ts, and adding a tool is a one-object change there.
 */

export type SuryaTier = "live" | "development" | "next";

export interface SuryaTool {
  slug: string;
  name: string;
  tier: SuryaTier;
  /** One-line essence, shown large on the card. */
  line: string;
  /** Two or three short sentences. Plain, factual, no claims we can't link. */
  description: string;
  /** A few short facts, each checkable in the repo. */
  points: string[];
  /** Public repo name under the owner, when open source. */
  repo?: string;
  /** Public site for the tool, if it has one. */
  site?: string;
  /** Where it runs, e.g. "Claude Code plugin · Mac app". */
  runsOn?: string;
  /** Short status text shown with the dot, e.g. "Open source". */
  status: string;
  accent: AccentKey;
  /** Gives the tool extra weight in its tier. */
  featured?: boolean;
  /** A venture detail page that covers this tool, if any. */
  ventureSlug?: string;
  /** Opens the matching assistant mode, e.g. the Gates demo. */
  tryIt?: "gates";
}
