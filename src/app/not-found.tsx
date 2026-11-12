import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="relative mx-auto flex min-h-[70svh] w-full max-w-shell flex-col justify-center px-4 pb-20 pt-28 sm:px-8">
      <p className="font-hand text-2xl text-accent">404</p>
      <h1 id="nf-title" className="mt-2 text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
        This page isn&apos;t here.
      </h1>
      <p className="mt-4 max-w-xl text-pretty text-lg text-ink-muted">
        The link may be old. Everything I&apos;m working on is on the home page.
      </p>
      <div className="mt-8">
        <Button href="/" variant="primary" size="lg">
          Back to {site.name}
          <span aria-hidden>→</span>
        </Button>
      </div>
    </section>
  );
}
