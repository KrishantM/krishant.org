import type { Venture } from "@/types/venture";

/**
 * THE single source of truth for ventures.
 *
 * To add a venture: append one object below. Everything (the showcase, the
 * constellation, the CreatorHQ map, and the detail pages) reads from here.
 * Never hardcode venture content into components.
 *
 * Emphasis: Gradual and Hiko are the flagship ventures (`featured: true`).
 * CreatorHQ is an umbrella / operating layer, and TrenTwinsHQ + LexxLittleHQ
 * sit under it (`parent: "creatorhq"`).
 */
export const ventures: Venture[] = [
  {
    name: "Gradual",
    slug: "gradual",
    url: "https://gradual.co.nz",
    externalUrl: "https://gradual.co.nz",
    category: "AI / Learning / Career Development",
    status: "Active",
    summary: "AI-powered career development built for real outcomes.",
    description:
      "Gradual builds the AI layer for career development — adaptive, personalised, and designed to shift real outcomes rather than just track activity.",
    role: "Founder / Builder",
    focusAreas: [
      "AI-enabled learning",
      "Career growth",
      "Product strategy",
      "Personal development systems",
      "Human potential",
    ],
    tags: ["AI", "Learning", "Careers", "Product"],
    accent: "honey",
    featured: true,
    parent: null,
    hasInternalPage: true,
  },
  {
    name: "Hiko",
    slug: "hiko",
    url: "https://hiko.org.nz",
    externalUrl: "https://hiko.org.nz",
    category: "Consumer / Local / Social Coordination",
    status: "Active",
    summary: "Find what's on. Plan it with people.",
    description:
      "Hiko is a local discovery and social coordination app — making it genuinely easy to find what's happening nearby and actually get people to show up.",
    role: "Founder / Builder",
    focusAreas: [
      "Local discovery",
      "Social coordination",
      "Consumer behaviour",
      "Community systems",
      "Experience design",
    ],
    tags: ["Consumer", "Local", "Social", "Community"],
    accent: "orange",
    featured: true,
    parent: null,
    hasInternalPage: true,
  },
  {
    name: "CreatorHQ",
    slug: "creatorhq",
    url: null,
    externalUrl: null,
    category: "Creator Infrastructure / Operating Layer",
    status: "Active",
    summary: "Infrastructure and operating systems for creator-led brands.",
    description:
      "CreatorHQ is the operating layer behind TrenTwinsHQ and LexxLittleHQ — shared content systems, audience infrastructure, and the operational backbone each brand runs on.",
    role: "Builder / Operator",
    focusAreas: [
      "Creator infrastructure",
      "Audience systems",
      "Media operations",
      "Brand growth",
      "Digital operating systems",
    ],
    tags: ["Creator", "Infrastructure", "Media", "Operations"],
    accent: "amber",
    featured: false,
    parent: null,
    hasInternalPage: true,
  },
  {
    name: "TrenTwinsHQ",
    slug: "trentwinshq",
    url: "https://trentwinshq.com",
    externalUrl: "https://trentwinshq.com",
    category: "Creator-Led Media / Community",
    status: "Active",
    summary: "Creator-led media and community, running on CreatorHQ.",
    description:
      "TrenTwinsHQ is a creator-led media and community brand on the CreatorHQ platform — content, audience, and community built to grow.",
    role: "Builder / Operator",
    focusAreas: [
      "Creator-led brand",
      "Community",
      "Content systems",
      "Audience engagement",
      "Media infrastructure",
    ],
    tags: ["Creator", "Media", "Community"],
    accent: "caramel",
    featured: false,
    parent: "creatorhq",
    hasInternalPage: true,
  },
  {
    name: "LexxLittleHQ",
    slug: "lexxlittlehq",
    url: "https://lexxlittle.com",
    externalUrl: "https://lexxlittle.com",
    category: "Creator-Led Media / Community",
    status: "Active",
    summary: "Creator-led brand on CreatorHQ, audience-first.",
    description:
      "LexxLittleHQ is a creator-led brand on the CreatorHQ platform — audience-first content and community, with the same infrastructure backbone as TrenTwinsHQ.",
    role: "Builder / Operator",
    focusAreas: [
      "Creator-led brand",
      "Community",
      "Content systems",
      "Audience engagement",
      "Media infrastructure",
    ],
    tags: ["Creator", "Media", "Community"],
    accent: "gold",
    featured: false,
    parent: "creatorhq",
    hasInternalPage: true,
  },
];

/* ------------------------------------------------------------------ */
/* Derived helpers. Keep selection logic out of components.            */
/* ------------------------------------------------------------------ */

/** Flagship ventures (Gradual, Hiko) that lead the Ventures section. */
export const featuredVentures = ventures.filter((v) => v.featured);

/** Top-level ventures (no parent). */
export const topLevelVentures = ventures.filter((v) => v.parent === null);

/** Ventures that belong to a given parent slug. */
export function venturesByParent(parentSlug: string): Venture[] {
  return ventures.filter((v) => v.parent === parentSlug);
}

/** Lookup a single venture by slug. */
export function getVenture(slug: string): Venture | undefined {
  return ventures.find((v) => v.slug === slug);
}

/** Slugs that should generate an internal detail page. */
export const internalVentureSlugs = ventures
  .filter((v) => v.hasInternalPage)
  .map((v) => v.slug);
