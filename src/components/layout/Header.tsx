"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Maps each in-page section id to the nav item that should glow while it's in
 * view. The constellation (`map`) and CreatorHQ (`creatorhq`) sections roll up
 * to "Ventures" so the highlight reads intuitively while scrolling that band.
 */
const SECTION_TO_NAV: Record<string, string> = {
  ventures: "#ventures",
  map: "#ventures",
  creatorhq: "#ventures",
  credentials: "#credentials",
  who: "#who",
  connect: "#connect",
};
const SECTION_IDS = Object.keys(SECTION_TO_NAV);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const reduce = useReducedMotion();

  // Single rAF-throttled scroll handler drives both the header background and
  // the active-section scroll-spy.
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      setScrolled(window.scrollY > 12);

      // Reference line a little below the fixed header.
      const line = window.scrollY + 160;
      let current = "";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (line >= top) current = SECTION_TO_NAV[id];
      }
      setActiveHref(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-line bg-base/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-shell items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-baseline gap-1.5 font-semibold tracking-tightest text-ink"
          aria-label={`${site.fullName} — home`}
        >
          <span className="text-lg">{site.name}</span>
          <span className="font-mono text-xs text-ink-faint transition-colors group-hover:text-accent-indigo">
            .org
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {site.nav.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm transition-colors",
                  isActive ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-white/10"
                    style={{ boxShadow: "0 0 22px rgba(124,139,255,0.5)" }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 380, damping: 32 }
                    }
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
          <a
            href={`mailto:${site.contact.email}`}
            className="ml-2 rounded-full border border-line bg-white/[0.03] px-4 py-2 text-sm font-medium text-ink backdrop-blur transition-all hover:border-white/25 hover:bg-white/[0.06]"
          >
            Email me
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/[0.03] text-ink md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <div className="flex flex-col gap-1.5">
            <span
              className={cn(
                "h-px w-5 bg-current transition-transform duration-300",
                open && "translate-y-[3.5px] rotate-45",
              )}
            />
            <span
              className={cn(
                "h-px w-5 bg-current transition-transform duration-300",
                open && "-translate-y-[3.5px] -rotate-45",
              )}
            />
          </div>
        </button>
      </div>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-base/95 backdrop-blur-xl md:hidden"
          >
            <nav
              className="flex h-full flex-col justify-center gap-2 px-8"
              aria-label="Mobile"
            >
              {site.nav.map((item, i) => {
                const isActive = activeHref === item.href;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i + 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex items-center gap-3 py-3 text-3xl font-semibold tracking-tightest transition-colors",
                        isActive ? "text-ink" : "text-ink-muted",
                      )}
                    >
                      {isActive && (
                        <span
                          aria-hidden
                          className="h-2 w-2 rounded-full bg-accent-indigo shadow-[0_0_12px_#7c8bff]"
                        />
                      )}
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
              <a
                href={`mailto:${site.contact.email}`}
                onClick={() => setOpen(false)}
                className="mt-6 inline-flex w-fit rounded-full bg-ink px-6 py-3 text-sm font-medium text-base-900"
              >
                Email me
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
