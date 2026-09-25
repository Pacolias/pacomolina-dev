import type { Localized } from "./i18n";
import type { GalleryImage } from "../components/Gallery";
import { redCheck, withBase } from "./site";

// Work page content, newest first. Facts come from the CV
// (public/cv/CV-Paco.pdf) — keep both in sync.
//
// `links` are places anyone can check the work (the live app, the site, the
// code). `photos` is for pictures (office, team, a demo day, a
// certificate…) — drop ~1280px-wide WebP files in public/images/work/ and
// list them here; the gallery only renders when there's at least one.

export type Job = {
  company: string;
  url: string;
  logo: string;
  role: Localized;
  // "YYYY-MM"; omit `end` for a current role.
  start: string;
  end?: string;
  location: Localized;
  summary: Localized;
  highlights: Localized[];
  stack: string[];
  links: { label: Localized; href: string }[];
  photos: GalleryImage[];
};

export const jobs: Job[] = [
  {
    company: "RedCheck",
    url: redCheck.websiteUrl,
    logo: withBase("/images/work/redcheck.svg"),
    role: {
      en: "Founder & AI/Software Engineer",
      es: "Fundador y AI/Software Engineer",
    },
    start: "2026-03",
    location: { en: "Málaga, Spain · Remote", es: "Málaga · Remoto" },
    summary: {
      en: "Designed, built and deployed an AI-powered smart planner on my own, from the database schema to the NGINX gateway in front of it.",
      es: "Diseñé, construí y desplegué yo solo un planificador inteligente con IA, desde el esquema de base de datos hasta el gateway NGINX que tiene delante.",
    },
    highlights: [
      {
        en: "Architected a multi-tier microservices setup with Docker Compose: React/TypeScript frontend, Java/Spring Boot core backend and a Python AI engine.",
        es: "Diseñé una arquitectura de microservicios por capas con Docker Compose: frontend en React/TypeScript, backend core en Java/Spring Boot y un motor de IA en Python.",
      },
      {
        en: "Engineered SmartCheck AI, a standalone RAG microservice (FastAPI, Pydantic, ChromaDB, Google Gemini) that analyzes user workloads and generates execution roadmaps.",
        es: "Desarrollé SmartCheck AI, un microservicio RAG independiente (FastAPI, Pydantic, ChromaDB, Google Gemini) que analiza la carga de trabajo del usuario y genera hojas de ruta.",
      },
      {
        en: "Built the core REST API in Java with a strict MySQL schema via Hibernate (JPA), secured with JWT and Spring Security.",
        es: "Construí la API REST core en Java con un esquema MySQL estricto vía Hibernate (JPA), protegida con JWT y Spring Security.",
      },
      {
        en: "Set up CI/CD with GitHub Actions: JUnit/Mockito tests and Docker image builds for production.",
        es: "Monté CI/CD con GitHub Actions: tests con JUnit/Mockito y build de imágenes Docker para producción.",
      },
    ],
    stack: ["Java", "Spring Boot", "Python", "FastAPI", "Gemini", "ChromaDB", "React", "Docker"],
    links: [
      { label: { en: "Live app", es: "App en producción" }, href: redCheck.liveUrl },
      { label: { en: "Website", es: "Sitio web" }, href: redCheck.websiteUrl },
      { label: { en: "GitHub organization", es: "Organización en GitHub" }, href: redCheck.repoUrl },
    ],
    photos: [],
  },
  {
    company: "Quimify",
    url: "https://quimify.com/",
    logo: withBase("/images/work/quimify.webp"),
    role: {
      en: "Backend Software Engineer",
      es: "Backend Software Engineer",
    },
    start: "2022-04",
    end: "2022-09",
    location: { en: "Málaga, Spain · Remote", es: "Málaga · Remoto" },
    summary: {
      en: "My first professional role, during my first year at university: backend work on a chemistry-learning app.",
      es: "Mi primer trabajo, durante mi primer año de carrera: backend de una app para aprender química.",
    },
    highlights: [
      {
        en: "Engineered backend domain logic in Java, using advanced regular expressions to parse chemical formulas and calculate molecular masses.",
        es: "Desarrollé lógica de dominio en Java, usando expresiones regulares avanzadas para parsear fórmulas químicas y calcular masas moleculares.",
      },
      {
        en: "Wrote SQL scripts with aggregate functions to find and manage duplicate records, keeping the database consistent.",
        es: "Escribí scripts SQL con funciones de agregación para detectar y gestionar registros duplicados y mantener la integridad de la base de datos.",
      },
      {
        en: "Maintained application services and version control, paying down technical debt and cleaning up repository configuration.",
        es: "Mantuve servicios de la aplicación y el control de versiones, reduciendo deuda técnica y ordenando la configuración de los repositorios.",
      },
    ],
    stack: ["Java", "Spring Boot", "SQL", "Regex", "Git"],
    links: [{ label: { en: "quimify.com", es: "quimify.com" }, href: "https://quimify.com/" }],
    photos: [],
  },
];
