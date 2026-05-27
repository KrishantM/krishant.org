import { site } from "@/content/site";
import { CredentialsSection } from "@/components/credentials/CredentialsSection";

/** Credentials window body: PwC + certifications + capability pillars. */
export function CredentialsView() {
  return (
    <div>
      <p className="font-hand text-xl text-accent sm:text-2xl">The credibility bit</p>
      <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Credentials
      </h3>
      <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-ink-muted">
        {site.sections.credentials.lede}
      </p>
      <div className="mt-8">
        <CredentialsSection />
      </div>
    </div>
  );
}
