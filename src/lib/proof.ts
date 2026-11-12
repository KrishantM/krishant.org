import codeRepos from "@/content/code-repos.json";
import type { Proof } from "@/types/proof";

/**
 * Resolves a proof to a URL. Code proofs are pinned to the commit recorded
 * when the code index was built, so line anchors always point at the lines
 * the claim refers to.
 */

interface RepoSummary {
  repo: string;
  url: string;
  branch: string;
  sha: string;
  files: string[];
}

const repos = codeRepos.repos as RepoSummary[];

export function repoSummary(repo: string): RepoSummary | undefined {
  return repos.find((r) => r.repo === repo);
}

export function proofHref(proof: Proof): string {
  if (proof.kind === "link") return proof.href;
  const summary = repoSummary(proof.repo);
  const ref = summary?.sha ?? summary?.branch ?? "main";
  const path = proof.path.split("/").map(encodeURIComponent).join("/");
  const lines = proof.lines ? `#L${proof.lines[0]}-L${proof.lines[1]}` : "";
  return `https://github.com/KrishantM/${proof.repo}/blob/${ref}/${path}${lines}`;
}

/** Display text for a code proof, e.g. "project-eval/eval_server/grading.py:111-152". */
export function proofPath(proof: Proof): string | null {
  if (proof.kind !== "code") return null;
  const lines = proof.lines ? `:${proof.lines[0]}-${proof.lines[1]}` : "";
  return `${proof.repo}/${proof.path}${lines}`;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
