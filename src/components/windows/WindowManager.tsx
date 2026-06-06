"use client";

import { lazy, Suspense } from "react";
import { useWindows, type WindowKey } from "./WindowsProvider";
import { Window } from "./Window";

// Views are code-split: their modules (and sub-trees) are fetched only when a
// window is first opened, keeping them out of the first-paint bundle.
const VenturesView = lazy(() =>
  import("./views/VenturesView").then((m) => ({ default: m.VenturesView })),
);
const MapView = lazy(() =>
  import("./views/MapView").then((m) => ({ default: m.MapView })),
);
const CredentialsView = lazy(() =>
  import("./views/CredentialsView").then((m) => ({ default: m.CredentialsView })),
);
const AboutView = lazy(() =>
  import("./views/AboutView").then((m) => ({ default: m.AboutView })),
);
const ConnectView = lazy(() =>
  import("./views/ConnectView").then((m) => ({ default: m.ConnectView })),
);

const VIEWS: Record<WindowKey, { title: string; View: React.ComponentType }> = {
  ventures: { title: "Ventures", View: VenturesView },
  map: { title: "The map", View: MapView },
  credentials: { title: "Credentials", View: CredentialsView },
  about: { title: "About me", View: AboutView },
  connect: { title: "Connect", View: ConnectView },
};

function WindowLoading() {
  return (
    <div className="flex h-32 items-center justify-center">
      <span className="flex gap-1.5" aria-label="Loading">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </div>
  );
}

/**
 * Renders every open window above the console. The wrapper is `pointer-events-
 * none` so empty space lets clicks fall through to the console behind; each
 * window switches back to `pointer-events-auto` on itself.
 */
export function WindowManager() {
  const { state } = useWindows();
  const openKeys = Object.keys(state.windows) as WindowKey[];

  return (
    <div
      aria-label="Windows"
      className="pointer-events-none fixed inset-0 z-30 md:left-16"
    >
      <div className="relative h-full w-full">
        {openKeys.map((k) => {
          const { title, View } = VIEWS[k];
          return (
            <Window key={k} windowKey={k} title={title}>
              <Suspense fallback={<WindowLoading />}>
                <View />
              </Suspense>
            </Window>
          );
        })}
      </div>
    </div>
  );
}
