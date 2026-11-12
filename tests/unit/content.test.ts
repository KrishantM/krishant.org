import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { surya, suryaTools } from "@/content/surya";
import { howIBuild } from "@/content/how-i-build";
import { certifications, pwc } from "@/content/certifications";
import { ventures } from "@/content/ventures";
import codeRepos from "@/content/code-repos.json";
import { ALLOWLIST } from "@/lib/code-index/policy";
import { proofHref, proofPath } from "@/lib/proof";
import { buildAskSystemPrompt, buildFitSystemPrompt, DEFAULT_ASSISTANT_MODEL, fitSchema } from "@/lib/llm-context";
import { foreignRepoRefs } from "@/lib/code-index/policy";
import { evidenceCatalogue } from "@/lib/evidence";

const APPROVED_PWC =
  "By day I'm an AI engineer and solution architect at PwC New Zealand, in the Digital Strategy & Architecture team. I build agentic systems, data platforms and cloud architecture for large organisations, which means shipping AI inside the kind of security, governance and scale most product builders never see.";

const allCopy = JSON.stringify({ site, surya, suryaTools, howIBuild, certifications, pwc, ventures });

describe("content rules", () => {
  it("keeps the approved PwC statement word for word", () => {
    expect(pwc.statement).toBe(APPROVED_PWC);
  });

  it("never uses banned phrases", () => {
    expect(allCopy.toLowerCase()).not.toContain("venture hub");
    expect(allCopy.toLowerCase()).not.toContain("seconded");
    expect(allCopy).not.toMatch(/\bexpert\b/i);
  });

  it("has six certifications including Claude Certified Architect, with no invented dates", () => {
    expect(certifications).toHaveLength(6);
    const ccar = certifications.find((c) => c.code === "CCAR-P");
    expect(ccar).toMatchObject({ name: "Claude Certified Architect – Professional", provider: "Anthropic", status: "Active" });
    expect(ccar?.credentialUrl ?? null).toBeNull();
    for (const c of certifications) expect(c.issuedDate).toBeUndefined();
    expect(certifications.map((c) => c.name)).toContain("Databricks Fundamentals");
  });

  it("puts every public repo tool on the allowlist and nothing unreleased on GitHub", () => {
    for (const t of suryaTools) {
      if (t.tier === "live") expect(ALLOWLIST).toContain(t.repo);
      else expect(t.repo).toBeUndefined();
    }
  });

  it("never calls Surya Unite available", () => {
    const unite = suryaTools.find((t) => t.slug === "surya-unite")!;
    expect(unite.tier).toBe("development");
    expect(JSON.stringify(unite)).not.toMatch(/\b(available now|buy|sign up|download)\b/i);
  });

  it("links only to public repos on the allowlist", () => {
    expect(foreignRepoRefs(allCopy)).toEqual([]);
  });

  it("makes no production-scale Kubernetes or LangChain claim", () => {
    const text = JSON.stringify(howIBuild);
    expect(text).not.toMatch(/production[- ]scale|in production at scale|scaled production/i);
  });
});

describe("How I build proofs", () => {
  const repos = new Map(codeRepos.repos.map((r) => [r.repo, r]));

  it("pins every code proof to an indexed public repo commit", () => {
    for (const item of howIBuild) {
      expect(item.proofs.length, item.slug).toBeGreaterThan(0);
      for (const p of item.proofs) {
        if (p.kind !== "code") continue;
        const r = repos.get(p.repo);
        expect(r, `${item.slug}: ${p.repo}`).toBeDefined();
        expect(proofHref(p)).toContain(`/blob/${r!.sha}/`);
        if (p.lines) {
          expect(p.lines[0]).toBeLessThanOrEqual(p.lines[1]);
          expect(proofHref(p)).toMatch(/#L\d+-L\d+$/);
        }
        expect(proofPath(p)).toContain(p.path);
      }
    }
  });

  it("points page links at sections that exist", () => {
    const anchors = new Set(["#surya", "#how-i-build", "#day-job", "#credentials", "#earlier", "#connect"]);
    for (const item of howIBuild) {
      for (const p of item.proofs) {
        if (p.kind !== "link") continue;
        if (p.href.startsWith("#")) expect(anchors).toContain(p.href);
        else if (p.href.startsWith("/ventures/")) expect(ventures.map((v) => `/ventures/${v.slug}`)).toContain(p.href);
        else expect(p.href).toMatch(/^https:\/\//);
      }
    }
  });
});

describe("assistant model", () => {
  it("defaults to Sonnet", () => {
    expect(DEFAULT_ASSISTANT_MODEL).toBe("claude-sonnet-5-5");
  });

  it("asks the fit-check model for choices only, never prose about the evidence", () => {
    expect(Object.keys(fitSchema.properties).sort()).toEqual(["discuss", "matches"]);
    expect(Object.keys(fitSchema.properties.matches.items.properties).sort()).toEqual(["evidence_ids", "requirement"]);
  });
});

describe("system prompts", () => {
  it("carry the scope, honesty and style rules", () => {
    const ask = buildAskSystemPrompt();
    for (const p of [ask, buildFitSystemPrompt(evidenceCatalogue())]) {
      expect(p).toMatch(/em dash/i);
      expect(p).toMatch(/seconded/i);
      expect(p).toMatch(/expert/i);
      expect(p).not.toContain("—");
    }
    expect(buildFitSystemPrompt(evidenceCatalogue())).toMatch(/job_description/);
  });
});
