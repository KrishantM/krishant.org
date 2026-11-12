/**
 * Builds src/content/code-index.json: README and source excerpts from
 * Krishant's public repos, for the site assistant's "answers from the real
 * code" mode. Run it by hand and commit the JSON, so every excerpt the site
 * can show is reviewable in a diff. Visitors never trigger a GitHub fetch.
 *
 *   npm run index:code                          all allowlisted repos
 *   npm run index:code -- --only surya-distro   just these; the rest are kept
 *                                               as they are in the current index
 *   (Node 23.6 or newer: it loads .ts files directly)
 *
 * Safety, in order:
 *   1. Only repos on ALLOWLIST (src/lib/code-index/policy.ts) are considered.
 *      There is no flag to add another.
 *   2. Each one is checked against the GitHub API and must be public.
 *   3. Requests carry NO credentials, so a private repo is invisible anyway.
 *   4. Tests, fixtures, lockfiles, env files and binaries are never fetched.
 *   5. A file that trips any secret pattern is dropped whole.
 *   6. Everything kept has emails, phones, local paths and IPs redacted.
 *   7. Links to any of the owner's repos that are NOT on the allowlist are
 *      removed: they may be private, and a visitor would get a 404.
 */

import { readFileSync, writeFileSync } from "node:fs";
import {
  ALLOWLIST,
  MAX_EXCERPT_LINES,
  OWNER,
  blobUrl,
  checkRepo,
  chunkLines,
  foreignRepoRefs,
  scrubForeignRepoRefs,
  selectFiles,
  type FetchJson,
  type TreeEntry,
} from "../src/lib/code-index/policy.ts";
import { findSecrets, hasSecret, redact, sanitise } from "../src/lib/sanitise.ts";

