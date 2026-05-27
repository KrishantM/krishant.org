import { cn } from "@/lib/utils";

interface SignatureProps {
  className?: string;
  /** The signed name. */
  label?: string;
  /** Draw the underline swash beneath the name. */
  flourish?: boolean;
}

/**
 * Krishant's hand-drawn signature mark — the name set in the handwriting face
 * with an amber swash that draws itself on (CSS `.draw-on`). Used as the logo
 * and as a recurring personal motif. Reduced-motion shows it fully drawn.
 */
export function Signature({
  className,
  label = "Krishant",
  flourish = true,
}: SignatureProps) {
  return (
    <span className={cn("relative inline-block font-hand leading-none", className)}>
      <span className="relative z-10">{label}</span>
      {flourish && (
        <svg
          className="absolute -bottom-[0.35em] left-0 w-[108%] -translate-x-[2%]"
          viewBox="0 0 340 24"
          height="0.5em"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M6 15 C 74 4, 158 4, 226 12 C 280 18, 312 20, 334 7"
            stroke="rgb(var(--accent))"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="draw-on draw-on-delayed"
            style={{ ["--draw-len" as string]: 380 }}
          />
        </svg>
      )}
    </span>
  );
}
