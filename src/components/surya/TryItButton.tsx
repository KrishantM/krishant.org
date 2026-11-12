"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { openAssistant, type AssistantTab } from "@/components/assistant/open";

/** Opens the hero assistant on a given mode. */
export function TryItButton({
  tab,
  children,
  className,
}: {
  tab: AssistantTab;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => openAssistant(tab)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-accent/45 bg-accent/10 px-4 text-sm font-medium text-ink transition-colors hover:bg-accent/20",
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent))]" />
      {children}
    </button>
  );
}
