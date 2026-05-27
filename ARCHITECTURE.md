# Architecture — krishant.org

The guiding rule: **content is data, presentation is components, and the two
never bleed into each other.** Any one venture or certification is described
once, in one place, and rendered everywhere from that single description.

## Layers

```
types/      →  the shape of the data        (Venture, Certification)
content/    →  the data itself + copy        (ventures.ts, certifications.ts, site.ts)
lib/        →  pure helpers                   (cn, accent colour resolution)
components/ →  presentation only             (read from content, render UI)
app/        →  routing + composition          (layout, homepage, detail pages)
```

A component should never contain venture/certification facts. It receives them
(via props or by importing the central content modules) and renders them.

## Content / data separation

- **`src/content/ventures.ts`** — the single source of truth for ventures, plus
  small derived helpers (`topLevelVentures`, `venturesByParent`, `getVenture`,
  `internalVentureSlugs`). Selection logic lives here, not in components.
- **`src/content/certifications.ts`** — the single source of truth for
  certifications, the `skillPillars` array, and the high-level `pwc` copy. Kept
  entirely separate from ventures.
- **`src/content/site.ts`** — identity, nav, hero copy, section headings,
  "Who is Krishant?" copy, contact links, footer. All site-wide wording.

To change wording: edit `content/`. To change layout: edit `components/`. These
two activities should almost never touch the same file.

## Data models

### Venture (`src/types/venture.ts`)

The model is named **`Venture`** — never `Project`. Key fields:

| field            | purpose                                                        |
| ---------------- | ------------------------------------------------------------- |
| `name`, `slug`   | identity + URL segment                                        |
| `url` / `externalUrl` | public site, or `null` (e.g. CreatorHQ)                  |
| `category`, `status`  | classification + lifecycle (`Active`/`Building`/`Exploring`) |
| `summary`        | one-line essence (cards, nodes)                              |
| `description`    | tighter paragraph (detail pages)                            |
| `role`           | how Krishant relates to it                                    |
| `focusAreas`, `tags` | themes + keywords                                        |
| `accent`         | one of the accent keys (see lib/utils + tailwind config)     |
| `featured`       | leads the grid / constellation                              |
| `parent`         | parent slug for sub-brands (`creatorhq`) or `null`          |
| `hasInternalPage`| whether `/ventures/[slug]` is generated                    |

### Certification (`src/types/certification.ts`)

`name`, `provider`, `code`, `status`, `category`, optional `issuedDate`, optional
`credentialUrl`. Never invent dates or URLs — omit / `null`.

## Component map

- **layout/** — `Header` (scroll-aware + mobile menu), `Footer`, `Section`
  (shell width, vertical rhythm, eyebrow/title/lede header), `Backdrop` (global
  grid + glow).
- **hero/** — `Hero` (server; CSS entrance), `HeroBackground` (CSS-only
  cinematic layer), `AskConsole` (the interactive AI-style prompt console; the
  only client island in the hero). Its answers come from `src/lib/assistant.ts`,
  which maps a query to a curated, data-driven response built from the content
  files — never hardcoded facts.
- **ventures/** — `FlagshipVentures` (the Gradual + Hiko feature cards),
  `VentureConstellation` (interactive map + stacked mobile fallback),
  `CreatorHQMap`.
- **about/** — `WhoIsKrishant`, `Currently` (the "right now" snapshot; edit
  `site.currently`).
- **credentials/** — `CredentialsSection` composes `PwCBlock` +
  `CertificationsBlock` + skill pillars.
- **contact/** — `ContactCTA`.
- **ui/** — `Badge`, `Button`, `Card`, `Reveal` (the scroll-reveal primitive),
  `Signature` (hand-drawn logo/mark), `ThemeToggle`. Reuse these rather than
  re-styling ad hoc.

## Theming

Two themes (warm-dark default + warm-light) share one token set. CSS variables
live in `globals.css` under `:root` (dark) and `[data-theme="light"]`; Tailwind
maps them to tokens in `tailwind.config.ts` (`base`, `surface`, `ink*`, `line`,
`accent`, `accent-gold`). A small inline script in `layout.tsx` sets the saved
theme before paint (no flash); `ThemeToggle` flips `data-theme` on `<html>` and
persists it. **Rule:** components reference tokens, never raw hex — that's what
lets a single component render correctly in both themes. Per-venture accent hex
lives in `src/lib/utils.ts` (`accentHex`) for SVG/inline use.

### A note on the constellation

`VentureConstellation.tsx` holds a `layout` map of **percentage coordinates** per
slug and a `connections` list. These are **presentation concerns** and live in
the component on purpose — they are not part of the `Venture` data model. When you
add a venture that should appear on the map, add a coordinate entry (and a
connection) here.

## Routing & composition

- **`app/layout.tsx`** — root HTML, fonts (`next/font`), global metadata + Open
  Graph, and the persistent chrome (`Backdrop`, `Header`, `Footer`).
- **`app/page.tsx`** — the homepage. It only *composes* sections; it owns no
  content beyond pulling from `content/`.
- **`app/ventures/[slug]/page.tsx`** — statically generated from
  `internalVentureSlugs`, with per-venture `generateMetadata`. Reuses the same
  venture object — content is never duplicated per page.
- **`app/opengraph-image.tsx`** — dynamic OG image so a forwarded link previews
  well.

## Safely modifying sections

- **Re-order / add / remove a homepage section:** edit `app/page.tsx` only.
  Wrap content in `<Section>` for consistent rhythm and the standard header.
- **Change a section's words:** edit `content/site.ts`.
- **Add a detail page for an existing venture:** set `hasInternalPage: true`. The
  route, params, and metadata generate automatically.
- **Add a new venture/cert:** append one object to the relevant content file
  (see README for the full template).

## Rules for staying modular

1. Never hardcode venture or certification facts inside a component.
2. Read from the central content files; add derived helpers there if needed.
3. Reuse `Section`, `Card`, `Badge`, `Button`, `Reveal` instead of bespoke markup.
4. Keep animation in `Reveal` (and CSS) — don't scatter motion logic.
5. Prefer one-object additions over new components when extending data.
6. Make small, targeted changes; keep each component readable and focused.
