import Link from "next/link";
import { site } from "@/content/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto max-w-shell px-5 py-14 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <Link
              href="/"
              className="flex items-baseline gap-1.5 font-semibold tracking-tightest text-ink"
            >
              <span className="text-xl">{site.name}</span>
              <span className="font-mono text-sm text-ink-faint">.org</span>
            </Link>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-muted">
              {site.footer.tagline}
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-x-8 gap-y-3"
            aria-label="Footer"
          >
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`mailto:${site.contact.email}`}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Email
            </a>
            <a
              href={site.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              LinkedIn
            </a>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.fullName}. {site.footer.note}
          </p>
          <p className="font-mono tracking-tight">{site.domain}</p>
        </div>
      </div>
    </footer>
  );
}
