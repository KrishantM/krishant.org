import { skillPillars } from "@/content/certifications";
import { Reveal } from "@/components/ui/Reveal";
import { PwCBlock } from "@/components/credentials/PwCBlock";
import { CertificationsBlock } from "@/components/credentials/CertificationsBlock";

/**
 * Composes the credibility layer: PwC background + certifications side by side,
 * with a row of capability pillars beneath. A grounding signal — kept
 * deliberately compact so the site never tips into CV territory.
 */
export function CredentialsSection() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Reveal>
          <PwCBlock />
        </Reveal>
        <Reveal delay={0.1}>
          <CertificationsBlock />
        </Reveal>
      </div>

      {/* Capability pillars */}
      <Reveal delay={0.15}>
        <div className="mt-5 rounded-xl2 border border-line bg-white/[0.02] p-6 backdrop-blur-sm sm:p-7">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
            Capability pillars
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {skillPillars.map((pillar) => (
              <li
                key={pillar}
                className="flex items-center gap-2 text-sm text-ink-muted"
              >
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-accent-indigo"
                />
                {pillar}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
