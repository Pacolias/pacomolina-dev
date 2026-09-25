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
      tagline: "Mathematician and Computer Scientist.",
      availability: "Available now · Málaga · remote, hybrid or on-site",
    },
    cta: {
      linkedin: "Connect on LinkedIn",
      cv: "Download CV",
    },
    home: {
      featured: "Featured project",
      allProjects: "See all projects",
      links: { live: "Live demo", website: "Website", repo: "Code" },
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
        showAll: "Show all projects",
        showFewer: "Show fewer",
        links: { live: "Live demo", website: "Website", repo: "Source code" },
        status: { live: "Live", active: "Active", complete: "Complete" },
      },
      work: {
        title: "Where I've worked",
        subtitle: "Backend, AI and full stack.",
        present: "Present",
        links: "Links",
        outsideHeading: "Outside work",
        outsideBody:
          "Dual degree in Mathematics and Computer Science at the University of Málaga (2021–2026), with two senior theses: numerical linear algebra and a production full-stack AI app.",
        outsideLink: "The longer story",
      },
      about: {
        title: "About me",
        subtitle: "The short version of how I got here.",
        timelineHeading: "Timeline",
        languagesHeading: "Languages",
        viewCertificate: "View certificate",
        kinds: {
          education: "Education",
          work: "Work",
          project: "Project",
          milestone: "Milestone",
        },
      },
      blog: {
        title: "Notes along the way",
        subtitle:
          "What I'm learning, building and talking about — written down so it doesn't get lost.",
        empty: "No posts yet — the first one is on its way.",
        talk: "Talk",
        draft: "Draft",
        back: "All posts",
        onlyIn: "This post is only available in Spanish.",
        slides: "Slides",
        video: "Video",
        repo: "Code",
        event: "Event",
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
    lightbox: {
      open: "Open image",
      close: "Close",
      prev: "Previous image",
      next: "Next image",
      of: "of",
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
      tagline: "Matemático e Ingeniero Informático.",
      availability: "Disponible ya · Málaga · remoto, híbrido, presencial",
    },
    cta: {
      linkedin: "Conectar en LinkedIn",
      cv: "Descargar CV",
    },
    home: {
      featured: "Proyecto destacado",
      allProjects: "Ver todos los proyectos",
      links: { live: "Demo en vivo", website: "Web", repo: "Código" },
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
        showAll: "Mostrar todos los proyectos",
        showFewer: "Mostrar menos",
        links: { live: "Demo en vivo", website: "Sitio web", repo: "Código fuente" },
        status: { live: "En vivo", active: "Activo", complete: "Completado" },
      },
      work: {
        title: "Dónde he trabajado",
        subtitle: "Backend, IA y full stack.",
        present: "Actualidad",
        links: "Enlaces",
        outsideHeading: "Fuera del trabajo",
        outsideBody:
          "Doble Grado en Matemáticas e Ingeniería Informática en la Universidad de Málaga (2021–2026), con dos TFG: álgebra lineal numérica y una app full stack con IA en producción.",
        outsideLink: "La historia completa",
      },
      about: {
        title: "Sobre mí",
        subtitle: "La versión corta de cómo he llegado hasta aquí.",
        timelineHeading: "Trayectoria",
        languagesHeading: "Idiomas",
        viewCertificate: "Ver certificado",
        kinds: {
          education: "Formación",
          work: "Trabajo",
          project: "Proyecto",
          milestone: "Hito",
        },
      },
      blog: {
        title: "Notas por el camino",
        subtitle:
          "Lo que voy aprendiendo, construyendo y contando — por escrito, para que no se pierda.",
        empty: "Todavía no hay entradas — la primera está en camino.",
        talk: "Charla",
        draft: "Borrador",
        back: "Todas las entradas",
        onlyIn: "Esta entrada solo está disponible en inglés.",
        slides: "Diapositivas",
        video: "Vídeo",
        repo: "Código",
        event: "Evento",
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
    lightbox: {
      open: "Abrir imagen",
      close: "Cerrar",
      prev: "Imagen anterior",
      next: "Imagen siguiente",
      of: "de",
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
