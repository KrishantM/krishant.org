import codeIndex from "@/content/code-index.json";
import { suryaTools } from "@/content/surya";

/**
 * Keyword retrieval (BM25) over the committed code index. Server only: the
 * API route is the one importer, so the 1 MB+ index never reaches a browser.
 * No embeddings and no network, so it is fast, free and deterministic.
 */

export interface IndexedExcerpt {
  id: string;
  repo: string;
  path: string;
  kind: string;
  lang: string;
  startLine: number;
  endLine: number;
  url: string;
  text: string;
}

const excerpts = (codeIndex as { excerpts: IndexedExcerpt[] }).excerpts;

const STOP = new Set(
  [
    // Grammar words.
    "a an and are as at be but by can do does for from has have how i if in into is it its of on or so that the their them then there these this to was what when where which who why will with you your my me we our",
    // Conversation: greetings and filler a visitor types that say nothing about code.
    "hi hello hey thanks thank please tell about know get touch work works working much like would could should want need any some more just really also very",
    // Code keywords that appear everywhere.
    "self def return import none true false let const var function new",
  ]
    .join(" ")
    .split(" "),
);

export function tokenize(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

interface Doc {
  tf: Map<string, number>;
  len: number;
}

let built: { docs: Doc[]; df: Map<string, number>; avg: number } | null = null;

function build() {
  if (built) return built;
  const df = new Map<string, number>();
  const docs: Doc[] = excerpts.map((e) => {
    // The path counts twice: file names are strong signals.
    const tokens = [...tokenize(e.path), ...tokenize(e.path), ...tokenize(e.repo), ...tokenize(e.text)];
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    return { tf, len: tokens.length };
  });
  const avg = docs.reduce((n, d) => n + d.len, 0) / Math.max(1, docs.length);
  built = { docs, df, avg };
  return built;
}

/** Which repos a question names, by tool name or repo name. */
export function reposMentioned(query: string): string[] {
  const q = query.toLowerCase();
  const found = new Set<string>();
  for (const t of suryaTools) {
    if (!t.repo) continue;
    const short = t.name.toLowerCase().replace(/^surya\s+/, "");
    if (q.includes(t.repo) || q.includes(t.name.toLowerCase()) || new RegExp(`\\b${short}\\b`).test(q)) {
      found.add(t.repo);
    }
  }
  if (/\beval\b/.test(q)) found.add("project-eval");
  return [...found];
}

export interface Retrieved {
  excerpt: IndexedExcerpt;
  score: number;
}

/**
 * Top excerpts for a question. At most two per file, so answers can draw on
 * more than one place. Returns nothing when nothing scores well, so a
 * question like "how can I reach you" carries no code.
 */
export function retrieve(query: string, k = 6, minScore = 4): Retrieved[] {
  const { docs, df, avg } = build();
  const terms = [...new Set(tokenize(query))];
  if (!terms.length) return [];
  const repos = reposMentioned(query);
  const N = docs.length;
  const k1 = 1.2;
  const b = 0.75;

  const scored: Retrieved[] = [];
  docs.forEach((doc, i) => {
    let s = 0;
    for (const t of terms) {
      const f = doc.tf.get(t);
      if (!f) continue;
      const n = df.get(t) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      s += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * doc.len) / avg));
    }
    if (s <= 0) return;
    const e = excerpts[i];
    if (repos.length) s *= repos.includes(e.repo) ? 1.6 : 0.5;
    if (e.kind === "readme") s *= 0.9;
    scored.push({ excerpt: e, score: s });
  });

  scored.sort((a, b2) => b2.score - a.score);
  const perFile = new Map<string, number>();
  const out: Retrieved[] = [];
  for (const r of scored) {
    if (r.score < minScore) break;
    const key = `${r.excerpt.repo}/${r.excerpt.path}`;
    const n = perFile.get(key) ?? 0;
    if (n >= 2) continue;
    perFile.set(key, n + 1);
    out.push(r);
    if (out.length >= k) break;
  }
  return out;
}

export function getExcerpt(id: string): IndexedExcerpt | undefined {
  return excerpts.find((e) => e.id === id);
}
