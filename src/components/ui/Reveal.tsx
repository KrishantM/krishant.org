"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  /** Stagger / sequencing delay in seconds. */
  delay?: number;
  className?: string;
  /** HTML tag to render as. */
  as?: "div" | "section" | "li" | "article";
}

/**
 * Lightweight scroll-reveal primitive. A single IntersectionObserver toggles a
 * CSS class — no animation library, minimal hydration cost. The hidden state is
 * gated on `.js` (see globals.css) so content is fully visible without JS, and
 * `prefers-reduced-motion` snaps straight to visible.
 */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  const Comp = Tag as "div";
  return (
    <Comp
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </Comp>
  );
}
