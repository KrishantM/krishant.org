/**
 * Site-wide copy, identity, navigation and links.
 *
 * Change wording here, not inside components. The voice is first person and
 * plain: short sentences, no flourishes, no self-praise, no semicolons, and
 * as few em dashes as possible (none in anything the assistant says).
 */

export const site = {
  name: "Krishant",
  fullName: "Krishant Maharaj",
  domain: "krishant.org",
  url: "https://krishant.org",
  location: "Aotearoa New Zealand",

  meta: {
    title: "Krishant Maharaj",
    description:
      "Krishant Maharaj is an AI engineer and solution architect at PwC. He builds Surya, a family of open tools for working with AI agents, from Aotearoa New Zealand.",
    ogImageAlt: "Krishant Maharaj, krishant.org",
  },

  contact: {
    email: "krishantm7@gmail.com",
    linkedin: "https://www.linkedin.com/in/krishant-maharaj",
    github: "https://github.com/KrishantM" as string | null,
  },

  /** In-page anchors. One scrolling page, so every item is a section id. */
  nav: [
    // Rooted at "/" so the header works from the venture pages too.
    { href: "/#surya", label: "Surya" },
    { href: "/#how-i-build", label: "How I build" },
    { href: "/#credentials", label: "Credentials" },
    { href: "/#connect", label: "Connect" },
  ],

  hero: {
    greeting: "Hey, I'm",
    name: "Krishant Maharaj",
    headline: "I like building stuff.",
    subline:
      "By day I'm an AI engineer and solution architect at PwC. The rest of the time I build Surya, open tools for working with AI agents.",
    primaryCta: { href: "#surya", label: "See what I'm building" },
  },

  /** The assistant in the hero. Three modes, each with its own copy. */
  assistant: {
    label: "Talk to my work",
    honesty: "An assistant on my site, running on Claude. It only talks about my work.",
    tabs: {
      ask: "Ask",
      gates: "Try Surya Gates",
      fit: "Fit check",
    },
    ask: {
      welcome:
        "Ask about my work, or how one of my open-source tools works. When an answer is about code, it quotes the real source and links to the lines.",
      placeholder: "Ask about my work or my code...",
      suggestions: [
        { label: "How does Gates decide what needs a yes?", query: "How does Surya Gates decide which tool calls need a person's approval?" },
        { label: "How does Project Eval grade?", query: "How does Project Eval grade an agent's work with LangGraph?" },
        { label: "How does Memory avoid losing edits?", query: "How does Surya Memory make sure no edit is lost?" },
        { label: "What are you building?", query: "What are you building right now?" },
        { label: "What do you do at PwC?", query: "What do you do at PwC?" },
        { label: "How can I reach you?", query: "How can I reach you?" },
      ],
      codeNote: "Quoted from the public repo",
    },
    gates: {
      intro:
        "Pick something an agent might try. Each verdict is real output from Surya Gates' classifier, run on its public code.",
      realOutput: "Real output from Surya Gates",
      verdicts: {
        pass: "Carries on",
        stop: "Waits for a person",
        refuse: "Refused outright",
      },
      trustable: "Can be trusted for a session",
      neverTrustable: "Always asks, even when you trust a session",
      passNote: "Nothing consequential, so the agent keeps going.",
      refuseNote: "No yes would make sense here, so nobody is asked.",
      phoneNote: "In a real session, the question can reach your phone by ntfy, iMessage, Telegram or SMS.",
    },
    fit: {
      intro:
        "Paste a job description. I'll map what it asks for to work you can check: repos, products, certifications and my day job.",
      placeholder: "Paste a job description here...",
      submit: "Map it to my work",
      matchesHeading: "Where my work lines up",
      sourceNote:
        "The line under each link is from this site, word for word. The assistant only chose which work fits each requirement.",
      discussHeading: "Happy to go deeper on these in a conversation",
      discussCta: "Get in touch",
      minLength: 120,
      maxLength: 8000,
      tooShort: "Paste a bit more of the job description so there's something to map.",
    },
    errors: {
      generic: "Something on my side broke for a second. Try again in a moment.",
      unavailable: "The live assistant isn't available on this deploy. The rest of the page has everything it would tell you.",
    },
  },

  sections: {
    surya: {
      eyebrow: "01 · what I'm building",
      title: "The Surya family",
    },
    howIBuild: {
      eyebrow: "02 · how I build",
      title: "How I build",
      lede: "Claims you can check. Each one links to the code, the certification or the statement behind it.",
    },
    dayJob: {
      eyebrow: "03 · day job",
      title: "PwC",
    },
    credentials: {
      eyebrow: "04 · certified",
      title: "Credentials",
    },
    earlier: {
      eyebrow: "05 · before Surya",
      title: "Earlier ventures",
    },
    connect: {
      eyebrow: "06 · say hello",
      title: "Let's talk",
      lede: "Building something, hiring, or curious about how any of this works? I'd like to hear from you.",
    },
  },

  footer: {
    tagline: "AI products and systems, built from Aotearoa New Zealand.",
    note: "Designed and built by Krishant Maharaj.",
    signoff: "Thanks for stopping by",
  },
} as const;

export type Site = typeof site;
