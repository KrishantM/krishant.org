"use client";

import dynamic from "next/dynamic";

// Code-split the AskConsole (and its next/image dependency) out of the root
// layout bundle. Using ssr:false because the component depends on browser APIs
// (fetch, AbortController, scroll) and its initial state is always the same
// static welcome message — no meaningful SSR content to lose.
//
// The loading skeleton matches the console's collapsed height so the page
// doesn't shift when the chunk arrives (prevents CLS on first load).
function ConsoleSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface/[0.03] shadow-card">
        <div className="min-h-[18svh] px-4 py-5 sm:px-5" />
        <div className="flex items-center gap-2 border-t border-line p-2.5">
          <div className="h-9 flex-1 rounded-full bg-surface/[0.04]" />
          <div className="h-9 w-9 shrink-0 rounded-full bg-surface/[0.04]" />
        </div>
      </div>
    </div>
  );
}

const AskConsole = dynamic(
  () => import("./AskConsole").then((m) => ({ default: m.AskConsole })),
  { ssr: false, loading: ConsoleSkeleton },
);

export function AskConsoleLoader() {
  return <AskConsole />;
}
