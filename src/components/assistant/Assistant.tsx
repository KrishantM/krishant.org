"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import { AskMode, type AskModeHandle } from "./AskMode";
import { FitCheck, type FitCheckHandle } from "./FitCheck";
import { GatesDemo } from "./GatesDemo";
import { OPEN_EVENT, type AssistantTab } from "./open";

const TABS: AssistantTab[] = ["ask", "gates", "fit"];
const copy = site.assistant;

/**
 * The assistant in the hero: three modes behind one set of tabs. All three
 * stay mounted, so switching tabs keeps a conversation or a pasted job
 * description intact. Server-rendered with its initial state, so the page
 * has real content before any script runs.
 */
export function Assistant() {
  const [tab, setTab] = useState<AssistantTab>("ask");
  const rootRef = useRef<HTMLDivElement>(null);
  const askRef = useRef<AskModeHandle>(null);
  const fitRef = useRef<FitCheckHandle>(null);
  const tabRefs = useRef<Record<AssistantTab, HTMLButtonElement | null>>({ ask: null, gates: null, fit: null });

  useEffect(() => {
    function open(next: AssistantTab, prefill?: string) {
      setTab(next);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      rootRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      window.setTimeout(() => {
        if (next === "ask") {
          if (prefill) askRef.current?.ask(prefill);
          else askRef.current?.focus();
        } else if (next === "fit") fitRef.current?.focus();
        else tabRefs.current.gates?.focus({ preventScroll: true });
      }, reduce ? 0 : 450);
    }
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ tab: AssistantTab; prefill?: string }>).detail;
      if (detail && TABS.includes(detail.tab)) open(detail.tab, detail.prefill);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    // Deep links: /#ask, /#try-gates and /#fit-check open those modes.
    const hash = window.location.hash;
    if (hash === "#ask") open("ask");
    if (hash === "#try-gates") open("gates");
    if (hash === "#fit-check") open("fit");
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = TABS.indexOf(tab);
    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div
      ref={rootRef}
      id="ask"
      className="relative overflow-hidden rounded-2xl border border-line bg-base-800/80 shadow-card backdrop-blur-xl"
    >
      <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative flex items-center justify-between gap-3 border-b border-line px-4 pb-0 pt-3 sm:px-5">
        <p className="flex items-center gap-2 pb-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent))]" />
          {copy.label}
        </p>
      </div>

      <div role="tablist" aria-label={copy.label} className="relative flex gap-1 border-b border-line px-2 sm:px-3">
        {TABS.map((t) => (
          <button
            key={t}
            ref={(el) => {
              tabRefs.current[t] = el;
            }}
            id={`tab-${t}`}
            role="tab"
            type="button"
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            onKeyDown={onTabKey}
            className={cn(
              "relative min-h-[44px] min-w-[44px] whitespace-nowrap px-2.5 text-[13px] font-medium transition-colors sm:px-3.5",
              tab === t ? "text-ink" : "text-ink-faint hover:text-ink-muted",
            )}
          >
            {copy.tabs[t]}
            {tab === t && (
              <span aria-hidden className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent))]" />
            )}
          </button>
        ))}
      </div>

      <div className="relative">
        <div role="tabpanel" id="panel-ask" aria-labelledby="tab-ask" hidden={tab !== "ask"}>
          <AskMode ref={askRef} />
        </div>
        <div role="tabpanel" id="panel-gates" aria-labelledby="tab-gates" hidden={tab !== "gates"}>
          <GatesDemo />
        </div>
        <div role="tabpanel" id="panel-fit" aria-labelledby="tab-fit" hidden={tab !== "fit"}>
          <FitCheck ref={fitRef} />
        </div>
      </div>

      <p className="relative border-t border-line px-4 py-2.5 text-[11px] leading-snug text-ink-faint sm:px-5">{copy.honesty}</p>
    </div>
  );
}
