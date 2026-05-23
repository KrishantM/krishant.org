# Design guidelines — krishant.org

The site should feel **ambitious, premium, future-facing, slick, slightly
mysterious, high-signal, cinematic, and alive** — confident but not arrogant,
technical underneath but never résumé-like.

Every change should protect that feeling while keeping the site **clear**.

## Visual direction

- **Dark-first.** Deep, slightly-blue near-black base (`base` = `#06070d`) with
  layered surfaces (`base-800`, `base-700`).
- **Layered depth.** Glassmorphism (faint borders, subtle blur, inner
  highlights), soft glow fields, a faded grid overlay, and fine hairlines.
- **Constellation / system-map motif.** Krishant sits at the centre; ventures
  branch outward, connected by fine lines. This is the signature visual — keep
  it crisp, not busy.
- **Accent colours carry meaning.** Each venture owns one accent
  (`cyan, indigo, violet, emerald, amber, sky, rose`). Accents are used for
  dots, glows, and edges — sparingly. The base UI stays near-monochrome so the
  accents read as signal, not decoration.

## Typography

- One clean sans (Inter) for everything; a mono (JetBrains Mono) for eyebrows,
  labels, codes, and the `.org` mark.
- **Tight tracking** on large headings (`tracking-tightest`), generous line
  height on body.
- Use `text-balance` on headings and `text-pretty` on paragraphs.
- Hierarchy comes from **size, weight, and colour** (`ink` → `ink-muted` →
  `ink-faint`), not from many fonts or many colours.

## Colour & motion

- Keep most of the surface monochrome; let glow and accents do the lifting.
- Motion is **tasteful and purposeful**: staggered reveals on scroll, gentle
  hover lifts, slow drifting glows, a subtle constellation "flow."
- Nothing should bounce, spin fast, or distract from reading.
- **Always honour `prefers-reduced-motion`.** The `Reveal` component and
  `globals.css` already collapse animation to a static end-state — preserve
  this in anything new.

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
- Fake startup hype, buzzword soup, walls of text.
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
