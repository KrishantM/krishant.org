import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVenture, internalVentureSlugs, venturesByParent } from "@/content/ventures";
import { suryaTiers, suryaTools } from "@/content/surya";
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
  const canonicalUrl = `${site.url}/ventures/${venture.slug}`;
  return {
    title: venture.name,
    description: venture.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${venture.name} · ${site.name}`,
      description: venture.description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `${venture.name} · ${site.name}`,
      description: venture.description,
    },
  };
}

export default function VenturePage({ params }: PageProps) {
  const venture = getVenture(params.slug);
  if (!venture || !venture.hasInternalPage) notFound();

  const accent = getAccentHex(venture.accent);
  const children = venturesByParent(venture.slug);
  const parent = venture.parent ? getVenture(venture.parent) : null;
  // The Surya page lists the family from the same content file as the home page.
  const tools = venture.slug === "surya" ? suryaTools : [];
  const back = venture.status === "Previous" ? "/#earlier" : "/#surya";

  return (
    <article className="relative mx-auto w-full max-w-shell px-4 pb-24 pt-24 sm:px-8 sm:pt-32">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 h-72 w-[44rem] max-w-[90vw] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: accent }}
      />

      <Link
        href={back}
        className="relative inline-flex min-h-[44px] items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden>←</span> Back to {site.name}
      </Link>

      <header className="relative mt-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge accent={accent} dot>
            {venture.status}
          </Badge>
          {parent && (
            <Link href={`/ventures/${parent.slug}`}>
              <Badge className="transition-colors hover:border-ink/25">Part of {parent.name}</Badge>
            </Link>
          )}
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">{venture.category}</span>
        </div>
        <h1 className="mt-5 text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-7xl">
          {venture.name}
        </h1>
        <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-muted sm:text-xl">{venture.summary}</p>
        {venture.externalUrl && (
          <div className="mt-8">
            <Button href={venture.externalUrl} external variant="primary" size="lg">
              Visit {venture.name}
              <span aria-hidden>↗</span>
            </Button>
          </div>
        )}
      </header>

      <div className="relative mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Overview</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-muted">{venture.description}</p>
          <h2 className="mt-12 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Role</h2>
          <p className="mt-4 text-lg text-ink">{venture.role}</p>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-xl2 border border-line bg-surface/[0.04] p-6 sm:p-7">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Focus areas</h2>
            <ul className="mt-4 space-y-3">
              {venture.focusAreas.map((area) => (
                <li key={area} className="flex items-center gap-3 text-ink-muted">
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                  {area}
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
              {venture.tags.map((tag) => (
                <li key={tag} className="rounded-full border border-line bg-surface/[0.03] px-2.5 py-1 text-xs text-ink-faint">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {tools.length > 0 && (
        <section aria-labelledby="family-title" className="relative mt-20 border-t border-line pt-12">
          <h2 id="family-title" className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            The Surya family
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tools.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/#tool-${t.slug}`}
                  className="group flex h-full items-start justify-between gap-3 rounded-xl2 border border-line bg-surface/[0.04] p-5 transition-colors hover:border-ink/20"
                >
                  <span>
                    <span className="block font-semibold tracking-tight text-ink">{t.name}</span>
                    <span className="mt-1 block text-sm text-ink-faint">{t.line}</span>
                    <span className="mt-2 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                      {suryaTiers[t.tier].label}
                    </span>
                  </span>
                  <span aria-hidden className="text-ink-muted transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {children.length > 0 && (
        <section className="relative mt-20 border-t border-line pt-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Connected brands</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {children.map((rel) => (
              <Link
                key={rel.slug}
                href={`/ventures/${rel.slug}`}
                className="group flex items-center justify-between gap-3 rounded-xl2 border border-line bg-surface/[0.04] p-5 transition-colors hover:border-ink/20"
              >
                <span>
                  <span className="block font-semibold tracking-tight text-ink">{rel.name}</span>
                  <span className="mt-1 block text-sm text-ink-faint">{rel.summary}</span>
                </span>
                <span aria-hidden className="text-ink-muted">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
