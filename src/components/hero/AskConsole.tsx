"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { type AskAction, fallbackText } from "@/lib/assistant";
import { useWindows } from "@/components/windows/WindowsProvider";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  actions?: AskAction[];
  /** Marks a message that came from a graceful fallback, not the live model. */
  error?: boolean;
}

const { console: consoleCopy } = site.hero;
const HISTORY_LIMIT = 6;

interface AskApiResponse {
  text?: string;
  actions?: AskAction[];
  error?: string;
}

/**
 * The hero "ask" console: an AI-chat surface that turns the landing page
 * into something you interact with. Each prompt is forwarded to /api/ask,
 * which runs the live Claude Sonnet 4.6 model behind strict guardrails
 * grounded in the site's own content. Action buttons are still chosen
 * deterministically on the server so they stay safe.
 *
 * Lives in the root layout so state survives navigation: closing a window
 * returns you to the same conversation, intact.
 */
export function AskConsole() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", text: consoleCopy.welcome },
  ]);
  const [input, setInput] = useState("");
  const [responding, setResponding] = useState(false);
  const idRef = useRef(1);
  const threadRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, responding]);

  // Tear down any in-flight request on unmount (e.g. fast nav away).
  useEffect(() => () => abortRef.current?.abort(), []);

  function submit(query: string) {
    const text = query.trim();
    if (!text || responding) return;

    const userMsg: Message = { id: idRef.current++, role: "user", text };
    // Build the history payload from messages BEFORE this turn (no welcome).
    const history = [...messages, userMsg]
      .filter((m) => m.id !== 0)
      .slice(-HISTORY_LIMIT - 1, -1)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setResponding(true);

    const controller = new AbortController();
    abortRef.current = controller;

    fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as AskApiResponse;
        const replyText =
          (typeof data.text === "string" && data.text.trim()) || fallbackText();
        setMessages((m) => [
          ...m,
          {
            id: idRef.current++,
            role: "assistant",
            text: replyText,
            actions: data.actions ?? [],
            error: !res.ok,
          },
        ]);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((m) => [
          ...m,
          {
            id: idRef.current++,
            role: "assistant",
            text: fallbackText(),
            error: true,
          },
        ]);
      })
      .finally(() => {
        if (abortRef.current === controller) abortRef.current = null;
        setResponding(false);
      });
  }

  function cancel() {
    abortRef.current?.abort();
  }

  return (
    <div className="mx-auto w-full max-w-2xl text-left">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface/[0.03] shadow-card">
        <div
          ref={threadRef}
          aria-live="polite"
          className="max-h-[46svh] min-h-[18svh] space-y-4 overflow-y-auto px-4 py-5 sm:px-5"
        >
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex animate-fade-in justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent/15 px-4 py-2.5 text-sm text-ink">
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex animate-fade-in gap-3">
                <Image
                  src="/lion-white.png"
                  alt=""
                  aria-hidden
                  width={30}
                  height={30}
                  className="assistant-mark mt-0.5 shrink-0 size-[24px] sm:size-[30px]"
                />
                <div className="max-w-[90%] space-y-3">
                  <p
                    className={
                      "rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed text-ink-muted " +
                      (m.error
                        ? "bg-surface/[0.03] ring-1 ring-inset ring-ink/10"
                        : "bg-surface/[0.05]")
                    }
                  >
                    {m.text}
                  </p>
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {m.actions.map((a, i) => (
                        <ActionButton key={i} action={a} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}

          {responding && (
            <div className="flex gap-3" aria-label="Thinking">
              <Image
                src="/lion-white.png"
                alt=""
                aria-hidden
                width={30}
                height={30}
                className="assistant-mark mt-0.5 shrink-0 size-[24px] sm:size-[30px]"
              />
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
            id="ask-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={consoleCopy.placeholder}
            autoComplete="off"
            maxLength={800}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          {responding ? (
            <button
              type="button"
              onClick={cancel}
              aria-label="Stop"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-ink-muted transition-colors hover:border-ink/30 hover:text-ink sm:h-9 sm:w-9"
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
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-base-900 transition-opacity hover:opacity-90 disabled:opacity-40 sm:h-9 sm:w-9"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </form>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent))]" />
        <span className="font-mono">Live · Claude Sonnet 4.6 · grounded in this site</span>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {consoleCopy.suggestions.map((s) => (
          <button
            key={s.query}
            type="button"
            onClick={() => submit(s.query)}
            disabled={responding}
            className="rounded-full border border-line bg-surface/[0.03] px-3.5 py-2 text-xs text-ink-muted transition-colors hover:border-ink/25 hover:text-ink disabled:opacity-50 sm:py-1.5"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionButton({ action }: { action: AskAction }) {
  const { openWindow } = useWindows();
  if (action.kind === "link") {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-surface/[0.06]"
        style={
          action.accent
            ? { borderColor: action.accent, color: action.accent }
            : undefined
        }
      >
        {action.label}
        <span aria-hidden>↗</span>
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => openWindow(action.key)}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/[0.03] px-3.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
    >
      {action.label}
      <span aria-hidden>↗</span>
    </button>
  );
}
