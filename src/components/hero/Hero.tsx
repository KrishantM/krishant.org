"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { HeroBackground } from "@/components/hero/HeroBackground";

export function Hero() {
  const reduce = useReducedMotion();
  const { hero } = site;

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.1 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-16"
    >
      <HeroBackground />

      <div className="mx-auto w-full max-w-shell px-5 sm:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          {/* Eyebrow */}
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 py-1.5 font-mono text-xs tracking-[0.2em] text-ink-muted backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-emerald shadow-[0_0_8px_#34e0a1]" />
              {hero.eyebrow}
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            variants={item}
            className="mt-7 text-balance text-5xl font-semibold leading-[0.98] tracking-tightest text-ink sm:text-7xl md:text-8xl"
          >
            {hero.name}
          </motion.h1>

          {/* Headline */}
          <motion.p
            variants={item}
            className="mt-7 max-w-2xl text-balance bg-gradient-to-r from-ink via-ink to-ink-muted bg-clip-text text-xl font-medium leading-snug tracking-tight text-transparent sm:text-2xl md:text-3xl"
          >
            {hero.headline}
          </motion.p>

          {/* Subline */}
          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            {hero.subline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button href={hero.primaryCta.href} variant="primary" size="lg">
              {hero.primaryCta.label}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </Button>
            <Button href={hero.secondaryCta.href} variant="secondary" size="lg">
              {hero.secondaryCta.label}
            </Button>
          </motion.div>

          {/* Signal chips */}
          <motion.ul
            variants={item}
            className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6"
          >
            {hero.signals.map((signal) => (
              <li
                key={signal}
                className="flex items-center gap-2 text-sm text-ink-faint"
              >
                <span className="h-1 w-1 rounded-full bg-ink-faint" aria-hidden />
                {signal}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: reduce ? 1 : [0.2, 1, 0.2] }}
        transition={
          reduce ? { duration: 0 } : { duration: 2.4, repeat: Infinity }
        }
        className="absolute bottom-7 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint"
        aria-hidden
      >
        Scroll
      </motion.div>
    </section>
  );
}
