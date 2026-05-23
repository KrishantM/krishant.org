import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

interface SectionProps {
  id?: string;
  /** Small label above the title, e.g. "01 — Active work". */
  eyebrow?: string;
  title?: string;
  /** Supporting sentence under the title. */
  lede?: string;
  children: ReactNode;
  className?: string;
  /** Tighten vertical rhythm for denser sections. */
  compact?: boolean;
}

/**
 * The structural rhythm of the page. Provides the shell width, vertical
 * spacing, and the standard eyebrow/title/lede header so every section reads
 * as part of one composed surface.
 */
export function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
  className,
  compact = false,
}: SectionProps) {
  const hasHeader = eyebrow || title || lede;

  return (
    <section
      id={id}
      className={cn(
        "relative mx-auto w-full max-w-shell px-5 sm:px-8",
        compact ? "py-16 sm:py-20" : "py-24 sm:py-32",
        className,
      )}
    >
      {hasHeader && (
        <Reveal className="mb-12 max-w-2xl sm:mb-16">
          {eyebrow && (
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ink-faint">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="text-balance text-3xl font-semibold tracking-tightest text-ink sm:text-4xl md:text-5xl">
              {title}
            </h2>
          )}
          {lede && (
            <p className="mt-5 text-pretty text-base leading-relaxed text-ink-muted sm:text-lg">
              {lede}
            </p>
          )}
        </Reveal>
      )}
      {children}
    </section>
  );
}
