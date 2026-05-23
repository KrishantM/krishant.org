import type { Venture } from "@/types/venture";
import { VentureCard } from "@/components/ventures/VentureCard";
import { Reveal } from "@/components/ui/Reveal";

interface VentureGridProps {
  ventures: Venture[];
}

/**
 * Responsive grid of venture cards. Featured / parent ventures span wider on
 * large screens to create visual hierarchy without any per-card hardcoding.
 */
export function VentureGrid({ ventures }: VentureGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
      {ventures.map((venture, i) => (
        <Reveal
          key={venture.slug}
          delay={i * 0.06}
          as="div"
          className={
            // Top-level ventures take two columns of the 6-col grid; sub-brands
            // take three so two sit neatly side by side on the final row.
            venture.parent ? "lg:col-span-3" : "lg:col-span-2"
          }
        >
          <VentureCard venture={venture} index={i} />
        </Reveal>
      ))}
    </div>
  );
}
