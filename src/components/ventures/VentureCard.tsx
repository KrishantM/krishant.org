import Link from "next/link";
import type { Venture } from "@/types/venture";
import { getAccentHex } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface VentureCardProps {
  venture: Venture;
  /** Sequencing index for staggered reveal handled by the parent grid. */
  index?: number;
}

/**
 * A single venture as a glass card. Uses the "stretched link" pattern: the
 * title anchor covers the whole card (primary destination), while any secondary
 * link sits above it — valid, accessible, and fully keyboard-navigable.
 *
 * Primary destination = external site (new tab) when one exists, otherwise the
 * internal detail page.
 */
export function VentureCard({ venture }: VentureCardProps) {
  const accent = getAccentHex(venture.accent);
  const hasExternal = Boolean(venture.externalUrl);
  const internalHref = `/ventures/${venture.slug}`;

  const primaryHref = hasExternal ? venture.externalUrl! : internalHref;

  return (
    <Card accent={accent} interactive className="h-full">
      <div className="flex h-full flex-col p-6 sm:p-7">
        {/* Header row */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <Badge accent={accent} dot>
            {venture.status}
          </Badge>
          {venture.parent && (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              ↳ CreatorHQ
            </span>
          )}
        </div>

        {/* Title — stretched primary link */}
        <h3 className="text-2xl font-semibold tracking-tightest text-ink">
          {hasExternal ? (
            <a
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:underline"
            >
              {venture.name}
            </a>
          ) : (
            <Link
              href={primaryHref}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:underline"
            >
              {venture.name}
            </Link>
          )}
        </h3>

        <p className="mt-1 text-sm text-ink-faint">{venture.category}</p>
        <p className="mt-4 text-pretty leading-relaxed text-ink-muted">
          {venture.summary}
        </p>

        {/* Focus areas */}
        <ul className="mt-6 flex flex-wrap gap-2">
          {venture.focusAreas.slice(0, 4).map((area) => (
            <li
              key={area}
              className="rounded-full border border-line bg-white/[0.02] px-2.5 py-1 text-xs text-ink-muted"
            >
              {area}
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-7">
          <span className="text-xs text-ink-faint">{venture.role}</span>

          {/* Secondary link sits above the stretched primary link (z-20). */}
          {hasExternal ? (
            venture.hasInternalPage ? (
              <Link
                href={internalHref}
                className="relative z-20 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                Details →
              </Link>
            ) : (
              <span className="text-sm font-medium text-ink-muted">
                Visit ↗
              </span>
            )
          ) : (
            <span className="text-sm font-medium text-ink-muted">
              Explore →
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
