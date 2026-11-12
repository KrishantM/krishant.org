/**
 * Rules for the code index behind "answers from the real code".
 *
 * Only an allowlist of Krishant's PUBLIC repos is ever read, and each one is
 * re-checked against the GitHub API at index time. The index script calls
 * these functions; the unit tests call them too. No imports, so Node can load
 * this file directly from the script.
 */

export const OWNER = "KrishantM";

/**
 * The only repos the index may read. Adding a repo here is a deliberate,
 * reviewable change. Never add a private repo.
 */
export const ALLOWLIST = [
  "surya-memory",
  "surya-gates",
  "surya-voice",
  "surya-distro",
  "project-eval",
] as const;

export type AllowedRepo = (typeof ALLOWLIST)[number];

export function isAllowlisted(repo: string): repo is AllowedRepo {
  return (ALLOWLIST as readonly string[]).includes(repo);
}

/** The fields we read from GET /repos/{owner}/{repo}. */
export interface RepoMeta {
  full_name?: string;
  private?: boolean;
  visibility?: string;
  default_branch?: string;
  archived?: boolean;
  description?: string | null;
  html_url?: string;
}

export type RepoCheck =
  | { ok: true; repo: AllowedRepo; meta: RepoMeta }
  | { ok: false; repo: string; reason: string };

export type FetchJson = (url: string) => Promise<{ status: number; body: unknown }>;

/**
 * Gate every repo through the allowlist first (no network call for anything
 * else), then confirm with the GitHub API that it is public. Unauthenticated
 * requests can't see private repos at all, which is a second guard: a private
 * repo returns 404 and is refused here.
 */
export async function checkRepo(repo: string, fetchJson: FetchJson): Promise<RepoCheck> {
  if (!isAllowlisted(repo)) {
    return { ok: false, repo, reason: "not on the allowlist" };
  }
  const { status, body } = await fetchJson(
    `https://api.github.com/repos/${OWNER}/${repo}`,
  );
  if (status === 404) return { ok: false, repo, reason: "not found or not public (404)" };
  if (status !== 200 || !body || typeof body !== "object") {
    return { ok: false, repo, reason: `GitHub API returned ${status}` };
  }
  const meta = body as RepoMeta;
  if (meta.full_name?.toLowerCase() !== `${OWNER}/${repo}`.toLowerCase()) {
    return { ok: false, repo, reason: "repo name mismatch" };
  }
  if (meta.private !== false || meta.visibility !== "public") {
    return { ok: false, repo, reason: "repo is not public" };
  }
  if (!meta.default_branch) {
    return { ok: false, repo, reason: "no default branch" };
  }
  return { ok: true, repo, meta };
}

/* ------------------------------------------------------------------ */
/* File selection                                                      */
/* ------------------------------------------------------------------ */

const SOURCE_EXT = /\.(py|ts|tsx|js|mjs|cjs|swift|go|rs|sh|sql)$/i;
const INFRA_FILE = /(^|\/)(Dockerfile|docker-compose\.ya?ml|Chart\.yaml|values\.yaml)$|(^|\/)deploy\/.*\.(ya?ml|tpl)$/i;

const SKIP_DIR =
  /(^|\/)(tests?|__tests__|spec|specs|e2e|fixtures?|testdata|mocks?|__mocks__|examples?|learn|docs?|migrations|node_modules|dist|build|vendor|third_party|\.github|\.claude-plugin|\.vscode|ios\/[^/]+\.xcodeproj|Assets\.xcassets|components\/ui)(\/|$)/i;

const SKIP_FILE =
  /(^|\/)(test_[^/]*|[^/]*_test\.[a-z]+|[^/]*\.(test|spec)\.[a-z]+|conftest\.py|fakes?\.py|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|poetry\.lock|uv\.lock|Cargo\.lock|Gemfile\.lock|composer\.lock|\.env[^/]*|[^/]*\.min\.[a-z]+|[^/]*\.d\.ts|next-env\.d\.ts|AGENTS\.md|CLAUDE\.md|[^/]*(?:secret|credential)[^/]*|[^/]*\.config\.[a-z]+)$/i;

const BINARY_EXT =
  /\.(png|jpe?g|gif|webp|ico|icns|svg|pdf|zip|gz|tgz|bz2|xz|7z|mp3|mp4|mov|wav|m4a|webm|woff2?|ttf|otf|eot|pbxproj|db|sqlite|bin|exe|dll|so|dylib|onnx|pt|safetensors|pkl|npz|jar|class|lock)$/i;

export const MAX_FILE_BYTES = 60_000;
/** Caps per repo: source files, then infrastructure (Docker, Helm). */
export const MAX_SOURCE_FILES = 24;
export const MAX_INFRA_FILES = 12;

export interface TreeEntry {
  path: string;
  type: string; // "blob" | "tree"
  size?: number;
}

export type FileKind = "readme" | "source" | "infra";

export function classifyPath(path: string): FileKind | null {
  if (path === "README.md") return "readme";
  if (SKIP_DIR.test(path)) return null;
  if (SKIP_FILE.test(path)) return null;
  if (BINARY_EXT.test(path)) return null;
  if (INFRA_FILE.test(path)) return "infra";
  if (SOURCE_EXT.test(path)) return "source";
  return null;
}

