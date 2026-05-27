import { site } from "@/content/site";
import { VentureConstellation } from "@/components/ventures/VentureConstellation";

/** Map window body: the interactive constellation. */
export function MapView() {
  return (
    <div>
      <p className="font-hand text-xl text-accent sm:text-2xl">How it all connects</p>
      <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        The map in my head
      </h3>
      <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-ink-muted">
        {site.sections.constellation.lede}
      </p>
      <div className="mt-8">
        <VentureConstellation />
      </div>
    </div>
  );
}
