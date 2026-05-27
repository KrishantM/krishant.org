import { site } from "@/content/site";
import { FlagshipVentures } from "@/components/ventures/FlagshipVentures";
import { CreatorHQMap } from "@/components/ventures/CreatorHQMap";

const nav = site.nav.find((n) => n.key === "ventures")!;

/**
 * Ventures window body: the flagships (Gradual + Hiko) up top, the CreatorHQ
 * operating layer with its connected brands below.
 */
export function VenturesView() {
  return (
    <div className="space-y-14">
      <div>
        <p className="font-hand text-xl text-accent sm:text-2xl">{nav.description}</p>
        <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          What I’m building
        </h3>
        <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-ink-muted">
          {site.sections.ventures.lede}
        </p>
        <div className="mt-8">
          <FlagshipVentures />
        </div>
      </div>

      <div>
        <p className="font-hand text-xl text-accent sm:text-2xl">The ecosystem</p>
        <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          The CreatorHQ ecosystem
        </h3>
        <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-ink-muted">
          {site.sections.creatorHq.lede}
        </p>
        <div className="mt-8">
          <CreatorHQMap />
        </div>
      </div>
    </div>
  );
}
