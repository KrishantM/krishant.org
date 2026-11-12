import { describe, expect, it, vi } from "vitest";
import {
  ALLOWLIST,
  OWNER,
  blobUrl,
  checkRepo,
  chunkLines,
  classifyPath,
  foreignRepoRefs,
  scrubForeignRepoRefs,
  isAllowlisted,
  MAX_EXCERPT_LINES,
  MAX_INFRA_FILES,
  MAX_SOURCE_FILES,
  selectFiles,
  type FetchJson,
} from "@/lib/code-index/policy";

const PRIVATE_REPOS = [
  "Surya",
  "private-tool",
  "surya-x",
  "other-repo",
  "surya-gates-fork",
  "some-service",
  "surya-memory-private",
  "surya-unite",
  "project-eval-2",
];

const publicMeta = (repo: string) => ({
  full_name: `${OWNER}/${repo}`,
  private: false,
  visibility: "public",
  default_branch: "main",
});

describe("allowlist", () => {
  it("is exactly the five public tools", () => {
    expect([...ALLOWLIST].sort()).toEqual(["project-eval", "surya-distro", "surya-gates", "surya-memory", "surya-voice"]);
  });

  it.each(PRIVATE_REPOS)("refuses private repo %s without any network call", async (repo) => {
    const fetchJson = vi.fn<FetchJson>();
    expect(isAllowlisted(repo)).toBe(false);
    const result = await checkRepo(repo, fetchJson);
    expect(result).toEqual({ ok: false, repo, reason: "not on the allowlist" });
    expect(fetchJson).not.toHaveBeenCalled();
  });

  it("refuses an allowlisted repo that GitHub reports as private", async () => {
    const fetchJson: FetchJson = async () => ({
      status: 200,
      body: { ...publicMeta("surya-gates"), private: true, visibility: "private" },
    });
    const result = await checkRepo("surya-gates", fetchJson);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toBe("repo is not public");
  });

  it("refuses when visibility is missing", async () => {
    const body = { ...publicMeta("surya-gates"), visibility: undefined };
    const result = await checkRepo("surya-gates", async () => ({ status: 200, body }));
    expect(result.ok).toBe(false);
  });

  it("refuses a 404 (how an unauthenticated call sees a private repo)", async () => {
    const result = await checkRepo("surya-memory", async () => ({ status: 404, body: { message: "Not Found" } }));
    expect(result).toEqual({ ok: false, repo: "surya-memory", reason: "not found or not public (404)" });
  });

  it("refuses a renamed or redirected repo", async () => {
    const body = { ...publicMeta("surya-voice"), full_name: `${OWNER}/private-tool` };
    const result = await checkRepo("surya-voice", async () => ({ status: 200, body }));
    expect(result.ok).toBe(false);
  });

  it("refuses on API errors", async () => {
    const result = await checkRepo("surya-voice", async () => ({ status: 403, body: { message: "rate limited" } }));
    expect(result.ok).toBe(false);
  });

  it("accepts a public allowlisted repo and asks only for that repo", async () => {
    const fetchJson = vi.fn<FetchJson>(async () => ({ status: 200, body: publicMeta("project-eval") }));
    const result = await checkRepo("project-eval", fetchJson);
    expect(result.ok).toBe(true);
    expect(fetchJson).toHaveBeenCalledTimes(1);
    expect(fetchJson).toHaveBeenCalledWith(`https://api.github.com/repos/${OWNER}/project-eval`);
  });
});

describe("classifyPath", () => {
  it.each([
    ["README.md", "readme"],
    ["surya_gates/rules.py", "source"],
    ["src/lib/retrieval.ts", "source"],
    ["Sources/Agent.swift", "source"],
    ["Dockerfile", "infra"],
    ["deploy/helm/project-eval/values.yaml", "infra"],
    ["deploy/helm/project-eval/templates/networkpolicy.yaml", "infra"],
  ])("%s is %s", (path, kind) => {
    expect(classifyPath(path)).toBe(kind);
  });

  it.each([
    "tests/test_rules.py",
    "surya_gates/test_hook.py",
    "src/lib/x.test.ts",
    "conftest.py",
    "fixtures/sample.py",
    "package-lock.json",
    "uv.lock",
    ".env",
    ".env.local",
    ".env.example",
    "smtp-credentials.py",
    "secrets.ts",
    "vite.config.ts",
    "logo.png",
    "dist/index.js",
    "node_modules/x/index.js",
    "docs/README.md",
    "CLAUDE.md",
    "AGENTS.md",
    "types/global.d.ts",
  ])("skips %s", (path) => {
    expect(classifyPath(path)).toBeNull();
  });
});

