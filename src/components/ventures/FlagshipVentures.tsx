import Link from "next/link";
import { featuredVentures } from "@/content/ventures";
import type { Venture } from "@/types/venture";
import { getAccentHex, cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";

/**
 * The flagship ventures, given deliberate weight as large feature cards. The
 * first entry leads and spans the full width; the rest sit beside each other
 * beneath it. Data-driven via `featuredVentures` — reorder the content file to
 * change which venture leads.
 */
export function FlagshipVentures() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {featuredVentures.map((venture, i) => (
        <Reveal
          key={venture.slug}
          delay={i * 0.1}
          className={i === 0 ? "lg:col-span-2" : undefined}
        >
          <FlagshipCard venture={venture} index={i + 1} lead={i === 0} />
        </Reveal>
      ))}
    </div>
  );
}

function FlagshipCard({
  venture,
  index,
  lead,
}: {
  venture: Venture;
  index: number;
  lead?: boolean;
}) {
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

      <h3
        className={cn(
          "relative mt-6 font-display font-semibold tracking-tight text-ink",
          lead ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl",
        )}
      >
        {venture.name}
      </h3>
      <p className="relative mt-2 text-sm text-ink-faint">{venture.category}</p>

      {lead && (
        <p className="relative mt-4 max-w-2xl text-pretty font-display text-xl leading-snug text-ink sm:text-2xl">
          {venture.summary}
        </p>
      )}

      <p
        className={cn(
          "relative mt-5 text-pretty leading-relaxed text-ink-muted",
          lead ? "max-w-3xl" : "max-w-md",
        )}
      >
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
