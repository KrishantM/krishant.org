import Link from "next/link";
import { getVenture, venturesByParent } from "@/content/ventures";
import type { Venture } from "@/types/venture";
import { getAccentHex } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

/**
 * CreatorHQ rendered as an operating map: the infrastructure layer on top, the
 * creator-led brands it powers branching beneath it. Fully data-driven — the
 * children are resolved via `parent: "creatorhq"`, so adding another brand to
 * the ecosystem needs no change here.
 */
export function CreatorHQMap() {
  const hub = getVenture("creatorhq");
  const brands = venturesByParent("creatorhq");
  if (!hub) return null;

  const hubAccent = getAccentHex(hub.accent);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Operating-layer hub */}
      <Reveal>
        <div
          className="relative overflow-hidden rounded-xl2 border border-line bg-white/[0.025] p-7 shadow-card backdrop-blur-sm sm:p-9"
          style={{ ["--hub" as string]: hubAccent }}
        >
          {/* Shimmering top edge to signal "active layer" */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px animate-shimmer bg-[length:200%_100%]"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent, ${hubAccent}, transparent)`,
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-25 blur-3xl"
            style={{ background: hubAccent }}
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: hubAccent, boxShadow: `0 0 10px ${hubAccent}` }}
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                  Operating layer
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tightest text-ink sm:text-3xl">
                {hub.name}
              </h3>
              <p className="mt-3 text-pretty leading-relaxed text-ink-muted">
                {hub.description}
              </p>
            </div>
          </div>

          {/* What the layer provides */}
          <ul className="relative mt-6 flex flex-wrap gap-2">
            {hub.focusAreas.map((area) => (
              <li
                key={area}
                className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs text-ink-muted"
              >
                {area}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* Branch connector (sm+) */}
      <div aria-hidden className="relative mx-auto hidden h-14 sm:block">
        <span className="absolute left-1/2 top-0 h-7 w-px -translate-x-1/2 bg-gradient-to-b from-white/30 to-white/10" />
        <span className="absolute left-1/4 right-1/4 top-7 h-px bg-white/12" />
        <span className="absolute left-1/4 top-7 h-7 w-px bg-gradient-to-b from-white/12 to-transparent" />
        <span className="absolute right-1/4 top-7 h-7 w-px bg-gradient-to-b from-white/12 to-transparent" />
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
      </div>

      {/* Mobile connector */}
      <div aria-hidden className="mx-auto my-4 h-6 w-px bg-gradient-to-b from-white/25 to-transparent sm:hidden" />

      {/* Connected creator-led brands */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {brands.map((brand, i) => (
          <Reveal key={brand.slug} delay={0.1 + i * 0.1}>
            <EcosystemBrand brand={brand} />
          </Reveal>
        ))}
      </div>

      {/* Theme footnote */}
      <Reveal delay={0.2}>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-ink-faint">
          Creator infrastructure, content systems, audience growth, and digital
          brand operations — one operating layer powering distinct creator-led
          brands.
        </p>
      </Reveal>
    </div>
  );
}

function EcosystemBrand({ brand }: { brand: Venture }) {
  const accent = getAccentHex(brand.accent);
  const hasExternal = Boolean(brand.externalUrl);
  const href = hasExternal ? brand.externalUrl! : `/ventures/${brand.slug}`;

  const card = (
    <div
      className="group relative h-full overflow-hidden rounded-xl2 border border-line bg-white/[0.025] p-6 shadow-card backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/20"
      style={{ borderTop: `2px solid ${accent}` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: accent }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <h4 className="text-xl font-semibold tracking-tightest text-ink">
          {brand.name}
        </h4>
        <span className="text-sm text-ink-muted">{hasExternal ? "↗" : "→"}</span>
      </div>
      <p className="relative mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
        {brand.category}
      </p>
      <p className="relative mt-4 text-pretty text-sm leading-relaxed text-ink-muted">
        {brand.summary}
      </p>
      <p className="relative mt-5 text-xs text-ink-faint">{brand.role}</p>
    </div>
  );

  if (hasExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${brand.name} (opens in a new tab)`}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-base rounded-xl2"
      >
        {card}
      </a>
    );
  }
  return (
    <Link href={href} className="block h-full">
      {card}
    </Link>
  );
}
