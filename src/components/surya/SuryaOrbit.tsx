import { suryaTools, suryaTiers } from "@/content/surya";
import type { SuryaTool } from "@/types/surya";

/**
 * The Surya family as a small solar system: Surya Unite at the centre, the
 * live tools on the inner orbit, work in development further out, and what's
 * next on the faint outer ring. Server-rendered SVG; each node links to its
 * card. Positions are presentation, so they live here, not in the content.
 */

const C = 260;
const RINGS = { live: 128, development: 196, next: 244 } as const;

// Angle (degrees, 0 = right, clockwise) and label placement per node.
type Place = { angle: number; label: "above" | "below" | "left" | "right" };
const PLACES: Record<string, Place> = {
  "surya-gates": { angle: -90, label: "above" },
  "surya-memory": { angle: -18, label: "right" },
  "surya-voice": { angle: 54, label: "below" },
  "surya-distro": { angle: 126, label: "below" },
  "project-eval": { angle: 198, label: "left" },
  "surya-coordinator": { angle: -140, label: "above" },
  "surya-voice-pointer": { angle: 40, label: "below" },
  "surya-build": { angle: -35, label: "above" },
};

const SHORT: Record<string, string> = {
  "surya-gates": "Gates",
  "surya-memory": "Memory",
  "surya-voice": "Voice",
  "surya-distro": "Distro",
  "project-eval": "Project Eval",
  "surya-coordinator": "Coordinator",
  "surya-voice-pointer": "Screen pointer",
  "surya-build": "Build",
};

function pos(tool: SuryaTool) {
  const place = PLACES[tool.slug] ?? { angle: 0, label: "right" as const };
  const r = RINGS[tool.tier];
  const a = (place.angle * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a), place };
}

function labelProps(x: number, y: number, side: Place["label"]) {
  switch (side) {
    case "above":
      return { x, y: y - 18, textAnchor: "middle" as const };
    case "below":
      return { x, y: y + 30, textAnchor: "middle" as const };
    case "left":
      return { x: x - 16, y: y + 6, textAnchor: "end" as const };
    default:
      return { x: x + 16, y: y + 6, textAnchor: "start" as const };
  }
}

export function SuryaOrbit() {
  const orbiting = suryaTools.filter((t) => t.slug !== "surya-unite" && PLACES[t.slug]);
  const live = orbiting.filter((t) => t.tier === "live");

  return (
    <figure className="mx-auto w-full max-w-[520px]">
      <svg viewBox="0 0 520 520" className="h-auto w-full overflow-visible" role="img" aria-labelledby="orbit-title orbit-desc">
        <title id="orbit-title">The Surya family</title>
        <desc id="orbit-desc">
          Surya Unite sits at the centre. The live open-source tools orbit closest, work in development orbits further out,
          and what comes next is on the outer ring.
        </desc>
        <defs>
          <radialGradient id="orbit-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(var(--accent-2))" stopOpacity="0.9" />
            <stop offset="55%" stopColor="rgb(var(--accent))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Rings */}
        <circle cx={C} cy={C} r={RINGS.live} fill="none" className="stroke-ink/15" strokeWidth="1" />
        <circle cx={C} cy={C} r={RINGS.live} fill="none" className="orbit-drift stroke-accent/50" strokeWidth="1.5" />
        <circle cx={C} cy={C} r={RINGS.development} fill="none" className="orbit-drift-slow stroke-ink/30" strokeWidth="1.2" />
        <circle cx={C} cy={C} r={RINGS.next} fill="none" className="stroke-ink/10" strokeWidth="1" strokeDasharray="1 8" />

        {/* Spokes: Unite brings the live tools together */}
        {live.map((t) => {
          const { x, y } = pos(t);
          return <line key={`spoke-${t.slug}`} x1={C} y1={C} x2={x} y2={y} className="stroke-accent/20" strokeWidth="1" />;
        })}

        {/* The sun: Surya Unite */}
        <a href="#tool-surya-unite" aria-label="Surya Unite, in development">
          <circle cx={C} cy={C} r={84} fill="url(#orbit-sun)" />
          <circle cx={C} cy={C} r={34} className="fill-accent/90" />
          <text x={C} y={C + 62} textAnchor="middle" className="fill-ink font-display" fontSize="20" fontWeight="600">
            Surya Unite
          </text>
          <text x={C} y={C + 82} textAnchor="middle" className="fill-ink-faint" fontSize="13">
            in development
          </text>
        </a>

        {/* Nodes */}
        {orbiting.map((t) => {
          const { x, y, place } = pos(t);
          const lp = labelProps(x, y, place.label);
          const tierLabel = suryaTiers[t.tier].label.toLowerCase();
          return (
            <a key={t.slug} href={`#tool-${t.slug}`} aria-label={`${t.name}, ${tierLabel}`} className="group">
              {t.tier === "live" && <circle cx={x} cy={y} r={16} className="node-pulse fill-accent/25" />}
              <circle
                cx={x}
                cy={y}
                r={t.tier === "live" ? 8 : 7}
                className={
                  t.tier === "live"
                    ? "fill-accent stroke-base"
                    : t.tier === "development"
                      ? "fill-base stroke-accent"
                      : "fill-base stroke-ink/40"
                }
                strokeWidth={t.tier === "live" ? 2 : 1.8}
                strokeDasharray={t.tier === "next" ? "2 2.5" : undefined}
              />
              <text
                {...lp}
                fontSize="17"
                className={
                  (t.tier === "live" ? "fill-ink" : t.tier === "development" ? "fill-ink-muted" : "fill-ink-faint") +
                  " transition-colors group-hover:fill-accent"
                }
              >
                {SHORT[t.slug] ?? t.name}
              </text>
            </a>
          );
        })}
      </svg>

      <figcaption className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-ink-faint">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent" />
          {suryaTiers.live.label}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full border-[1.5px] border-accent" />
          {suryaTiers.development.label}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full border-[1.5px] border-dashed border-ink/40" />
          {suryaTiers.next.label}
        </span>
      </figcaption>
    </figure>
  );
}
