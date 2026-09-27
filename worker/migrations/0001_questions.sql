-- What visitors ask the assistant (see worker/src/log.ts). No IP, no
-- identifiers; rows older than 90 days are deleted every night.
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL DEFAULT (datetime('now')),
  lang TEXT,
  question TEXT NOT NULL,
  answer TEXT,
  cited INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  turn INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS questions_at ON questions (at);
