// Non-translated facts: links, contact info, project URLs.

// Prefixes a root-relative public/ path with the configured base path, so
// asset links keep working whether the site is served from a GitHub Pages
// project path or later from the pacomolina.dev root.
function withBase(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const site = {
  name: "Paco Molina",
  photo: withBase("/images/paco.jpg"),
  // Kept around as a fallback avatar — swap `photo` back to this if needed.
  photoPlaceholder: withBase("/images/paco-placeholder.svg"),
  email: "pacomolinac2003@gmail.com",
  linkedin: "https://www.linkedin.com/in/francisco-javier-molina-cuenca/",
  // Inferred from this repo's own git remote (github.com/Pacolias/pacomolina-dev) — confirm/correct if wrong.
  github: "https://github.com/Pacolias",
  cvHref: withBase("/cv/CV-Paco.pdf"),
  vcardHref: withBase("/paco-molina.vcf"),
} as const;

export const redCheck = {
  name: "RedCheck",
  // "Live demo" is the actual interactive React app, not the marketing site.
  liveUrl: "https://my.redcheckapp.com/",
  websiteUrl: "https://redcheckapp.com/",
  repoUrl: "https://github.com/redcheckapp",
} as const;

export type StackItem = {
  name: string;
  // One icon per chip, even for a paired label — picks whichever half of
  // the pair is the more recognizable/defining mark (e.g. Spring Boot
  // stands in for "Java / Spring Boot": Simple Icons has no Java logo at
  // all, and Spring Boot already implies Java).
  icon:
    | "python"
    | "springboot"
    | "react"
    | "langgraph"
    | "docker"
    | "gemini";
};

export const stack: StackItem[] = [
  { name: "Python / FastAPI", icon: "python" },
  { name: "Java / Spring Boot", icon: "springboot" },
  { name: "React / TS", icon: "react" },
  { name: "LangGraph", icon: "langgraph" },
  { name: "Gemini API", icon: "gemini" },
  { name: "Docker / NGINX", icon: "docker" },
];
