/**
 * Site-wide copy, identity, navigation and links.
 *
 * Change wording here, not inside components. The voice is first-person and
 * warm, like Krishant talking, not a brochure. Keep it tight all the same.
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
      "Krishant Maharaj is an AI engineer and solution architect building Surya, an AI operator that runs the whole business, from Aotearoa New Zealand.",
    ogImageAlt: "Krishant Maharaj, krishant.org",
  },

  contact: {
    email: "krishantm7@gmail.com",
    linkedin: "https://www.linkedin.com/in/krishant-maharaj",
    github: "https://github.com/KrishantM" as string | null,
  },

  /**
   * The sidebar nav. Each `key` maps to a window in WindowsProvider — these are
   * NOT routes; the sidebar opens windows in place rather than navigating, so
   * no item here should carry an href (the old `/ventures`-style routes no
   * longer exist and would 404). The K monogram at the top of the sidebar is
   * the home (console) affordance and is rendered separately. `tooltip` is the
   * short label shown on hover, `description` is a one-line elaboration shown
   * beneath the title inside each window.
   */
  nav: [
    {
      key: "ventures",
      label: "Ventures",
      tooltip: "Ventures",
      description: "What I'm building, with Surya in the lead.",
    },
    {
      key: "map",
      label: "Map",
      tooltip: "The map",
      description: "How everything I'm building connects.",
    },
    {
      key: "credentials",
      label: "Credentials",
      tooltip: "Credentials",
      description: "Professional background and certified depth.",
    },
    {
      key: "about",
      label: "About",
      tooltip: "About me",
      description: "Who I am and how I think.",
    },
    {
      key: "connect",
      label: "Connect",
      tooltip: "Connect",
      description: "Say hello, or start a conversation.",
    },
  ],

  hero: {
    greeting: "Hey, I'm",
    name: "Krishant Maharaj",
    headline: "I build AI that actually runs things.",
    subline:
      "Right now that's Surya, an AI operator that plans, builds and runs the whole business with you. By day I build agentic systems as an AI engineer and solution architect at PwC.",
    /** Copy for the interactive "ask" console in the hero. */
    console: {
      placeholder: "Ask me anything about my work...",
      welcome:
        "Ask me anything about my background, what I'm building, or how to reach me. Or tap a prompt below.",
      suggestions: [
        { label: "What are you building?", query: "what are you building" },
        { label: "Tell me about Surya", query: "tell me about surya" },
        { label: "Tell me about Gradual", query: "tell me about gradual" },
        { label: "What do you do at PwC?", query: "what do you do at pwc" },
        { label: "What's your background?", query: "what is your background" },
        { label: "How can I reach you?", query: "how can i reach you" },
      ],
    },
  },

  sections: {
    ventures: {
      eyebrow: "01 · what I'm building",
      title: "Ventures",
      lede: "Surya has most of my attention right now. It's an AI operator that plans, builds and runs a business with you. Gradual was my previous startup, and Hiko came before it. Real products, not slideware.",
    },
    constellation: {
      eyebrow: "02 · how it all connects",
      title: "The map in my head",
      lede: "Everything I'm building orbits the same centre. Have a play with the map. Hover a node for the gist, open one to go deeper.",
    },
    credentials: {
      eyebrow: "03 · the credibility bit",
      title: "Credentials",
      lede: "What sits underneath the ambition: professional experience and certified technical depth. Context, not a CV.",
    },
    who: {
      eyebrow: "04 · the person behind it",
      title: "Who is Krishant?",
    },
    connect: {
      eyebrow: "05 · say hello",
      title: "Let's talk",
      lede: "Building something, weighing up a collaboration, or just curious? I'd love to hear from you.",
    },
  },

  /** A small, easy-to-update snapshot of what has my attention right now. */
  currently: {
    label: "Currently",
    note: "A quick snapshot of what's got my attention right now.",
    items: [
      { label: "Building", value: "Surya, an AI operator that runs the whole business" },
      { label: "Day job", value: "AI engineer and solution architect at PwC" },
      { label: "Exploring", value: "AI agents that earn the trust to act on your behalf" },
      { label: "Certified", value: "AWS Solutions Architect and Databricks Platform Architect" },
      { label: "Based in", value: "Aotearoa New Zealand" },
    ],
  },

  /** "Who is Krishant?" copy: concise, warm, first-person. */
  who: {
    lead: "I'm drawn to the gap between how things work now and how they'd work if someone rebuilt them properly. Better software, clearer incentives, and the patience to actually ship.",
    body: [
      "I build real things. Most of what I make starts with a process that's clearly broken and a stubborn belief it can be done right. Cleaner architecture, AI that earns its place, and something that makes commercial sense.",
      "By day I'm an AI engineer and solution architect at PwC, building agentic systems for large organisations. The rest goes into Surya, which I'm building with my brother. Before that came Gradual and Hiko. The throughline is curiosity, taste, and a habit of shipping. I work mostly from Aotearoa New Zealand.",
    ],
    principles: [
      { title: "Build real things", note: "Shipped products beat decks and good intentions." },
      { title: "Rebuild dated systems", note: "Find the gap, then close it properly." },
      { title: "AI as leverage", note: "A multiplier on good software, not the whole product." },
      { title: "Foundations first", note: "Cloud, architecture, and security under the surface." },
      { title: "Commercial execution", note: "Ideas that stand up in the real world." },
      { title: "Curiosity and taste", note: "The instinct for what's worth building next." },
    ],
  },

  footer: {
    tagline: "AI products and systems, built from Aotearoa New Zealand.",
    note: "Designed and built by Krishant Maharaj.",
    signoff: "Thanks for stopping by",
  },
} as const;

export type Site = typeof site;
