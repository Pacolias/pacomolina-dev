import type { Localized } from "./i18n";
import type { GalleryImage } from "../components/Gallery";
import { redCheck, withBase } from "./site";

// Projects page content. Two tiers:
// - `featured: true`  → a full card with screenshots, near the top.
// - `featured: false` → a compact expandable row under "More from the
//   workshop". Flip the flag to move a project between tiers.
// Order within each tier is the order of this array.
//
// Images live in public/images/projects/ as ~1280px-wide WebP. When the
// project itself has languages and/or themes, give one file per variant
// (see `ImageSource` in Gallery.tsx) so the screenshot matches how the
// visitor is viewing this site — e.g. `themedLocalized("redcheck-focus")`
// expects redcheck-focus-{light,dark}-{en,es}.webp.

export type ProjectLink = {
  kind: "live" | "website" | "repo";
  href: string;
};

export type Project = {
  slug: string;
  name: string;
  year: string;
  status: "live" | "active" | "complete";
  featured: boolean;
  tagline: Localized;
  summary: Localized;
  highlights: Localized[];
  stack: string[];
  images: GalleryImage[];
  links: ProjectLink[];
};

const img = (file: string) => withBase(`/images/projects/${file}`);
const themed = (name: string) => ({
  light: img(`${name}-light.webp`),
  dark: img(`${name}-dark.webp`),
});
const themedLocalized = (name: string) => ({
  light: { en: img(`${name}-light-en.webp`), es: img(`${name}-light-es.webp`) },
  dark: { en: img(`${name}-dark-en.webp`), es: img(`${name}-dark-es.webp`) },
});

