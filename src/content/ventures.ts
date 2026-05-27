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
    summary: "AI-assisted learning and career development.",
    description:
      "Gradual explores how AI can support learning, development, and career growth through more adaptive, personalised systems that meet people where they are and move them forward.",
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
    summary: "Local discovery and social coordination.",
    description:
      "Hiko explores how people discover what's happening around them and coordinate social experiences in a more intuitive way, turning local activity into something effortless to find and act on.",
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
      "CreatorHQ is the operating layer for creator-led brands: content systems, audience growth, and digital infrastructure. It's the connective tissue beneath individual creator brands like TrenTwinsHQ and LexxLittleHQ.",
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
    summary:
      "A creator-led media and community brand within the CreatorHQ ecosystem.",
    description:
      "TrenTwinsHQ is a creator-led media and community brand built on the CreatorHQ operating layer, bringing content systems, audience engagement, and media infrastructure together.",
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
    summary:
      "A creator-led media and community brand within the CreatorHQ ecosystem.",
    description:
      "LexxLittleHQ is a creator-led media and community brand built on the CreatorHQ operating layer, bringing content systems, audience engagement, and media infrastructure together.",
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
