# Strategic context — krishant.org

This file captures **why** krishant.org exists and the guardrails that keep it on
course. Read this before making meaningful changes to copy, structure, or tone.

## What it is

krishant.org is a **forwardable personal domain** for Krishant Maharaj.

When Krishant meets a lead, collaborator, investor, client, founder, creator, or
otherwise interesting person, he should be able to send them `krishant.org` and
let the site do useful work on his behalf:

- show that he builds real things
- make his ventures accessible
- establish credibility
- signal ambition
- give a sense of the person behind the work
- make it easy to get in touch
- create interest in what he offers now and what he may build next

The site should create **credibility, curiosity, and commercial interest**.

## What it is NOT

- **Not a CV / résumé.** No job-history timeline, no responsibilities lists, no
  bullet-pointed duties.
- **Not a generic portfolio.** No "selected works" gallery energy, no case-study
  template feel.
- **Not a startup directory.** It indexes _Krishant's_ ventures, not a catalogue.
- **Not a "venture hub."** Never use that phrase anywhere — UI, metadata,
  README, docs, or internal notes.

It should feel current, active, and future-facing — never a static archive.

## Language & labels

- The brand is **Krishant** (primary) / **Krishant Maharaj** (fuller, formal).
- Canonical domain: **krishant.org**.
- **"Ventures"** is the approved nav label and section title for active work.
- **"Credentials"** is the nav label covering both PwC and certifications.
- Top-level nav is exactly: **Ventures · Credentials · Who is Krishant? ·
  Connect**.
- Avoid: Portfolio, Resume, CV, Work, Projects, "Professional Signal", or PwC as
  a standalone nav item.

## Credentials guardrails

The Credentials section is a **credibility layer**, not the centre of gravity. It
must never make the site feel like LinkedIn or a certification badge wall.

It has two **separate** blocks:

1. **PwC** — referenced directly (it carries real brand recognition), but only at
   a high level. PwC is **professional background, not an independent venture**.
2. **Certifications** — kept distinct from PwC, designed so future certs (Azure,
   GCP, …) drop in cleanly.

### PwC confidentiality (non-negotiable)

- No client names.
- No specific PwC projects.
- No implied ownership of PwC client outcomes.
- No internal methods, deliverables, or confidential information.
- Keep it high-level, credible, and safe.

The approved framing lives in `src/content/certifications.ts` (`pwc.statement`)
and centres on cloud, architecture, security, enterprise technology, and
delivery in complex environments.

## Future-proofing

- New ventures are added by appending one object to `src/content/ventures.ts`.
- New certifications are added by appending one object to
  `src/content/certifications.ts`.
- The site is built to grow without structural rework.

## The person

"Who is Krishant?" should read as concise, founder-like, and human — interested
in the gap between how systems work today and how they could work if rebuilt with
better software, clearer incentives, and sharper execution. Themes: building real
things, challenging dated systems, AI as leverage (not the whole product),
strong technical foundations, creator infrastructure, commercial execution,
curiosity and taste. Avoid life story, generic "passionate about technology,"
excessive humility, and founder clichés.
