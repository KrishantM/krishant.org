import { site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

/**
 * A small, human "right now" snapshot. Easy to keep alive — edit
 * `site.currently` in content/site.ts; no markup changes needed.
 */
export function Currently() {
  const { currently } = site;

  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-xl2 border border-line bg-surface/[0.04] p-6 sm:p-7">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          <span className="font-hand text-2xl leading-none text-ink">
            {currently.label}
          </span>
        </div>
        <p className="relative mt-2 text-sm text-ink-faint">{currently.note}</p>

        <ul className="relative mt-5 space-y-3">
          {currently.items.map((item) => (
            <li key={item.label} className="flex items-baseline gap-4">
              <span className="w-[88px] shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                {item.label}
              </span>
              <span className="text-sm text-ink-muted">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
