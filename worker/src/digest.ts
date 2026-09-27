// Weekly digest of the question log (Paco's request): every Monday the
// Worker opens an issue with the past week's questions in a PRIVATE
// repository (DIGEST_REPO) — never in the site's repo, which is public.
// GitHub then emails it to Paco like any issue. Needs a fine-grained
// token with Issues: read & write on that one repo (GITHUB_TOKEN secret).

type Row = {
  at: string;
  lang: string | null;
  turn: number;
  cited: number;
  error: string | null;
  question: string;
  answer: string | null;
};

// Visitors' text, made inert in Markdown: one line, no @mentions or
// #references pinging anyone (a zero-width space breaks them), and inside
// the table no "|" column breaks.
const ZWSP = "\u200b";
const inert = (s: string, max = 300) =>
  s
    .replace(/\s+/g, " ")
    .replace(/@/g, `@${ZWSP}`)
    .replace(/#(\d)/g, `#${ZWSP}$1`)
    .slice(0, max);
const cell = (s: string) => inert(s).replace(/\|/g, "\\|");

const day = (at: string) =>
  new Date(`${at.replace(" ", "T")}Z`).toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "Europe/Madrid" });

export function buildDigest(rows: Row[], weekStart: Date) {
  const week = weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const title = `Preguntas al asistente — semana del ${week} (${rows.length})`;
  if (!rows.length) return { title, body: "Sin preguntas esta semana." };

  const answered = rows.filter((r) => !r.error);
  const uncited = answered.filter((r) => !r.cited);
  const errors = rows.filter((r) => r.error);
  const langs = ["es", "en"].map((l) => `${l}: ${rows.filter((r) => r.lang === l).length}`).join(" · ");
  const lines = [
    `**${rows.length}** preguntas (${langs}) · **${uncited.length}** sin fuente · **${errors.length}** con error`,
    "",
  ];
  if (uncited.length) {
    lines.push(
      "### Sin fuente — ¿falta algo en la web?",
      "",
      ...uncited.map((r) => `- ${inert(r.question)}`),
      ""
    );
  }
  if (errors.length) {
    const counts: Record<string, number> = {};
    for (const r of errors) counts[r.error!] = (counts[r.error!] ?? 0) + 1;
    lines.push(`### Errores`, "", Object.entries(counts).map(([e, n]) => `\`${e}\` × ${n}`).join(" · "), "");
  }
  lines.push(
    "### Todas",
    "",
    "| Día | Idioma | Turno | Fuente | Pregunta |",
    "|---|---|---|---|---|",
    ...rows.map(
      (r) => `| ${day(r.at)} | ${r.lang ?? "—"} | ${r.turn} | ${r.error ? `⚠️ ${r.error}` : r.cited ? "✓" : "—"} | ${cell(r.question)} |`
    ),
    "",
    "<details><summary>Respuestas</summary>",
    "",
    ...rows.flatMap((r) => [`**${inert(r.question)}**`, "", `> ${inert(r.answer ?? `(${r.error})`, 1500)}`, ""]),
    "</details>"
  );
  return { title, body: lines.join("\n") };
}

export async function sendWeeklyDigest(env: {
  LOG?: D1Database;
  GITHUB_TOKEN?: string;
  DIGEST_REPO?: string;
  GITHUB_API?: string;
}) {
  if (!env.LOG || !env.GITHUB_TOKEN || !env.DIGEST_REPO) {
    console.log("digest skipped: LOG, GITHUB_TOKEN or DIGEST_REPO missing");
    return;
  }
  const { results } = await env.LOG.prepare(
    "SELECT at, lang, turn, cited, error, question, answer FROM questions WHERE at >= datetime('now', '-7 days') ORDER BY at"
  ).all<Row>();
  const weekStart = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const { title, body } = buildDigest(results, weekStart);
  const res = await fetch(`${env.GITHUB_API ?? "https://api.github.com"}/repos/${env.DIGEST_REPO}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "pacomolina-assistant",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body: body.slice(0, 60000), labels: ["digest"] }),
  });
  if (!res.ok) console.log(`digest failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
}
