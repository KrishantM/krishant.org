import type { SuryaTier, SuryaTool } from "@/types/surya";

/**
 * THE single source of truth for the Surya family: what is live, what is in
 * development and what is next. Components read from here. Every fact on a
 * live tool can be checked in its public repo.
 *
 * Surya Unite's source is private and it is not available yet. Never write
 * copy that implies it can be used today.
 */

export const surya = {
  name: "Surya",
  /** trysurya.com is being rebuilt. Link to it, but don't describe it. */
  site: "https://trysurya.com",
  siteLabel: "trysurya.com",
  lede: "Surya started as one AI operator. It is now a family of open tools for working with AI agents, and Surya Unite, the paid app that brings them together.",
} as const;

export const suryaTiers: Record<SuryaTier, { label: string; note: string }> = {
  live: {
    label: "Live and open source",
    note: "Public repos you can read, install and run today.",
  },
  development: {
    label: "In development",
    note: "Being built now. Not available yet.",
  },
  next: {
    label: "Next",
    note: "Designed, not started.",
  },
};

export const suryaTools: SuryaTool[] = [
  /* -------------------------- Live and open source -------------------------- */
  {
    slug: "surya-gates",
    name: "Surya Gates",
    tier: "live",
    line: "Approval gates for AI agents.",
    description:
      "Reading files and running tests carry on. A deploy, a push, a delete or a sent message waits for a person, who can approve from their phone by ntfy, iMessage, Telegram or SMS.",
    points: [
      "Works with Claude Code, Codex and apps on Claude or GPT",
      "212 tests",
      "Fails closed: if the gate errors, the call is blocked",
    ],
    repo: "surya-gates",
    runsOn: "Claude Code plugin · Codex · Python library",
    status: "Open source",
    accent: "amber",
    featured: true,
    tryIt: "gates",
  },
  {
    slug: "surya-memory",
    name: "Surya Memory",
    tier: "live",
    line: "One Claude Code memory on every machine.",
    description:
      "Syncs Claude Code memory across your machines through your own private repo. Every write is a commit, so no edit is lost, and a local app lets you browse and edit it.",
    points: [
      "Plain Markdown files you own",
      "No server: sync goes through your own private GitHub repo",
      "When two machines edit the same note, both versions are kept",
    ],
    repo: "surya-memory",
    runsOn: "Claude Code plugin · Mac app · CLI",
    status: "Open source",
    accent: "honey",
  },
  {
    slug: "surya-voice",
    name: "Surya Voice",
    tier: "live",
    line: "Talk to your own coding agent.",
    description:
      "Hold a key and talk. It types what you said, or hands it to Claude Code or Codex and speaks the answer back. Speech recognition and the voice run on your Mac.",
    points: [
      "Mac and iPhone apps",
      "Uses your agent, your memory and your project folder",
      "Free and MIT licensed",
    ],
    repo: "surya-voice",
    runsOn: "macOS · iPhone",
    status: "Open source",
    accent: "orange",
  },
  {
    slug: "surya-distro",
    name: "Surya Distro",
    tier: "live",
    line: "A launch kit that works from evidence.",
    description:
      "It studies which posts are working in your repo's space and writes a playbook from that evidence. It drafts launch posts to the playbook and learns from how they do. It never posts.",
    points: [
      "Every playbook rule names the posts behind it",
      "Drafts for Show HN, Reddit, X, Bluesky, LinkedIn and more",
      "You approve and post by hand",
    ],
    repo: "surya-distro",
    runsOn: "Claude Code plugin · CLI",
    status: "Open source",
    accent: "caramel",
  },
  {
    slug: "project-eval",
    name: "Project Eval",
    tier: "live",
    line: "Measures what AI agents actually deliver.",
    description:
      "Tasks done, time spent, cost, how often the work is kept, and quality from an LLM judge that is checked against people. Every number says whether it was measured, inferred or estimated.",
    points: [
      "Runs in the browser, on Docker, or on Kubernetes with Helm",
      "Grading runs in LangGraph with a Postgres checkpointer",
      "A human-calibration step decides when the judge is trusted",
    ],
    repo: "project-eval",
    site: "https://krishantm.github.io/project-eval",
    runsOn: "Browser · Docker · Kubernetes",
    status: "Open source",
    accent: "gold",
    ventureSlug: "project-eval",
  },

  /* ----------------------------- In development ----------------------------- */
  {
    slug: "surya-unite",
    name: "Surya Unite",
    tier: "development",
    line: "The paid product Surya has become.",
    description:
      "One app that brings every Surya tool together, running on your own Claude or Codex plan.",
    points: ["Every tool in one app", "Runs on your own Claude or Codex plan", "Private source"],
    status: "In development",
    accent: "amber",
    featured: true,
  },
  {
    slug: "surya-coordinator",
    name: "Surya Coordinator",
    tier: "development",
    line: "One agent above your agents.",
    description:
      "You write what you want in plain words. It sends a short digest to your phone, and you can answer it there.",
    points: [],
    status: "In development",
    accent: "copper",
  },
  {
    slug: "surya-voice-pointer",
    name: "Surya Voice, with a screen pointer",
    tier: "development",
    line: "Show me, or do it for me.",
    description:
      "Surya Voice learns to point at your screen. Ask it to show you how to do something, or ask it to do it for you.",
    points: [],
    status: "In development",
    accent: "orange",
  },

  /* ---------------------------------- Next ---------------------------------- */
  {
    slug: "surya-build",
    name: "Surya Build",
    tier: "next",
    line: "A visual system builder.",
    description:
      "You lay out a system as blocks. A block only goes green after a real check passes.",
    points: [],
    status: "Next",
    accent: "honey",
  },
];

/* ------------------------------------------------------------------ */
/* Derived helpers. Keep selection logic out of components.            */
/* ------------------------------------------------------------------ */

export function toolsByTier(tier: SuryaTier): SuryaTool[] {
  return suryaTools.filter((t) => t.tier === tier);
}

export function getSuryaTool(slug: string): SuryaTool | undefined {
  return suryaTools.find((t) => t.slug === slug);
}

export function repoUrl(repo: string): string {
  return `https://github.com/KrishantM/${repo}`;
}
