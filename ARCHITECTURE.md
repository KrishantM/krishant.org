# Architecture — krishant.org

The guiding rule: **content is data, presentation is components, and the two
never bleed into each other.** Any one venture or certification is described
once, in one place, and rendered everywhere from that single description.

## Layers

```
types/      →  the shape of the data        (Venture, Certification, SuryaTool, Proof)
content/    →  the data itself + copy        (surya.ts, how-i-build.ts, ventures.ts,
                                              certifications.ts, site.ts, generated JSON)
lib/        →  pure helpers                   (cn, accents, sanitiser, retrieval, assistant)
scripts/    →  build-time generators          (code index, Gates demo verdicts)
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
- **`src/content/surya.ts`** — the Surya family: every tool, its tier
  (`live`, `development`, `next`), repo, points and status. One object per tool.
- **`src/content/how-i-build.ts`** — "How I build": each claim with its proofs.
  A code proof names a repo, path and line range; `lib/proof.ts` pins the link
  to the commit recorded in `code-repos.json`.
- **`src/content/site.ts`** — identity, nav, hero copy, assistant copy, section
  headings, contact links, footer. All site-wide wording.
- **Generated, committed, reviewable JSON** (never edit by hand):
  `code-index.json` + `code-repos.json` (from `npm run index:code`) and
  `gates-demo.json` (from `npm run demo:gates`).

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

One scrolling page, server-rendered. The assistant is the only client island
of any size.

- **layout/** — `SiteHeader` (fixed; anchor nav, "Ask", theme toggle, mobile
  disclosure menu), `SiteFooter`, `Section` (shell width, rhythm,
  eyebrow/title/lede header, optional aside), `Backdrop` (global grid + glow).
- **hero/** — `Hero` (server; CSS entrance and the sun motif) with the
  `Assistant` beside it.
- **assistant/** — `Assistant` (tabs, all modes stay mounted), `AskMode`
  (answers from the real code, with `CodeCard`s), `GatesDemo` (real Surya
  Gates verdicts from `gates-demo.json`, no backend), `FitCheck` (job
  description mapped to evidence), `open.ts` (`openAssistant(tab)` from any
  button; deep links `/#ask`, `/#try-gates`, `/#fit-check`).
- **surya/** — `SuryaFamily` (three tiers), `ToolCard`, `SuryaOrbit` (SVG
  map; node positions are presentation and live in the component),
  `TryItButton`.
- **build/** — `HowIBuild` (claims with proof links).
- **credentials/** — `DayJob` (the approved `pwc.statement`, word for word),
  `Certifications`.
- **ventures/** — `EarlierVentures` (Gradual and Hiko, kept small).
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

### A note on the orbit

`SuryaOrbit.tsx` holds an angle per tool slug and a short label. These are
**presentation concerns** and live in the component on purpose, not in
`surya.ts`. A new tool needs an entry there to appear on the orbit.

## Routing & composition

- **`app/layout.tsx`** — root HTML, fonts (`next/font`), global metadata + Open
  Graph, the no-flash theme bootstrap, and the chrome (`Backdrop`,
  `SiteHeader`, `SiteFooter`).
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

## The assistant (`/api/ask`)

Two model-backed modes behind one route, plus one with no backend.

- **Ask** retrieves up to six excerpts from `code-index.json` (BM25,
  `lib/retrieval.ts`, server only) and labels them E1..En. The model answers
  and cites labels; the server turns labels into code cards and links, so the
  model never writes a URL. Only labels that were retrieved survive.
- **Fit check** sends the pasted job description inside `<job_description>`
  tags as untrusted data, with an evidence catalogue (`lib/evidence.ts`). The
  model only chooses: a short label for each requirement and the evidence ids
  that answer it. It writes nothing about the evidence. The line shown under
  each evidence link is that item's own `text` from the content files (a
  tool's `line`, a "How I build" claim, the work sentence of the PwC
  statement, a cert's provider and code, a venture's summary). Labels that
  describe Krishant instead of the job are dropped. The server drops unknown
  ids and moves unsupported requirements to "Happy to go deeper on these in a
  conversation". There is no gaps list, and gap or weakness wording is removed.
- **Try Surya Gates** reads `gates-demo.json`: real `classify()` output,
  pinned to a commit. `python3 -I scripts/build-gates-demo.py --check`
  re-runs it and the unit tests call that.
- Every string sent back passes through `lib/sanitise.ts`, and links to any
  of his repos off the allowlist are removed. Model: `claude-sonnet-5-5`
  (`DEFAULT_ASSISTANT_MODEL` in `lib/llm-context.ts`; a public assistant on
  his own key, so cost matters) with server-side fallbacks, overridable by
  `ASSISTANT_MODEL`. Rate limited per IP. Returns 503 without a key.

### The code index

`npm run index:code` reads only the allowlist in `lib/code-index/policy.ts`
(surya-memory, surya-gates, surya-voice, surya-distro, project-eval), checks
each repo is public through the unauthenticated GitHub API (a private repo is
a 404 and is refused), indexes the README plus main source and infrastructure
files (no tests, fixtures, lockfiles, env files or binaries), drops any file
that trips a secret pattern, redacts personal details, removes links to any
of his repos that aren't on the allowlist (they may be private), and writes
excerpts of at most 25 lines with links pinned to the commit.
`npm run index:code -- --only surya-distro` re-indexes just that repo and
keeps the others exactly as they are. Commit the JSON so the
change is reviewable. Re-running moves the pinned commits, so re-check the
line ranges in `how-i-build.ts` afterwards (`npm run test:unit` checks they
resolve).

## Tests

- `npm run test:unit` (vitest): sanitiser, allowlist and file policy, index
  integrity, retrieval, Gates demo data, fit and ask normalisers, content rules.
- `npm run test:e2e` (Playwright): server-rendered sections, nav, theme,
  mobile widths, all three assistant modes with mocked `/api/ask`. Set
  `E2E_LIVE_ASSISTANT=1` for one real model call. `PLAYWRIGHT_BASE_URL` plus
  `VERCEL_AUTOMATION_BYPASS_SECRET` runs it against a protected preview.

## Rules for staying modular

1. Never hardcode venture or certification facts inside a component.
2. Read from the central content files; add derived helpers there if needed.
3. Reuse `Section`, `Card`, `Badge`, `Button`, `Reveal` instead of bespoke markup.
4. Keep animation in `Reveal` (and CSS) — don't scatter motion logic.
5. Prefer one-object additions over new components when extending data.
6. Make small, targeted changes; keep each component readable and focused.

---

## Performance baseline (task #1 — 2026-06-05)

> Historical. This predates the November 2026 overhaul, which removed the
> window manager, sidebar, panels and the lion assistant mark. After the
> overhaul the home page is 8.8 kB with 105 kB first-load JS.

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
3. ~~**Window views: lazy-load with `next/dynamic`**~~ — **Done (task #2).** All
   five window views are now code-split and loaded on demand via `next/dynamic`
   with `ssr: false`.
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
