import { site } from "@/content/site";
import { certifications, certificationsFooterNote } from "@/content/certifications";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Certifications: a tidy list with codes and a status dot paired with text.
 * Issue dates show only where the content file has one. Never a badge wall.
 */
export function Certifications() {
  const { eyebrow, title } = site.sections.credentials;
  return (
    <Section id="credentials" eyebrow={eyebrow} title={title}>
      <Reveal>
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl2 border border-line bg-line sm:grid-cols-2">
          {certifications.map((cert) => {
            const body = (
              <div className="flex h-full items-start justify-between gap-4 bg-base p-5 sm:p-6">
                <div className="min-w-0">
                  <p className="font-medium tracking-tight text-ink">{cert.name}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {cert.provider} · {cert.category}
                    {cert.issuedDate ? ` · ${cert.issuedDate}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-mono text-xs tracking-tight text-ink-muted">{cert.code}</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgb(var(--accent))]" />
                    {cert.status}
                  </span>
                </div>
              </div>
            );
            return (
              <li key={cert.code} className="bg-base">
                {cert.credentialUrl ? (
                  <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="block h-full transition-opacity hover:opacity-80">
                    {body}
                  </a>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-ink-faint">{certificationsFooterNote}</p>
      </Reveal>
    </Section>
  );
}