describe("selectFiles", () => {
  it("keeps the README, caps source and infra separately, and skips large or empty files", () => {
    const tree = [
      { path: "README.md", type: "blob", size: 900 },
      { path: "pkg", type: "tree" },
      { path: "huge.py", type: "blob", size: 120_000 },
      { path: "empty.py", type: "blob", size: 0 },
      ...Array.from({ length: 40 }, (_, i) => ({ path: `pkg/mod${i}.py`, type: "blob", size: 1000 + i })),
      ...Array.from({ length: 20 }, (_, i) => ({ path: `deploy/t${i}.yaml`, type: "blob", size: 500 })),
    ];
    const picked = selectFiles(tree);
    expect(picked[0]).toEqual({ path: "README.md", kind: "readme" });
    expect(picked.filter((p) => p.kind === "source")).toHaveLength(MAX_SOURCE_FILES);
    expect(picked.filter((p) => p.kind === "infra")).toHaveLength(MAX_INFRA_FILES);
    expect(picked.map((p) => p.path)).not.toContain("huge.py");
    expect(picked.map((p) => p.path)).not.toContain("empty.py");
  });
});

describe("chunkLines", () => {
  it("never makes an excerpt longer than the cap and covers every line", () => {
    const content = Array.from({ length: 203 }, (_, i) => (i % 17 === 0 ? "" : `line ${i + 1}`)).join("\n");
    const chunks = chunkLines(content);
    for (const c of chunks) {
      expect(c.endLine - c.startLine + 1).toBeLessThanOrEqual(MAX_EXCERPT_LINES);
      expect(c.text.split("\n")).toHaveLength(c.endLine - c.startLine + 1);
    }
    expect(chunks[0].startLine).toBe(1);
    expect(chunks.at(-1)!.endLine).toBe(203);
    for (let i = 1; i < chunks.length; i++) expect(chunks[i].startLine).toBe(chunks[i - 1].endLine + 1);
  });

  it("drops chunks that are only blank lines", () => {
    expect(chunkLines("\n\n\n")).toEqual([]);
  });
});

describe("blobUrl", () => {
  it("pins to a commit and encodes the path", () => {
    expect(blobUrl("surya-gates", "abc123", "surya_gates/my file.py", 3, 9)).toBe(
      "https://github.com/KrishantM/surya-gates/blob/abc123/surya_gates/my%20file.py#L3-L9",
    );
  });
});

describe("links to repos off the allowlist", () => {
  it.each([
    "https://github.com/KrishantM/surya-unite",
    "see github.com/KrishantM/surya-unite/blob/main/README.md for more",
    "git clone git@github.com:KrishantM/private-tool.git",
    "[email]:KrishantM/other-repo.git",
    "https://raw.githubusercontent.com/KrishantM/surya-x/main/x.py",
    "uses: KrishantM/some-service@v1",
    "https://krishantm.github.io/surya-gates-fork/",
    "github.com/krishantm/Surya",
  ])("finds %s", (text) => {
    expect(foreignRepoRefs(text).length).toBe(1);
    const { text: out, removed } = scrubForeignRepoRefs(text);
    expect(removed).toBe(1);
    expect(foreignRepoRefs(out)).toEqual([]);
  });

  it.each([
    "https://github.com/KrishantM/surya-gates",
    "https://github.com/KrishantM/surya-memory.git.",
    "git clone https://github.com/KrishantM/project-eval",
    "https://krishantm.github.io/project-eval/",
    "https://github.com/KrishantM",
    "https://github.com/anthropics/claude-code",
  ])("leaves %s alone", (text) => {
    expect(foreignRepoRefs(text)).toEqual([]);
    expect(scrubForeignRepoRefs(text)).toEqual({ text, removed: 0 });
  });

  it("removes the whole link and keeps the sentence around it", () => {
    expect(scrubForeignRepoRefs("Pair it with (https://github.com/KrishantM/surya-unite) today.").text).toBe(
      "Pair it with ([link removed]) today.",
    );
  });
});
