import { SYSTEM_PROMPT } from "./prompt";
import { logQuestion, purgeOld, type LogEntry } from "./log";

// POST /chat  { messages: [{ role: "user" | "assistant", text }], lang? }
//   → text/event-stream: `data: {"t": "..."}` chunks, then `data: {"done": true}`
//   → JSON { error: "busy" | "limited" | "bad_request" | "failed" } on errors
// GET  /health → "ok"
//
// Keeps the Gemini key server-side, only answers pacomolina.dev (CORS +
// Origin check), rate-limits per IP, caps message sizes, and streams
// Gemini's answer through as it's generated. The site's content comes
// from pacomolina.dev/assistant/knowledge.txt (cached), so publishing the
// site is enough to update what the assistant knows.

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  KNOWLEDGE_URL: string;
  ALLOWED_ORIGINS: string;
  // Only to point local tests at a mock of the Gemini API.
  GEMINI_BASE?: string;
  LIMITER?: RateLimiter;
  // The anonymous question log (D1). Optional: without it nothing is kept.
  LOG?: D1Database;
}

type Message = { role: "user" | "assistant"; text: string };

const MAX_MESSAGES = 8; // the last few turns are enough context
const MAX_USER_CHARS = 500;
const MAX_ASSISTANT_CHARS = 2500;
const KNOWLEDGE_TTL_MS = 10 * 60 * 1000;

let knowledge: { text: string; at: number } | null = null;

async function getKnowledge(env: Env) {
  if (knowledge && Date.now() - knowledge.at < KNOWLEDGE_TTL_MS) return knowledge.text;
  const res = await fetch(env.KNOWLEDGE_URL, { cf: { cacheTtl: 600 } } as RequestInit);
  if (!res.ok) {
    if (knowledge) return knowledge.text; // stale beats nothing
    throw new Error(`knowledge ${res.status}`);
  }
  knowledge = { text: await res.text(), at: Date.now() };
  return knowledge.text;
}

function cors(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  if (!origin || !allowed.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

function parseMessages(body: unknown): Message[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const messages: Message[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    const role = (m as Message)?.role;
    const text = (m as Message)?.text;
    if ((role !== "user" && role !== "assistant") || typeof text !== "string" || !text.trim()) return null;
    const max = role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    if (role === "user" && text.length > max) return null;
    messages.push({ role, text: text.slice(0, max) });
  }
  // Gemini wants the conversation to start with the user and end with them.
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return null;
  return messages;
}

export default {
  // Nightly: drop logged questions past the retention period.
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(purgeOld(env.LOG));
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const headers = cors(origin, env);

    if (url.pathname === "/health") return new Response("ok");
    if (url.pathname !== "/chat") return new Response("Not found", { status: 404 });
    if (request.method === "OPTIONS") return new Response(null, { status: headers["Access-Control-Allow-Origin"] ? 204 : 403, headers });
    if (request.method !== "POST") return json({ error: "bad_request" }, 405, headers);
    // Browsers from other sites (and anything without our Origin) are refused.
    if (!headers["Access-Control-Allow-Origin"]) return json({ error: "forbidden" }, 403, {});

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    if (env.LIMITER && !(await env.LIMITER.limit({ key: ip })).success) {
      return json({ error: "limited" }, 429, headers);
    }

    let messages: Message[] | null = null;
    let lang: string | null = null;
    try {
      const body = await request.json();
      messages = parseMessages(body);
      const l = (body as { lang?: unknown })?.lang;
      lang = l === "en" || l === "es" ? l : null;
    } catch {
      messages = null;
    }
    if (!messages) return json({ error: "bad_request" }, 400, headers);

    // Logged once the outcome is known (after the stream, or on error).
    const entry = (answer: string | null, error: string | null): LogEntry => ({
      lang,
      question: messages![messages!.length - 1].text,
      answer,
      error,
      turn: messages!.filter((m) => m.role === "user").length,
    });

    let content: string;
    try {
      content = await getKnowledge(env);
    } catch {
      ctx.waitUntil(logQuestion(env.LOG, entry(null, "knowledge")));
      return json({ error: "failed" }, 502, headers);
    }

    const base = env.GEMINI_BASE ?? "https://generativelanguage.googleapis.com";
    let gemini: Response;
    try {
      gemini = await fetch(`${base}/v1beta/models/${env.GEMINI_MODEL}:streamGenerateContent?alt=sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\nCONTENT:\n\n${content}` }] },
          contents: messages.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] })),
          generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
        }),
      });
    } catch (e) {
      console.log(`gemini unreachable: ${(e as Error).message}`);
      ctx.waitUntil(logQuestion(env.LOG, entry(null, "unreachable")));
      return json({ error: "failed" }, 502, headers);
    }
    if (!gemini.ok || !gemini.body) {
      // 429: the free tier's quota ran out (per minute or per day).
      console.log(`gemini ${gemini.status}: ${(await gemini.text()).slice(0, 300)}`);
      ctx.waitUntil(logQuestion(env.LOG, entry(null, gemini.status === 429 ? "busy" : `gemini ${gemini.status}`)));
      return json({ error: gemini.status === 429 ? "busy" : "failed" }, gemini.status === 429 ? 503 : 502, headers);
    }

    // Gemini's SSE (whole JSON chunks) → ours ({"t": text} chunks).
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = gemini.body.getReader();
    // Keeps the Worker alive until the answer has been logged.
    let finished: (e: LogEntry) => void = () => {};
    ctx.waitUntil(new Promise<LogEntry>((resolve) => (finished = resolve)).then((e) => logQuestion(env.LOG, e)));
    let answer = "";
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        let buffer = "";
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let cut: number;
            while ((cut = buffer.indexOf("\n")) >= 0) {
              const line = buffer.slice(0, cut).trim();
              buffer = buffer.slice(cut + 1);
              if (!line.startsWith("data:")) continue;
              const chunk = JSON.parse(line.slice(5));
              const text = (chunk.candidates?.[0]?.content?.parts ?? [])
                .filter((p: { thought?: boolean }) => !p.thought)
                .map((p: { text?: string }) => p.text ?? "")
                .join("");
              if (text) {
                answer += text;
                send({ t: text });
              }
            }
          }
          send({ done: true });
          finished(entry(answer, answer ? null : "empty"));
        } catch {
          send({ error: "failed" });
          finished(entry(answer || null, "stream"));
        }
        controller.close();
      },
      // The visitor closed the chat mid-answer.
      cancel() {
        reader.cancel().catch(() => {});
        finished(entry(answer || null, "aborted"));
      },
    });
    return new Response(stream, {
      headers: { ...headers, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store" },
    });
  },
};
