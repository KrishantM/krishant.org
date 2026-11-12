"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { site } from "@/content/site";
import type { AssistantResponse, FitResult } from "@/lib/assistant";

const copy = site.assistant.fit;

export interface FitCheckHandle {
  focus: () => void;
}

/**
 * "Fit check": a visitor pastes a job description and gets each requirement
 * mapped to evidence on this page. Anything the evidence doesn't cover is
 * offered as a conversation topic, never listed as a gap.
 */
export const FitCheck = forwardRef<FitCheckHandle>(function FitCheck(_props, ref) {
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<FitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => areaRef.current?.focus({ preventScroll: true }),
  }));

  async function submit() {
    const text = jd.trim();
    if (busy) return;
    if (text.length < copy.minLength) {
      setError(copy.tooShort);
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "fit", message: text }),
      });
      const data = (await res.json().catch(() => ({}))) as AssistantResponse;
      if (data.fit) setResult(data.fit);
      else setError(data.text || site.assistant.errors.generic);
    } catch {
      setError(site.assistant.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="thin-scroll max-h-[70svh] space-y-4 overflow-y-auto px-4 py-4 sm:max-h-[560px] sm:px-5">
      <p className="text-sm leading-relaxed text-ink-muted">{copy.intro}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="space-y-2"
      >
        <label htmlFor="fit-input" className="sr-only">
          Job description
        </label>
        <textarea
          ref={areaRef}
          id="fit-input"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder={copy.placeholder}
          maxLength={copy.maxLength}
          rows={6}
          className="thin-scroll block w-full resize-y rounded-xl border border-line bg-surface/[0.03] px-3.5 py-3 text-[1rem] leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent/50 sm:text-sm"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10.5px] text-ink-faint">
            {jd.length.toLocaleString()} / {copy.maxLength.toLocaleString()}
          </span>
          <button
            type="submit"
            disabled={busy || !jd.trim()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-base-900 transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Mapping..." : copy.submit}
          </button>
        </div>
      </form>

      <div aria-live="polite" className="space-y-4">
        {busy && (
          <div className="space-y-2" aria-label="Mapping the job description">
            {[0, 1, 2].map((i) => (
              <div key={i} className="shimmer-line h-12 rounded-lg" />
            ))}
          </div>
        )}

        {error && !busy && <p className="rounded-lg bg-surface/[0.04] px-3.5 py-2.5 text-sm text-ink-muted">{error}</p>}

        {result && !busy && (
          <div className="space-y-5" data-testid="fit-result">

            {result.matches.length > 0 && (
              <div>
                <h3 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{copy.matchesHeading}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">{copy.sourceNote}</p>
                <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                  {result.matches.map((m, i) => (
                    <li key={i} className="p-3.5" data-testid="fit-match">
                      <p className="text-sm font-medium text-ink">{m.requirement}</p>
                      <ul className="mt-2 space-y-2">
                        {m.evidence.map((e) => {
                          const external = /^https?:/.test(e.href);
                          return (
                            <li key={e.id} className="border-l-2 border-accent/40 pl-3">
                              <a
                                href={e.href}
                                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                className="inline-flex min-h-[32px] items-center gap-1 text-[13px] font-medium text-ink underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
                              >
                                {e.title}
                                <span aria-hidden className="text-ink-faint">
                                  {external ? "↗" : "↓"}
                                </span>
                              </a>
                              <p className="text-[13px] leading-relaxed text-ink-muted" data-testid="fit-evidence-text">
                                {e.text}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.discuss.length > 0 && (
              <div className="rounded-xl border border-line bg-surface/[0.03] p-3.5" data-testid="fit-discuss">
                <h3 className="font-display text-[1rem] font-semibold text-ink">{copy.discussHeading}</h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {result.discuss.map((d) => (
                    <li key={d} className="rounded-full border border-line px-3 py-1 text-[12px] text-ink-muted">
                      {d}
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                >
                  {copy.discussCta} <span aria-hidden>→</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
