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
      "Krishant Maharaj — using AI, cloud architecture, and systems thinking to rebuild dated workflows. Building Gradual and Hiko from Aotearoa New Zealand.",
    ogImageAlt: "Krishant Maharaj, krishant.org",
  },

  contact: {
    email: "krishantm7@gmail.com",
    linkedin: "https://www.linkedin.com/in/krishant-maharaj",
    /** No public repository yet. Replace when one exists. */
    github: null as string | null,
  },

  /**
   * The sidebar nav. Each item is a route; the K monogram at the top of the
   * sidebar is the home (console) affordance and is rendered separately.
   * `tooltip` is the short label shown on hover, `description` is a one-line
   * elaboration shown beneath the title inside each overlay panel header.
   */
  nav: [
    {
      key: "ventures",
      label: "Ventures",
      href: "/ventures",
      tooltip: "Ventures",
      description: "What I'm building, with Gradual and Hiko in the lead.",
    },
    {
      key: "map",
      label: "Map",
      href: "/map",
      tooltip: "The map",
      description: "How everything I'm building connects.",
    },
    {
      key: "credentials",
      label: "Credentials",
      href: "/credentials",
      tooltip: "Credentials",
      description: "Professional background and certified depth.",
    },
    {
      key: "about",
      label: "About",
      href: "/about",
      tooltip: "About me",
      description: "Who I am and how I think.",
    },
    {
      key: "connect",
      label: "Connect",
      href: "/connect",
      tooltip: "Connect",
      description: "Say hello, or start a conversation.",
    },
  ],

  hero: {
    greeting: "Hey, I'm",
    name: "Krishant Maharaj",
    headline: "I rebuild dated workflows with AI and cloud architecture.",
    subline:
      "Systems thinking, real products, and the technical depth to ship them properly.",
    /** Copy for the interactive "ask" console in the hero. */
    console: {
      placeholder: "Ask me anything about my work...",
      welcome:
        "Ask me about Krishant’s background, what he’s building, how to get in touch - or tap a prompt below.",
      suggestions: [
        { label: "What are you building?", query: "what are you building" },
        { label: "Tell me about Gradual", query: "tell me about gradual" },
        { label: "Tell me about Hiko", query: "tell me about hiko" },
        { label: "What's your background?", query: "what is your background" },
        { label: "How can I reach you?", query: "how can i reach you" },
      ],
    },
  },

  sections: {
    ventures: {
      eyebrow: "01 · what I'm building",
      title: "Ventures",
      lede: "Two ventures have my full attention right now: Gradual and Hiko. Real products, not slideware.",
    },
    creatorHq: {
      eyebrow: "02 · the ecosystem",
      title: "The CreatorHQ ecosystem",
      lede: "CreatorHQ is the operating layer beneath creator-led brands: the infrastructure for content systems, audience growth, and digital brand operations. TrenTwinsHQ and LexxLittleHQ are built on it.",
    },
    constellation: {
      eyebrow: "03 · how it all connects",
      title: "The map in my head",
      lede: "Everything I'm building orbits the same centre. Have a play with the map. Hover a node for the gist, open one to go deeper.",
    },
    credentials: {
      eyebrow: "04 · the credibility bit",
      title: "Credentials",
      lede: "The grounding underneath the ambition: professional experience and certified technical depth. Context, not a CV.",
    },
    who: {
      eyebrow: "05 · the person behind it",
      title: "Who is Krishant?",
    },
    connect: {
      eyebrow: "06 · say hello",
      title: "Let's talk",
      lede: "Building something, weighing a collaboration, or just curious? I'd genuinely love to hear from you.",
    },
  },

  /** A small, easy-to-update snapshot of what has my attention right now. */
  currently: {
    label: "Currently",
    note: "A quick snapshot of what's got my attention right now.",
    items: [
      { label: "Building", value: "Gradual and Hiko, in parallel and on purpose" },
      { label: "Exploring", value: "AI as everyday leverage for real workflows" },
      { label: "Growing", value: "The CreatorHQ ecosystem and its brands" },
      { label: "Based in", value: "Aotearoa New Zealand" },
    ],
  },

  /** "Who is Krishant?" copy: concise, warm, first-person. */
  who: {
    lead: "I'm drawn to the gap between how things work today and how they could work if you rebuilt them with better software, clearer incentives, and the patience to actually ship.",
    body: [
      "I build real things. Most of what I make starts with a dated process or an obvious gap, and a stubborn belief that it can be done cleaner, with AI as leverage, solid technical foundations, and a genuine commercial edge.",
      "My range runs from cloud and architecture through to creator infrastructure and consumer products. The throughline is taste, curiosity, and a bias for shipping. I do most of this from Aotearoa New Zealand.",
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
    tagline: "Software, systems, and digital ventures, built for what comes next, from Aotearoa New Zealand.",
    note: "Designed and built by Krishant Maharaj.",
    signoff: "Thanks for stopping by",
  },
} as const;

export type Site = typeof site;
