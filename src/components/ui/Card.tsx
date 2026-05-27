import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Accent hex used for the hover glow + corner wash. */
  accent?: string;
  /** Enable interactive hover lift + accent glow. */
  interactive?: boolean;
}

/**
 * The glass surface used across the site. Provides the layered-depth look:
 * faint border, subtle inner highlight, blur, and an optional accent glow that
 * blooms on hover for interactive cards.
 */
export function Card({ children, className, accent, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl2 border border-line bg-surface/[0.04] shadow-card",
        interactive &&
          "transition-all duration-500 hover:-translate-y-1 hover:border-ink/20",
        className,
      )}
      style={
        accent
          ? ({ "--card-accent": accent } as React.CSSProperties)
          : undefined
      }
    >
      {/* Accent corner wash — only painted when an accent is supplied. */}
      {accent && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-0 blur-3xl transition-opacity duration-500",
            interactive ? "group-hover:opacity-40" : "opacity-20",
          )}
          style={{ background: accent }}
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
