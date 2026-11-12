"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { site } from "@/content/site";
import type { AskAction, AssistantResponse, CodeCard as CodeCardData } from "@/lib/assistant";
import { CodeCard } from "./CodeCard";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  actions?: AskAction[];
  code?: CodeCardData[];
  error?: boolean;
}

const copy = site.assistant.ask;
const HISTORY_LIMIT = 6;

export interface AskModeHandle {
  focus: () => void;
  ask: (q: string) => void;
}

/**
 * "Ask": questions about Krishant's work. Code questions come back with the
 * excerpts the answer relied on, as cards that link to the exact lines.
 */
export const AskMode = forwardRef<AskModeHandle>(function AskMode(_props, ref) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const idRef = useRef(1);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus({ preventScroll: true }),
    ask: (q: string) => submit(q),
  }));

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [messages, busy]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function submit(query: string) {
    const text = query.trim();
    if (!text || busy) return;
    const userMsg: Message = { id: idRef.current++, role: "user", text };
    const history = messages
      .filter((m) => !m.error)
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "ask", message: text, history }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as AssistantResponse;
        setMessages((m) => [
          ...m,
          {
            id: idRef.current++,
            role: "assistant",
            text: (typeof data.text === "string" && data.text.trim()) || site.assistant.errors.generic,
            actions: data.actions ?? [],
            code: data.code ?? [],
            error: !res.ok,
          },
        ]);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((m) => [
          ...m,
          { id: idRef.current++, role: "assistant", text: site.assistant.errors.generic, error: true },
        ]);
      })
      .finally(() => {
        if (abortRef.current === controller) abortRef.current = null;
        setBusy(false);
      });
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={threadRef}
        aria-live="polite"
        className="thin-scroll max-h-[52svh] min-h-[220px] flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:max-h-[440px] sm:px-5"
      >
        <AssistantBubble text={copy.welcome} />
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pl-9">
            {copy.suggestions.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => submit(s.query)}
                className="min-h-[40px] rounded-full border border-line bg-surface/[0.03] px-3.5 py-2 text-left text-xs text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex animate-fade-in justify-end">
              <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-accent/15 px-4 py-2.5 text-sm text-ink">
                {m.text}
              </p>
            </div>
          ) : (
            <div key={m.id} className="animate-fade-in space-y-3">
              <AssistantBubble text={m.text} error={m.error} />
              {m.code && m.code.length > 0 && (
                <div className="space-y-2 pl-9" data-testid="code-cards">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{copy.codeNote}</p>
                  {m.code.map((c) => (
                    <CodeCard key={`${c.repo}/${c.path}:${c.startLine}`} card={c} />
                  ))}
                </div>
              )}
              {m.actions && m.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-9">
                  {m.actions.map((a) => {
                    const external = /^https?:|^mailto:/.test(a.href);
                    return (
                      <a
                        key={a.href}
                        href={a.href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line bg-surface/[0.03] px-3.5 text-xs font-medium text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
                      >
                        {a.label}
                        <span aria-hidden>{external ? "↗" : "↓"}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          ),
        )}
        {busy && (
          <div className="flex items-center gap-3" aria-label="Thinking">
            <Mark />
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-surface/[0.05] px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2 border-t border-line p-2.5"
      >
        <label htmlFor="ask-input" className="sr-only">
          Ask a question about my work
        </label>
        <input
          ref={inputRef}
          id="ask-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={copy.placeholder}
          autoComplete="off"
          maxLength={800}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[1rem] text-ink outline-none placeholder:text-ink-faint sm:text-sm"
        />
        {busy ? (
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            aria-label="Stop"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-ink-muted transition-colors hover:text-ink"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <rect width="10" height="10" rx="1.5" fill="currentColor" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            aria-label="Send"
            disabled={!input.trim()}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-base-900 transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
});

function Mark() {
  return (
    <span
      aria-hidden
      className="relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10"
    >
      <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent))]" />
    </span>
  );
}

function AssistantBubble({ text, error }: { text: string; error?: boolean }) {
  return (
    <div className="flex gap-3">
      <Mark />
      <p
        className={
          "max-w-[92%] whitespace-pre-line rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed text-ink-muted " +
          (error ? "bg-surface/[0.03] ring-1 ring-inset ring-ink/10" : "bg-surface/[0.05]")
        }
      >
        {text}
      </p>
    </div>
  );
}
