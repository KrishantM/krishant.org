import { site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

/**
 * Connect section — a strong, simple open line. Email + LinkedIn pulled from
 * site.contact so there's a single place to update either.
 */
export function ContactCTA() {
  const { contact, sections } = site;

  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-xl2 border border-line bg-surface/[0.04] p-8 text-center shadow-card sm:p-14">
        {/* Ambient glow */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] max-w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
        />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {sections.connect.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg">
            {sections.connect.lede}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href={`mailto:${contact.email}`}
              external
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Email me
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </Button>
            <Button
              href={contact.linkedin}
              external
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Connect on LinkedIn
            </Button>
          </div>

          <p className="mt-7 font-mono text-sm text-ink-faint">
            {contact.email}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
