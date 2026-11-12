# krishant.org

The personal domain of **Krishant Maharaj** — a forwardable surface for the
ventures he's building, the credentials behind the work, a sense of who he is,
and a direct way to get in touch.

It is **not** a CV, a generic portfolio, or a startup directory. It's a polished,
future-facing index of active work.

---

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS 3.4**
- **Framer Motion** for tasteful, reduced-motion-aware animation
- Deployed on **Vercel**, domain managed via **Cloudflare**

---

## Run locally

Requires Node 18.17+ (Node 20+ recommended).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

## Editing content

All copy and data is **data-driven** and lives under `src/content/`. You can
update the entire site without touching component logic.

### Add or edit a venture

Edit **`src/content/ventures.ts`** and add one object to the `ventures` array:

```ts
{
  name: "New Venture",
  slug: "new-venture",
  url: "https://example.com",        // or null if no public site yet
  externalUrl: "https://example.com",// keep in sync with url
  category: "Category / Line",
  status: "Active",                   // "Active" | "Building" | "Exploring"
  summary: "One-line essence.",
  description: "A tighter paragraph for the detail page.",
  role: "Founder / Builder",
  focusAreas: ["Area one", "Area two"],
  tags: ["Tag"],
  accent: "amber",                    // see accent keys below
  featured: true,
  parent: null,                       // or a parent slug e.g. "creatorhq"
  hasInternalPage: true,             // generates /ventures/new-venture
}
```

That single object flows into the **grid**, the **constellation**, related
sections, and (if `hasInternalPage` is true) a detail page at
`/ventures/<slug>`.

**Accent keys** (amber-honey palette, defined in `src/lib/utils.ts` `accentHex`):
`amber`, `honey`, `orange`, `caramel`, `gold`, `copper`.

> If you add a venture to the constellation map, also give it a position in the
> `layout` map inside `src/components/ventures/VentureConstellation.tsx` (these
> are presentation-only coordinates, kept out of the data model on purpose).

### Add or edit a certification

Edit **`src/content/certifications.ts`** and add one object to the
`certifications` array:

```ts
{
  name: "Microsoft Certified: Azure Solutions Architect Expert",
  provider: "Microsoft",
  code: "AZ-305",
  status: "Active",
  category: "Cloud Architecture",
  // issuedDate: "2026-01-01",     // optional — omit rather than invent
  credentialUrl: null,            // leave null until a real URL exists
}
```

Do **not** invent issue dates or credential URLs. Leave them omitted / `null`.

### Edit site-wide copy & links

Edit **`src/content/site.ts`** — identity, navigation, hero copy, assistant
copy, section headings, contact links, location, and footer text all live
there. The voice is first-person and warm by design.

### Edit the Surya family or "How I build"

- **`src/content/surya.ts`** — one object per tool, with its tier (`live`,
  `development`, `next`). A live tool's `repo` must be on the code-index
  allowlist.
- **`src/content/how-i-build.ts`** — each claim and its proofs. Code proofs
  name a repo, path and line range and are pinned to the indexed commit.

### Regenerate the assistant's data

```bash
npm run index:code   # public repos on the allowlist -> src/content/code-index.json
npm run demo:gates   # real Surya Gates verdicts -> src/content/gates-demo.json
npm run test:unit    # checks both, plus the sanitiser and proof links
```

Commit the generated JSON so every change to it is reviewable.

## Personality, theming & type

- **Two themes.** Warm-dark (default) and warm-light/paper, toggled in the nav
  and remembered via `localStorage`. Colours are CSS variables in
  `globals.css` (`:root` + `[data-theme="light"]`) mapped to Tailwind tokens
  (`base`, `surface`, `ink`, `line`, `accent`, `accent-gold`). Add a colour by
  setting its variable in both theme blocks — components reference tokens, never
  raw hex.
- **Signature accent:** amber (`#FFB454`) with a honey highlight (`#F6C453`).
- **Type:** Fraunces (display/headings), Inter (body/UI), Caveat (handwritten
  accents — the signature, eyebrows-as-marker, sign-off),
  JetBrains Mono (codes + technical bits). All loaded via `next/font`.
- **Motif:** the hand-drawn `Signature` (logo, draws itself on) carries the
  personality. Keep it reduced-motion friendly.
- **Hero:** the assistant, with three modes: Ask (answers quote the real
  public code and link to the lines), Try Surya Gates (real classifier
  verdicts) and Fit check (a job description mapped to evidence).

---

## Project structure

```
src/
  app/
    layout.tsx              # root layout, metadata, fonts, chrome
    page.tsx                # homepage (composes the sections)
    globals.css
    not-found.tsx
    opengraph-image.tsx     # dynamic OG image for shared links
    ventures/[slug]/page.tsx# data-driven venture detail pages
    api/ask/route.ts        # the assistant's model-backed modes
  components/
    layout/                 # SiteHeader, SiteFooter, Section, Backdrop
    hero/                   # Hero
    assistant/              # Assistant, AskMode, CodeCard, GatesDemo, FitCheck
    surya/                  # SuryaFamily, ToolCard, SuryaOrbit, TryItButton
    build/                  # HowIBuild
    credentials/            # DayJob, Certifications
    ventures/               # EarlierVentures
    contact/                # ContactCTA
    ui/                     # Badge, Button, Card, Reveal, Signature, ThemeToggle
  content/                  # surya.ts, how-i-build.ts, ventures.ts, certifications.ts,
                            # site.ts, plus generated JSON (code index, Gates demo)
  lib/                      # utils, sanitise, retrieval, assistant, evidence, proof,
                            # llm-context, code-index/policy
  types/                    # venture.ts, certification.ts, surya.ts, proof.ts
scripts/                    # build-code-index.mts, build-gates-demo.py
tests/unit/                 # vitest
e2e/                        # Playwright
public/
  icon.svg
```

See **ARCHITECTURE.md** for the deeper rationale.

---

## Deploy to Vercel + Cloudflare

High-level — full notes in **ARCHITECTURE.md**.

1. **Push to GitHub**, then import the repo into Vercel. Framework preset:
   _Next.js_ (auto-detected). `ANTHROPIC_API_KEY` powers the assistant; without
   it the page still works and the assistant says it isn't available.
2. Vercel runs `npm run build` and deploys automatically on every push.
3. **Add the domain** `krishant.org` (and `www.krishant.org`) in the Vercel
   project's _Domains_ settings.
4. In **Cloudflare DNS**, point the domain at Vercel using the records Vercel
   shows you (typically an `A`/`CNAME` for the apex and a `CNAME` for `www`).
   Set those records to **DNS only** (grey cloud) so Vercel can issue and manage
   the TLS certificate cleanly.
5. Once DNS verifies, `https://krishant.org` is live.

---

## Documentation map

- **README.md** — this file (run, edit, deploy)
- **CONTEXT.md** — what the site is _for_ and what it must not become
- **DESIGN_GUIDELINES.md** — the visual & interaction language
- **ARCHITECTURE.md** — code structure, data models, how to extend safely
- **CLAUDE.md** — guardrails for future AI-assisted edits
