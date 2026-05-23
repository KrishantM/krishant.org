import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  /** Optional accent hex — drives a subtle coloured dot + tint. */
  accent?: string;
  className?: string;
  /** Show the small leading status dot. */
  dot?: boolean;
}

/**
 * Small, restrained label chip. Used for status, categories, and signals.
 * Designed to read as a premium signal — never as a badge wall.
 */
export function Badge({ children, accent, className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs font-medium tracking-tight text-ink-muted backdrop-blur",
        className,
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: accent ?? "currentColor",
            boxShadow: accent ? `0 0 8px ${accent}` : undefined,
          }}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
