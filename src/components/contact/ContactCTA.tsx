import { site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

/** Connect: a simple open line. Every link comes from site.contact. */
export function ContactCTA() {
  const { contact, sections } = site;
  return (
    <section id="connect" aria-labelledby="connect-title" className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-shell px-4 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-xl2 border border-line bg-surface/[0.04] px-6 py-12 text-center shadow-card sm:p-16">
            <span aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] max-w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <p className="font-hand text-xl text-accent sm:text-2xl">{sections.connect.eyebrow}</p>
              <h2 id="connect-title" className="mt-2 text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
                {sections.connect.title}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-[1rem] leading-relaxed text-ink-muted sm:text-lg">
                {sections.connect.lede}
              </p>
              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Button href={`mailto:${contact.email}`} external variant="primary" size="lg">
                  Email me
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </Button>
                <Button href={contact.linkedin} external variant="secondary" size="lg">
                  LinkedIn
                </Button>
                {contact.github && (
                  <Button href={contact.github} external variant="secondary" size="lg">
                    GitHub
                  </Button>
                )}
              </div>
              <p className="mt-7 break-all font-mono text-sm text-ink-faint">{contact.email}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
