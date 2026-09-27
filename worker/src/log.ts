// The question log (Paco's call, Sep 2026): what visitors ask, to see what
// recruiters want to know, spot gaps in the site, and turn real questions
// into eval cases. Anonymous by design — no IP, no user agent, nothing
// that identifies anyone — and kept 90 days (the nightly `scheduled`
// handler deletes older rows). The chat says so under the input.
// Read it with `npm run questions` in worker/.

export const RETENTION_DAYS = 90;

export type LogEntry = {
  lang: string | null;
  question: string;
  answer: string | null;
  error: string | null;
  // Which user message of the conversation this was (1 = opening question).
  turn: number;
};

export async function logQuestion(db: D1Database | undefined, entry: LogEntry) {
  if (!db) return;
  try {
    await db
      .prepare("INSERT INTO questions (lang, question, answer, cited, error, turn) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(
        entry.lang,
        entry.question.slice(0, 500),
        entry.answer?.slice(0, 3000) ?? null,
        entry.answer && /\[\[\/[^|\]]*\|/.test(entry.answer) ? 1 : 0,
        entry.error,
        entry.turn
      )
      .run();
  } catch (e) {
    // Never let logging break an answer.
    console.log(`log failed: ${(e as Error).message}`);
  }
}

export async function purgeOld(db: D1Database | undefined) {
  if (!db) return;
  await db.prepare(`DELETE FROM questions WHERE at < datetime('now', '-${RETENTION_DAYS} days')`).run();
}
