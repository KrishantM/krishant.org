import { suryaTools, repoUrl } from "@/content/surya";
import { site } from "@/content/site";
import { sanitise } from "@/lib/sanitise";
import { scrubForeignRepoRefs } from "@/lib/code-index/policy";

/**
 * Shared shapes and pure helpers for the site assistant. Safe to import from
 * client components: nothing here touches the code index or the API key.
 *
 * The model never chooses a link. Action buttons, code cards and fit-check
 * evidence are all resolved on the server from the site's own data, so a
 * reply can't point anywhere the site doesn't already point.
 */

export type AssistantMode = "ask" | "fit";

export interface AskAction {
  label: string;
  href: string;
}

export interface CodeCard {
  repo: string;
  path: string;
  startLine: number;
  endLine: number;
  url: string;
  lang: string;
  text: string;
}

export interface FitEvidence {
  id: string;
  title: string;
  href: string;
  kind: string;
  /** Verbatim from the content files. Never model-written. */
  text: string;
}

export interface FitMatch {
  /** A short label for what the job asks for. The only model-written words. */
  requirement: string;
  evidence: FitEvidence[];
}

export interface FitResult {
  matches: FitMatch[];
  discuss: string[];
}

export interface AssistantResponse {
  text?: string;
  actions?: AskAction[];
  code?: CodeCard[];
  fit?: FitResult;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Cleaning every string before it reaches the browser                 */
/* ------------------------------------------------------------------ */

/**
 * Applies the sanitiser and the house style to model text: no em dashes,
 * no markdown emphasis, no fenced code (code is only ever shown in cards
 * built from the index).
 */
export function cleanReply(text: string): string {
  let out = text.replace(/```[\s\S]*?```/g, "").replace(/```[\s\S]*$/g, "");
  out = out.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1");
  out = out.replace(/\s*—\s*/g, ", ").replace(/\s+–\s+/g, ", ");
  out = out.replace(/,\s*,/g, ",").replace(/\n{3,}/g, "\n\n").trim();
  return scrubForeignRepoRefs(sanitise(out)).text;
}

/* ------------------------------------------------------------------ */
/* Grounded actions                                                    */
/* ------------------------------------------------------------------ */

function has(q: string, ...terms: string[]): boolean {
  return terms.some((t) => q.includes(t));
}

/**
 * Buttons under a reply, chosen from the question and the cited repos. Every
 * href comes from the content files or a page anchor.
 */
export function pickActions(raw: string, citedRepos: string[] = []): AskAction[] {
  const q = raw.toLowerCase();
  const actions: AskAction[] = [];
  const seen = new Set<string>();
  const add = (a: AskAction) => {
    if (seen.has(a.href) || actions.length >= 3) return;
    seen.add(a.href);
    actions.push(a);
  };

  for (const t of suryaTools) {
    if (!t.repo) continue;
    const short = t.name.toLowerCase().replace(/^surya\s+/, "");
    if (citedRepos.includes(t.repo) || q.includes(t.name.toLowerCase()) || new RegExp(`\\b${short}\\b`).test(q)) {
      add({ label: `${t.name} on GitHub`, href: repoUrl(t.repo) });
    }
  }
  if (has(q, "unite", "coordinator", "building", "working on", "surya", "next")) {
    add({ label: "The Surya family", href: "#surya" });
  }
  if (has(q, "langchain", "langgraph", "kubernetes", "k8s", "helm", "docker", "skill", "stack", "experience", "agent sdk")) {
    add({ label: "How I build", href: "#how-i-build" });
  }
  if (has(q, "pwc", "day job", "work at", "employer", "job")) {
    add({ label: "My day job", href: "#day-job" });
  }
  if (has(q, "cert", "credential", "aws", "azure", "databricks", "qualif")) {
    add({ label: "Credentials", href: "#credentials" });
  }
  if (has(q, "gradual", "hiko", "before", "previous", "earlier")) {
    add({ label: "Earlier ventures", href: "#earlier" });
  }
  if (has(q, "reach", "contact", "email", "hire", "connect", "talk", "touch", "linkedin")) {
    add({ label: "Email me", href: `mailto:${site.contact.email}` });
    add({ label: "LinkedIn", href: site.contact.linkedin });
  }
  return actions;
}

/* ------------------------------------------------------------------ */
/* Validating model output                                             */
/* ------------------------------------------------------------------ */

export interface ExcerptLike {
  repo: string;
  path: string;
  startLine: number;
  endLine: number;
  url: string;
  lang: string;
  text: string;
}

/**
 * The ask mode's model output: an answer plus citations by label (E1, E2...).
 * Only labels that were actually retrieved for this request survive.
 */
export function normaliseAsk(
  raw: unknown,
  labelled: Map<string, ExcerptLike>,
): { text: string; code: CodeCard[] } | null {
  if (!raw || typeof raw !== "object") return null;
  const answer = (raw as { answer?: unknown }).answer;
  if (typeof answer !== "string" || !answer.trim()) return null;
  const cites = (raw as { citations?: unknown }).citations;
  const code: CodeCard[] = [];
  const used = new Set<string>();
  if (Array.isArray(cites)) {
    for (const c of cites) {
      if (typeof c !== "string") continue;
      const label = c.trim().replace(/^\[|\]$/g, "").toUpperCase();
      const ex = labelled.get(label);
      if (!ex || used.has(label) || code.length >= 3) continue;
      used.add(label);
      code.push({ ...ex, text: sanitise(ex.text) });
    }
  }
  // Remove citation markers the model left inline; the cards carry them.
  const text = cleanReply(answer.replace(/\s*\[E\d+\]/g, ""));
  return { text, code };
}

/**
 * Wording that would read as a reason not to hire. The prompt forbids it;
 * this is the server-side backstop.
 */
const NEGATIVE =
  /\b(gaps?|lacks?|lacking|missing|weakness(es)?|weak|unfortunately|no (direct |prior |professional )?experience|limited experience|not experienced|doesn'?t have|does not have)\b/i;

/**
 * A requirement label names what the job asks for. It is the only text the
 * model writes in a fit check, so it must not describe Krishant or his work:
 * no first person, no names of his products, at most 80 characters.
 */
const CLAIMY =
  /\b(I|I'?ve|I'?m|me|my|he|his|him|Krishant)\b|\b(Surya|Project Eval|Gradual|Hiko|PwC)\b/i;

function requirementLabel(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const label = cleanReply(raw).replace(/[.\s]+$/, "");
  if (!label || label.length > 80) return null;
  if (NEGATIVE.test(label) || CLAIMY.test(label)) return null;
  return label;
}

/**
 * The fit check's model output. The model only picks which evidence answers
 * which requirement and labels the requirement. Everything shown about the
 * evidence (title, link, the line under it) comes from the catalogue, so a
 * reply can't credit an item with something it doesn't do. Unknown ids are
 * dropped. A requirement left with no evidence moves to the "happy to
 * discuss" list. There is deliberately no list of gaps.
 */
export function normaliseFit(
  raw: unknown,
  catalogue: { id: string; title: string; href: string; kind: string; text: string }[],
): FitResult | null {
  if (!raw || typeof raw !== "object") return null;
  const byId = new Map(catalogue.map((e) => [e.id, e]));
  const r = raw as { matches?: unknown; discuss?: unknown };

  const matches: FitMatch[] = [];
  const discuss: string[] = [];
  if (Array.isArray(r.matches)) {
    for (const m of r.matches) {
      if (!m || typeof m !== "object") continue;
      const mm = m as { requirement?: unknown; evidence_ids?: unknown };
      const requirement = requirementLabel(mm.requirement);
      if (!requirement) continue;
      const ids = Array.isArray(mm.evidence_ids) ? mm.evidence_ids : [];
      const evidence: FitEvidence[] = [];
      for (const id of ids) {
        const e = typeof id === "string" ? byId.get(id) : undefined;
        if (e && !evidence.some((x) => x.id === e.id) && evidence.length < 3) {
          evidence.push({ id: e.id, title: e.title, href: e.href, kind: e.kind, text: e.text });
        }
      }
      if (!evidence.length) {
        discuss.push(requirement);
        continue;
      }
      if (matches.length < 10) matches.push({ requirement, evidence });
    }
  }
  if (Array.isArray(r.discuss)) {
    for (const d of r.discuss) {
      const label = requirementLabel(d);
      if (label) discuss.push(label);
    }
  }
  const uniqueDiscuss = [...new Set(discuss)].slice(0, 6);
  if (!matches.length && !uniqueDiscuss.length) return null;
  return { matches, discuss: uniqueDiscuss };
}
