"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { openAssistant } from "@/components/assistant/open";

/**
 * Sticky top bar. Anchor links to the page's sections, an "Ask" shortcut to
 * the assistant in the hero, and the theme toggle. On phones the links sit
 * in a small disclosure menu.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled || open ? "border-b border-line bg-base/85 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-shell items-center justify-between gap-3 px-4 sm:px-8">
        <a
          href="/#top"
          aria-label={`${site.fullName}, back to the top`}
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface/[0.04] font-display md:h-10 md:w-10 text-[1rem] font-semibold text-ink transition-colors group-hover:border-accent/50 group-hover:text-accent">
            K
          </span>
          <span className="hidden font-hand text-2xl leading-none text-ink sm:inline">{site.name}</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm text-ink-muted transition-colors hover:bg-surface/[0.05] hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openAssistant("ask");
            }}
            className="hidden h-10 items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 text-sm font-medium text-ink transition-colors hover:bg-accent/20 sm:inline-flex"
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent))]" />
            Ask
          </button>
          <ThemeToggle className="h-11 w-11 md:h-10 md:w-10" />
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface/[0.04] text-ink-muted transition-colors hover:text-ink md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-line px-4 pb-4 pt-2 md:hidden">
          <ul className="flex flex-col">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center border-b border-line text-[1rem] text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openAssistant("ask");
                }}
                className="flex min-h-[48px] w-full items-center gap-2 text-left text-[1rem] text-accent"
              >
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                Ask about my work
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
