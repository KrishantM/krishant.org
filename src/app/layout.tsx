import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Caveat } from "next/font/google";
import { site } from "@/content/site";
import { Backdrop } from "@/components/layout/Backdrop";
import { Sidebar } from "@/components/layout/Sidebar";
import { ConsoleSurface } from "@/components/hero/ConsoleSurface";
import { WindowsProvider } from "@/components/windows/WindowsProvider";
import { WindowManager } from "@/components/windows/WindowManager";
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
    "ventures",
    "software",
    "AI",
    "cloud architecture",
    "creator infrastructure",
    "digital products",
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
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#14100c",
  width: "device-width",
  initialScale: 1,
};

/**
 * Runs before paint to set the saved theme (defaulting to warm-dark), so there
 * is no flash of the wrong theme on load.
 */
const themeBootstrap = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='dark';}d.setAttribute('data-theme',t);}catch(e){d.setAttribute('data-theme','dark');}})();`;

/**
 * Root shell. The site is a console-first OS:
 *   • Sidebar — fixed nav (left rail on desktop, bottom bar + corner floats
 *     on mobile). Each icon toggles a window.
 *   • ConsoleSurface — the persistent landing experience (the AskConsole);
 *     stays mounted so conversation state survives window open/close.
 *   • WindowManager — renders the open OS-style windows (draggable, focusable,
 *     z-stacked) above the console.
 *   • {children} — the active route. `/` renders null (bare desktop); deep
 *     pages like `/ventures/[slug]` render as a Panel overlay.
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
        <Backdrop />
        <WindowsProvider>
          <Sidebar />
          <main className="relative md:pl-16">
            <ConsoleSurface />
            {children}
          </main>
          <WindowManager />
        </WindowsProvider>
      </body>
    </html>
  );
}
