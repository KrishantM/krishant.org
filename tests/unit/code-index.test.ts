import { describe, expect, it } from "vitest";
import codeIndex from "@/content/code-index.json";
import codeRepos from "@/content/code-repos.json";
import { ALLOWLIST, MAX_EXCERPT_LINES, OWNER, classifyPath, foreignRepoRefs } from "@/lib/code-index/policy";
import { findSecrets, redact } from "@/lib/sanitise";
import { retrieve, reposMentioned } from "@/lib/retrieval";

type Ex = (typeof codeIndex.excerpts)[number];
const excerpts = codeIndex.excerpts as Ex[];

describe("committed code index", () => {
  it("only holds allowlisted repos under the right owner", () => {
    expect(codeIndex.owner).toBe(OWNER);
    for (const r of codeIndex.repos as { repo: string }[]) expect(ALLOWLIST).toContain(r.repo);
    for (const r of codeRepos.repos) expect(ALLOWLIST).toContain(r.repo);
    expect(new Set(excerpts.map((e) => e.repo))).toEqual(new Set(codeRepos.repos.map((r) => r.repo)));
  });

  it("has a few hundred excerpts at least", () => {
    expect(excerpts.length).toBeGreaterThan(300);
  });

  it("keeps every excerpt to 25 lines or fewer, with matching text", () => {
    for (const e of excerpts) {
      const n = e.endLine - e.startLine + 1;
      expect(n, e.id).toBeGreaterThan(0);
      expect(n, e.id).toBeLessThanOrEqual(MAX_EXCERPT_LINES);
      expect(e.text.split("\n").length, e.id).toBe(n);
    }
  });

  it("links every excerpt to its lines at the pinned commit", () => {
    const sha = new Map(codeRepos.repos.map((r) => [r.repo, r.sha]));
    for (const e of excerpts) {
      const path = e.path.split("/").map(encodeURIComponent).join("/");
      expect(e.url).toBe(`https://github.com/${OWNER}/${e.repo}/blob/${sha.get(e.repo)}/${path}#L${e.startLine}-L${e.endLine}`);
      expect(sha.get(e.repo)).toMatch(/^[0-9a-f]{40}$/);
    }
  });

  it("contains only files the policy allows: no tests, lockfiles, env files or binaries", () => {
    for (const e of excerpts) expect(classifyPath(e.path), e.id).not.toBeNull();
  });

  it("is clean under the sanitiser: no secrets, nothing left to redact", () => {
    for (const e of excerpts) {
      expect(findSecrets(e.text), e.id).toEqual([]);
      expect(redact(e.text).redactions, e.id).toBe(0);
    }
  });

  it("never links to a repo that isn't on the allowlist", () => {
    for (const e of excerpts) expect(foreignRepoRefs(e.text), e.id).toEqual([]);
    for (const r of codeRepos.repos) expect(foreignRepoRefs(JSON.stringify(r)), r.repo).toEqual([]);
    // The specific private repo that a public README used to link to.
    expect(JSON.stringify(codeIndex)).not.toMatch(/KrishantM\/surya-unite/i);
  });

  it("records skipped files by pattern name only", () => {
    for (const s of codeIndex.skipped as { reason: string }[]) {
      expect(s.reason).toMatch(/^[a-z][a-z0-9 :()-]*$/i);
    }
  });
});

describe("retrieval", () => {
  it("finds the Gates classifier for a question about it", () => {
    const hits = retrieve("how does surya gates classify a git push");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].excerpt.repo).toBe("surya-gates");
  });

  it("finds the LangGraph checkpointer in Project Eval", () => {
    const hits = retrieve("LangGraph Postgres checkpointer");
    expect(hits.some((h) => h.excerpt.repo === "project-eval")).toBe(true);
  });

  it("returns no code for a question with nothing to do with it", () => {
    expect(retrieve("how can I get in touch with you")).toEqual([]);
  });

  it("keeps at most two excerpts per file", () => {
    const hits = retrieve("memory merge driver sync conflict git", 10, 0);
    const per = new Map<string, number>();
    for (const h of hits) per.set(`${h.excerpt.repo}/${h.excerpt.path}`, (per.get(`${h.excerpt.repo}/${h.excerpt.path}`) ?? 0) + 1);
    for (const n of per.values()) expect(n).toBeLessThanOrEqual(2);
  });

  it("recognises tools by name", () => {
    expect(reposMentioned("tell me about Gates")).toEqual(["surya-gates"]);
    expect(reposMentioned("what does project eval do")).toContain("project-eval");
  });
});