export const projects: Project[] = [
  {
    slug: "redcheck",
    name: "RedCheck",
    year: "2026",
    status: "live",
    featured: true,
    tagline: {
      en: "An AI-powered smart planner that turns your task list into a plan for the day.",
      es: "Un planificador inteligente con IA que convierte tu lista de tareas en un plan para el día.",
    },
    summary: {
      en: "My flagship project, built end to end: a Java/Spring Boot core API, a dedicated Python/FastAPI AI microservice that talks to Google Gemini, and a React/TypeScript app — containerized behind NGINX and running in production.",
      es: "Mi proyecto principal, construido de principio a fin: una API core en Java/Spring Boot, un microservicio de IA dedicado en Python/FastAPI que habla con Google Gemini y una app en React/TypeScript — todo en contenedores detrás de NGINX y en producción.",
    },
    highlights: [
      {
        en: "SmartCheck AI: a standalone RAG microservice (FastAPI + Pydantic, ChromaDB for semantic retrieval, Gemini as the LLM) that analyzes your workload and generates an execution roadmap.",
        es: "SmartCheck AI: un microservicio RAG independiente (FastAPI + Pydantic, ChromaDB para la recuperación semántica, Gemini como LLM) que analiza tu carga de trabajo y genera una hoja de ruta.",
      },
      {
        en: "Core REST API in Java/Spring Boot with a strict MySQL schema via Hibernate (JPA), secured with JWT and Spring Security.",
        es: "API REST core en Java/Spring Boot con un esquema MySQL estricto vía Hibernate (JPA), protegida con JWT y Spring Security.",
      },
      {
        en: "Docker Compose infrastructure with an NGINX API gateway and Let's Encrypt SSL, plus a GitHub Actions pipeline running JUnit/Mockito tests and building images.",
        es: "Infraestructura con Docker Compose, un API gateway en NGINX y SSL con Let's Encrypt, más un pipeline de GitHub Actions con tests JUnit/Mockito y build de imágenes.",
      },
    ],
    stack: ["Java", "Spring Boot", "Python", "FastAPI", "Gemini", "ChromaDB", "React", "TypeScript", "Docker", "NGINX"],
    images: [
      {
        src: themedLocalized("redcheck-landing"),
        alt: {
          en: "RedCheck's landing page: “Your day, organized by Artificial Intelligence”, above a demo list the AI has just sorted by risk.",
          es: "La landing de RedCheck: “Tu día, organizado por Inteligencia Artificial”, sobre una lista de ejemplo que la IA acaba de ordenar por riesgo.",
        },
        width: 1280,
        height: 900,
      },
      {
        src: themedLocalized("redcheck-ai-plan"),
        alt: {
          en: "SmartCheck AI's daily plan: a risk level, a summary of the day and a prioritized strategy explaining why each task comes first.",
          es: "El plan diario de SmartCheck AI: un nivel de riesgo, un resumen del día y una estrategia priorizada que explica por qué va primero cada tarea.",
        },
        width: 1280,
        height: 900,
      },
      {
        src: themedLocalized("redcheck-dashboard"),
        alt: {
          en: "The dashboard: a month calendar colored by workload, task balance per subject, and tasks grouped by subject with their deadlines.",
          es: "El dashboard: un calendario mensual coloreado según la carga de trabajo, el balance de tareas por asignatura y las tareas agrupadas con sus fechas límite.",
        },
        width: 1280,
        height: 900,
      },
      {
        src: themedLocalized("redcheck-focus"),
        alt: {
          en: "Focus Mode: the calendar steps aside for today's tasks and a GitHub-style activity heatmap of your streak.",
          es: "El Modo Foco: el calendario se aparta para dejar solo las tareas de hoy y un mapa de actividad al estilo GitHub con tu racha.",
        },
        width: 1280,
        height: 900,
      },
    ],
    links: [
      { kind: "website", href: redCheck.websiteUrl },
      { kind: "live", href: redCheck.liveUrl },
      { kind: "repo", href: redCheck.repoUrl },
    ],
  },
  {
    slug: "shellmate",
    name: "ShellMate",
    year: "2026",
    status: "active",
    featured: true,
    tagline: {
      en: "A real Linux terminal wrapped in scaffolding that explains, protects and teaches — and fades away as you learn.",
      es: "Una terminal Linux real envuelta en un andamiaje que explica, protege y enseña — y que desaparece a medida que aprendes.",
    },
    summary: {
      en: "Not a simulated terminal and not a chatbot with a command box: it runs your actual bash/zsh and adds a live danger semaphore, plain-language subtitles, translated errors, a filesystem map, a command diary and an optional AI copilot — each one something you can dial down as you outgrow it.",
      es: "Ni una terminal simulada ni un chatbot con una caja de comandos: ejecuta tu bash/zsh real y le añade un semáforo de peligro en vivo, subtítulos en lenguaje llano, errores traducidos, un mapa del sistema de archivos, un diario de comandos y un copiloto de IA opcional — cada pieza se puede ir apagando según dejas de necesitarla.",
    },
    highlights: [
      {
        en: "The danger semaphore is deterministic rules, never AI: commands are parsed with tree-sitter-bash and classified by an exhaustively unit-tested classifier.",
        es: "El semáforo de peligro son reglas deterministas, nunca IA: los comandos se parsean con tree-sitter-bash y los clasifica un clasificador con tests exhaustivos.",
      },
      {
        en: "The AI copilot (Gemini by default, Claude as a drop-in) turns natural language into commands — and every suggestion is re-validated by the same local rules before you see it.",
        es: "El copiloto de IA (Gemini por defecto, Claude como alternativa) convierte lenguaje natural en comandos — y cada sugerencia se revalida con las mismas reglas locales antes de mostrártela.",
      },
      {
        en: "A real pty (node-pty) instrumented via OSC 133/OSC 7, `rm` previews with a freedesktop.org trash and undo, and 122 unit tests on strict TypeScript.",
        es: "Una pty real (node-pty) instrumentada con OSC 133/OSC 7, previsualización de `rm` con papelera freedesktop.org y deshacer, y 122 tests unitarios sobre TypeScript estricto.",
      },
    ],
    stack: ["TypeScript", "Electron", "React", "xterm.js", "tree-sitter", "Gemini", "Claude"],
    images: [
      {
        src: img("shellmate-overview.webp"),
        alt: {
          en: "ShellMate's three-column layout: filesystem map and command diary, the real terminal, and the explanation panels.",
          es: "El diseño de tres columnas de ShellMate: mapa de archivos y diario de comandos, la terminal real y los paneles de explicación.",
        },
        width: 1280,
        height: 800,
      },
      {
        src: img("shellmate-semaphore.webp"),
        alt: {
          en: "A destructive command caught live by ShellMate's danger semaphore, asking for confirmation.",
          es: "Un comando destructivo detectado en vivo por el semáforo de ShellMate, pidiendo confirmación.",
        },
        width: 1280,
        height: 800,
      },
    ],
    links: [{ kind: "repo", href: "https://github.com/Pacolias/shellmate" }],
  },
  {
    slug: "spotify-mcp",
    name: "spotify-mcp",
    year: "2026",
    status: "active",
    featured: true,
    tagline: {
      en: "An MCP server that lets Claude (or any MCP host) search, control and curate your Spotify.",
      es: "Un servidor MCP que permite a Claude (o cualquier host MCP) buscar, controlar y organizar tu Spotify.",
    },
    summary: {
      en: "A local Model Context Protocol server exposing the Spotify Web API as tools, resources and prompts — from “what am I listening to” to building a playlist from a YouTube mix's tracklist. Every architecture decision is logged in a public decision journal.",
      es: "Un servidor local del Model Context Protocol que expone la API web de Spotify como tools, resources y prompts — desde “qué estoy escuchando” hasta crear una playlist a partir del tracklist de un mix de YouTube. Cada decisión de arquitectura está documentada en un diario público.",
    },
    highlights: [
      {
        en: "20+ typed MCP tools (search, playback, playlists, top tracks…) plus URI-addressed resources and reusable prompts, served over stdio.",
        es: "Más de 20 tools MCP tipadas (búsqueda, reproducción, playlists, top tracks…) además de resources direccionados por URI y prompts reutilizables, servidos por stdio.",
      },
      {
        en: "A separate FastAPI login helper for the OAuth2 Authorization Code + PKCE flow, with tokens in SQLite and transparent refresh.",
        es: "Un helper de login aparte en FastAPI para el flujo OAuth2 Authorization Code + PKCE, con tokens en SQLite y refresco transparente.",
      },
      {
        en: "Honest about limits: known Spotify-side bugs and quota restrictions are documented per tool instead of hidden.",
        es: "Honesto con los límites: los bugs conocidos de Spotify y las restricciones de cuota están documentados en cada tool en lugar de ocultarse.",
      },
    ],
    stack: ["Python", "FastAPI", "MCP", "OAuth2 PKCE", "SQLModel"],
    images: [],
    links: [{ kind: "repo", href: "https://github.com/Pacolias/spotify-mcp" }],
  },
  {
    slug: "camper-agent-orchestrator",
    name: "Camper Agent Orchestrator",
    year: "2026",
    status: "active",
    featured: true,
    tagline: {
      en: "A multi-agent system that plans campervan routes — legal constraints, overnight spots and fuel costs.",
      es: "Un sistema multiagente que planifica rutas en camper — restricciones legales, sitios para pernoctar y coste de combustible.",
    },
    summary: {
      en: "A hub-and-spoke architecture built with LangGraph: a Gemini-based supervisor reads a shared route state and delegates to specialized agents until every field is filled, then returns a structured plan through a FastAPI endpoint.",
      es: "Una arquitectura hub-and-spoke construida con LangGraph: un supervisor basado en Gemini lee un estado de ruta compartido y delega en agentes especializados hasta completar todos los campos, y devuelve un plan estructurado a través de un endpoint de FastAPI.",
    },
    highlights: [
      {
        en: "Supervisor with Pydantic structured outputs and conditional routing over a shared RouteState.",
        es: "Supervisor con salidas estructuradas en Pydantic y enrutado condicional sobre un RouteState compartido.",
      },
      {
        en: "RAG legal agent (ChromaDB over regulation PDFs), SQL agent for campsites and points of interest, and a math agent (NumPy/SciPy) for fuel and driving-time estimates.",
        es: "Agente legal con RAG (ChromaDB sobre PDFs de normativa), agente SQL para áreas y puntos de interés, y un agente matemático (NumPy/SciPy) para estimar combustible y tiempos.",
      },
    ],
    stack: ["Python", "LangGraph", "Gemini", "FastAPI", "ChromaDB", "Docker"],
    images: [],
    links: [{ kind: "repo", href: "https://github.com/Pacolias/camper-agent-orchestrator" }],
  },
  {
    slug: "krylov-solvers",
    name: "krylov-solvers",
    year: "2026",
    status: "complete",
    featured: false,
    tagline: {
      en: "Matrix-free Krylov subspace solvers in Python — the code behind my maths thesis.",
      es: "Solvers de subespacios de Krylov sin matrices explícitas en Python — el código detrás de mi TFG de matemáticas.",
    },
    summary: {
      en: "From-scratch implementations of CG (with preconditioning), GMRES, BiCG, CGS and BiCGSTAB, benchmarked on real sparse matrices from the SuiteSparse collection — structural engineering, fluid dynamics, oil reservoir simulation.",
      es: "Implementaciones desde cero de CG (con precondicionamiento), GMRES, BiCG, CGS y BiCGSTAB, comparadas sobre matrices dispersas reales de la colección SuiteSparse — ingeniería estructural, dinámica de fluidos, simulación de yacimientos.",
    },
    highlights: [],
    stack: ["Python", "NumPy", "SciPy", "Matplotlib"],
    images: [
      {
        src: themedLocalized("krylov-asym-sherman1"),
        alt: {
          en: "Convergence on the asymmetric sherman1 matrix: BiCGSTAB and GMRES converge smoothly, CGS oscillates wildly.",
          es: "Convergencia sobre la matriz asimétrica sherman1: BiCGSTAB y GMRES convergen de forma estable, CGS oscila muchísimo.",
        },
        width: 1280,
        height: 814,
      },
      {
        src: themedLocalized("krylov-asym-pores_2"),
        alt: {
          en: "On the harder pores_2 matrix, BiCG and CGS never converge in 2,000 iterations, while GMRES gets there in 420.",
          es: "Con la matriz pores_2, más difícil, BiCG y CGS no convergen en 2.000 iteraciones, mientras que GMRES lo consigue en 420.",
        },
        width: 1280,
        height: 814,
      },
      {
        src: themedLocalized("krylov-efficiency-pores_2"),
        alt: {
          en: "Same matrix, plotted against time: BiCGSTAB's cheap iterations reach a low residual far sooner than GMRES, whose cost per iteration keeps growing.",
          es: "La misma matriz frente al tiempo: las iteraciones baratas de BiCGSTAB alcanzan un residuo bajo mucho antes que GMRES, cuyo coste por iteración no para de crecer.",
        },
        width: 1280,
        height: 814,
      },
      {
        src: themedLocalized("krylov-spd-nos6"),
        alt: {
          en: "Symmetric positive-definite nos6 matrix: a Jacobi preconditioner cuts CG from 292 iterations to 75.",
          es: "Matriz simétrica definida positiva nos6: un precondicionador de Jacobi reduce CG de 292 iteraciones a 75.",
        },
        width: 1280,
        height: 813,
      },
      {
        src: themedLocalized("krylov-spd-bcsstk14"),
        alt: {
          en: "On bcsstk14, plain CG stalls at the 1,000-iteration cap while Jacobi-preconditioned CG converges in 195.",
          es: "Con bcsstk14, CG sin precondicionar se atasca en el límite de 1.000 iteraciones, y con Jacobi converge en 195.",
        },
        width: 1280,
        height: 813,
      },
    ],
    links: [{ kind: "repo", href: "https://github.com/Pacolias/krylov-solvers" }],
  },
  {
    slug: "astro-landing-boilerplate",
    name: "Astro Landing Boilerplate",
    year: "2026",
    status: "live",
    featured: false,
    tagline: {
      en: "A fast, SEO-friendly starter for landing pages and small business sites.",
      es: "Una plantilla rápida y optimizada para SEO para landings y webs de pequeños negocios.",
    },
    summary: {
      en: "Astro islands with React and Tailwind CSS: a flash-free dark mode that survives view transitions, a booking calendar with slot selection, accordion FAQs and a contact form with submission states.",
      es: "Islas de Astro con React y Tailwind CSS: modo oscuro sin parpadeo que sobrevive a las view transitions, un calendario de reservas con selección de huecos, FAQs en acordeón y un formulario de contacto con estados de envío.",
    },
    highlights: [],
    stack: ["Astro", "React", "Tailwind CSS", "TypeScript"],
    images: [
      {
        src: themed("astro-landing"),
        alt: {
          en: "The boilerplate's landing page hero.",
          es: "El hero de la landing de la plantilla.",
        },
        width: 1280,
        height: 620,
      },
    ],
    links: [
      { kind: "live", href: "https://pacolias.github.io/astro-landing-boilerplate/" },
      { kind: "repo", href: "https://github.com/Pacolias/astro-landing-boilerplate" },
    ],
  },
];
