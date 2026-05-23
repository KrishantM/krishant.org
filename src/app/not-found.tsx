import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center justify-center px-5 text-center">
      <div className="max-w-md">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-ink-faint">
          404
        </p>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tightest text-ink sm:text-5xl">
          This signal didn&apos;t resolve.
        </h1>
        <p className="mt-5 text-pretty leading-relaxed text-ink-muted">
          The page you&apos;re looking for isn&apos;t here. Head back to the index
          and explore the ventures.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/" variant="primary" size="lg">
            Return to {site.name}
            <span aria-hidden>→</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
