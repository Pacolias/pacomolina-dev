import type { Localized } from "./i18n";
import { withBase } from "./site";

// The /now page ("what I'm doing now", nownownow.com-style). Update
// `updated` whenever the content changes — the page shows it.
export const nowUpdated = "2026-10-21";

export type NowSection = {
  heading: Localized;
  items: { text: Localized; href?: string }[];
};

export const now: NowSection[] = [
  {
    heading: { en: "Working", es: "Trabajando" },
    items: [
      {
        text: {
          en: "My first role, as an AI Engineer since October 2026: full-stack software that connects to LLM APIs and agentic AI systems.",
          es: "Mi primer puesto, como AI Engineer desde octubre de 2026: software full stack que se conecta a APIs de LLM y a sistemas de IA agéntica.",
        },
      },
    ],
  },
  {
    heading: { en: "Building", es: "Construyendo" },
    items: [
      {
        text: {
          en: "RedCheck, my AI-powered planner — live, and still growing.",
          es: "RedCheck, mi planificador con IA — en producción, y sigue creciendo.",
        },
        href: withBase("/projects/#redcheck"),
      },
      {
        text: {
          en: "ShellMate, a real terminal that explains and protects while you learn.",
          es: "ShellMate, una terminal real que explica y protege mientras aprendes.",
        },
        href: withBase("/projects/#shellmate"),
      },
      {
        text: {
          en: "spotify-mcp, an MCP server that lets Claude run your Spotify.",
          es: "spotify-mcp, un servidor MCP para que Claude maneje tu Spotify.",
        },
        href: withBase("/projects/#spotify-mcp"),
      },
    ],
  },
  {
    heading: { en: "Out and about", es: "Por ahí" },
    items: [
      {
        text: {
          en: "Going to Málaga's tech meetups to meet the local community — most recently TERRACEO #31 by Málaga Tech.",
          es: "Yendo a los meetups tecnológicos de Málaga para conocer a la comunidad — el último, el TERRACEO #31 de Málaga Tech.",
        },
        href: withBase("/blog/#terraceo-31"),
      },
    ],
  },
];
