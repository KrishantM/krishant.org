/**
 * A pointer to evidence. Code proofs name a file (and optionally lines) in
 * one of the public repos on the code-index allowlist; the link is pinned to
 * the commit recorded in src/content/code-repos.json, so line numbers stay
 * correct. Link proofs are anchors on this page or external URLs.
 */
export type Proof =
  | {
      kind: "code";
      repo: string;
      path: string;
      lines?: [number, number];
      /** Short plain-words label, e.g. "The grading graph". */
      label: string;
    }
  | { kind: "link"; href: string; label: string };
