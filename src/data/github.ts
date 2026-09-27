import { projects } from "./projects";

// Build-time GitHub activity: when each project's repo (or, for an org
// like RedCheck's, its most recently pushed repo) last received a push.
// Fetched once per build — the site rebuilds weekly (deploy.yml schedule),
// so it stays fresh without a client-side API call. Any failure (offline,
// rate limit) just leaves a project out: the build never breaks over it.
// In CI, GITHUB_TOKEN raises the rate limit.

export type Activity = Record<string, string>; // project slug → ISO date

const API = "https://api.github.com";

async function getJson(path: string) {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { headers, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

async function lastPush(repoUrl: string): Promise<string | undefined> {
  const match = new URL(repoUrl).pathname.split("/").filter(Boolean);
  if (match.length >= 2) {
    const repo = await getJson(`/repos/${match[0]}/${match[1]}`);
    return repo.pushed_at;
  }
  // An organisation: its most recently pushed repository.
  const repos = await getJson(`/orgs/${match[0]}/repos?sort=pushed&per_page=1`);
  return repos[0]?.pushed_at;
}

let cached: Promise<Activity> | null = null;

export function getGithubActivity(): Promise<Activity> {
  cached ??= (async () => {
    const entries = await Promise.all(
      projects.map(async (project) => {
        const repo = project.links.find((l) => l.kind === "repo");
        if (!repo || !repo.href.startsWith("https://github.com/")) return null;
        try {
          const date = await lastPush(repo.href);
          return date ? ([project.slug, date] as const) : null;
        } catch (err) {
          console.warn(`[github] ${project.slug}: ${(err as Error).message}`);
          return null;
        }
      })
    );
    return Object.fromEntries(entries.filter((e) => e !== null));
  })();
  return cached;
}
