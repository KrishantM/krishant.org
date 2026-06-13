"use client";

import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useWindows, type WindowKey } from "@/components/windows/WindowsProvider";
import {
  AboutIcon,
  ConnectIcon,
  CredentialsIcon,
  MapIcon,
  VenturesIcon,
} from "./SidebarIcons";

const ICONS: Record<WindowKey, React.ComponentType<{ className?: string }>> = {
  ventures: VenturesIcon,
  map: MapIcon,
  credentials: CredentialsIcon,
  about: AboutIcon,
  connect: ConnectIcon,
};

interface HomeMarkProps {
  active: boolean;
  onClick: () => void;
}

function HomeMark({ active, onClick }: HomeMarkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${site.fullName}, back to the console`}
      aria-pressed={active}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-full border font-display text-base font-semibold transition-all md:h-10 md:w-10",
        active
          ? "border-accent/40 bg-accent/15 text-accent shadow-[0_0_18px_rgb(var(--accent)/0.35)]"
          : "border-line bg-surface/[0.04] text-ink hover:border-ink/30",
      )}
    >
      K
    </button>
  );
}

/**
 * Sidebar — central nav. Each icon toggles its window: click an icon to
 * open that window (or focus it if already open). Active state reflects
 * whether the window is currently open. The K monogram closes every open
 * window, returning you to the bare console.
 *
 * Two presentations: a fixed left rail on desktop, and a bottom tab bar +
 * floating K / theme toggle on mobile.
 */
export function Sidebar() {
  const { isOpen, openWindow, focusWindow, closeWindow, closeAll, state } =
    useWindows();
  const noWindowsOpen = Object.keys(state.windows).length === 0;

  // Toggle: clicking an open, focused window's icon closes it. If the window
  // is open but behind something else, click brings it to the front first.
  function handleSidebarClick(key: WindowKey) {
    if (!isOpen(key)) {
      openWindow(key);
      return;
    }
    const win = state.windows[key];
    if (win && win.z === state.topZ) {
      closeWindow(key);
    } else {
      focusWindow(key);
    }
  }

  return (
    <>
      {/* DESKTOP — left rail */}
      <aside
        aria-label="Sidebar"
        className="fixed left-0 top-0 z-40 hidden h-svh w-16 flex-col items-center justify-between border-r border-line bg-base/85 py-5 md:flex"
      >
        <HomeMark active={noWindowsOpen} onClick={closeAll} />

        <nav aria-label="Primary" className="flex flex-col gap-1.5">
          {site.nav.map((item) => {
            const key = item.key as WindowKey;
            const Icon = ICONS[key];
            const active = isOpen(key);
            return (
              <button
                key={key}
                type="button"
                aria-label={item.label}
                aria-pressed={active}
                onClick={() => handleSidebarClick(key)}
                className={cn(
                  "icon-trigger group relative grid h-10 w-10 place-items-center rounded-full transition-colors",
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon className="h-[22px] w-[22px]" />
                {active && (
                  <span
                    aria-hidden
                    className="absolute -left-2 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent))]"
                  />
                )}
                <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md border border-line bg-base/95 px-2.5 py-1 font-mono text-[11px] text-ink opacity-0 shadow-card transition-opacity duration-150 group-hover:opacity-100">
                  {item.tooltip}
                </span>
              </button>
            );
          })}
        </nav>

        <ThemeToggle />
      </aside>

      {/* MOBILE — corner floats + bottom nav */}
      {/* K button and bottom nav hide when a section is open — MobileView has its own tabs. */}
      {noWindowsOpen && (
        <div className="fixed left-4 top-4 z-40 md:hidden">
          <HomeMark active={noWindowsOpen} onClick={closeAll} />
        </div>
      )}
      <div className="fixed right-4 top-4 z-40 md:hidden">
        <ThemeToggle className="h-11 w-11" />
      </div>

      {noWindowsOpen && (
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-base/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 md:hidden"
        >
          {site.nav.map((item) => {
            const key = item.key as WindowKey;
            const Icon = ICONS[key];
            const active = isOpen(key);
            return (
              <button
                key={key}
                type="button"
                aria-label={item.label}
                aria-pressed={active}
                onClick={() => handleSidebarClick(key)}
                className={cn(
                  "icon-trigger relative grid h-12 w-12 place-items-center rounded-full transition-colors",
                  active ? "text-accent" : "text-ink-muted",
                )}
              >
                <Icon className="h-6 w-6" />
                {active && (
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent"
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
