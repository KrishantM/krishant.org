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

---

## Performance baseline (task #1 — 2026-06-05)

Measured on Next.js 14.2.35 production build. No Lighthouse / CWV run yet
(requires a deployed URL or a local perf tool pass); numbers below are from the
build output and static bundle analysis.

### Build output (gzip, first-load JS)

| Route              | Page     | First Load JS |
|--------------------|----------|---------------|
| `/` (homepage)     | 142 B    | **87.4 kB**   |
| `/ventures/[slug]` | 1.38 kB  | 97.3 kB       |

Shared JS (all routes): **87.3 kB gzip**

| Chunk              | Raw     | Gzip    | Contents                     |
|--------------------|---------|---------|------------------------------|
| `fd9d1056`         | 169 KB  | 52 KB   | react-dom                    |
| `framework`        | 137 KB  | 44 KB   | React                        |
| `polyfills`        | 110 KB  | 39 KB   | Next.js polyfills            |
| `main`             | 114 KB  | 33 KB   | Next.js router/internals     |
| `117-a68`          | 121 KB  | 31 KB   | shared app utilities         |
| `app/layout`       |  53 KB  | 14 KB   | all client components (app)  |
| **Total**          | **704 KB** | **213 KB** |                        |

The 87.4 kB first-load number is reasonable for a Next.js 14 app with no
third-party animation library. React + Next.js core account for ~88 kB of that.

### Public image assets

| File             | Size    | Display use               | Issue                              |
|------------------|---------|---------------------------|------------------------------------|
| `lion-white.png` | **533 KB** | 30×30 px CSS `bg-image` | **Critical: 9× over-sized**        |
| `lion-black.png` | 101 KB  | 30×30 px CSS `bg-image`  | Over-sized (theme-light variant)   |
| `icon.svg`       | 1 KB    | favicon                   | Fine                               |

`lion-white.png` (533 KB) is the single largest asset. It is loaded as a CSS
`background-image` inside `.assistant-mark` — a 30×30 px span shown next to
every assistant message. At 2× DPR the image needs to be at most ~60×60 px.
Converting to WebP and right-sizing would reduce this to ~3–5 KB (>99% savings).

### Client components (root layout — always hydrated)

Nine `"use client"` boundaries, all mounted on every page via the root layout:

| Component        | File                                | Cost/notes                                         |
|------------------|-------------------------------------|----------------------------------------------------|
| `WindowsProvider`| `windows/WindowsProvider.tsx`       | Lightweight context + useReducer                   |
| `WindowManager`  | `windows/WindowManager.tsx`         | **Eagerly imports all 5 window views**             |
| `Window`         | `windows/Window.tsx`                | Pointer-event drag/resize; only renders when open  |
| `Sidebar`        | `layout/Sidebar.tsx`                | Nav + theme toggle; always visible                 |
| `ThemeToggle`    | `ui/ThemeToggle.tsx`                | Minimal                                            |
| `AskConsole`     | `hero/AskConsole.tsx`               | Interactive; always visible — correct to be client |
| `Reveal`         | `ui/Reveal.tsx`                     | IntersectionObserver, no library                   |
| `Panel`          | `layout/Panel.tsx`                  | Only active on `/ventures/[slug]` routes           |
| `VentureConstellation` | `ventures/VentureConstellation.tsx` | Interactive SVG; only shown in map window   |

`WindowManager` eagerly imports all five view components (VenturesView,
MapView, CredentialsView, AboutView, ConnectView), including
`VentureConstellation` (SVG map) and `FlagshipVentures`. These are bundled
into the layout chunk even though they are only rendered when a window is
opened. Switching `WindowManager` to `React.lazy` / `next/dynamic` per-view
would allow the five window views to be code-split and loaded on demand.

### Animation & motion

No Framer Motion or other animation library — confirmed by bundle analysis.
All motion is CSS-only (`globals.css` keyframes: `animate-fade-in`,
`animate-fade-up`, `animate-pop`, `animate-panel-in`, `draw-on`,
`constellation-flow`) or `IntersectionObserver` in `Reveal`. The backdrop is
pure CSS with no JS. `prefers-reduced-motion` is respected via a global
`@media` rule. This is the correct architecture — no library to remove.

### Font loading

Three Google Fonts via `next/font`:

| Family    | Variable          | Use              | Subset  | Display |
|-----------|-------------------|------------------|---------|---------|
| Inter     | `--font-sans`     | Body text        | latin   | swap    |
| Fraunces  | `--font-display`  | Display headings | latin   | swap    |
| Caveat    | `--font-hand`     | Handwriting      | latin   | swap    |

`display: swap` is correct (no invisible text). Mono uses the system stack
(no additional file). Font loading is well-configured; no issues here.

### Next.js config

`next.config.mjs` is minimal — no image optimisation domains, no bundle
analyser, no custom webpack config. The app does not use `next/image` for any
user-facing image (the lion marks are loaded as CSS `background-image`, so
`next/image` optimisation does not apply to them).

### API route (`/api/ask`)

Server-only (`runtime: "nodejs"`, `dynamic: "force-dynamic"`). The
`@anthropic-ai/sdk` is not bundled into any client chunk — confirmed. A new
`Anthropic` client is instantiated per request; no persistent connection, but
acceptable for a low-traffic personal site.

### Prioritised optimisation opportunities

1. **`lion-white.png` (533 KB → ~3–5 KB)** — Convert to WebP/AVIF at 60×60 px.
   Highest impact; virtually free win.
2. **`lion-black.png` (101 KB → ~2–3 KB)** — Same treatment as above.
3. **Window views: lazy-load with `next/dynamic`** — Split the five window
   views out of the initial bundle; load each on first open.
4. **No Lighthouse / CWV numbers yet** — Run `npx lighthouse` against a local
   prod build (`npm run build && npm start`) or the live Vercel deploy to get
   LCP, CLS, FCP, and TBT baselines.

### What is already correct (do not change)

- No Framer Motion or animation library
- Fonts correctly subsetted with `display: swap`
- No-flash theme bootstrap (inline script before paint)
- `Reveal` uses IntersectionObserver, not a library
- `Backdrop` is pure CSS
- `@anthropic-ai/sdk` is server-only
- `prefers-reduced-motion` correctly respected
