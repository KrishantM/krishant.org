import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, HISTORY_WINDOW } from "@/lib/llm-context";
import { pickActions, type AskAction } from "@/lib/assistant";
import { consume } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ClientTurn {
  role: "user" | "assistant";
  text: string;
}

interface AskBody {
  message?: unknown;
  history?: unknown;
}

const MAX_MESSAGE_LEN = 800;
const MAX_REPLY_TOKENS = 350;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

/**
 * Pull a best-effort client identifier for rate limiting. In production we
 * expect Vercel's `x-forwarded-for` to carry the client's IP; we fall back
 * gracefully so dev / local always works.
 */
function clientId(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "anon";
}

/** Coerce + clamp incoming history to a safe shape. */
function sanitiseHistory(raw: unknown): ClientTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: ClientTurn[] = [];
  for (const t of raw) {
    if (!t || typeof t !== "object") continue;
    const role = (t as { role?: unknown }).role;
    const text = (t as { text?: unknown }).text;
    if ((role !== "user" && role !== "assistant") || typeof text !== "string") {
      continue;
    }
    out.push({ role, text: text.slice(0, MAX_MESSAGE_LEN) });
  }
  return out.slice(-HISTORY_WINDOW);
}

interface AskResult {
  text: string;
  actions: AskAction[];
}

export async function POST(req: NextRequest) {
  let body: AskBody;
  try {
    body = (await req.json()) as AskBody;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_LEN) : "";
  if (!message) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

  const limit = consume(clientId(req));
  if (!limit.ok) {
    return NextResponse.json<AskResult>(
      {
        text: `You've sent a few messages quickly — give me about ${limit.retryAfter}s and try again.`,
        actions: [],
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<AskResult>(
      {
        text: "The live assistant isn't configured on this deploy. Try the prompts below or reach out directly.",
        actions: pickActions(message),
      },
      { status: 503 },
    );
  }

  const history = sanitiseHistory(body.history);

  const client = new Anthropic({ apiKey });

  try {
    const completion = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_REPLY_TOKENS,
      system: buildSystemPrompt(),
      messages: [
        ...history.map((t) => ({ role: t.role, content: t.text })),
        { role: "user" as const, content: message },
      ],
    });

    const text = completion.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!text) {
      return NextResponse.json<AskResult>(
        {
          text: "I couldn't quite parse that — try rephrasing, or tap a prompt below.",
          actions: pickActions(message),
        },
        { status: 200 },
      );
    }

    return NextResponse.json<AskResult>(
      { text, actions: pickActions(message) },
      { status: 200 },
    );
  } catch (err) {
    console.error("[/api/ask] anthropic error", err);
    return NextResponse.json<AskResult>(
      {
        text: "Something on my side broke for a second — try again in a moment. The prompts below still work.",
        actions: pickActions(message),
      },
      { status: 502 },
    );
  }
}
