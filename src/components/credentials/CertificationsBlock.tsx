import { certifications } from "@/content/certifications";

/**
 * Certifications block — separate from PwC. Restrained, premium presentation
 * (not a badge wall). Reads every entry from content/certifications.ts, so
 * adding an Azure / GCP cert later is a one-object change with zero edits here.
 */
export function CertificationsBlock() {
  return (
    <div className="relative h-full overflow-hidden rounded-xl2 border border-line bg-white/[0.025] p-7 shadow-card backdrop-blur-sm sm:p-8">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-amber/12 blur-3xl"
      />

      <div className="relative flex items-center justify-between">
        <span className="text-2xl font-semibold tracking-tightest text-ink">
          Certifications
        </span>
        <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-ink-faint">
          Verified depth
        </span>
      </div>

      <ul className="relative mt-6 divide-y divide-line">
        {certifications.map((cert) => {
          const row = (
            <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
              <div className="min-w-0">
                <p className="font-medium tracking-tight text-ink">{cert.name}</p>
                <p className="mt-1 text-xs text-ink-faint">
                  {cert.provider} · {cert.category}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-mono text-xs tracking-tight text-ink-muted">
                  {cert.code}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-accent-emerald shadow-[0_0_6px_#34e0a1]"
                    aria-hidden
                  />
                  {cert.status}
                </span>
              </div>
            </div>
          );

          return (
            <li key={cert.code}>
              {cert.credentialUrl ? (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-opacity hover:opacity-80"
                >
                  {row}
                </a>
              ) : (
                row
              )}
            </li>
          );
        })}
      </ul>

      <p className="relative mt-5 text-xs text-ink-faint">
        Built to grow — Azure and further certifications slot in as they land.
      </p>
    </div>
  );
}
