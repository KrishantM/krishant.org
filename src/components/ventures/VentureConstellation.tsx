"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ventures } from "@/content/ventures";
import type { Venture } from "@/types/venture";
import { getAccentHex, withAlpha, cn } from "@/lib/utils";
import { site } from "@/content/site";

/* ------------------------------------------------------------------ */
/* Presentation-only layout. Coordinates are % within the map box, so   */
/* they live here (not in the venture data model).                      */
/* ------------------------------------------------------------------ */

type Pos = { x: number; y: number };

const layout: Record<string, Pos> = {
  center: { x: 50, y: 46 },
  gradual: { x: 17, y: 22 },
  hiko: { x: 83, y: 22 },
  creatorhq: { x: 50, y: 73 },
  trentwinshq: { x: 20, y: 91 },
  lexxlittlehq: { x: 80, y: 91 },
};

const connections: Array<{ from: string; to: string }> = [
  { from: "center", to: "gradual" },
  { from: "center", to: "hiko" },
  { from: "center", to: "creatorhq" },
  { from: "creatorhq", to: "trentwinshq" },
  { from: "creatorhq", to: "lexxlittlehq" },
];

/** Edges that should glow when `active` is hovered/focused. */
function highlightedEdges(active: string | null): Set<string> {
  const set = new Set<string>();
  if (!active) return set;
  const v = ventures.find((x) => x.slug === active);
  if (!v) return set;
  if (v.parent) {
    set.add(`center-${v.parent}`);
    set.add(`${v.parent}-${active}`);
  } else {
    set.add(`center-${active}`);
  }
  return set;
}

function tooltipPlacement(pos: Pos): string {
  const vertical = pos.y < 50 ? "top-full mt-4" : "bottom-full mb-4";
  const horizontal =
    pos.x <= 30 ? "left-0" : pos.x >= 70 ? "right-0" : "left-1/2 -translate-x-1/2";
  return `${vertical} ${horizontal}`;
}

