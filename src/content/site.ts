/**
 * Site-wide copy, identity, navigation and links.
 *
 * Change wording here — not inside components. Components read from this file so
 * copy can evolve without touching presentation logic.
 */

export const site = {
  name: "Krishant",
  fullName: "Krishant Maharaj",
  domain: "krishant.org",
  url: "https://krishant.org",

  meta: {
    title: "Krishant Maharaj",
    description:
      "The personal domain of Krishant Maharaj — ventures, credentials, and work across software, AI, cloud, creator infrastructure, and digital products.",
    ogImageAlt: "Krishant Maharaj — krishant.org",
  },

  contact: {
    email: "krishantm7@gmail.com",
    linkedin: "https://www.linkedin.com/in/krishant-maharaj",
    /** No public repository yet — replace when one exists. */
    github: null as string | null,
  },

  nav: [
    { label: "Ventures", href: "#ventures" },
    { label: "Credentials", href: "#credentials" },
    { label: "Who is Krishant?", href: "#who" },
    { label: "Connect", href: "#connect" },
  ],

  hero: {
    eyebrow: "krishant.org",
    name: "Krishant Maharaj",
    headline: "Building at the edge of software, AI, cloud, and digital systems.",
    subline:
      "A living index of the ventures, systems, and ideas I'm shaping — and the people, products, and conversations that follow.",
    primaryCta: { label: "Explore ventures", href: "#ventures" },
    secondaryCta: { label: "Connect", href: "#connect" },
    /** Short signal chips under the hero. */
    signals: [
      "Software & AI",
      "Cloud architecture",
      "Creator infrastructure",
      "Digital products",
    ],
  },

  sections: {
    ventures: {
      eyebrow: "01 — Active work",
      title: "Ventures",
      lede: "A focused set of things I'm building right now, across learning, local discovery, and creator infrastructure.",
    },
    constellation: {
      eyebrow: "02 — System map",
      title: "An operating constellation",
      lede: "krishant.org sits at the centre of a connected set of ventures. Explore the map — hover a node for the essence, open one to go deeper.",
    },
    creatorHq: {
      eyebrow: "03 — Ecosystem",
      title: "The CreatorHQ ecosystem",
      lede: "CreatorHQ is the operating layer beneath creator-led brands — the infrastructure for content systems, audience growth, and digital brand operations.",
    },
    credentials: {
      eyebrow: "04 — Credibility",
      title: "Credentials",
      lede: "A grounding layer of professional experience and certified technical depth — context, not a CV.",
    },
    who: {
      eyebrow: "05 — The person",
      title: "Who is Krishant?",
    },
    connect: {
      eyebrow: "06 — Open line",
      title: "Let's talk",
      lede: "Interested in what I'm building, exploring a collaboration, or want to start a conversation?",
    },
  },

  /** "Who is Krishant?" — concise, founder-like, human. */
  who: {
    lead: "I'm interested in the gap between how systems work today and how they could work if rebuilt with better software, clearer incentives, and sharper execution.",
    body: [
      "I build real things. Most of what I make starts with a dated process or an obvious gap, and a conviction that it can be rebuilt cleaner — with AI as leverage, strong technical foundations, and a commercial edge rather than hype.",
      "My range runs from cloud and architecture through to creator infrastructure and consumer products. The throughline is taste, curiosity, and the discipline to actually ship.",
    ],
    principles: [
      { title: "Build real things", note: "Shipped products over decks and intentions." },
      { title: "Rebuild dated systems", note: "Find the gap, then close it cleanly." },
      { title: "AI as leverage", note: "A multiplier on good software — not the whole product." },
      { title: "Foundations first", note: "Cloud, architecture, and security underneath the surface." },
      { title: "Commercial execution", note: "Ideas that stand up in the real world." },
      { title: "Curiosity & taste", note: "The instinct for what's worth building next." },
    ],
  },

  footer: {
    tagline: "Software, systems, and digital ventures built for what comes next.",
    note: "Designed & built by Krishant Maharaj.",
  },
} as const;

export type Site = typeof site;