/**
 * Choose the files to index: the root README, then the main source and
 * infrastructure files. Shallow paths first (the package itself before
 * helper folders), with separate caps for source and infrastructure.
 */
export function selectFiles(tree: TreeEntry[]): { path: string; kind: FileKind }[] {
  const picked: { path: string; kind: FileKind; depth: number; size: number }[] = [];
  for (const entry of tree) {
    if (entry.type !== "blob") continue;
    const kind = classifyPath(entry.path);
    if (!kind) continue;
    const size = entry.size ?? 0;
    if (size === 0 || size > MAX_FILE_BYTES) continue;
    picked.push({ path: entry.path, kind, depth: entry.path.split("/").length, size });
  }
  picked.sort(
    (a, b) => a.depth - b.depth || b.size - a.size || a.path.localeCompare(b.path),
  );
  const of = (k: FileKind) => picked.filter((p) => p.kind === k);
  return [
    ...of("readme"),
    ...of("source").slice(0, MAX_SOURCE_FILES),
    ...of("infra").slice(0, MAX_INFRA_FILES),
  ].map(({ path, kind }) => ({ path, kind }));
}

/* ------------------------------------------------------------------ */
/* Chunking                                                            */
/* ------------------------------------------------------------------ */

export const MAX_EXCERPT_LINES = 25;
const MIN_EXCERPT_LINES = 10;

export interface Chunk {
  startLine: number; // 1-based, inclusive
  endLine: number; // inclusive
  text: string;
}

/**
 * Split a file into excerpts of at most 25 lines, preferring to break at a
 * blank line or a markdown heading so each excerpt reads as a unit. Chunks
 * that are only blank lines are dropped.
 */
export function chunkLines(content: string): Chunk[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  const chunks: Chunk[] = [];
  let start = 0;
  while (start < lines.length) {
    let end = Math.min(start + MAX_EXCERPT_LINES, lines.length); // exclusive
    if (end < lines.length) {
      for (let i = end - 1; i >= start + MIN_EXCERPT_LINES; i--) {
        const next = lines[i + 1] ?? "";
        if (lines[i].trim() === "" || /^#{1,6}\s/.test(next)) {
          end = i + 1;
          break;
        }
      }
    }
    const slice = lines.slice(start, end);
    if (slice.some((l) => l.trim() !== "")) {
      chunks.push({ startLine: start + 1, endLine: end, text: slice.join("\n") });
    }
    start = end;
  }
  return chunks;
}

export function blobUrl(repo: string, sha: string, path: string, start: number, end: number): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `https://github.com/${OWNER}/${repo}/blob/${sha}/${encoded}#L${start}-L${end}`;
}

/* ------------------------------------------------------------------ */
/* References to repos that are not on the allowlist                   */
/* ------------------------------------------------------------------ */

// A repo of the owner's, named in a GitHub URL, a git remote, a raw URL, an
// owner/repo slug or a GitHub Pages URL.
const OWN_REPO_REF = new RegExp(
  `\\b${OWNER}\\/([A-Za-z0-9._-]+)|\\b${OWNER.toLowerCase()}\\.github\\.io\\/([A-Za-z0-9._-]+)`,
  "gi",
);
// The whole link around such a reference, so the URL goes, not just the name.
const OWN_REPO_LINK = new RegExp(
  `(?:https?:\\/\\/)?(?:www\\.)?(?:(?:github\\.com|raw\\.githubusercontent\\.com)[/:])?\\b${OWNER}\\/([A-Za-z0-9._-]+)[^\\s)"'\`<>\\]]*` +
    `|(?:https?:\\/\\/)?\\b${OWNER.toLowerCase()}\\.github\\.io\\/([A-Za-z0-9._-]+)[^\\s)"'\`<>\\]]*`,
  "gi",
);

function repoName(raw: string): string {
  return raw.replace(/\.+$/, "").replace(/\.git$/i, "").replace(/\.+$/, "");
}

function allowedRef(raw: string): boolean {
  const name = repoName(raw).toLowerCase();
  return (ALLOWLIST as readonly string[]).includes(name);
}

/**
 * Names of the owner's repos that `text` refers to but that are not on the
 * allowlist. Any of them may be private, so a link to one would 404 for a
 * visitor and would name something that isn't public. Empty means clean.
 */
export function foreignRepoRefs(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(OWN_REPO_REF)) {
    const raw = m[1] ?? m[2] ?? "";
    if (raw && !allowedRef(raw)) found.add(repoName(raw));
  }
  return [...found];
}

/** Replace every link to a repo that isn't on the allowlist. */
export function scrubForeignRepoRefs(text: string): { text: string; removed: number } {
  let removed = 0;
  const out = text.replace(OWN_REPO_LINK, (link, a?: string, b?: string) => {
    const raw = a ?? b ?? "";
    if (!raw || allowedRef(raw)) return link;
    removed += 1;
    return "[link removed]";
  });
  return { text: out, removed };
}
