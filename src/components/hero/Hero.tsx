import { site } from "@/content/site";
import { toolsByTier } from "@/content/surya";
import { Signature } from "@/components/ui/Signature";
import { Assistant } from "@/components/assistant/Assistant";
import { TryItButton } from "@/components/surya/TryItButton";

/**
 * Hero: who I am in one line, and the assistant beside it. Server component;
 * the assistant is the only client island. Entrance motion is CSS only.
 */
export function Hero() {
  const { hero, location } = site;
  const live = toolsByTier("live");

  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pb-16 pt-24 sm:pb-24 sm:pt-32">
      {/* The sun: a warm core and a slow ring of rays behind the headline. */}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-32 h-[44rem] w-[44rem] sm:-left-24">
        <div className="sun-core absolute inset-0 rounded-full" />
        <div className="sun-rays absolute inset-0 rounded-full" />
      </div>

      <div className="relative mx-auto grid w-full max-w-shell grid-cols-1 items-center gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6 xl:col-span-6">
          <p
            className="flex animate-fade-up flex-wrap items-baseline gap-x-2 gap-y-1 font-hand text-2xl leading-none text-ink sm:text-3xl"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="text-accent">{hero.greeting}</span>
            <Signature label={hero.name} flourish className="text-ink" />
          </p>

          <h1
            id="hero-title"
            className="mt-6 animate-fade-up text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl md:text-7xl"
            style={{ animationDelay: "0.13s" }}
          >
            {hero.headline}
          </h1>

          <p
            className="mt-6 max-w-xl animate-fade-up text-pretty text-lg leading-relaxed text-ink-muted sm:text-xl"
            style={{ animationDelay: "0.21s" }}
          >
            {hero.subline}
          </p>

          <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3" style={{ animationDelay: "0.29s" }}>
            <a
              href={hero.primaryCta.href}
              className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-base-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
            >
              {hero.primaryCta.label}
              <span aria-hidden className="transition-transform group-hover:translate-y-0.5">↓</span>
            </a>
            <TryItButton tab="gates" className="min-h-[48px] px-6 text-[15px]">
              Try Surya Gates
            </TryItButton>
          </div>

          <ul
            aria-label="Live and open source"
            className="mt-10 flex animate-fade-up flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ animationDelay: "0.37s" }}
          >
            {live.map((t) => (
              <li key={t.slug} className="flex items-center gap-1.5">
                <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
                <a href={`#tool-${t.slug}`} className="transition-colors hover:text-ink">
                  {t.name}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-1.5 normal-case tracking-normal">· {location}</li>
          </ul>
        </div>

        <div className="animate-fade-up lg:col-span-6 xl:col-span-6" style={{ animationDelay: "0.25s" }}>
          <Assistant />
        </div>
      </div>
    </section>
  );
}
