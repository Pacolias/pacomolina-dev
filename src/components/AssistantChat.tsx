import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUp, RotateCcw, Sparkles } from "lucide-react";
import { site, withBase } from "../data/site";
import { useLanguage } from "./LanguageProvider";
import { focusRing } from "./ui";

// The "Ask about Paco" chat, shown inside the command palette (lazy-loaded
// the first time it's opened). Talks to the Cloudflare Worker in worker/,
// which answers from the site's own content and streams the reply.
// Answers cite their sources as [[/path|label]] markers, rendered here as
// links (internal paths only). The conversation survives navigating
// through one of those links (sessionStorage).

type Message = { role: "user" | "assistant"; text: string; error?: keyof ErrorCopy };
type ErrorCopy = { busy: string; limited: string; failed: string; offline: string };

const STORE = "assistant-chat";

function load(): Message[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORE) ?? "[]");
  } catch {
    return [];
  }
}

// A tiny, safe renderer for the answers: paragraphs, "- " lists, **bold**
// and [[/path|label]] source links. Everything else is plain text (no
// HTML is ever injected).
function renderInline(text: string, onNavigate: () => void, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[\[([^|\]]+)\|([^\]]+)\]\]|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      const path = m[1].trim();
      // Only the site's own pages: never an external or protocol URL.
      if (/^\/(?!\/)[\w\-/.#]*$/.test(path)) {
        out.push(
          <a
            key={`${key}-${i++}`}
            href={withBase(path)}
            onClick={onNavigate}
            className={`mx-0.5 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 align-baseline text-[11px] font-medium text-amber-800 no-underline hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70 ${focusRing}`}
          >
            {m[2].trim()} →
          </a>
        );
      }
    } else if (m[3]) {
      out.push(
        <strong key={`${key}-${i++}`} className="font-medium text-stone-900 dark:text-stone-100">
          {m[3]}
        </strong>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Answer({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  // Lines grouped into paragraphs and lists: consecutive "- " / "• " lines
  // form a list even right after a sentence (models often skip the blank
  // line), and a blank line starts a new paragraph.
  const bullet = /^\s*[-*•]\s+/;
  const blocks: { list: boolean; lines: string[] }[] = [];
  for (const line of text.trim().split("\n")) {
    if (!line.trim()) {
      blocks.push({ list: false, lines: [] });
      continue;
    }
    const list = bullet.test(line);
    const last = blocks[blocks.length - 1];
    if (last && last.list === list && (list || last.lines.length)) last.lines.push(line.replace(bullet, ""));
    else blocks.push({ list, lines: [line.replace(bullet, "")] });
  }
  return (
    <>
      {blocks
        .filter((b) => b.lines.length)
        .map((block, b) =>
          block.list ? (
            <ul key={b} className="my-1 list-disc space-y-0.5 pl-5 marker:text-amber-500">
              {block.lines.map((l, i) => (
                <li key={i}>{renderInline(l, onNavigate, `${b}-${i}`)}</li>
              ))}
            </ul>
          ) : (
            <p key={b} className="my-1">
              {block.lines.map((l, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {renderInline(l, onNavigate, `${b}-${i}`)}
                </span>
              ))}
            </p>
          )
        )}
    </>
  );
}

export default function AssistantChat({
  initialQuestion,
  onNavigate,
  inputRef,
}: {
  initialQuestion?: string;
  // Called when a source link is followed (the palette closes).
  onNavigate: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { t, lang } = useLanguage();
  const copy = t.assistant;
  const [messages, setMessages] = useState<Message[]>(load);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const asked = useRef(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(messages.filter((m) => !m.error)));
    } catch {
      // Private mode: the chat just won't survive a navigation.
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy || !site.assistantUrl) return;
    setDraft("");
    const history = [...messages.filter((m) => !m.error), { role: "user" as const, text: q }];
    setMessages([...history, { role: "assistant", text: "" }]);
    setBusy(true);
    const fail = (error: Message["error"]) =>
      setMessages((ms) => [...ms.slice(0, -1), { role: "assistant", text: "", error }]);
    if (!navigator.onLine) {
      fail("offline");
      setBusy(false);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`${site.assistantUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, text }) => ({ role, text })), lang }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const { error } = await res.json().catch(() => ({ error: "failed" }));
        fail(error === "busy" || error === "limited" ? error : "failed");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let cut: number;
        while ((cut = buffer.indexOf("\n\n")) >= 0) {
          const event = buffer.slice(0, cut).replace(/^data:\s*/, "");
          buffer = buffer.slice(cut + 2);
          const data = JSON.parse(event) as { t?: string; error?: string };
          if (data.error) throw new Error(data.error);
          if (data.t) {
            answer += data.t;
            const text = answer;
            setMessages((ms) => [...ms.slice(0, -1), { role: "assistant", text }]);
          }
        }
      }
      if (!answer.trim()) fail("failed");
    } catch (e) {
      if ((e as Error).name !== "AbortError") fail("failed");
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  // A question typed in the search box ("Ask about Paco: …").
  useEffect(() => {
    if (initialQuestion && !asked.current) {
      asked.current = true;
      ask(initialQuestion);
    }
    inputRef.current?.focus();
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3" aria-live="polite" aria-busy={busy}>
        {messages.length === 0 ? (
          <div className="py-2">
            <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{copy.intro}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {copy.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className={`rounded-full border border-amber-200 bg-amber-50/60 px-3 py-1.5 text-left text-xs text-amber-800 transition-colors hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50 ${focusRing}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <p
                  key={i}
                  className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-stone-800 px-3.5 py-2 text-sm text-stone-50 dark:bg-stone-100 dark:text-stone-900"
                >
                  {m.text}
                </p>
              ) : (
                <div key={i} className="flex gap-2.5">
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <div className="min-w-0 flex-1 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                    {m.error ? (
                      <p className="my-1 text-stone-500 dark:text-stone-400">
                        {copy.errors[m.error]}{" "}
                        {m.error !== "limited" && m.error !== "offline" && (
                          <a href={`mailto:${site.email}`} className="text-amber-700 underline decoration-amber-300 underline-offset-2 dark:text-amber-400">
                            {site.email}
                          </a>
                        )}
                      </p>
                    ) : m.text ? (
                      <Answer text={m.text} onNavigate={onNavigate} />
                    ) : (
                      <p className="my-1 animate-pulse text-stone-400">{copy.thinking}</p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-stone-100 px-3 py-2.5 dark:border-stone-800">
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              abortRef.current?.abort();
              setMessages([]);
              inputRef.current?.focus();
            }}
            aria-label={copy.clear}
            title={copy.clear}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300 ${focusRing}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder={copy.placeholder}
          aria-label={copy.label}
          enterKeyHint="send"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          aria-label={copy.send}
          title={copy.send}
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-800 text-stone-50 transition-colors hover:bg-stone-700 disabled:opacity-30 dark:bg-stone-100 dark:text-stone-900 ${focusRing}`}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
      <p className="px-4 pb-2.5 text-[11px] leading-snug text-stone-400 dark:text-stone-500">
        {copy.disclaimer}
      </p>
    </div>
  );
}
