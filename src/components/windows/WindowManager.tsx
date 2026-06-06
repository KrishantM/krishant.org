"use client";

import dynamic from "next/dynamic";
import { useWindows, type WindowKey } from "./WindowsProvider";
import { Window } from "./Window";

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
          const { title, render } = VIEWS[k];
          return (
            <Window key={k} windowKey={k} title={title}>
              {render()}
            </Window>
          );
        })}
      </div>
    </div>
  );
}
