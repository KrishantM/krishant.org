import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import demo from "@/content/gates-demo.json";
import { renderCall, type DemoAction } from "@/components/assistant/GatesDemo";

const actions = demo.actions as DemoAction[];
const byId = Object.fromEntries(actions.map((a) => [a.id, a]));

describe("Gates demo data", () => {
  it("is labelled as real output and pinned to a commit", () => {
    expect(demo.note).toMatch(/^Real output from Surya Gates/);
    expect(demo.source.function).toBe("surya_gates.rules.classify");
    expect(demo.source.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(demo.source.url).toBe(`https://github.com/KrishantM/surya-gates/blob/${demo.source.commit}/surya_gates/rules.py`);
    expect(demo.source.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("has a unique, well-formed verdict for every action", () => {
    expect(new Set(actions.map((a) => a.id)).size).toBe(actions.length);
    for (const a of actions) {
      expect(["pass", "stop", "refuse"]).toContain(a.verdict.action);
      if (a.verdict.action === "stop") {
        expect(a.verdict.class, a.id).not.toBe("");
        expect(typeof a.verdict.trustable, a.id).toBe("boolean");
      } else {
        expect(a.verdict.trustable, a.id).toBeNull();
      }
    }
  });

  it("covers all three outcomes", () => {
    const outcomes = new Set(actions.map((a) => a.verdict.action));
    expect(outcomes).toEqual(new Set(["pass", "stop", "refuse"]));
  });

  it("matches what the site says Gates does", () => {
    expect(byId.pytest.verdict.action).toBe("pass");
    expect(byId.read.verdict.action).toBe("pass");
    expect(byId.deploy.verdict.action).toBe("stop");
    expect(byId.push.verdict.action).toBe("stop");
    expect(byId["rm-src"].verdict.action).toBe("stop");
    // Sent messages can never be trusted for a session.
    expect(byId.email.verdict).toMatchObject({ action: "stop", class: "send", trustable: false });
  });

  it("renders calls the way a tool log shows them", () => {
    expect(renderCall(byId.pytest)).toBe("$ pytest -q");
    expect(renderCall(byId.read)).toBe("Read src/app.py");
    expect(renderCall(byId.email)).toBe('mcp__gmail__send_email({ to: "launch list", subject: "We\'re live" })');
  });

  const gates = process.env.SURYA_GATES_PATH || join(homedir(), "Projects", "active", "surya-gates");
  it.skipIf(!existsSync(join(gates, "surya_gates", "rules.py")))(
    "is exactly what classify() returns at the recorded commit",
    () => {
      const out = execFileSync("/usr/bin/python3", ["-I", "scripts/build-gates-demo.py", "--check"], {
        encoding: "utf8",
        env: { ...process.env, SURYA_GATES_PATH: gates },
      });
      expect(out).toMatch(/^(MATCH|SKIP)/);
    },
  );
});
