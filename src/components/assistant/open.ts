/**
 * Lets any button on the page open the assistant in the hero on a given
 * mode. The assistant listens for this event, switches tab, scrolls into
 * view and focuses its input.
 */
export type AssistantTab = "ask" | "gates" | "fit";

export const OPEN_EVENT = "assistant:open";

const DEEP_LINK: Record<AssistantTab, string> = { ask: "/#ask", gates: "/#try-gates", fit: "/#fit-check" };

export function openAssistant(tab: AssistantTab, prefill?: string) {
  // The assistant lives on the home page. From any other page, go there.
  if (!document.getElementById("ask")) {
    window.location.assign(DEEP_LINK[tab]);
    return;
  }
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { tab, prefill } }));
}
