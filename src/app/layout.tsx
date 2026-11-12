import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Caveat } from "next/font/google";
import { site } from "@/content/site";
import { Backdrop } from "@/components/layout/Backdrop";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

// Three web fonts only — body (Inter), headings (Fraunces), handwriting
// (Caveat). Mono uses the system stack (--font-mono fallback in globals.css)
// to avoid shipping a fourth font for a handful of small technical labels.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const hand = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.meta.title,
    template: `%s · ${site.name}`,
  },
  description: site.meta.description,
  applicationName: site.fullName,
  authors: [{ name: site.fullName }],
  creator: site.fullName,
  keywords: [
    "Krishant Maharaj",
    "Krishant",
    "Surya",
    "Surya Gates",
    "Surya Memory",
    "Project Eval",
    "AI engineer",
    "solution architect",
    "agentic engineering",
    "Claude Agent SDK",
    "LangGraph",
    "Kubernetes",
    "cloud architecture",
    "New Zealand",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    title: site.meta.title,
    description: site.meta.description,
    siteName: site.fullName,
    locale: "en_NZ",
  },
  twitter: {
    card: "summary_large_image",
    title: site.meta.title,
    description: site.meta.description,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/lion-black.png", type: "image/png" }],
    apple: "/lion-black.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#14100c",
  width: "device-width",
  initialScale: 1,
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.fullName,
  url: site.url,
  sameAs: [site.contact.linkedin, site.contact.github].filter(Boolean),
  jobTitle: "AI engineer and solution architect",
  description: site.meta.description,
  email: site.contact.email,
};

/**
 * Runs before paint to set the saved theme (defaulting to warm-dark), so there
 * is no flash of the wrong theme on load.
 */
const themeBootstrap = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='dark';}d.setAttribute('data-theme',t);}catch(e){d.setAttribute('data-theme','dark');}})();`;

/**
 * Root shell: a fixed header with anchor links, the page, and the footer.
 * The Backdrop sits behind everything. The theme bootstrap runs first so
 * there is no flash of the wrong theme.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${hand.variable}`}
    >
      <body className="relative min-h-svh">
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Backdrop />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-base-900"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="relative">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
