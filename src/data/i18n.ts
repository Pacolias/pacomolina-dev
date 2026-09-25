export type Lang = "en" | "es";

export const dictionary = {
  en: {
    meta: {
      title: "Paco Molina — AI/Software Engineer",
      description:
        "Portfolio of Paco Molina, an AI/Software Engineer based in Málaga, Spain. Mathematician and Computer Scientist, and builder of RedCheck, an AI-powered task manager. Open to remote, hybrid and on-site roles.",
    },
    hero: {
      role: "AI/Software Engineer",
      tagline:
        "Mathematician and Computer Scientist, building AI-powered products and agentic architectures.",
      availability:
        "Based in Málaga, Spain — open to remote, hybrid or on-site AI/Software Engineer roles. Available immediately.",
    },
    cta: {
      linkedin: "Connect on LinkedIn",
      cv: "Download CV",
    },
    projects: {
      redcheck: {
        tag: "AI-Powered Smart Planner",
        description:
          "An AI-powered smart planner that uses Google Gemini — through a dedicated Python/FastAPI microservice — to help you prioritize your day, backed by a Java/Spring Boot core API and a React/TypeScript app.",
        live: "Live demo",
        website: "Website",
        repo: "Source code",
      },
    },
    stack: {
      heading: "Tech stack",
    },
    contact: {
      heading: "Let's talk",
      button: "Send an email",
      vcard: "Save contact",
      github: "GitHub profile",
    },
    nav: {
      label: "Main",
      home: "Home",
      projects: "Projects",
      work: "Work",
      blog: "Blog",
      about: "About",
    },
    pages: {
      projects: {
        title: "Things I've built",
        subtitle:
          "AI products, agent systems and developer tools — plus a detour into numerical maths. Open one for the story behind it.",
        moreHeading: "More from the workshop",
        moreSubtitle: "Smaller or older projects, still worth a look.",
        details: "Details",
        hideDetails: "Hide details",
        links: { live: "Live demo", website: "Website", repo: "Source code" },
        status: { live: "Live", active: "Active", complete: "Complete" },
      },
      work: {
        title: "Where I've worked",
        subtitle: "Backend, AI and full stack — with the receipts.",
        present: "Present",
        proof: "Proof",
        outsideHeading: "Outside work",
        outsideBody:
          "Dual degree in Mathematics and Computer Science at the University of Málaga (2021–2026), with two senior theses: numerical linear algebra and a production full-stack AI app.",
        outsideLink: "The longer story",
      },
    },
    langToggle: {
      label: "Switch to Spanish",
      short: "ES",
    },
    themeToggle: {
      toDark: "Switch to dark mode",
      toLight: "Switch to light mode",
    },
  },
  es: {
    meta: {
      title: "Paco Molina — AI/Software Engineer",
      description:
        "Portfolio de Paco Molina, AI/Software Engineer en Málaga. Matemático e Informático, y creador de RedCheck, un gestor de tareas con IA. Abierto a trabajo remoto, híbrido y presencial.",
    },
    hero: {
      role: "AI/Software Engineer",
      tagline:
        "Matemático e Informático, construyendo productos con IA y arquitecturas agénticas.",
      availability:
        "Ubicado en Málaga — abierto a puestos de AI/Software Engineer en remoto, híbrido o presencial. Disponibilidad inmediata.",
    },
    cta: {
      linkedin: "Conectar en LinkedIn",
      cv: "Descargar CV",
    },
    projects: {
      redcheck: {
        tag: "Planificador Inteligente con IA",
        description:
          "Un planificador inteligente con IA que usa Google Gemini — a través de un microservicio dedicado en Python/FastAPI — para ayudarte a priorizar tu día, apoyado en una API core en Java/Spring Boot y una app en React/TypeScript.",
        live: "Demo en vivo",
        website: "Sitio web",
        repo: "Código fuente",
      },
    },
    stack: {
      heading: "Stack tecnológico",
    },
    contact: {
      heading: "Hablemos",
      button: "Enviar un email",
      vcard: "Guardar contacto",
      github: "Perfil de GitHub",
    },
    nav: {
      label: "Principal",
      home: "Inicio",
      projects: "Proyectos",
      work: "Trabajo",
      blog: "Blog",
      about: "Sobre mí",
    },
    pages: {
      projects: {
        title: "Cosas que he construido",
        subtitle:
          "Productos con IA, sistemas de agentes y herramientas para desarrolladores — y un desvío por las matemáticas numéricas. Abre uno para ver la historia detrás.",
        moreHeading: "Más del taller",
        moreSubtitle: "Proyectos más pequeños o antiguos que merece la pena ver.",
        details: "Detalles",
        hideDetails: "Ocultar detalles",
        links: { live: "Demo en vivo", website: "Sitio web", repo: "Código fuente" },
        status: { live: "En vivo", active: "Activo", complete: "Completado" },
      },
      work: {
        title: "Dónde he trabajado",
        subtitle: "Backend, IA y full stack — con pruebas.",
        present: "Actualidad",
        proof: "Pruebas",
        outsideHeading: "Fuera del trabajo",
        outsideBody:
          "Doble Grado en Matemáticas e Ingeniería Informática en la Universidad de Málaga (2021–2026), con dos TFG: álgebra lineal numérica y una app full stack con IA en producción.",
        outsideLink: "La historia completa",
      },
    },
    langToggle: {
      label: "Cambiar a inglés",
      short: "EN",
    },
    themeToggle: {
      toDark: "Cambiar a modo oscuro",
      toLight: "Cambiar a modo claro",
    },
  },
} as const;

// The English copy's shape with its string literals widened to `string`, so
// both languages are assignable to it (and a key missing from one of them is
// a type error).
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { readonly [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<(typeof dictionary)["en"]>;

// A piece of copy that exists in both languages — used by the structured
// content files (projects, work, timeline) so each entry keeps its EN/ES
// text side by side instead of being split across the dictionary above.
export type Localized = Record<Lang, string>;
