import type { Proof } from "@/types/proof";

/**
 * "How I build": evidence, not a skills list. Every item makes a plain claim
 * and links to proof: a file in a public repo (pinned to the indexed commit),
 * the PwC statement, or a certification.
 *
 * Rules for this file:
 *   - Never claim scaled production Kubernetes or LangChain.
 *   - Every code proof must point at a file in src/content/code-repos.json.
 *     The unit tests check this.
 */

export interface BuildEvidence {
  slug: string;
  title: string;
  /** The claim, in one or two short sentences. */
  claim: string;
  /** What the proof shows. */
  detail: string;
  proofs: Proof[];
}

export const howIBuild: BuildEvidence[] = [
  {
    slug: "langchain-langgraph",
    title: "LangChain and LangGraph",
    claim:
      "I've built and designed agents with LangChain and LangGraph for prototypes and designs, including at work.",
    detail:
      "In Project Eval, LLM-judge grading runs as a LangGraph graph with a Postgres checkpointer, so a paused grade survives a restart. A human-calibration step decides when the judge can be trusted.",
    proofs: [
      { kind: "code", repo: "project-eval", path: "eval_server/grading.py", lines: [111, 152], label: "The grading graph" },
      { kind: "code", repo: "project-eval", path: "eval_server/grading.py", lines: [160, 165], label: "Postgres checkpointer" },
      { kind: "code", repo: "project-eval", path: "eval_server/grading.py", lines: [82, 102], label: "Human calibration" },
    ],
  },
  {
    slug: "containers-kubernetes",
    title: "Containers and Kubernetes",
    claim:
      "I use containers and Kubernetes in personal builds, and in internal designs and proofs of concept at work.",
    detail:
      "Project Eval ships Docker Compose and a Helm chart, with KEDA autoscaling on the grading backlog and a NetworkPolicy that locks egress. I verified it on a local k3d cluster.",
    proofs: [
      { kind: "code", repo: "project-eval", path: "deploy/helm/project-eval/templates/worker.yaml", lines: [29, 48], label: "KEDA ScaledObject" },
      { kind: "code", repo: "project-eval", path: "deploy/helm/project-eval/templates/networkpolicy.yaml", lines: [1, 25], label: "Egress lock" },
      { kind: "code", repo: "project-eval", path: "scripts/egress-check.sh", label: "Egress test on k3d" },
      { kind: "code", repo: "project-eval", path: "README.md", lines: [35, 45], label: "Helm install" },
    ],
  },
  {
    slug: "agentic-engineering",
    title: "Agentic engineering",
    claim: "Agents that act on their own, with a person in the loop where it matters.",
    detail:
      "Surya Gates sits between an agent and its tools and decides what needs a yes. Surya Memory gives agents one memory that you can read, edit and undo.",
    proofs: [
      { kind: "code", repo: "surya-gates", path: "surya_gates/rules.py", lines: [298, 323], label: "How Gates classifies a call" },
      { kind: "code", repo: "surya-gates", path: "surya_gates/hook.py", lines: [1, 6], label: "Fails closed" },
      { kind: "code", repo: "surya-memory", path: "scripts/merge-driver.sh", label: "Keeps both versions" },
    ],
  },
  {
    slug: "claude-agent-sdk",
    title: "Claude Agent SDK",
    claim: "I build on the Claude Agent SDK and Claude Code's hooks.",
    detail:
      "Surya Gates ships a PreToolUse hook for the Claude Agent SDK, checked in a real session. The same rules run as hooks in Claude Code and Codex.",
    proofs: [
      { kind: "code", repo: "surya-gates", path: "surya_gates/gate.py", lines: [296, 305], label: "The Agent SDK hook" },
      { kind: "code", repo: "surya-gates", path: "README.md", lines: [183, 189], label: "How it was checked" },
    ],
  },
  {
    slug: "multi-model-routing",
    title: "Multi-model routing",
    claim: "The same system works across Claude, GPT and local models.",
    detail:
      "Surya Gates reads tool calls from Anthropic, OpenAI and MCP and applies one set of rules. Project Eval's judge runs on any LangChain chat model, local by default. Surya Voice sends each question to Claude Code, Codex or a command you choose.",
    proofs: [
      { kind: "code", repo: "surya-gates", path: "surya_gates/gate.py", lines: [80, 106], label: "One gate, four call shapes" },
      { kind: "code", repo: "project-eval", path: "eval_server/grading.py", lines: [195, 215], label: "Swappable judge model" },
      { kind: "code", repo: "surya-voice", path: "Sources/Agent.swift", lines: [133, 141], label: "Harness routing" },
    ],
  },
  {
    slug: "data-platforms",
    title: "Data platforms",
    claim: "Data platforms are part of my day job, and I'm certified as a Databricks Platform Architect.",
    detail:
      "Outside work, Gradual ran a weekly pipeline that pulled 800+ opportunities from 7 sources.",
    proofs: [
      { kind: "link", href: "#day-job", label: "My day job" },
      { kind: "link", href: "#credentials", label: "Databricks Platform Architect" },
      { kind: "link", href: "/ventures/gradual", label: "Gradual" },
    ],
  },
  {
    slug: "cloud-architecture",
    title: "Cloud architecture",
    claim: "Cloud architecture for large organisations, at PwC.",
    detail:
      "I hold the AWS Solutions Architect Associate and Azure Fundamentals certifications. Project Eval is designed to run inside a company's own cluster, with data kept in.",
    proofs: [
      { kind: "link", href: "#day-job", label: "My day job" },
      { kind: "link", href: "#credentials", label: "Certifications" },
      { kind: "code", repo: "project-eval", path: "deploy/helm/project-eval/values.yaml", lines: [39, 50], label: "Network policy settings" },
    ],
  },
];
