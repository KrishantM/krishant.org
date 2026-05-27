"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useWindows, type WindowKey } from "./WindowsProvider";

interface WindowProps {
  windowKey: WindowKey;
  title: string;
  children: React.ReactNode;
}

const MIN_W = 360;
const MIN_H = 300;

/**
 * A single OS-style window: title bar (drag to move) + body (scrollable) +
 * bottom-right corner resize handle. Drag and resize use pointer events on
 * the window for desktop. On screens below `md`, CSS overrides force the
 * window to render full-bleed in the safe area; touch users get a stack of
 * full-screen panels where the top-z window is visually on top.
 */
export function Window({ windowKey, title, children }: WindowProps) {
  const { state, focusWindow, closeWindow, moveWindow, resizeWindow } = useWindows();
  const win = state.windows[windowKey];

  // Local drag offsets are not in state — we track them while a drag is live
  // and commit position/size on every pointer move via the reducer.
  const [drag, setDrag] = useState<
    | null
    | {
        mode: "move" | "resize";
        // Distance between pointer and window origin / size at drag start.
        ox: number;
        oy: number;
      }
  >(null);

  useEffect(() => {
    if (!drag || !win) return;

    function onMove(e: PointerEvent) {
      if (!win) return;
      if (drag!.mode === "move") {
        // Window coords are container-relative (the container starts at the
        // sidebar's right edge on desktop). Since `drag.ox = clientX - win.x`
        // at drag start, `clientX - ox` already yields container coords.
        // Clamp to the canvas so at least 120px of the title bar stays inside.
        const sidebar = window.innerWidth >= 768 ? 64 : 0;
        const canvasW = window.innerWidth - sidebar;
        const canvasH = window.innerHeight;
        const x = Math.max(
          -win.w + 120,
          Math.min(canvasW - 120, e.clientX - drag!.ox),
        );
        const y = Math.max(0, Math.min(canvasH - 60, e.clientY - drag!.oy));
        moveWindow(windowKey, x, y);
      } else {
        const w = Math.max(MIN_W, e.clientX - drag!.ox);
        const h = Math.max(MIN_H, e.clientY - drag!.oy);
        resizeWindow(windowKey, w, h);
      }
    }
    function onUp() {
      setDrag(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, win, windowKey, moveWindow, resizeWindow]);

  if (!win) return null;

  function onTitleDown(e: React.PointerEvent) {
    // Ignore clicks that originated on the close button.
    if ((e.target as HTMLElement).closest("[data-window-close]")) return;
    e.preventDefault();
    focusWindow(windowKey);
    setDrag({ mode: "move", ox: e.clientX - win!.x, oy: e.clientY - win!.y });
  }

  function onResizeDown(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(windowKey);
    setDrag({ mode: "resize", ox: e.clientX - win!.w, oy: e.clientY - win!.h });
  }

  return (
    <div
      onPointerDown={() => focusWindow(windowKey)}
      style={{
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: win.z,
      }}
      className={cn(
        "pointer-events-auto absolute flex animate-panel-in flex-col overflow-hidden rounded-xl2 border border-line bg-base-800 shadow-card",
        // Mobile fallback: occupy the safe area, ignore stored position/size.
        "max-md:!inset-0 max-md:!left-0 max-md:!top-0 max-md:!h-auto max-md:!w-auto max-md:!rounded-none",
      )}
    >
      <div
        onPointerDown={onTitleDown}
        className={cn(
          "flex shrink-0 select-none items-center justify-between gap-3 border-b border-line bg-surface/[0.05] px-4 py-2.5",
          drag?.mode === "move" ? "cursor-grabbing" : "md:cursor-grab",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent))]" />
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            {title}
          </h2>
        </div>
        <button
          data-window-close
          type="button"
          onClick={() => closeWindow(windowKey)}
          aria-label={`Close ${title}`}
          className="grid h-7 w-7 place-items-center rounded-md text-ink-faint transition-colors hover:bg-surface/[0.08] hover:text-ink"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-8 sm:py-9">
        {children}
      </div>

      <button
        type="button"
        aria-label="Resize window"
        tabIndex={-1}
        onPointerDown={onResizeDown}
        className="absolute bottom-0 right-0 hidden h-5 w-5 cursor-nwse-resize items-end justify-end p-1 text-ink-faint hover:text-ink md:flex"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2 11 L11 2 M6 11 L11 6 M10 11 L11 10"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
