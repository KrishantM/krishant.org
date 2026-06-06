import { site } from "@/content/site";
import { Signature } from "@/components/ui/Signature";
import { AskConsoleLoader } from "./AskConsoleLoader";

/**
 * The persistent landing surface that lives in the root layout: hero copy
 * stacked above the interactive AskConsole. The greeting line uses the
 * handwriting voice (Fraunces' Caveat partner) with the draw-on curved swash
 * beneath the name, matching the original Signature treatment.
 */
export function ConsoleSurface() {
  const { hero, location } = site;

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-5 pb-28 pt-20 sm:px-8 md:px-14 md:pb-14 md:pt-14">
      <div className="w-full max-w-3xl text-center">
        <p
          className="flex animate-fade-up flex-wrap items-baseline justify-center gap-x-2 gap-y-1 font-hand text-2xl leading-none text-ink sm:text-3xl"
          style={{ animationDelay: "0.05s" }}
        >
          <span className="text-accent">{hero.greeting}</span>
          <Signature label={hero.name} flourish className="text-ink" />
          <span className="text-base text-ink-faint sm:text-lg">
            <span className="mr-2">·</span>
            {location}
          </span>
        </p>

        <h1
          className="mt-5 animate-fade-up text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl"
          style={{ animationDelay: "0.13s" }}
        >
          {hero.headline}
        </h1>

        <p
          className="mx-auto mt-5 animate-fade-up text-pretty text-base leading-relaxed text-ink-muted sm:whitespace-nowrap sm:text-lg"
          style={{ animationDelay: "0.21s" }}
        >
          {hero.subline}
        </p>

        <div
          className="mt-10 animate-fade-up sm:mt-12"
          style={{ animationDelay: "0.3s" }}
        >
          <AskConsoleLoader />
        </div>
      </div>
    </div>
  );
}
