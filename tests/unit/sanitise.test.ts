import { describe, expect, it } from "vitest";
import { findSecrets, hasSecret, isHighEntropyToken, redact, sanitise } from "@/lib/sanitise";

// Fake values built at runtime so this file never holds a real-looking secret
// that a scanner (or the index) would trip on.
const rep = (s: string, n: number) => s.repeat(n);
const FAKE = {
  anthropic: "sk-ant-" + rep("aB3dE5fG7h", 3),
  openai: "sk-proj-" + rep("Zx9Yw8Vu7T", 3),
  github: "ghp_" + rep("A1b2C3d4E5", 4),
  githubPat: "github_pat_" + rep("11ABCDEFG0", 3),
  aws: "AKIA" + "IOSFODNN7EXAMPLE",
  google: "AIza" + rep("Sy9xQ1wE2r", 3) + "T3y4U",
  stripe: "sk_live_" + rep("4eC39HqLyj", 2),
  slack: "xoxb-" + "1234567890-abcdefghij",
  npm: "npm_" + rep("abcdef123456", 3),
  jwt: "eyJ" + "hbGciOiJIUzI1NiJ9" + ".eyJ" + "zdWIiOiIxMjM0NTY3ODkwIn0" + ".dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
  pem: "-----BEGIN " + "RSA PRIVATE KEY-----",
  random: "Qm9" + "x7KpL2vR8sT4wY6zA1bC3dE5fG7hJ9kM",
};

describe("findSecrets", () => {
  it.each(Object.entries(FAKE))("flags a %s-shaped value", (_name, value) => {
    expect(hasSecret(`const token = ${JSON.stringify(value)};`)).toBe(true);
  });

  it("flags a URL that carries a password", () => {
    expect(findSecrets("DATABASE_URL=postgres://" + "app:hunter22@db:5432/app").map((h) => h.pattern)).toContain(
      "credential-url",
    );
  });

  it("flags a secret-looking name assigned a literal", () => {
    expect(findSecrets(`api_key = "${"abcd".repeat(4)}"`).map((h) => h.pattern)).toContain("secret-assignment");
  });

  it("records pattern names only, never the value", () => {
    const hits = findSecrets(FAKE.anthropic);
    expect(hits.length).toBeGreaterThan(0);
    expect(JSON.stringify(hits)).not.toContain(FAKE.anthropic);
  });

  it.each([
    "def classify(tool: str, args: dict, cwd: str) -> Verdict:",
    "const API_KEY = process.env.ANTHROPIC_API_KEY;",
    'password = os.environ["DB_PASSWORD"]',
    "import { useEffect, useRef, useState } from 'react';",
    "src/components/assistant/AskMode.tsx",
    "git push --force origin main",
    "https://github.com/KrishantM/surya-gates/blob/30f8ad218decc5f733c860dc3a3ea9f03e3fdf81/surya_gates/rules.py",
    "a3f9c2e1b7d4c8e2f6a1b9d3c7e5f2a8b4d6c1e9", // a 40-char hex commit sha
    "redis://redis:6379/0",
  ])("leaves ordinary code alone: %s", (line) => {
    expect(findSecrets(line)).toEqual([]);
  });
});

describe("isHighEntropyToken", () => {
  it("accepts a long random mixed-case token", () => {
    expect(isHighEntropyToken(FAKE.random)).toBe(true);
  });
  it("rejects identifiers, paths and hex", () => {
    expect(isHighEntropyToken("ThisIsAVeryLongIdentifierNameForTesting1")).toBe(false);
    expect(isHighEntropyToken("surya_gates/rules/classify_bash_command_v2")).toBe(false);
    expect(isHighEntropyToken("30f8ad218decc5f733c860dc3a3ea9f03e3fdf81")).toBe(false);
  });
});

describe("redact", () => {
  it("redacts secrets in place", () => {
    const { text, redactions } = redact(`key: ${FAKE.anthropic}\ntoken: ${FAKE.github}`);
    expect(text).not.toContain(FAKE.anthropic);
    expect(text).not.toContain(FAKE.github);
    expect(text).toContain("[redacted]");
    expect(redactions).toBe(2);
  });

  it("keeps the scheme of a credential URL but drops the user and password", () => {
    const out = sanitise("postgres://" + "app:hunter22@db:5432/app");
    expect(out).toBe("postgres://[redacted]@db:5432/app");
  });

  it("redacts personal details", () => {
    expect(sanitise("mail someone@example.com")).toBe("mail [email]");
    expect(sanitise("call +64 21 123 4567 now")).toBe("call [phone] now");
    expect(sanitise("host 192.168.1.20 up")).toBe("host [ip] up");
    expect(sanitise("see /Users/someone/Projects/app")).toBe("see [local path]");
    expect(sanitise("C:\\Users\\someone\\code")).toBe("[local path]");
  });

  it("leaves loopback, versions, dates and ports alone", () => {
    const line = "listen on 127.0.0.1:8080 and 0.0.0.0, version 1.8.0, released 2026-11-12, port 5432";
    expect(sanitise(line)).toBe(line);
  });

  it("returns clean text unchanged with zero redactions", () => {
    const code = "export function add(a: number, b: number) {\n  return a + b;\n}";
    expect(redact(code)).toEqual({ text: code, redactions: 0 });
  });
});
