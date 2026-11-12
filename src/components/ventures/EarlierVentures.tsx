import Link from "next/link";
import { site } from "@/content/site";
import { earlierVentures } from "@/content/ventures";
import { getAccentHex } from "@/lib/utils";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";

/** Gradual and Hiko, kept small: earlier work, not the headline. */
export function EarlierVentures() {
  const { eyebrow, title } = site.sections.earlier;
  return (
    <Section id="earlier" eyebrow={eyebrow} title={title} className="py-16 sm:py-20">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {earlierVentures.map((v, i) => {
          const accent = getAccentHex(v.accent);
          return (
            <Reveal key={v.slug} delay={0.06 * i}>
              <article className="relative flex h-full flex-col rounded-xl2 border border-line bg-surface/[0.03] p-6">
                <div className="flex items-center gap-2.5">
                  <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">{v.name}</h3>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{v.role}</span>
                </div>
                <p className="mt-3 text-[15px] text-ink">{v.summary}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                  <Link
                    href={`/ventures/${v.slug}`}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-line px-3.5 text-sm text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
                  >
                    Details <span aria-hidden>→</span>
                  </Link>
                  {v.externalUrl && (
                    <a
                      href={v.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center gap-1.5 px-3 text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      Visit {v.name} <span aria-hidden>↗</span>
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
