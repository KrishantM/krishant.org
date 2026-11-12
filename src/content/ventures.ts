import type { Venture } from "@/types/venture";

/**
 * THE single source of truth for ventures.
 *
 * To add a venture: append one object below. Everything (the showcase, the
 * constellation and the detail pages) reads from here.
 * Never hardcode venture content into components.
 *
 * Emphasis: Surya leads, then Project Eval, then Gradual (previous startup),
 * then Hiko (an earlier build). The individual Surya tools live in
 * src/content/surya.ts. `parent` is still supported for sub-brands.
 */
export const ventures: Venture[] = [
  {
    name: "Surya",
    slug: "surya",
    url: "https://trysurya.com",
    externalUrl: "https://trysurya.com",
    category: "Open tools for AI agents",
    status: "Active",
    summary: "Open tools for working with AI agents, and the app that brings them together.",
    description:
      "Surya started as one AI operator. It is now a family of open tools for working with AI agents, and Surya Unite, the paid app that brings them together. Unite is in development and its source is private.",
    role: "Founder / CEO",
    focusAreas: [
      "Approval gates for agents",
      "Shared agent memory",
      "Voice control of coding agents",
      "Evidence-led launches",
      "Agent evaluation",
    ],
    tags: ["AI", "Agents", "Open source", "Developer tools"],
    accent: "amber",
    featured: true,
    parent: null,
    hasInternalPage: true,
  },
  {
    name: "Project Eval",
    slug: "project-eval",
    url: "https://krishantm.github.io/project-eval",
    externalUrl: "https://krishantm.github.io/project-eval",
    category: "AI / Agent Evaluation",
    status: "Active",
    summary: "Measures what AI agents actually deliver.",
    description:
      "Project Eval measures tasks done, time spent, cost, how often an agent's work is kept, and quality from an LLM judge that is checked against people. It runs in the browser, on Docker, or on Kubernetes with Helm. Grading runs in LangGraph with a Postgres checkpointer. It is open source.",
    role: "Founder / Builder",
    focusAreas: [
      "Agent evaluation",
      "LLM-judge grading",
      "Human-in-the-loop calibration",
      "LangChain and LangGraph",
      "Docker, Helm and KEDA",
    ],
    tags: ["AI", "Agents", "Evaluation", "Open source"],
    accent: "gold",
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

/** Featured ventures (Surya, Project Eval, Gradual, Hiko). */
export const featuredVentures = ventures.filter((v) => v.featured);

/** Earlier ventures, shown small beneath the current work. */
export const earlierVentures = ventures.filter((v) => v.status === "Previous");

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
