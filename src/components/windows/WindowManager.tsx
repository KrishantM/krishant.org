"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { site } from "@/content/site";
import { useWindows, type WindowKey } from "./WindowsProvider";
import { Window } from "./Window";
import {
  VenturesIcon,
  MapIcon,
  CredentialsIcon,
  AboutIcon,
  ConnectIcon,
} from "@/components/layout/SidebarIcons";

// Each view is code-split and fetched only when its window is first opened,
// keeping the views out of the initial layout bundle.
const VenturesView = dynamic(
  () => import("./views/VenturesView").then((m) => ({ default: m.VenturesView })),
  { ssr: false },
);
const MapView = dynamic(
  () => import("./views/MapView").then((m) => ({ default: m.MapView })),
  { ssr: false },
);
const CredentialsView = dynamic(
  () => import("./views/CredentialsView").then((m) => ({ default: m.CredentialsView })),
  { ssr: false },
);
const AboutView = dynamic(
  () => import("./views/AboutView").then((m) => ({ default: m.AboutView })),
  { ssr: false },
);
const ConnectView = dynamic(
  () => import("./views/ConnectView").then((m) => ({ default: m.ConnectView })),
  { ssr: false },
);

const VIEWS: Record<WindowKey, { title: string; render: () => React.ReactNode }> = {
  ventures: { title: "Ventures", render: () => <VenturesView /> },
  map: { title: "The map", render: () => <MapView /> },
  credentials: { title: "Credentials", render: () => <CredentialsView /> },
  about: { title: "About me", render: () => <AboutView /> },
  connect: { title: "Connect", render: () => <ConnectView /> },
};

const ICONS: Record<WindowKey, React.ComponentType<{ className?: string }>> = {
  ventures: VenturesIcon,
  map: MapIcon,
  credentials: CredentialsIcon,
  about: AboutIcon,
  connect: ConnectIcon,
};

/**
 * Mobile-only full-screen view. Renders when at least one window is open on
 * a narrow screen. Shows the topmost (most recently focused) section with a
 * back button and a section tab strip — no overlapping, no drag/resize.
 */
function MobileView() {
  const { state, closeAll, openWindow } = useWindows();
  const openKeys = Object.keys(state.windows) as WindowKey[];

  if (openKeys.length === 0) return null;

  // The topZ window is the active section.
  const activeKey = openKeys.reduce((best, k) =>
    (state.windows[k]?.z ?? 0) > (state.windows[best]?.z ?? 0) ? k : best,
  );

  const { title, render } = VIEWS[activeKey];

  return (
    <div
      role="region"
      aria-label={title}
      className="fixed inset-0 z-30 flex flex-col bg-base animate-panel-in motion-reduce:animate-none md:hidden"
    >
      {/* Title bar — pr-16 leaves room for the ThemeToggle corner float (z-40). */}
      <div className="flex shrink-0 items-center gap-3 border-b border-line bg-surface/[0.05] px-4 pr-16 py-3">
        <button
          type="button"
          onClick={closeAll}
          aria-label="Back to console"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-faint transition-colors hover:bg-surface/[0.08] hover:text-ink"
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
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent))]" />
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
          {title}
        </h2>
      </div>

      {/* Scrollable section content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-9">
        {render()}
      </div>

      {/* Section tab strip — mirrors the Sidebar bottom nav style */}
      <nav
        aria-label="Sections"
        className="flex shrink-0 items-center justify-around border-t border-line bg-base/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2"
      >
        {site.nav.map((item) => {
          const key = item.key as WindowKey;
          const Icon = ICONS[key];
          const active = key === activeKey;
          return (
            <button
              key={key}
              type="button"
              aria-label={item.label}
              aria-pressed={active}
              onClick={() => openWindow(key)}
              className={cn(
                "relative grid h-12 w-12 place-items-center rounded-full transition-colors",
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
    </div>
  );
}

/**
 * Renders every open window above the console on desktop. The wrapper is
 * `pointer-events-none` so empty space lets clicks fall through to the
 * console behind; each Window switches back to `pointer-events-auto`.
 *
 * On mobile, Window components hide themselves (max-md:hidden) and MobileView
 * takes over — one full-screen section at a time.
 */
export function WindowManager() {
  const { state } = useWindows();
  const openKeys = Object.keys(state.windows) as WindowKey[];

  return (
    <>
      <div
        aria-label="Windows"
        className="pointer-events-none fixed inset-0 z-30 md:left-16"
      >
        <div className="relative h-full w-full">
          {openKeys.map((k) => {
            const { title, render } = VIEWS[k];
            return (
              <Window key={k} windowKey={k} title={title}>
                {render()}
              </Window>
            );
          })}
        </div>
      </div>
      <MobileView />
    </>
  );
}