export function VentureConstellation() {
  return (
    <>
      {/* Interactive map — desktop / large tablet */}
      <div className="hidden lg:block">
        <ConstellationMap />
      </div>
      {/* Simplified stacked layout — phones / small tablets */}
      <div className="lg:hidden">
        <ConstellationStacked />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop interactive map                                             */
/* ------------------------------------------------------------------ */

function ConstellationMap() {
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const highlighted = highlightedEdges(active);

  const nodeVariants: Variants = {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.4 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: reduce ? 0 : 0.15 + i * 0.08,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl">
      {/* Connecting lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {connections.map(({ from, to }) => {
          const a = layout[from];
          const b = layout[to];
          const toVenture = ventures.find((v) => v.slug === to);
          const accent = toVenture ? getAccentHex(toVenture.accent) : "#7c8bff";
          const isOn = highlighted.has(`${from}-${to}`);
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              vectorEffect="non-scaling-stroke"
              stroke={isOn ? accent : "rgba(255,255,255,0.12)"}
              strokeWidth={isOn ? 1.4 : 1}
              className={cn(
                "transition-all duration-500",
                isOn && "constellation-flow",
              )}
              style={isOn ? { filter: `drop-shadow(0 0 5px ${withAlpha(accent, 0.7)})` } : undefined}
            />
          );
        })}
      </svg>

      {/* Center node — Krishant */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${layout.center.x}%`, top: `${layout.center.y}%` }}
      >
        <motion.div
          custom={0}
          variants={nodeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative grid h-24 w-24 place-items-center"
        >
          <span className="absolute inset-0 animate-pulseslow rounded-full bg-accent-indigo/20 blur-xl" />
          <span className="absolute inset-2 rounded-full border border-white/15" />
          <span className="absolute inset-0 rounded-full border border-white/10" />
          <span className="relative text-center">
            <span className="block text-sm font-semibold tracking-tightest text-ink">
              {site.name}
            </span>
            <span className="block font-mono text-[10px] text-ink-faint">
              .org
            </span>
          </span>
        </motion.div>
      </div>

      {/* Venture nodes */}
      {ventures.map((venture, i) => {
        const pos = layout[venture.slug];
        if (!pos) return null;
        return (
          <div
            key={venture.slug}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <motion.div
              custom={i + 1}
              variants={nodeVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <ConstellationNode
                venture={venture}
                active={active === venture.slug}
                onActivate={() => setActive(venture.slug)}
                onDeactivate={() => setActive(null)}
                placement={tooltipPlacement(pos)}
              />
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

interface NodeProps {
  venture: Venture;
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  placement: string;
}

function ConstellationNode({
  venture,
  active,
  onActivate,
  onDeactivate,
  placement,
}: NodeProps) {
  const accent = getAccentHex(venture.accent);
  const hasExternal = Boolean(venture.externalUrl);
  const href = hasExternal ? venture.externalUrl! : `/ventures/${venture.slug}`;

  const handlers = {
    onMouseEnter: onActivate,
    onMouseLeave: onDeactivate,
    onFocus: onActivate,
    onBlur: onDeactivate,
  };

  const inner = (
    <>
      {/* Star core */}
      <span
        className="relative grid place-items-center transition-transform duration-300 group-hover/node:scale-110"
      >
        <span
          className="absolute h-8 w-8 rounded-full opacity-30 blur-md transition-opacity duration-300 group-hover/node:opacity-70"
          style={{ background: accent }}
        />
        <span
          className="relative h-3.5 w-3.5 rounded-full ring-2 ring-base"
          style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
        />
      </span>
      {/* Label */}
      <span className="mt-2.5 whitespace-nowrap text-xs font-medium tracking-tight text-ink-muted transition-colors duration-300 group-hover/node:text-ink">
        {venture.name}
      </span>
    </>
  );

  const tooltip = (
    <span
      role="presentation"
      className={cn(
        "pointer-events-none absolute z-20 w-56 rounded-xl2 border border-line bg-base-800/90 p-4 text-left shadow-card backdrop-blur-xl transition-all duration-300",
        placement,
        active ? "opacity-100 translate-y-0" : "invisible opacity-0",
      )}
    >
      <span className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          {venture.status}
        </span>
      </span>
      <span className="mt-1.5 block text-sm font-semibold tracking-tight text-ink">
        {venture.name}
      </span>
      <span className="mt-0.5 block text-[11px] text-ink-faint">
        {venture.category}
      </span>
      <span className="mt-2 block text-xs leading-relaxed text-ink-muted">
        {venture.summary}
      </span>
      <span className="mt-2.5 block text-[11px] font-medium" style={{ color: accent }}>
        {hasExternal ? "Visit ↗" : "Explore →"}
      </span>
    </span>
  );

  const className =
    "group/node relative flex flex-col items-center rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

  if (hasExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`${venture.name} — ${venture.summary} (opens in a new tab)`}
        {...handlers}
      >
        {inner}
        {tooltip}
      </a>
    );
  }

  return (
    <Link href={href} className={className} aria-label={`${venture.name} — ${venture.summary}`} {...handlers}>
      {inner}
      {tooltip}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile / small-tablet stacked layout                               */
/* ------------------------------------------------------------------ */

function ConstellationStacked() {
  const topLevel = ventures.filter((v) => v.parent === null);

  return (
    <div className="relative mx-auto max-w-md">
      {/* Center marker */}
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.03]">
          <span className="text-xs font-semibold tracking-tightest text-ink">
            {site.name}
          </span>
        </span>
        <p className="text-sm text-ink-muted">
          krishant.org at the centre — ventures branch out from here.
        </p>
      </div>

      <div className="space-y-3 border-l border-line pl-5">
        {topLevel.map((venture) => (
          <div key={venture.slug}>
            <StackedNode venture={venture} />
            {/* Children nested under their parent */}
            {ventures
              .filter((c) => c.parent === venture.slug)
              .map((child) => (
                <div key={child.slug} className="ml-5 mt-3 border-l border-line pl-5">
                  <StackedNode venture={child} small />
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StackedNode({ venture, small }: { venture: Venture; small?: boolean }) {
  const accent = getAccentHex(venture.accent);
  const hasExternal = Boolean(venture.externalUrl);
  const href = hasExternal ? venture.externalUrl! : `/ventures/${venture.slug}`;

  const content = (
    <div className="flex items-center justify-between gap-3 rounded-xl2 border border-line bg-white/[0.025] px-4 py-3 backdrop-blur-sm transition-colors hover:border-white/20">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
          />
          <span
            className={cn(
              "truncate font-semibold tracking-tight text-ink",
              small ? "text-sm" : "text-base",
            )}
          >
            {venture.name}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-faint">{venture.summary}</p>
      </div>
      <span className="shrink-0 text-sm text-ink-muted">
        {hasExternal ? "↗" : "→"}
      </span>
    </div>
  );

  if (hasExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return <Link href={href}>{content}</Link>;
}
