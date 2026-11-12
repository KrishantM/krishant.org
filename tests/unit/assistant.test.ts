import { describe, expect, it } from "vitest";
import { cleanReply, normaliseAsk, normaliseFit, pickActions, type ExcerptLike } from "@/lib/assistant";
import { evidenceCatalogue, pwcWorkSentence } from "@/lib/evidence";
import { suryaTiers, suryaTools } from "@/content/surya";
import { howIBuild } from "@/content/how-i-build";
import { certifications, pwc } from "@/content/certifications";
import { earlierVentures } from "@/content/ventures";

const ex = (n: number): ExcerptLike => ({
  repo: "surya-gates",
  path: "surya_gates/rules.py",
  startLine: n,
  endLine: n + 9,
  url: `https://github.com/KrishantM/surya-gates/blob/abc/surya_gates/rules.py#L${n}-L${n + 9}`,
  lang: "python",
  text: `def f${n}():\n    return ${n}`,
});

describe("cleanReply", () => {
  it("removes em dashes, code fences and bold", () => {
    const out = cleanReply("It works — mostly.\n```py\nprint(1)\n```\n**Really** good");
    expect(out).not.toMatch(/—|```|\*\*/);
    expect(out).toContain("It works, mostly.");
  });

  it("sanitises personal details out of a reply", () => {
    expect(cleanReply("Write to someone@example.com")).toBe("Write to [email]");
  });

  it("removes links to repos that aren't on the allowlist", () => {
    const out = cleanReply("See https://github.com/KrishantM/surya-unite and https://github.com/KrishantM/surya-gates.");
    expect(out).not.toContain("surya-unite");
    expect(out).toContain("https://github.com/KrishantM/surya-gates");
  });
});

describe("normaliseAsk", () => {
  const labelled = new Map([
    ["E1", ex(1)],
    ["E2", ex(20)],
  ]);

  it("keeps only citations that were actually retrieved", () => {
    const out = normaliseAsk({ answer: "It classifies first [E1].", citations: ["E1", "E7", "[E2]", "E1"] }, labelled);
    expect(out?.code.map((c) => c.startLine)).toEqual([1, 20]);
    expect(out?.text).toBe("It classifies first.");
  });

  it("caps code cards at three", () => {
    const many = new Map(Array.from({ length: 5 }, (_, i) => [`E${i + 1}`, ex(i * 30 + 1)]));
    const out = normaliseAsk({ answer: "x", citations: ["E1", "E2", "E3", "E4", "E5"] }, many);
    expect(out?.code).toHaveLength(3);
  });

  it("rejects malformed output", () => {
    expect(normaliseAsk(null, labelled)).toBeNull();
    expect(normaliseAsk({ answer: "" }, labelled)).toBeNull();
    expect(normaliseAsk({ text: "hi" }, labelled)).toBeNull();
  });
});

describe("normaliseFit", () => {
  const catalogue = evidenceCatalogue();
  const byId = new Map(catalogue.map((c) => [c.id, c]));

  it("maps requirements to known evidence and drops invented ids", () => {
    const out = normaliseFit(
      {
        matches: [
          { requirement: "Agentic systems", evidence_ids: ["tool:surya-gates", "made-up", "build:agentic-engineering"] },
          { requirement: "Kubernetes", evidence_ids: ["build:containers-kubernetes"] },
        ],
        discuss: ["Go at scale"],
      },
      catalogue,
    );
    expect(out).not.toBeNull();
    expect(out!.matches).toHaveLength(2);
    expect(out!.matches[0].evidence.map((e) => e.id)).toEqual(["tool:surya-gates", "build:agentic-engineering"]);
    for (const m of out!.matches) for (const e of m.evidence) expect(e).toEqual({ ...pick(byId.get(e.id)!) });
    expect(out!.discuss).toEqual(["Go at scale"]);
  });

  it("shows only the canonical text when the model misattributes a capability", () => {
    // The kind of oversell that slipped through when the model wrote notes.
    const raw = {
      intro: "Surya Memory works across Claude, GPT and MCP tool calls, which is ideal for this role.",
      matches: [
        {
          requirement: "Multi-provider tool calling",
          evidence_ids: ["tool:surya-memory"],
          note: "Surya Memory works across Claude, GPT and MCP tool calls.",
        },
      ],
      discuss: [],
    };
    const out = normaliseFit(raw, catalogue)!;
    const memory = suryaTools.find((t) => t.slug === "surya-memory")!;
    expect(out.matches).toHaveLength(1);
    expect(out.matches[0].evidence).toEqual([
      {
        id: "tool:surya-memory",
        title: "Surya Memory",
        href: "https://github.com/KrishantM/surya-memory",
        kind: "repo",
        text: memory.line,
      },
    ]);
    // Nothing the model wrote about the evidence survives anywhere.
    const rendered = JSON.stringify(out);
    expect(rendered).not.toMatch(/GPT|MCP|ideal/);
    expect(out).not.toHaveProperty("intro");
    expect(out.matches[0]).not.toHaveProperty("note");
  });

  it("takes every evidence text verbatim from the content files", () => {
    for (const c of catalogue) {
      const [kind, slug] = c.id.split(":");
      if (kind === "tool") {
        const t = suryaTools.find((x) => x.slug === slug)!;
        expect(c.text.startsWith(t.line)).toBe(true);
        if (t.tier !== "live") expect(c.text).toContain(suryaTiers[t.tier].note);
      } else if (kind === "build") {
        expect(c.text).toBe(howIBuild.find((b) => b.slug === slug)!.claim);
      } else if (kind === "pwc") {
        expect(pwc.statement).toContain(c.text);
        expect(c.text).toBe(pwcWorkSentence());
      } else if (kind === "venture") {
        expect(c.text).toBe(earlierVentures.find((v) => v.slug === slug)!.summary);
      } else if (kind === "cert") {
        const cert = certifications.find((x) => x.code === slug)!;
        expect(c.text).toBe(`${cert.provider} · ${cert.code} · ${cert.status}`);
      }
    }
  });

  it("drops requirement labels that describe Krishant instead of the job", () => {
    const out = normaliseFit(
      {
        matches: [
          { requirement: "I have built multi-agent systems", evidence_ids: ["tool:surya-gates"] },
          { requirement: "Surya Memory for agent memory", evidence_ids: ["tool:surya-memory"] },
          { requirement: "His LangGraph work", evidence_ids: ["build:langchain-langgraph"] },
          { requirement: "x".repeat(81), evidence_ids: ["tool:surya-gates"] },
          { requirement: "LLM evaluation", evidence_ids: ["tool:project-eval"] },
        ],
        discuss: ["I would need to learn Rust", "Rust"],
      },
      catalogue,
    )!;
    expect(out.matches.map((m) => m.requirement)).toEqual(["LLM evaluation"]);
    expect(out.discuss).toEqual(["Rust"]);
  });

  it("moves a requirement with no valid evidence to the conversation list, never a gaps list", () => {
    const out = normaliseFit({ matches: [{ requirement: "Rust", evidence_ids: ["nope"] }], discuss: [] }, catalogue);
    expect(out!.matches).toEqual([]);
    expect(out!.discuss).toEqual(["Rust"]);
    expect(out).not.toHaveProperty("gaps");
  });

  it("strips gap and weakness wording from labels and topics", () => {
    const out = normaliseFit(
      {
        matches: [{ requirement: "Missing Django experience", evidence_ids: ["tool:surya-gates"] }, { requirement: "Python", evidence_ids: ["tool:surya-gates"] }],
        discuss: ["Missing: Java", "Data mesh design"],
      },
      catalogue,
    );
    expect(out!.matches.map((m) => m.requirement)).toEqual(["Python"]);
    expect(out!.discuss).toEqual(["Data mesh design"]);
  });

  it("caps evidence per requirement and the totals", () => {
    const ids = catalogue.slice(0, 6).map((c) => c.id);
    const matches = Array.from({ length: 14 }, (_, i) => ({ requirement: `Req ${i}`, evidence_ids: ids }));
    const discuss = Array.from({ length: 10 }, (_, i) => `Topic ${i}`);
    const out = normaliseFit({ matches, discuss }, catalogue)!;
    expect(out.matches).toHaveLength(10);
    for (const m of out.matches) expect(m.evidence.length).toBeLessThanOrEqual(3);
    expect(out.discuss).toHaveLength(6);
  });

  it("returns null when nothing usable came back", () => {
    expect(normaliseFit({ matches: [], discuss: [] }, catalogue)).toBeNull();
    expect(normaliseFit("nope", catalogue)).toBeNull();
  });
});

function pick(e: { id: string; title: string; href: string; kind: string; text: string }) {
  return { id: e.id, title: e.title, href: e.href, kind: e.kind, text: e.text };
}

describe("pickActions", () => {
  it("links to repos and sections from the content files only", () => {
    const acts = pickActions("How do Gates and Kubernetes fit together?", ["surya-gates"]);
    expect(acts.length).toBeGreaterThan(0);
    expect(acts.length).toBeLessThanOrEqual(3);
    expect(acts[0].href).toBe("https://github.com/KrishantM/surya-gates");
    for (const a of acts) expect(a.href).toMatch(/^(https:\/\/(github\.com\/KrishantM|www\.linkedin\.com)|#|mailto:)/);
  });
});

describe("evidence catalogue", () => {
  it("has unique ids and real destinations", () => {
    const cat = evidenceCatalogue();
    expect(new Set(cat.map((c) => c.id)).size).toBe(cat.length);
    for (const c of cat) expect(c.href).toMatch(/^(https:\/\/|#|\/ventures\/)/);
  });

  it("never describes an in-development tool as available", () => {
    const unite = evidenceCatalogue().find((c) => c.id === "tool:surya-unite")!;
    expect(unite.summary).toMatch(/not available yet/i);
    expect(unite.href).toBe("#surya");
  });
});
