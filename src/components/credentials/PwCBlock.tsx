import { pwc } from "@/content/certifications";

/**
 * PwC credibility block. References PwC directly as professional background,
 * kept high-level by design — no client names, projects, or confidential
 * detail. Copy lives in content/certifications.ts.
 */
export function PwCBlock() {
  return (
    <div className="relative h-full overflow-hidden rounded-xl2 border border-line bg-white/[0.025] p-7 shadow-card backdrop-blur-sm sm:p-8">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-accent-sky/15 blur-3xl"
      />

      <div className="relative flex items-center justify-between">
        <span className="text-2xl font-semibold tracking-tightest text-ink">
          {pwc.name}
        </span>
        <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-ink-faint">
          {pwc.role}
        </span>
      </div>

      <p className="relative mt-5 text-pretty leading-relaxed text-ink-muted">
        {pwc.statement}
      </p>

      <ul className="relative mt-6 flex flex-wrap gap-2">
        {pwc.themes.map((theme) => (
          <li
            key={theme}
            className="rounded-full border border-line bg-white/[0.02] px-3 py-1 text-xs text-ink-muted"
          >
            {theme}
          </li>
        ))}
      </ul>
    </div>
  );
}
