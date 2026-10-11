import type { Venture } from "@/types/venture";

/**
 * THE single source of truth for ventures.
 *
 * To add a venture: append one object below. Everything (the showcase, the
 * constellation and the detail pages) reads from here.
 * Never hardcode venture content into components.
 *
 * Emphasis: Surya leads, then Gradual (previous startup), then Hiko (an
 * earlier build). The first featured entry gets
 * the lead card. `parent` is still supported for sub-brands if one is added.
 */
export const ventures: Venture[] = [
  {
    name: "Surya",
    slug: "surya",
    url: "https://trysurya.com",
    externalUrl: "https://trysurya.com",
    category: "AI Operator / Autonomous Business Operations",
    status: "Active",
    summary: "An app isn't a business. Surya runs the whole thing.",
    description:
      "Surya is an AI operator for people building without a technical team. It sets the strategy, builds the product, and runs the operations around it, with you approving anything that actually matters. The loop between strategising and building is the point: context compounds across domains instead of being stranded in separate tools.",
    role: "Co-founder / CEO",
    focusAreas: [
      "AI agents",
      "Autonomous operations",
      "Governed execution",
      "Product strategy",
      "Security-first architecture",
    ],
    tags: ["AI", "Agents", "Startups", "Operations"],
    accent: "amber",
    featured: true,
    parent: null,
    hasInternalPage: true,
  },
  {
    name: "Gradual",
    slug: "gradual",
    url: "https://gradual.co.nz",
    externalUrl: "https://gradual.co.nz",
    category: "AI / Career Development",
    status: "Previous",
    summary: "My previous startup. A career operating system for students.",
    description:
      "Gradual was a career operating system for NZ students and early-career people. An AI career copilot, CV scoring, a planner and an opportunities feed that all update each other, with a weekly pipeline pulling in 800+ opportunities from 7 sources. I built and ran it from 2025 to 2026.",
    role: "Founder / Builder",
    focusAreas: [
      "AI career copilot",
      "CV scoring",
      "Data pipelines",
      "Product design",
      "Next.js and Firebase",
    ],
    tags: ["AI", "Careers", "Product"],
    accent: "honey",
    featured: true,
    parent: null,
    hasInternalPage: true,
  },
  {
    name: "Hiko",
    slug: "hiko",
    url: null,
    externalUrl: null,
    category: "Consumer / Outdoors",
    status: "Previous",
    summary: "A trip planner for New Zealand's tracks and huts.",
    description:
      "Hiko was a hiking planner for New Zealand: tracks, huts and campsites from the Department of Conservation, with track status, weather and trip planning. I was the technical co-founder and built the data pipeline and the app.",
    role: "Technical Co-founder",
    focusAreas: [
      "Data pipelines",
      "API integration",
      "Mobile app",
      "Outdoor planning",
    ],
    tags: ["Consumer", "Outdoors", "Data"],
    accent: "orange",
    featured: true,
    parent: null,
    hasInternalPage: true,
  },
];

/* ------------------------------------------------------------------ */
/* Derived helpers. Keep selection logic out of components.            */
/* ------------------------------------------------------------------ */

/** Featured ventures (Surya, Gradual, Hiko) that lead the Ventures section. */
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
