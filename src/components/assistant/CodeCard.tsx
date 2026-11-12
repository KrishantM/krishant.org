import type { CodeCard as CodeCardData } from "@/lib/assistant";

/**
 * One excerpt from a public repo: repo and file, the line range, the code
 * with real line numbers, and a link to those exact lines on GitHub. The
 * code scrolls inside the card, so a long line never widens the page.
 */
export function CodeCard({ card }: { card: CodeCardData }) {
  const lines = card.text.split("\n");
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-base-800/70">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] text-ink-faint">{card.repo}</p>
          <p className="truncate font-mono text-xs text-ink" title={card.path}>
            {card.path}
            <span className="text-ink-faint">
              {" "}
              · lines {card.startLine} to {card.endLine}
            </span>
          </p>
        </div>
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${card.repo}/${card.path} lines ${card.startLine} to ${card.endLine} on GitHub`}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-line px-3 text-[11px] font-medium text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
        >
          GitHub <span aria-hidden>↗</span>
        </a>
      </figcaption>
      <pre
        className="thin-scroll max-h-72 overflow-auto px-0 py-3 font-mono text-[11.5px] leading-[1.5] text-ink-muted"
        tabIndex={0}
        aria-label={`Code from ${card.path}`}
      >
        <code className="code-lines block pr-4" style={{ ["--start" as string]: card.startLine - 1 }}>
          {lines.map((l, i) => (
            <span key={i}>{l || " "}</span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
