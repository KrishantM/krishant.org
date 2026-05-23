import { site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

/**
 * "Who is Krishant?" — concise and founder-like, not an about-me essay. All
 * copy comes from site.who so it can be reworded without touching this layout.
 */
export function WhoIsKrishant() {
  const { who } = site;

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
      {/* Lead statement */}
      <div className="lg:col-span-7">
        <Reveal>
          <p className="text-balance text-2xl font-medium leading-snug tracking-tight text-ink sm:text-3xl md:text-[2.1rem]">
            <span className="text-ink-faint">“</span>
            {who.lead}
            <span className="text-ink-faint">”</span>
          </p>
        </Reveal>

        <div className="mt-8 space-y-5">
          {who.body.map((para, i) => (
            <Reveal key={i} delay={0.08 * (i + 1)}>
              <p className="text-pretty leading-relaxed text-ink-muted">{para}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Principles */}
      <div className="lg:col-span-5">
        <Reveal delay={0.1}>
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl2 border border-line bg-line sm:grid-cols-2 lg:grid-cols-1">
            {who.principles.map((p) => (
              <li
                key={p.title}
                className="group bg-base-800/60 p-5 backdrop-blur-sm transition-colors hover:bg-base-700/60"
              >
                <div className="flex items-baseline gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-indigo transition-transform duration-300 group-hover:scale-150"
                  />
                  <div>
                    <p className="font-medium tracking-tight text-ink">{p.title}</p>
                    <p className="mt-0.5 text-sm text-ink-faint">{p.note}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
