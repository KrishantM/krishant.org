import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { site } from "@/content/site";
import {
  askSchema,
  buildAskSystemPrompt,
  buildFitSystemPrompt,
  DEFAULT_ASSISTANT_MODEL,
  fitSchema,
  HISTORY_WINDOW,
} from "@/lib/llm-context";
import {
  normaliseAsk,
  normaliseFit,
  pickActions,
  type AssistantResponse,
  type ExcerptLike,
} from "@/lib/assistant";
import { retrieve } from "@/lib/retrieval";
import { evidenceCatalogue } from "@/lib/evidence";
import { consume } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * The site assistant. Two server modes:
 *   ask  answers about Krishant's work, quoting retrieved excerpts from the
 *        committed code index when the question is about code.
 *   fit  maps a pasted job description to evidence on the site.
 * The third mode on the page (the Surya Gates demo) is static data and
 * never calls this route.
 *
 * Every string in a response is sanitised before it leaves the server, and
 * every link is resolved from the site's own data, never from model text.
 */

// See DEFAULT_ASSISTANT_MODEL: Sonnet by default, ASSISTANT_MODEL overrides.
const MODEL = process.env.ASSISTANT_MODEL || DEFAULT_ASSISTANT_MODEL;
// Models that accept server-side refusal fallbacks (fallbacks: "default").
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"]);

const MAX_MESSAGE_LEN = 800;
const { fit: fitCopy, errors } = site.assistant;

interface ClientTurn {
  role: "user" | "assistant";
  text: string;
}

function clientId(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

/** Coerce history to plain alternating text turns that start with the user. */
function sanitiseHistory(raw: unknown): ClientTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: ClientTurn[] = [];
  for (const t of raw) {
    if (!t || typeof t !== "object") continue;
    const role = (t as { role?: unknown }).role;
    const text = (t as { text?: unknown }).text;
    if ((role !== "user" && role !== "assistant") || typeof text !== "string" || !text.trim()) continue;
    out.push({ role, text: text.slice(0, MAX_MESSAGE_LEN) });
  }
  const recent = out.slice(-HISTORY_WINDOW);
  while (recent.length && recent[0].role !== "user") recent.shift();
  return recent;
}

function json(body: AssistantResponse, status = 200, headers?: Record<string, string>) {
  return NextResponse.json<AssistantResponse>(body, { status, headers });
}

async function callModel(
  system: string,
  schema: Record<string, unknown>,
  messages: Anthropic.Beta.BetaMessageParam[],
  maxTokens: number,
): Promise<{ parsed: unknown; refused: boolean }> {
  const client = new Anthropic({ timeout: 50_000, maxRetries: 1 });
  const useFallback = FALLBACK_MODELS.has(MODEL);
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    ...(useFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    output_config: { effort: "low", format: { type: "json_schema", schema } },
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages,
  });
  if (response.stop_reason === "refusal") return { parsed: null, refused: true };
  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  try {
    return { parsed: JSON.parse(text), refused: false };
  } catch {
    return { parsed: null, refused: false };
  }
}

export async function POST(req: NextRequest) {
  let body: { mode?: unknown; message?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const mode = body.mode === "fit" ? "fit" : "ask";
  const limit = mode === "fit" ? fitCopy.maxLength : MAX_MESSAGE_LEN;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, limit) : "";
  if (!message) return json({ error: "empty_message" }, 400);
  if (mode === "fit" && message.length < fitCopy.minLength) {
    return json({ text: fitCopy.tooShort }, 400);
  }

  const rate = consume(clientId(req));
  if (!rate.ok) {
    return json(
      { text: `You've sent a few quickly. Give it about ${rate.retryAfter}s and try again.` },
      429,
      { "Retry-After": String(rate.retryAfter) },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ text: errors.unavailable, actions: mode === "ask" ? pickActions(message) : [] }, 503);
  }

  try {
    if (mode === "fit") {
      const catalogue = evidenceCatalogue();
      const { parsed, refused } = await callModel(
        buildFitSystemPrompt(catalogue),
        fitSchema as unknown as Record<string, unknown>,
        [{ role: "user", content: `<job_description>\n${message}\n</job_description>` }],
        2000,
      );
      if (refused) return json({ text: "I can't map that one. Try pasting the job description on its own." });
      const fit = normaliseFit(parsed, catalogue);
      if (!fit) return json({ text: errors.generic }, 502);
      return json({ fit });
    }

    const history = sanitiseHistory(body.history);
    const lastUser = [...history].reverse().find((t) => t.role === "user")?.text ?? "";
    const hits = retrieve(`${message} ${lastUser}`);
    const labelled = new Map<string, ExcerptLike>(hits.map((h, i) => [`E${i + 1}`, h.excerpt]));
    const excerptBlock = hits.length
      ? `<excerpts>\n${hits
          .map((h, i) => {
            const e = h.excerpt;
            return `[E${i + 1}] ${e.repo}/${e.path} lines ${e.startLine}-${e.endLine}\n${e.text}`;
          })
          .join("\n\n")}\n</excerpts>\n\n`
      : "";

    const messages: Anthropic.Beta.BetaMessageParam[] = [
      ...history.map((t) => ({ role: t.role, content: t.text })),
      { role: "user", content: `${excerptBlock}<question>${message}</question>` },
    ];
    const { parsed, refused } = await callModel(
      buildAskSystemPrompt(),
      askSchema as unknown as Record<string, unknown>,
      messages,
      3000,
    );
    if (refused) {
      return json({ text: "I can't help with that one. Ask me about my work instead.", actions: pickActions(message) });
    }
    const answer = normaliseAsk(parsed, labelled);
    if (!answer) return json({ text: errors.generic, actions: pickActions(message) }, 502);
    return json({
      text: answer.text,
      code: answer.code,
      actions: pickActions(message, answer.code.map((c) => c.repo)),
    });
  } catch (err) {
    const status = err instanceof Anthropic.APIError ? err.status : undefined;
    console.error("[/api/ask] model call failed", status ?? (err instanceof Error ? err.name : "unknown"));
    if (err instanceof Anthropic.RateLimitError) {
      return json({ text: "The assistant is busy right now. Try again in a minute." }, 503);
    }
    return json({ text: errors.generic, actions: mode === "ask" ? pickActions(message) : [] }, 502);
  }
}
