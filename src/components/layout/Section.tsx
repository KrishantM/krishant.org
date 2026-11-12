import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

interface SectionProps {
  id: string;
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  /** Content beside the header on large screens (e.g. a diagram). */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Standard section shell: shell width, vertical rhythm, and the eyebrow /
 * title / lede header. Server component. Every section is an anchor target.
 */
export function Section({ id, eyebrow, title, lede, aside, children, className }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("relative py-20 sm:py-28", className)}>
      <div className="mx-auto w-full max-w-shell px-4 sm:px-8">
        <div className={cn("mb-10 sm:mb-14", aside ? "grid grid-cols-1 items-center gap-10 lg:grid-cols-12" : undefined)}>
          <Reveal className={aside ? "lg:col-span-6" : "max-w-3xl"}>
            {eyebrow && <p className="font-hand text-xl text-accent sm:text-2xl">{eyebrow}</p>}
            <h2
              id={`${id}-title`}
              className="mt-2 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl"
            >
              {title}
            </h2>
            {lede && (
              <div className="mt-5 max-w-2xl text-pretty text-[1rem] leading-relaxed text-ink-muted sm:text-lg">
                {lede}
              </div>
            )}
          </Reveal>
          {aside && <div className="lg:col-span-6">{aside}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
