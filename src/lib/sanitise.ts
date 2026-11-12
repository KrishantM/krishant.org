/**
 * The sanitiser. It runs twice:
 *
 *   1. At index time (scripts/build-code-index.mts), on every file pulled from
 *      the public repos. A file that trips any SECRET pattern is dropped whole.
 *      Everything else has personal details redacted before it is written.
 *   2. At request time (/api/ask), on every string the assistant sends back to
 *      the browser, so a model reply can never carry one of these out.
 *
 * Pure functions, no imports, so the Node index script can load this file
 * directly and the Next app and the unit tests share the same code.
 */

export interface SecretHit {
  /** Pattern name only. The matched value is never recorded. */
  pattern: string;
}

interface Rule {
  name: string;
  re: RegExp;
}

/** Known credential shapes. Any hit drops a file at index time. */
const SECRET_RULES: Rule[] = [
  { name: "private-key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "anthropic-or-openai-key", re: /\bsk-(?:ant-|proj-|live-)?[A-Za-z0-9_-]{16,}/ },
  { name: "github-token", re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/ },
  { name: "github-pat", re: /\bgithub_pat_[A-Za-z0-9_]{20,}/ },
  { name: "slack-token", re: /\bxox[abposr]-[A-Za-z0-9-]{10,}/ },
  { name: "aws-access-key", re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { name: "google-api-key", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: "stripe-key", re: /\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{16,}/ },
  { name: "npm-token", re: /\bnpm_[A-Za-z0-9]{36}\b/ },
  { name: "jwt", re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  // A URL that carries a password: scheme://user:pass@host
  { name: "credential-url", re: /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@"'`]+:[^\s/@"'`]+@[^\s/"'`]+/i },
  // A secret-looking name assigned a literal value of 12+ characters.
  {
    name: "secret-assignment",
    re: /\b(?:api[_-]?key|secret(?:[_-]?key)?|access[_-]?token|auth[_-]?token|password|passwd|client[_-]?secret)\b["']?\s*[:=]\s*["'][^"'\s]{12,}["']/i,
  },
];

/** Shannon entropy in bits per character. */
export function entropy(s: string): number {
  if (!s) return 0;
  const counts = new Map<string, number>();
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let h = 0;
  for (const n of counts.values()) {
    const p = n / s.length;
    h -= p * Math.log2(p);
  }
  return h;
}

const CANDIDATE = /[A-Za-z0-9+/_=-]{32,}/g;

/**
 * A long, random-looking token: 32+ characters with an unbroken run of 24+
 * that mixes upper and lower case and digits, is not mostly words, and has
 * high entropy. Real API keys look like this; identifiers, commit shas,
 * words and paths do not.
 */
export function isHighEntropyToken(token: string): boolean {
  if (token.length < 32) return false;
  // Paths, URLs and dotted or dashed identifiers break into short words, so
  // judge the longest unbroken piece on its own.
  const run = token.split(/[/_\-.=]+/).reduce((a, b) => (b.length > a.length ? b : a), "");
  if (run.length < 24) return false;
  // Keys mix all three. A hex commit sha or a lowercase slug does not.
  if (!/[a-z]/.test(run) || !/[A-Z]/.test(run) || !/[0-9]/.test(run)) return false;
  // CamelCase identifiers are mostly words.
  const wordy = (run.match(/[A-Z]?[a-z]{3,}/g) ?? []).join("").length;
  if (wordy / run.length >= 0.6) return false;
  return entropy(run) >= Math.min(4.2, Math.log2(run.length) - 0.5);
}

/** Names of the secret patterns found in `text`. Empty means clean. */
export function findSecrets(text: string): SecretHit[] {
  const hits: SecretHit[] = [];
  for (const rule of SECRET_RULES) {
    if (rule.re.test(text)) hits.push({ pattern: rule.name });
  }
  const candidates = text.match(CANDIDATE) ?? [];
  if (candidates.some(isHighEntropyToken)) hits.push({ pattern: "high-entropy-string" });
  return hits;
}

export function hasSecret(text: string): boolean {
  return findSecrets(text).length > 0;
}

/* ------------------------------------------------------------------ */
/* Redaction: personal details and anything secret-shaped.             */
/* ------------------------------------------------------------------ */

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

// Absolute local paths that name a person or a machine.
const LOCAL_PATH =
  /(?:\/(?:Users|home|private\/var|private\/tmp|var\/folders)\/[^\s"'`)\]<>,;]+)|(?:\b[A-Za-z]:\\(?:Users|Documents and Settings)\\[^\s"'`)\]<>,;]+)/g;

const IPV4 = /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g;
const SAFE_IPS = new Set(["127.0.0.1", "0.0.0.0"]);

// Phone numbers in common written forms. Tuned to leave dates, versions and
// ports alone.
const PHONE =
  /(?<![\w.:/-])(?:\+\d{1,3}[\s.-]?(?:\(\d{1,4}\)[\s.-]?)?\d{1,4}[\s.-]\d{3,4}[\s.-]?\d{3,4}|\(\d{2,4}\)[\s.-]?\d{3,4}[\s.-]\d{3,4}|0\d{1,3}[\s.-]\d{3,4}[\s.-]\d{3,4}|\d{3}-\d{3}-\d{4}|\+\d{8,15})(?![\w.-])/g;

const CRED_URL = /\b([a-z][a-z0-9+.-]*:\/\/)[^\s/:@"'`]+:[^\s/@"'`]+@/gi;

export interface RedactResult {
  text: string;
  redactions: number;
}

/**
 * Redact personal details and secret-shaped strings. Order matters: secrets
 * and credential URLs first, then paths, IPs (before phones, which could
 * otherwise eat an IP), emails, phones.
 */
export function redact(input: string): RedactResult {
  let n = 0;
  const swap = (re: RegExp, by: string | ((m: string, ...g: string[]) => string)) => {
    out = out.replace(re, (...args: unknown[]) => {
      const m = args[0] as string;
      const groups = args.slice(1, -2) as string[];
      const next = typeof by === "string" ? by : by(m, ...groups);
      if (next !== m) n += 1;
      return next;
    });
  };

  let out = input;
  for (const rule of SECRET_RULES) {
    if (rule.name === "credential-url") continue;
    swap(new RegExp(rule.re.source, rule.re.flags.includes("g") ? rule.re.flags : rule.re.flags + "g"), "[redacted]");
  }
  swap(CRED_URL, (_m, scheme) => `${scheme}[redacted]@`);
  swap(CANDIDATE, (m) => (isHighEntropyToken(m) ? "[redacted]" : m));
  swap(LOCAL_PATH, "[local path]");
  swap(IPV4, (m) => (SAFE_IPS.has(m) ? m : "[ip]"));
  swap(EMAIL, "[email]");
  swap(PHONE, "[phone]");
  return { text: out, redactions: n };
}

/** Convenience: the redacted text only. */
export function sanitise(text: string): string {
  return redact(text).text;
}
