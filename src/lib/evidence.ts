import { suryaTiers, suryaTools, repoUrl } from "@/content/surya";
import { howIBuild } from "@/content/how-i-build";
import { certifications, pwc } from "@/content/certifications";
import { earlierVentures } from "@/content/ventures";

/**
 * The evidence catalogue for the fit check. Every item is something a
 * visitor can open and check: a repo, a product, a certification, the PwC
 * statement or a "How I build" entry. The model may only cite these ids, and
 * the server drops any id it doesn't recognise.
 */

export type EvidenceKind = "repo" | "product" | "skill" | "cert" | "day-job" | "venture";

export interface Evidence {
  id: string;
  kind: EvidenceKind;
  title: string;
  /** What it shows, in plain words. The model reads this to choose evidence. */
  summary: string;
  /**
   * The words shown to the visitor under a fit-check match. Taken verbatim
   * from the content files, never written by the model, so a match can't
   * credit an item with something it doesn't do.
   */
  text: string;
  href: string;
}

/** The sentence of the approved PwC statement that says what the work is. */
export function pwcWorkSentence(): string {
  const sentences = pwc.statement.split(/(?<=\.)\s+/);
  return sentences.find((s) => s.startsWith("I build")) ?? sentences[0];
}

export function evidenceCatalogue(): Evidence[] {
  const items: Evidence[] = [];

  for (const t of suryaTools) {
    const status =
      t.tier === "live"
        ? "Live and open source."
        : t.tier === "development"
          ? "In development, not available yet."
          : "Planned next, not started.";
    items.push({
      id: `tool:${t.slug}`,
      kind: t.repo ? "repo" : "product",
      title: t.name,
      summary: `${status} ${t.line} ${t.description} ${t.points.join(". ")}`.trim(),
      text: t.tier === "live" ? t.line : `${t.line} ${suryaTiers[t.tier].note}`,
      href: t.repo ? repoUrl(t.repo) : "#surya",
    });
  }

  for (const b of howIBuild) {
    items.push({
      id: `build:${b.slug}`,
      kind: "skill",
      title: b.title,
      summary: `${b.claim} ${b.detail}`,
      text: b.claim,
      href: `#build-${b.slug}`,
    });
  }

  items.push({
    id: "pwc",
    kind: "day-job",
    title: "Day job at PwC",
    summary: pwc.statement,
    text: pwcWorkSentence(),
    href: "#day-job",
  });

  for (const c of certifications) {
    items.push({
      id: `cert:${c.code}`,
      kind: "cert",
      title: c.name,
      summary: `${c.provider}, ${c.category}, ${c.status}.`,
      text: `${c.provider} · ${c.code} · ${c.status}`,
      href: c.credentialUrl ?? "#credentials",
    });
  }

  for (const v of earlierVentures) {
    items.push({
      id: `venture:${v.slug}`,
      kind: "venture",
      title: v.name,
      summary: `${v.role}. ${v.description}`,
      text: v.summary,
      href: `/ventures/${v.slug}`,
    });
  }

  return items;
}
