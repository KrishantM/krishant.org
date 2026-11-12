import { site } from "@/content/site";
import { surya, suryaTiers, toolsByTier } from "@/content/surya";
import type { SuryaTier } from "@/types/surya";
import { cn } from "@/lib/utils";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SuryaOrbit } from "./SuryaOrbit";
import { ToolCard } from "./ToolCard";

/**
 * The centrepiece: the Surya family in three tiers. All data comes from
 * src/content/surya.ts. A featured tool takes a wider card in its tier.
 */
export function SuryaFamily() {
  const { eyebrow, title } = site.sections.surya;

  return (
    <Section
      id="surya"
      eyebrow={eyebrow}
      title={title}
      lede={
        <>
          <p>{surya.lede}</p>
          <p className="mt-4 text-sm">
            <a
              href={surya.site}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
            >
              {surya.siteLabel} <span aria-hidden>↗</span>
            </a>
          </p>
        </>
      }
      aside={
        <Reveal delay={0.1}>
          <SuryaOrbit />
        </Reveal>
      }
    >
      <div className="space-y-16 sm:space-y-20">
        <Tier tier="live" />
        <Tier tier="development" />
        <Tier tier="next" />
      </div>
    </Section>
  );
}

function Tier({ tier }: { tier: SuryaTier }) {
  const tools = toolsByTier(tier);
  const meta = suryaTiers[tier];
  if (!tools.length) return null;

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-4">
          <h3 className="flex items-center gap-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            <TierMark tier={tier} />
            {meta.label}
          </h3>
          <p className="text-sm text-ink-faint">{meta.note}</p>
        </div>
      </Reveal>

      {tier === "live" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((t, i) => (
            <Reveal key={t.slug} delay={0.05 * i} className={cn(t.featured && "md:col-span-2")}>
              <ToolCard tool={t} size={t.featured ? "lg" : "md"} />
            </Reveal>
          ))}
        </div>
      )}

      {tier === "development" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {tools.map((t, i) => (
            <Reveal key={t.slug} delay={0.05 * i} className={cn(t.featured && "md:col-span-2")}>
              <ToolCard tool={t} size={t.featured ? "lg" : "md"} />
            </Reveal>
          ))}
        </div>
      )}

      {tier === "next" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto]">
          {tools.map((t) => (
            <Reveal key={t.slug}>
              <ToolCard tool={t} />
            </Reveal>
          ))}
          <Reveal delay={0.1} className="hidden md:block">
            <BlocksSketch />
          </Reveal>
        </div>
      )}
    </div>
  );
}

function TierMark({ tier }: { tier: SuryaTier }) {
  if (tier === "live") return <span aria-hidden className="h-3 w-3 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent))]" />;
  if (tier === "development") return <span aria-hidden className="h-3 w-3 rounded-full border-2 border-accent" />;
  return <span aria-hidden className="h-3 w-3 rounded-full border-2 border-dashed border-ink/40" />;
}

/** A small sketch of Surya Build: blocks wired together, the last one checked. */
function BlocksSketch() {
  return (
    <div className="flex h-full items-center justify-center rounded-xl2 border border-dashed border-ink/20 px-8 py-6">
      <svg width="260" height="96" viewBox="0 0 260 96" aria-hidden className="text-ink-faint">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * 92}, 24)`}>
            <rect width="64" height="48" rx="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={i === 2 ? undefined : "4 4"} className={i === 2 ? "stroke-accent" : undefined} />
            {i < 2 && <line x1="64" y1="24" x2="92" y2="24" stroke="currentColor" strokeWidth="1.5" />}
            {i === 2 && <path d="M22 25l7 7 14-15" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="stroke-accent" />}
          </g>
        ))}
      </svg>
    </div>
  );
}
