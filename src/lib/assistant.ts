import { getVenture, venturesByParent } from "@/content/ventures";
import { site } from "@/content/site";
import { getAccentHex } from "@/lib/utils";
import type { WindowKey } from "@/components/windows/WindowsProvider";

/**
 * Deterministic helpers behind the live ask-console. The actual reply text
 * comes from the LLM (via /api/ask), but action buttons are still chosen
 * here so they remain grounded in the site's data — no risk of the model
 * hallucinating a window key or a venture URL.
 *
 * Two action kinds:
 *   • link    → opens an external URL in a new tab.
 *   • window  → opens / focuses one of the OS-style windows.
 *
 * Also exports a small offline fallback so the console degrades gracefully
 * if the API is unreachable or rate-limited.
 */

export type AskAction =
  | { kind: "link"; label: string; href: string; accent?: string }
  | { kind: "window"; label: string; key: WindowKey };

export interface AskResponse {
  text: string;
  actions?: AskAction[];
}

function ventureLink(slug: string): AskAction | null {
  const v = getVenture(slug);
  if (!v || !v.externalUrl) return null;
  return {
    kind: "link",
    label: `Visit ${v.name}`,
    href: v.externalUrl,
    accent: getAccentHex(v.accent),
  };
}

function has(q: string, ...terms: string[]): boolean {
  return terms.some((t) => q.includes(t));
}

/**
 * Inspect a free-text query and return the most relevant action buttons,
 * or an empty array if nothing obvious matches. Used by the API route to
 * enrich every LLM response with grounded UI affordances.
 */
export function pickActions(raw: string): AskAction[] {
  const q = raw.toLowerCase().trim();

  if (has(q, "gradual")) {
    const link = ventureLink("gradual");
    return [
      ...(link ? [link] : []),
      { kind: "window", label: "See it in context", key: "ventures" },
    ];
  }

  if (has(q, "hiko")) {
    const link = ventureLink("hiko");
    return [
      ...(link ? [link] : []),
      { kind: "window", label: "See it in context", key: "ventures" },
    ];
  }

  if (has(q, "creatorhq", "creator", "trent", "lexx", "media", "brand")) {
    const children = venturesByParent("creatorhq");
    const actions: AskAction[] = [];
    children.forEach((c) => {
      const l = ventureLink(c.slug);
      if (l) actions.push(l);
    });
    actions.push({ kind: "window", label: "Explore the ecosystem", key: "ventures" });
    return actions;
  }

  if (
    has(
      q,
      "building",
      "build",
      "ventures",
      "working on",
      "work on",
      "projects",
      "making",
      "products",
    )
  ) {
    const g = ventureLink("gradual");
    const h = ventureLink("hiko");
    return [
      ...(g ? [g] : []),
      ...(h ? [h] : []),
      { kind: "window", label: "See all ventures", key: "ventures" },
    ];
  }

  if (
    has(
      q,
      "background",
      "experience",
      "pwc",
      "credential",
      "qualif",
      "aws",
      "cloud",
      "architecture",
      "security",
      "certif",
      "resume",
      "cv",
      "skills",
    )
  ) {
    return [{ kind: "window", label: "See credentials", key: "credentials" }];
  }

  if (has(q, "who", "about", "yourself", "person", "you are", "story")) {
    return [{ kind: "window", label: "More about me", key: "about" }];
  }

  if (
    has(
      q,
      "reach",
      "contact",
      "email",
      "hire",
      "connect",
      "collab",
      "talk",
      "work with",
      "get in touch",
      "message",
    )
  ) {
    return [
      { kind: "link", label: "Email me", href: `mailto:${site.contact.email}` },
      { kind: "link", label: "LinkedIn", href: site.contact.linkedin },
      { kind: "window", label: "Go to Connect", key: "connect" },
    ];
  }

  if (has(q, "map", "constellation", "everything", "how it connects", "overview", "system")) {
    return [{ kind: "window", label: "Open the map", key: "map" }];
  }

  if (
    has(
      q,
      "stack",
      "tech",
      "built",
      "how does this",
      "how is this",
      "made",
      "this site",
      "code",
      "next.js",
      "nextjs",
    )
  ) {
    return [{ kind: "window", label: "See the credentials", key: "credentials" }];
  }

  if (has(q, "where", "location", "based", "new zealand", "nz", "aotearoa")) {
    return [{ kind: "window", label: "Get in touch", key: "connect" }];
  }

  return [];
}

/**
 * Last-resort deterministic answer if the LLM call fails. Short, safe, and
 * uses only the same content the model would have had access to.
 */
export function fallbackText(): string {
  return "Something on my side broke for a second — try again in a moment. In the meantime, the prompts below are a good way in.";
}
