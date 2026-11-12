import Link from "next/link";
import type { SuryaTool } from "@/types/surya";
import { repoUrl } from "@/content/surya";
import { cn, getAccentHex } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { TryItButton } from "./TryItButton";

/**
 * One Surya tool. Every link is a real destination: the public repo, the
 * tool's own site, a detail page, or the live demo in the hero.
 */
export function ToolCard({ tool, size = "md" }: { tool: SuryaTool; size?: "md" | "lg" }) {
  const accent = getAccentHex(tool.accent);
  const lg = size === "lg";
  const upcoming = tool.tier !== "live";

  return (
    <article
      id={`tool-${tool.slug}`}
      className={cn(
        "group relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-xl2 border bg-surface/[0.04] shadow-card transition-all duration-500 hover:-translate-y-1",
        tool.tier === "next" ? "border-dashed border-ink/25" : "border-line hover:border-ink/20",
        lg ? "p-7 sm:p-9" : "p-6 sm:p-7",
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 rounded-full blur-3xl transition-opacity duration-500",
          lg ? "h-64 w-64 opacity-30 group-hover:opacity-45" : "h-40 w-40 opacity-15 group-hover:opacity-35",
        )}
        style={{ background: accent }}
      />

      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
        <Badge accent={accent} dot>
          {tool.status}
        </Badge>
        {tool.runsOn && (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{tool.runsOn}</span>
        )}
      </div>

      <h4
        className={cn(
          "relative mt-5 font-display font-semibold tracking-tight text-ink",
          lg ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl",
        )}
      >
        {tool.name}
      </h4>
      <p className={cn("relative mt-2 text-pretty font-display leading-snug text-ink", lg ? "text-xl sm:text-2xl" : "text-lg")}>
        {tool.line}
      </p>
      <p className={cn("relative mt-3 text-pretty leading-relaxed text-ink-muted", lg ? "max-w-2xl" : "text-[15px]")}>
        {tool.description}
      </p>

      {tool.points.length > 0 && (
        <ul className="relative mt-5 space-y-2">
          {tool.points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-ink-muted">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
              {p}
            </li>
          ))}
        </ul>
      )}

      {(tool.repo || tool.site || tool.ventureSlug || tool.tryIt || upcoming) && (
        <div className="relative mt-auto flex flex-wrap items-center gap-2 pt-7">
          {tool.repo && (
            <a
              href={repoUrl(tool.repo)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line bg-surface/[0.04] px-3.5 font-mono text-[12px] text-ink transition-colors hover:border-ink/30"
              aria-label={`${tool.name} on GitHub`}
            >
              <GitHubMark />
              {tool.repo}
              <span aria-hidden className="text-ink-faint">↗</span>
            </a>
          )}
          {tool.site && (
            <a
              href={tool.site}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Site <span aria-hidden>↗</span>
            </a>
          )}
          {tool.ventureSlug && (
            <Link
              href={`/ventures/${tool.ventureSlug}`}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Details <span aria-hidden>→</span>
            </Link>
          )}
          {tool.tryIt && (
            <TryItButton tab={tool.tryIt} className="min-h-[40px]">
              Try it here
            </TryItButton>
          )}
          {upcoming && (
            <span className="font-mono text-[11px] text-ink-faint">
              {tool.tier === "development" ? "Not available yet" : "Not started"}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function GitHubMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
