"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PanelProps {
  /** Heading displayed at the top of the panel. */
  title: string;
  /** Optional one-line description under the title. */
  description?: string;
  /** Optional content slotted above the title (badges, breadcrumbs). */
  eyebrow?: React.ReactNode;
  children: React.ReactNode;
  /** Drop the inner max-width for full-bleed content (e.g. the venture map). */
  fullBleed?: boolean;
  /** Route to navigate to on close. Defaults to "/" (the bare console). */
  closeHref?: string;
}

/**
 * Overlay panel that renders over the persistent AskConsole. Each route
 * (`/ventures`, `/map`, …) renders its content inside one of these. Closing
 * (X, Escape, backdrop click) navigates back to `closeHref` (default `/`) so
 * the bare console returns, with its conversation intact. Nested routes
 * (e.g. `/ventures/[slug]`) set `closeHref="/ventures"` to return to the
 * parent overlay.
 */
export function Panel({
  title,
  description,
  eyebrow,
  children,
  fullBleed,
  closeHref = "/",
}: PanelProps) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") router.push(closeHref);
    }
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [router, closeHref]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
      className="fixed inset-0 z-30 animate-panel-in overflow-y-auto bg-base/85 md:left-16"
      onClick={(e) => {
        if (e.target === e.currentTarget) router.push(closeHref);
      }}
    >
      <div
        className={cn(
          "relative mx-auto w-full px-5 pb-28 pt-20 sm:px-8 md:px-12 md:pb-16 md:pt-14",
          fullBleed ? "max-w-none" : "max-w-5xl",
        )}
      >
        <header className="mb-10 flex items-start justify-between gap-6 sm:mb-14">
          <div className="max-w-2xl">
            {eyebrow && <div className="mb-4">{eyebrow}</div>}
            <h1
              id="panel-title"
              className="text-balance font-display text-3xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-4xl md:text-5xl"
            >
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-pretty text-base leading-relaxed text-ink-muted sm:mt-4 sm:text-lg">
                {description}
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => router.push(closeHref)}
            aria-label="Close panel"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-surface/[0.04] text-ink-muted transition-all hover:border-ink/30 hover:text-ink"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}
