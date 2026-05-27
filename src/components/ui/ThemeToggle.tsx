"use client";

import { cn } from "@/lib/utils";

/**
 * Warm-dark / warm-light toggle. Icon visibility is purely CSS-driven via the
 * Tailwind `dark:` variant (wired to [data-theme="dark"]), so there's no
 * hydration mismatch and no flash. The click just flips the attribute and
 * remembers the choice. The no-flash bootstrap script lives in layout.tsx.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next =
      root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage may be unavailable; the toggle still works for the session */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light or dark theme"
      title="Toggle theme"
      className={cn(
        "group relative grid h-10 w-10 place-items-center rounded-full border border-line bg-surface/[0.04] text-ink-muted transition-all hover:border-ink/25 hover:text-ink",
        className,
      )}
    >
      {/* Sun — shown in light theme */}
      <svg
        className="theme-icon-sun h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      {/* Moon — shown in dark theme */}
      <svg
        className="theme-icon-moon h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