const OUT = new URL("../src/content/code-index.json", import.meta.url);
// A small summary (repo, commit, files) that page components can import
// without pulling the full excerpt index into their bundle.
const OUT_REPOS = new URL("../src/content/code-repos.json", import.meta.url);
const HEADERS = {
  "User-Agent": "krishant.org-code-index",
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

const fetchJson: FetchJson = async (url) => {
  const res = await fetch(url, { headers: HEADERS });
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
};

async function fetchRaw(repo: string, sha: string, path: string): Promise<string | null> {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(`https://raw.githubusercontent.com/${OWNER}/${repo}/${sha}/${encoded}`, {
    headers: { "User-Agent": HEADERS["User-Agent"] },
  });
  if (!res.ok) return null;
  return res.text();
}

const LANG: Record<string, string> = {
  py: "python", ts: "typescript", tsx: "tsx", js: "javascript", mjs: "javascript",
  cjs: "javascript", swift: "swift", go: "go", rs: "rust", sh: "bash", sql: "sql",
  md: "markdown", yaml: "yaml", yml: "yaml", tpl: "yaml",
};

function langOf(path: string): string {
  if (/Dockerfile$/.test(path)) return "dockerfile";
  const ext = path.split(".").pop() ?? "";
  return LANG[ext.toLowerCase()] ?? "text";
}

interface Excerpt {
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

interface RepoEntry {
  repo: string;
  url: string;
  description: string;
  branch: string;
  sha: string;
  files: string[];
}

interface Skip {
  repo: string;
  path?: string;
  reason: string;
}

/** `--only a,b` (or `--only a --only b`): re-index just these allowlisted repos. */
function onlyArg(): string[] | null {
  const args = process.argv.slice(2);
  const names: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--only" && args[i + 1]) names.push(...args[++i].split(","));
    else if (args[i].startsWith("--only=")) names.push(...args[i].slice(7).split(","));
  }
  if (!names.length) return null;
  for (const n of names) {
    if (!(ALLOWLIST as readonly string[]).includes(n)) throw new Error(`--only ${n}: not on the allowlist`);
  }
  return names;
}

async function main() {
  const only = onlyArg();
  const previous = only
    ? (JSON.parse(readFileSync(OUT, "utf8")) as {
        repos: RepoEntry[];
        skipped: Skip[];
        excerpts: Excerpt[];
        stats: { redactions?: number; repoLinksRemoved?: number };
      })
    : null;
  const repos: RepoEntry[] = [];
  const excerpts: Excerpt[] = [];
  const skipped: Skip[] = [];
  let redactions = 0;
  let repoLinksRemoved = 0;

  for (const name of ALLOWLIST) {
    if (only && previous && !only.includes(name)) {
      // Keep this repo exactly as it is in the current index.
      const entry = previous.repos.find((r) => r.repo === name);
      if (entry) repos.push(entry);
      excerpts.push(...previous.excerpts.filter((e) => e.repo === name));
      skipped.push(...previous.skipped.filter((s) => s.repo === name));
      continue;
    }
    const check = await checkRepo(name, fetchJson);
    if (!check.ok) {
      console.warn(`skip ${name}: ${check.reason}`);
      skipped.push({ repo: name, reason: check.reason });
      continue;
    }
    const branch = check.meta.default_branch!;
    const commit = await fetchJson(
      `https://api.github.com/repos/${OWNER}/${name}/commits/${encodeURIComponent(branch)}`,
    );
    const sha = (commit.body as { sha?: string } | null)?.sha;
    if (commit.status !== 200 || !sha) throw new Error(`no commit for ${name} (${commit.status})`);

    const treeRes = await fetchJson(
      `https://api.github.com/repos/${OWNER}/${name}/git/trees/${sha}?recursive=1`,
    );
    const tree = (treeRes.body as { tree?: TreeEntry[]; truncated?: boolean } | null)?.tree;
    if (treeRes.status !== 200 || !tree) throw new Error(`no tree for ${name} (${treeRes.status})`);

    const files = selectFiles(tree);
    const kept: string[] = [];
    for (const file of files) {
      const raw = await fetchRaw(name, sha, file.path);
      if (raw === null) {
        skipped.push({ repo: name, path: file.path, reason: "fetch failed" });
        continue;
      }
      if (raw.includes("\u0000")) {
        skipped.push({ repo: name, path: file.path, reason: "binary" });
        continue;
      }
      const secrets = findSecrets(raw);
      if (secrets.length) {
        // Drop the whole file. Record only the pattern names, never the value.
        const names = [...new Set(secrets.map((s) => s.pattern))].join(", ");
        skipped.push({ repo: name, path: file.path, reason: `secret pattern: ${names}` });
        continue;
      }
      for (const chunk of chunkLines(raw)) {
        if (chunk.endLine - chunk.startLine + 1 > MAX_EXCERPT_LINES) {
          throw new Error(`chunk too long in ${name}/${file.path}`);
        }
        const clean = redact(chunk.text);
        if (hasSecret(clean.text)) continue; // belt and braces
        const scrubbed = scrubForeignRepoRefs(clean.text);
        if (foreignRepoRefs(scrubbed.text).length) {
          throw new Error(`a link to a repo off the allowlist survived in ${name}/${file.path}`);
        }
        redactions += clean.redactions;
        repoLinksRemoved += scrubbed.removed;
        excerpts.push({
          id: `${name}/${file.path}#L${chunk.startLine}-L${chunk.endLine}`,
          repo: name,
          path: file.path,
          kind: file.kind,
          lang: langOf(file.path),
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          url: blobUrl(name, sha, file.path, chunk.startLine, chunk.endLine),
          text: scrubbed.text,
        });
      }
      kept.push(file.path);
    }

    repos.push({
      repo: name,
      url: `https://github.com/${OWNER}/${name}`,
      description: scrubForeignRepoRefs(sanitise(check.meta.description ?? "")).text,
      branch,
      sha,
      files: kept,
    });
    console.log(`${name}@${sha.slice(0, 7)}: ${kept.length} files`);
  }

  if (only && previous) {
    // Carry over the counts for the repos that were kept as they were.
    const keptRedactions = previous.excerpts
      .filter((e) => !only.includes(e.repo))
      .reduce((n, e) => n + (e.text.match(/\[(redacted|local path|ip|email|phone)\]/g)?.length ?? 0), 0);
    redactions += keptRedactions;
  }

  const index = {
    note: "Generated by scripts/build-code-index.mts from public repos only. Review before committing.",
    generatedAt: new Date().toISOString().slice(0, 10),
    owner: OWNER,
    repos,
    skipped,
    stats: { excerpts: excerpts.length, redactions, repoLinksRemoved },
    excerpts,
  };
  writeFileSync(OUT, JSON.stringify(index, null, 1) + "\n");
  writeFileSync(
    OUT_REPOS,
    JSON.stringify({ generatedAt: index.generatedAt, owner: OWNER, repos }, null, 2) + "\n",
  );
  console.log(
    `wrote ${excerpts.length} excerpts, ${skipped.length} skipped, ${redactions} redactions, ` +
      `${repoLinksRemoved} links to repos off the allowlist removed`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
