"use client";

import { useRef, useState } from "react";
import demo from "@/content/gates-demo.json";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * "Try Surya Gates". Every verdict here is real output from Surya Gates'
 * classifier, generated at build time by scripts/build-gates-demo.py from a
 * pinned commit. No live backend, so nothing can break.
 */

export type Verdict = {
  action: "pass" | "stop" | "refuse" | string;
  class: string;
  classLabel: string;
  summary: string;
  trustable: boolean | null;
};
export type DemoAction = {
  id: string;
  label: string;
  tool: string;
  input: Record<string, string | undefined>;
  verdict: Verdict;
};

const actions = demo.actions as DemoAction[];
const copy = site.assistant.gates;

/** How the agent's call reads, as it would in a terminal or a tool log. */
export function renderCall(a: DemoAction): string {
  if (a.tool === "Bash") return `$ ${a.input.command}`;
  if (a.tool === "Read") return `Read ${a.input.file_path}`;
  const args = Object.entries(a.input)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: "${v}"`)
    .join(", ");
  return `${a.tool}({ ${args} })`;
}

export function GatesDemo() {
  const [selected, setSelected] = useState<string>("push");
  const verdictRef = useRef<HTMLDivElement>(null);

  // On a phone the list is long, so bring the verdict back into view.
  function choose(id: string) {
    setSelected(id);
    const el = verdictRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 64 || top > window.innerHeight - 120) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollBy({ top: top - 88, behavior: reduce ? "auto" : "smooth" });
    }
  }
  const current = actions.find((a) => a.id === selected) ?? actions[0];
  const v = current.verdict;
  const tone = v.action === "pass" ? "pass" : v.action === "stop" ? "stop" : "refuse";

  return (
    <div className="space-y-4 px-4 py-4 sm:px-5">
      <p className="text-sm leading-relaxed text-ink-muted">{copy.intro}</p>

      {/* The verdict */}
      <div
        ref={verdictRef}
        aria-live="polite"
        data-testid="gates-verdict"
        data-verdict={v.action}
        className={cn(
          "relative overflow-hidden rounded-xl border p-4 transition-colors",
          tone === "pass" && "border-line bg-surface/[0.03]",
          tone === "stop" && "border-accent/45 bg-accent/[0.08]",
          tone === "refuse" && "border-ink/30 bg-surface/[0.06]",
        )}
      >
        <p className="break-words font-mono text-[12px] text-ink">{renderCall(current)}</p>
        <div className="mt-3 flex items-center gap-2.5">
          <VerdictIcon tone={tone} />
          <p className="font-display text-xl font-semibold tracking-tight text-ink">
            {copy.verdicts[tone as keyof typeof copy.verdicts]}
          </p>
        </div>
        <div className="mt-2 space-y-1 text-sm text-ink-muted">
          {tone === "pass" && <p>{copy.passNote}</p>}
          {tone !== "pass" && (
            <p>
              {v.summary.replace(/:.*$/, "")}
              <span className="text-ink-faint">
                {" "}
                · class <span className="font-mono text-[12px]">{v.class}</span>
              </span>
            </p>
          )}
          {tone === "stop" && (
            <p className="text-ink-faint">{v.trustable ? copy.trustable : copy.neverTrustable}</p>
          )}
          {tone === "refuse" && <p className="text-ink-faint">{copy.refuseNote}</p>}
          {tone === "stop" && <p className="text-ink-faint">{copy.phoneNote}</p>}
        </div>
      </div>

      {/* The choices */}
      <div role="radiogroup" aria-label="Agent actions" className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {actions.map((a) => {
          const on = a.id === current.id;
          const t = a.verdict.action;
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => choose(a.id)}
              className={cn(
                "flex min-h-[44px] items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors",
                on
                  ? "border-accent/50 bg-accent/10 text-ink"
                  : "border-line bg-surface/[0.02] text-ink-muted hover:border-ink/25 hover:text-ink",
              )}
            >
              <span className="min-w-0 truncate">{a.label}</span>
              <span
                aria-hidden
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  t === "pass" ? "bg-ink-faint" : t === "stop" ? "bg-accent" : "bg-ink",
                )}
              />
            </button>
          );
        })}
      </div>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] text-ink-faint">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
        <span>
          {copy.realOutput} v{demo.source.version}
        </span>
        <span aria-hidden>·</span>
        <a
          href={demo.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-line underline-offset-2 hover:text-ink"
        >
          classify() at {demo.source.commit.slice(0, 7)}
        </a>
        <span aria-hidden>·</span>
        <span>generated {demo.generatedAt}</span>
      </p>
    </div>
  );
}

function VerdictIcon({ tone }: { tone: "pass" | "stop" | "refuse" }) {
  const common = "h-7 w-7 shrink-0 rounded-full grid place-items-center";
  if (tone === "pass")
    return (
      <span className={cn(common, "border border-line text-ink-muted")} aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    );
  if (tone === "stop")
    return (
      <span className={cn(common, "bg-accent text-base-900")} aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M9 6v12M15 6v12" />
        </svg>
      </span>
    );
  return (
    <span className={cn(common, "bg-ink text-base-900")} aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </span>
  );
}
