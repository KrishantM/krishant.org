"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger / sequencing delay in seconds. */
  delay?: number;
  className?: string;
  /** HTML tag to render as. */
  as?: "div" | "section" | "li" | "article";
}

/**
 * Single, isolated scroll-reveal primitive. Every section composes this rather
 * than re-implementing animation. Honours prefers-reduced-motion by snapping
 * straight to the visible state.
 */
export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: reduce ? 0 : delay,
      },
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}
