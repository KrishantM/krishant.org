import { site } from "@/content/site";
import { Signature } from "@/components/ui/Signature";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-shell flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <Signature label={site.footer.signoff} className="text-2xl text-ink" />
          <p className="mt-4 text-sm text-ink-faint">{site.footer.tagline}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-ink-faint sm:items-end">
          <div className="flex gap-4">
            <a className="transition-colors hover:text-ink" href={`mailto:${site.contact.email}`}>Email</a>
            <a className="transition-colors hover:text-ink" href={site.contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            {site.contact.github && (
              <a className="transition-colors hover:text-ink" href={site.contact.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            )}
          </div>
          <p>
            © {year} {site.fullName}. {site.footer.note}
          </p>
        </div>
      </div>
    </footer>
  );
}
