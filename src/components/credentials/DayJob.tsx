import { site } from "@/content/site";
import { pwc } from "@/content/certifications";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Day job. The approved PwC statement, word for word, and nothing else: no
 * clients, no projects, no dates.
 */
export function DayJob() {
  const { eyebrow, title } = site.sections.dayJob;
  return (
    <section id="day-job" aria-labelledby="day-job-title" className="relative py-16 sm:py-20">
      <div className="mx-auto w-full max-w-shell px-4 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-xl2 border border-line bg-surface/[0.04] p-7 shadow-card sm:p-12">
            <span aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="font-hand text-xl text-accent sm:text-2xl">{eyebrow}</p>
                <h2 id="day-job-title" className="mt-2 font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
                  {title}
                </h2>
              </div>
              <div className="lg:col-span-8">
                <p className="text-pretty font-display text-xl leading-relaxed text-ink sm:text-2xl" data-testid="pwc-statement">
                  {pwc.statement}
                </p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {pwc.themes.map((t) => (
                    <li key={t} className="rounded-full border border-line bg-surface/[0.03] px-3 py-1 text-xs text-ink-muted">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
