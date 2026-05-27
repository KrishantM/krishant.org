import Link from "next/link";
import { featuredVentures } from "@/content/ventures";
import type { Venture } from "@/types/venture";
import { getAccentHex } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";

/**
 * The flagship ventures (Gradual + Hiko), given deliberate weight as two large
 * feature cards. Data-driven via `featuredVentures`; CreatorHQ and its sub-brands
 * live in their own ecosystem section.
 */
export function FlagshipVentures() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {featuredVentures.map((venture, i) => (
        <Reveal key={venture.slug} delay={i * 0.1}>
          <FlagshipCard venture={venture} index={i + 1} />
        </Reveal>
      ))}
    </div>
  );
}

function FlagshipCard({ venture, index }: { venture: Venture; index: number }) {
  const accent = getAccentHex(venture.accent);
  const hasExternal = Boolean(venture.externalUrl);

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-xl2 border border-line bg-surface/[0.04] p-8 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-ink/20 sm:p-10"
      style={{ borderTop: `2px solid ${accent}` }}
    >
      {/* Accent wash + watermark index */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: accent }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-6 top-3 select-none font-display text-7xl font-semibold leading-none text-ink opacity-[0.05]"
      >
        {String(index).padStart(2, "0")}
      </span>

      <div className="relative flex items-center gap-3">
        <Badge accent={accent} dot>
          {venture.status}
        </Badge>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
          {venture.role}
        </span>
      </div>

      <h3 className="relative mt-6 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        {venture.name}
      </h3>
      <p className="relative mt-2 text-sm text-ink-faint">{venture.category}</p>

      <p className="relative mt-5 max-w-md text-pretty leading-relaxed text-ink-muted">
        {venture.description}
      </p>

      <ul className="relative mt-6 flex flex-wrap gap-2">
        {venture.focusAreas.map((area) => (
          <li
            key={area}
            className="rounded-full border border-line bg-surface/[0.03] px-3 py-1 text-xs text-ink-muted"
          >
            {area}
          </li>
        ))}
      </ul>

      <div className="relative mt-auto flex flex-wrap items-center gap-4 pt-8">
        {hasExternal && (
          <a
            href={venture.externalUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface/[0.06]"
            style={{ borderColor: accent, color: accent }}
          >
            Visit {venture.name}
            <span aria-hidden>↗</span>
          </a>
        )}
        {venture.hasInternalPage && (
          <Link
            href={`/ventures/${venture.slug}`}
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Details →
          </Link>
        )}
      </div>
    </article>
  );
}
