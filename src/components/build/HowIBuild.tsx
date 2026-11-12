import { site } from "@/content/site";
import { howIBuild } from "@/content/how-i-build";
import { isExternal, proofHref, proofPath } from "@/lib/proof";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Evidence, not a skills list: each item is a plain claim and the proof
 * behind it. Code proofs show the repo path and line range they open.
 */
export function HowIBuild() {
  const { eyebrow, title, lede } = site.sections.howIBuild;
  return (
    <Section id="how-i-build" eyebrow={eyebrow} title={title} lede={lede}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {howIBuild.map((item, i) => (
          <Reveal key={item.slug} delay={0.04 * (i % 2)}>
            <article
              id={`build-${item.slug}`}
              className="flex h-full scroll-mt-24 flex-col rounded-xl2 border border-line bg-surface/[0.04] p-6 shadow-card sm:p-7"
            >
              <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">{item.title}</h3>
              <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink">{item.claim}</p>
              <p className="mt-2 text-pretty text-[15px] leading-relaxed text-ink-muted">{item.detail}</p>

              <ul className="mt-auto space-y-1.5 pt-6" aria-label={`Proof for ${item.title}`}>
                {item.proofs.map((p) => {
                  const href = proofHref(p);
                  const path = proofPath(p);
                  const ext = isExternal(href);
                  return (
                    <li key={`${p.label}-${href}`}>
                      <a
                        href={href}
                        {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="group flex min-h-[44px] items-center justify-between gap-3 rounded-lg border border-line bg-base-800/50 px-3 py-2 transition-colors hover:border-accent/40"
                      >
                        <span className="min-w-0">
                          <span className="block text-[13px] text-ink">{p.label}</span>
                          {path && (
                            <span className="block break-all font-mono text-[11px] text-ink-faint">
                              {path}
                            </span>
                          )}
                        </span>
                        <span aria-hidden className="shrink-0 text-ink-faint transition-colors group-hover:text-accent">
                          {ext ? "↗" : "↓"}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
