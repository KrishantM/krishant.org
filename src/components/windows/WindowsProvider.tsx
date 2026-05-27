"use client";

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";

export type WindowKey = "ventures" | "map" | "credentials" | "about" | "connect";

export interface WindowState {
  key: WindowKey;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
}

interface State {
  windows: Partial<Record<WindowKey, WindowState>>;
  topZ: number;
}

type Action =
  | { type: "open"; key: WindowKey }
  | { type: "close"; key: WindowKey }
  | { type: "closeAll" }
  | { type: "focus"; key: WindowKey }
  | { type: "move"; key: WindowKey; x: number; y: number }
  | { type: "resize"; key: WindowKey; w: number; h: number };

/**
 * Sensible per-window default sizes. Constellation and ventures get more
 * canvas; credentials/about/connect default narrower.
 */
const DEFAULT_SIZES: Record<WindowKey, { w: number; h: number }> = {
  ventures: { w: 940, h: 680 },
  map: { w: 820, h: 640 },
  credentials: { w: 760, h: 620 },
  about: { w: 780, h: 640 },
  connect: { w: 620, h: 520 },
};

/**
 * Sidebar width on desktop (matches `md:left-16` on the WindowManager
 * container). Windows live in container coords, so the visible canvas is
 * `innerWidth - SIDEBAR_W` wide.
 */
const SIDEBAR_W = 64;
/** Outer breathing room around windows so they don't kiss the viewport edge. */
const EDGE_MARGIN = 24;

/**
 * Compute a sensible initial geometry for a newly opened window. Clamps the
 * default size to whatever the viewport can actually show (so the resize
 * handle is always reachable on small laptops), then staggers position from
 * the top-left of the safe canvas — wrapping back to the top before any
 * window would spawn off-screen.
 */
function initialGeometry(key: WindowKey, openCount: number) {
  const { w: dw, h: dh } = DEFAULT_SIZES[key];

  if (typeof window === "undefined") {
    return { x: 32, y: 32, w: dw, h: dh };
  }

  const canvasW = Math.max(320, window.innerWidth - SIDEBAR_W);
  const canvasH = Math.max(320, window.innerHeight);
  const w = Math.min(dw, canvasW - EDGE_MARGIN * 2);
  const h = Math.min(dh, canvasH - EDGE_MARGIN * 2);

  const step = 32;
  const maxStaggerX = Math.max(0, canvasW - w - EDGE_MARGIN * 2);
  const maxStaggerY = Math.max(0, canvasH - h - EDGE_MARGIN * 2);
  const stagger = openCount * step;
  const offsetX = maxStaggerX > 0 ? stagger % maxStaggerX : 0;
  const offsetY = maxStaggerY > 0 ? stagger % maxStaggerY : 0;

  return { x: EDGE_MARGIN + offsetX, y: EDGE_MARGIN + offsetY, w, h };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open": {
      if (state.windows[action.key]) {
        return reducer(state, { type: "focus", key: action.key });
      }
      const topZ = state.topZ + 1;
      const openCount = Object.keys(state.windows).length;
      const { x, y, w, h } = initialGeometry(action.key, openCount);
      return {
        ...state,
        topZ,
        windows: {
          ...state.windows,
          [action.key]: { key: action.key, x, y, w, h, z: topZ },
        },
      };
    }
    case "close": {
      const next = { ...state.windows };
      delete next[action.key];
      return { ...state, windows: next };
    }
    case "closeAll":
      return { ...state, windows: {} };
    case "focus": {
      const win = state.windows[action.key];
      if (!win) return state;
      if (win.z === state.topZ) return state;
      const topZ = state.topZ + 1;
      return {
        ...state,
        topZ,
        windows: { ...state.windows, [action.key]: { ...win, z: topZ } },
      };
    }
    case "move": {
      const win = state.windows[action.key];
      if (!win) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.key]: { ...win, x: action.x, y: action.y },
        },
      };
    }
    case "resize": {
      const win = state.windows[action.key];
      if (!win) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.key]: { ...win, w: action.w, h: action.h },
        },
      };
    }
  }
}

interface ContextValue {
  state: State;
  openWindow: (key: WindowKey) => void;
  closeWindow: (key: WindowKey) => void;
  closeAll: () => void;
  focusWindow: (key: WindowKey) => void;
  moveWindow: (key: WindowKey, x: number, y: number) => void;
  resizeWindow: (key: WindowKey, w: number, h: number) => void;
  isOpen: (key: WindowKey) => boolean;
}

const WindowsContext = createContext<ContextValue | null>(null);

export function WindowsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { windows: {}, topZ: 100 });

  const openWindow = useCallback((key: WindowKey) => dispatch({ type: "open", key }), []);
  const closeWindow = useCallback((key: WindowKey) => dispatch({ type: "close", key }), []);
  const closeAll = useCallback(() => dispatch({ type: "closeAll" }), []);
  const focusWindow = useCallback((key: WindowKey) => dispatch({ type: "focus", key }), []);
  const moveWindow = useCallback(
    (key: WindowKey, x: number, y: number) => dispatch({ type: "move", key, x, y }),
    [],
  );
  const resizeWindow = useCallback(
    (key: WindowKey, w: number, h: number) => dispatch({ type: "resize", key, w, h }),
    [],
  );

  const value: ContextValue = useMemo(
    () => ({
      state,
      openWindow,
      closeWindow,
      closeAll,
      focusWindow,
      moveWindow,
      resizeWindow,
      isOpen: (key) => Boolean(state.windows[key]),
    }),
    [state, openWindow, closeWindow, closeAll, focusWindow, moveWindow, resizeWindow],
  );

  return <WindowsContext.Provider value={value}>{children}</WindowsContext.Provider>;
}

export function useWindows() {
  const ctx = useContext(WindowsContext);
  if (!ctx) {
    throw new Error("useWindows must be used inside <WindowsProvider>");
  }
  return ctx;
}
