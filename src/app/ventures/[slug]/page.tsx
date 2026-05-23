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
      title: `${venture.name} — ${site.name}`,
      description: venture.description,
    },
  };
}

export default function VenturePage({ params }: PageProps) {
  const venture = getVenture(params.slug);
  if (!venture || !venture.hasInternalPage) notFound();

  const accent = getAccentHex(venture.accent);
  const hasExternal = Boolean(venture.externalUrl);

  // Related ventures: children if this is a parent, else siblings under the
  // same parent, else other top-level ventures.
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

  return (
    <article className="relative mx-auto max-w-shell px-5 pb-24 pt-28 sm:px-8 sm:pb-32 sm:pt-36">
      {/* Accent glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-20 h-72 w-[44rem] max-w-[90vw] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: accent }}
      />

      {/* Breadcrumb */}
      <div className="relative mb-10 flex items-center gap-2 text-sm text-ink-faint">
        <Link href="/" className="transition-colors hover:text-ink">
          {site.name}
        </Link>
        <span aria-hidden>/</span>
        <Link href="/#ventures" className="transition-colors hover:text-ink">
          Ventures
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink-muted">{venture.name}</span>
      </div>

      {/* Header */}
      <header className="relative max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge accent={accent} dot>
            {venture.status}
          </Badge>
          {parent && (
            <Link href={`/ventures/${parent.slug}`}>
              <Badge className="transition-colors hover:border-white/25">
                ↳ Part of {parent.name}
              </Badge>
            </Link>
          )}
        </div>

        <h1 className="mt-6 text-5xl font-semibold tracking-tightest text-ink sm:text-6xl">
          {venture.name}
        </h1>
        <p className="mt-3 font-mono text-sm uppercase tracking-[0.16em] text-ink-faint">
          {venture.category}
        </p>
        <p className="mt-7 text-balance text-xl leading-snug text-ink-muted sm:text-2xl">
          {venture.summary}
        </p>

        {hasExternal && (
          <div className="mt-8">
            <Button href={venture.externalUrl!} external variant="primary" size="lg">
              Visit {venture.name}
              <span aria-hidden>↗</span>
            </Button>
          </div>
        )}
      </header>

      {/* Body */}
      <div className="relative mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
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
          <div className="rounded-xl2 border border-line bg-white/[0.025] p-6 backdrop-blur-sm sm:p-7">
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
                    className="rounded-full border border-line bg-white/[0.02] px-2.5 py-1 text-xs text-ink-faint"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="relative mt-20 border-t border-line pt-12">
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
                  className="group flex items-center justify-between gap-3 rounded-xl2 border border-line bg-white/[0.025] p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/20"
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

      {/* Back */}
      <div className="relative mt-16">
        <Link
          href="/#ventures"
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← Back to all ventures
        </Link>
      </div>
    </article>
  );
}
