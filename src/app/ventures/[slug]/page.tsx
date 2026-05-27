import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getVenture,
  internalVentureSlugs,
  venturesByParent,
  ventures,
} from "@/content/ventures";
import { site } from "@/content/site";
import { getAccentHex } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/layout/Panel";

interface PageProps {
  params: { slug: string };
}

/** Pre-render a static page for every venture flagged hasInternalPage. */
export function generateStaticParams() {
  return internalVentureSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const venture = getVenture(params.slug);
  if (!venture) return {};
  return {
    title: venture.name,
    description: venture.description,
    openGraph: {
      title: `${venture.name} · ${site.name}`,
      description: venture.description,
    },
  };
}

export default function VenturePage({ params }: PageProps) {
  const venture = getVenture(params.slug);
  if (!venture || !venture.hasInternalPage) notFound();

  const accent = getAccentHex(venture.accent);
  const hasExternal = Boolean(venture.externalUrl);

  // Related: children if this is a parent, else siblings under the same parent.
  const children = venturesByParent(venture.slug);
  const parent = venture.parent ? getVenture(venture.parent) : null;
  const related =
    children.length > 0
      ? children
      : ventures.filter(
          (v) =>
            v.slug !== venture.slug &&
            v.parent === venture.parent &&
            v.hasInternalPage,
        );

  const eyebrow = (
    <div className="flex flex-wrap items-center gap-3">
      <Badge accent={accent} dot>
        {venture.status}
      </Badge>
      {parent && (
        <Link href={`/ventures/${parent.slug}`}>
          <Badge className="transition-colors hover:border-ink/25">
            ↳ Part of {parent.name}
          </Badge>
        </Link>
      )}
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
        {venture.category}
      </span>
    </div>
  );

  return (
    <Panel
      title={venture.name}
      description={venture.summary}
      eyebrow={eyebrow}
      closeHref="/ventures"
    >
      {/* Accent glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-20 h-72 w-[44rem] max-w-[90vw] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: accent }}
      />

      {hasExternal && (
        <div className="-mt-4 mb-12">
          <Button href={venture.externalUrl!} external variant="primary" size="lg">
            Visit {venture.name}
            <span aria-hidden>↗</span>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            Overview
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-muted">
            {venture.description}
          </p>

          <h2 className="mt-12 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            Role
          </h2>
          <p className="mt-4 text-lg text-ink">{venture.role}</p>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-xl2 border border-line bg-surface/[0.04] p-6 sm:p-7">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
              Focus areas
            </h2>
            <ul className="mt-4 space-y-3">
              {venture.focusAreas.map((area) => (
                <li key={area} className="flex items-center gap-3 text-ink-muted">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
                  />
                  {area}
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-line pt-5">
              <ul className="flex flex-wrap gap-2">
                {venture.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-line bg-surface/[0.03] px-2.5 py-1 text-xs text-ink-faint"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            {children.length > 0 ? "Connected brands" : "Related ventures"}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {related.map((rel) => {
              const relAccent = getAccentHex(rel.accent);
              return (
                <Link
                  key={rel.slug}
                  href={`/ventures/${rel.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-xl2 border border-line bg-surface/[0.04] p-5 transition-all hover:-translate-y-0.5 hover:border-ink/20"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ background: relAccent, boxShadow: `0 0 8px ${relAccent}` }}
                      />
                      <span className="font-semibold tracking-tight text-ink">
                        {rel.name}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-faint">{rel.summary}</p>
                  </div>
                  <span className="text-ink-muted transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </Panel>
  );
}
