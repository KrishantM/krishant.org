# Design guidelines — krishant.org

The site should feel **ambitious, premium, future-facing, slick, slightly
mysterious, high-signal, cinematic, and alive** — confident but not arrogant,
technical underneath but never résumé-like.

Every change should protect that feeling while keeping the site **clear**.

## Visual direction

- **Warm, dual-theme.** Two themes share one token set: warm-**dark** (espresso
  base `#14100C`, cream ink) is the default and the cinematic first impression;
  warm-**light/paper** (`#F4EDE0`, near-black ink) is the daytime counterpart.
  The toggle lives in the nav and is remembered. Both must always look
  intentional — never style one and let the other break.
- **Token-driven colour.** Never hardcode hex in components. Colours are CSS
  variables (`globals.css`) surfaced as Tailwind tokens: `base`, `surface`
  (glass overlay — inverts per theme), `ink` / `ink-muted` / `ink-faint`,
  `line`, `accent` (amber), `accent-gold` (honey). Overlays use `surface/[α]`; stronger
  borders use `ink/[α]`. This is what makes "white-on-dark" become
  "dark-on-paper" automatically.
- **Layered depth.** Glassmorphism (faint borders, subtle blur), soft glow
  fields, a faded grid, fine hairlines.
- **Constellation / system-map motif.** Krishant sits at the centre; ventures
  branch outward on fine lines. Keep it crisp, not busy.
- **Accent colours carry meaning.** The signature accent is **amber-honey**
  (amber `#FFB454` + honey `#F6C453`). Each venture owns one accent from the warm
  amber-honey family (`amber, honey, orange, caramel, gold, copper`), used for
  dots, glows, and edges — sparingly, so they read as signal, not decoration.

## Typography

- **Fraunces** (soft serif) sets display/headings — it carries the warm,
  hand-crafted character. **Inter** handles body and UI. **Caveat** is the
  handwriting voice (the signature, eyebrow markers, the Currently label, the
  sign-off). **JetBrains Mono** is reserved for codes and small technical bits.
- Use `font-display` / `font-hand` / `font-mono` tokens; don't introduce more
  faces.
- Use `text-balance` on headings and `text-pretty` on paragraphs.
- Hierarchy comes from **face, size, weight, and colour** (`ink` → `ink-muted`
  → `ink-faint`) — not from many colours.

## Colour & motion

- Let warmth, glow, and the single amber accent do the lifting; keep the rest
  restrained.
- Motion is **tasteful and purposeful**: staggered reveals, gentle hover lifts,
  slow drifting glows, the constellation "flow," and the hand-drawn **draw-on**
  stroke in the `Signature` mark that sketches itself in on load.
- Nothing should bounce, spin fast, or distract from reading.
- **Always honour `prefers-reduced-motion`.** `Reveal`, the draw-on strokes, and
  `globals.css` already collapse to a static end-state — preserve this. Theme
  changes also transition gently.

## Interaction principles

- **Hover reveals, it doesn't gate.** Constellation nodes show a short summary on
  hover/focus; the information is always reachable by keyboard too.
- **External venture links open in a new tab** (`target="_blank"` +
  `rel="noopener noreferrer"`). Internal detail pages use `next/link`.
- Interactive cards use the **stretched-link** pattern (one primary anchor over
  the card, secondary links layered above) — never nest anchors.
- Provide clear focus states; never communicate meaning with colour alone (pair
  every status dot with text).

## What to avoid

- Generic portfolio / case-study layouts.
- Corporate CV or résumé structures (timelines, duty lists).
- Student-project or startup-directory energy.
- Fake startup bravado, buzzword soup, walls of text.
- A LinkedIn-style or badge-wall treatment of credentials.
- One-off visual hacks that fight the system (prefer Tailwind tokens + the
  shared `Card`, `Badge`, `Button`, `Section`, `Reveal` primitives).

## Keeping it premium *and* clear

- Lead with **whitespace and restraint**. If a section feels crowded, cut, don't
  cram.
- Copy stays **sharp, minimal, and confident**. Short lines beat paragraphs.
- Let one strong idea own each section. The "wow" comes from depth, motion, and
  typography — not from more elements on screen.

## Credentials, specifically

- Present PwC + certifications as a **grounding credibility layer**, compact and
  beneath the ventures — never the headline.
- Certifications: a tidy list with codes and a status dot. **Not** a wall of
  badges or logos.
- Capability pillars are a single restrained row, not a skills matrix.

## Responsiveness

- Excellent on desktop, tablet, and mobile. **No horizontal overflow** (the body
  enforces `overflow-x: hidden`; still design so nothing relies on it).
- The constellation collapses to a clean **stacked card layout** below `lg`.
- Animations must never break mobile usability or layout.
