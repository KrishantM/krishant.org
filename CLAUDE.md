# CLAUDE.md — instructions for future Claude sessions

This is the working brief for any AI-assisted change to krishant.org. Read
`CONTEXT.md` (why the site exists) and `ARCHITECTURE.md` (how it's built) before
making non-trivial edits. This file is the short, enforceable summary.

## What this site is

krishant.org is the **forwardable personal domain** of Krishant Maharaj. It
exists to create credibility, curiosity, and commercial interest — and to make it
easy to reach him.

It is **NOT**, and must never become:

- a CV or résumé
- a generic portfolio
- a startup directory
- a "venture hub" ← never use this phrase **anywhere** (UI, metadata, docs,
  comments)

## Hard rules

### Data & modularity

- **Never hardcode repeated venture content** into components. Ventures live in
  `src/content/ventures.ts`. Read from there.
- **Never hardcode certification content** across components. Certifications live
  in `src/content/certifications.ts`. Read from there.
- Keep the **certifications data separate from PwC** (PwC copy is the `pwc`
  export in the same file, but a distinct concept and a distinct UI block).
- Site-wide copy lives in `src/content/site.ts`. Change wording there, not in
  component logic.
- The data model is **`Venture`** — never rename it to `Project`. If you ever
  need a generic word, prefer "ventures", "work", "systems", or "builds";
  use "projects" only if genuinely unavoidable.
- Adding a venture or certification should be a **one-object change** to the
  relevant content file. If that's not true after your edit, you've coupled data
  to presentation — fix it.

### PwC & confidentiality

- Reference **PwC directly** (it has real credibility) but **only at a high
  level**.
- **Never** mention client names, specific PwC projects, internal methods,
  deliverables, or any confidential information. Never imply ownership of PwC
  client outcomes.
- Frame PwC as **professional background, not an independent venture**. The safe,
  approved statement is in `pwc.statement` (`src/content/certifications.ts`).

### Tone & content

- Keep copy **concise, ambitious, and premium**. Short, sharp lines. No walls of
  text, no buzzword soup, no fake urgency, no founder clichés, no résumé phrasing.
- Don't over-explain the site. A degree of restraint and mystery is intentional.
- Credentials are a **credibility layer**, not the headline. Never let them turn
  the site into LinkedIn or a certification badge wall.

### Design & code quality

- Preserve the **warm, cinematic, constellation-driven** aesthetic across **both
  themes** (warm-dark default + warm-light). See `DESIGN_GUIDELINES.md`.
- **Theme via tokens, never raw hex** in components: `base`, `surface`, `ink*`,
  `line`, `accent`, `accent-gold` (CSS vars in `globals.css`). Overlays use
  `surface/[α]`; stronger borders use `ink/[α]`. If you add a colour, define it
  in **both** theme blocks. The signature accent is **amber-honey** (amber
  `#FFB454` + honey `#F6C453`). Amber-honey accent keys: `amber, honey, orange,
  caramel, gold, copper`. Don't reintroduce the old cold (indigo/cyan) palette.
- Type tokens: `font-display` (Fraunces), `font-hand` (Caveat, the handwriting
  voice), `font-mono` (codes only), default sans (Inter). Don't add more faces.
- Voice is **first-person and warm** — like Krishant talking, kept tight.
- Reuse the shared primitives: `Section`, `Card`, `Badge`, `Button`, `Reveal`,
  `Signature`, `ThemeToggle`. The hero is an interactive AI-style "ask" console
  (`AskConsole`) whose answers come from `lib/assistant.ts`, built from the
  content files — keep it data-driven, never hardcode venture/credential facts.
- Keep animation in `Reveal` + the draw-on strokes + CSS; **always** respect
  `prefers-reduced-motion`. Never break the no-flash theme bootstrap in
  `layout.tsx`.
- Maintain accessibility: semantic HTML, keyboard-reachable controls, aria-labels
  where needed, never colour-only meaning, no nested anchors (use the
  stretched-link pattern).
- **Prioritise maintainability over one-off visual hacks.** Make small, targeted
  changes. Keep components readable and focused.

## Approved vocabulary

- Identity: **Krishant** / **Krishant Maharaj**. Domain: **krishant.org**.
- Nav (exactly): **Ventures · Credentials · Who is Krishant? · Connect**.
- Section/nav label for active work: **Ventures**. For PwC + certs:
  **Credentials**.
- Contact: email `krishantm7@gmail.com`, LinkedIn
  `https://www.linkedin.com/in/krishant-maharaj`.

## Before you finish a change

- [ ] No venture/cert facts hardcoded in components.
- [ ] No use of the phrase "venture hub".
- [ ] No confidential PwC/client detail.
- [ ] Copy is tight, premium, and on-brand.
- [ ] Reduced-motion and accessibility preserved.
- [ ] Still builds (`npm run build`) and type-checks (`npm run typecheck`).
