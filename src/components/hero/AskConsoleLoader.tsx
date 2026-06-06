"use client";

import dynamic from "next/dynamic";

// Code-split the AskConsole (and its next/image dependency) out of the root
// layout bundle. Using ssr:false because the component depends on browser APIs
// (fetch, AbortController, scroll) and its initial state is always the same
// static welcome message — no meaningful SSR content to lose.
const AskConsole = dynamic(
  () => import("./AskConsole").then((m) => ({ default: m.AskConsole })),
  { ssr: false },
);

export function AskConsoleLoader() {
  return <AskConsole />;
}
