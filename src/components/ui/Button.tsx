import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

interface LinkButtonProps extends BaseProps {
  href: string;
  /** When true, opens in a new tab with safe rel attributes. */
  external?: boolean;
}

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo/70 focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:opacity-50";

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-base-900 hover:bg-white hover:shadow-glow",
  secondary:
    "border border-line bg-white/[0.03] text-ink backdrop-blur hover:border-white/25 hover:bg-white/[0.06]",
  ghost: "text-ink-muted hover:text-ink",
};

function classesFor(variant: Variant, size: Size, className?: string) {
  return cn(base, sizes[size], variants[variant], className);
}

/**
 * Renders an accessible link styled as a button. Internal hrefs (starting with
 * "#" or "/") use next/link; external links open in a new tab.
 */
export function Button({
  children,
  href,
  external,
  variant = "primary",
  size = "md",
  className,
}: LinkButtonProps) {
  const classes = classesFor(variant, size, className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
