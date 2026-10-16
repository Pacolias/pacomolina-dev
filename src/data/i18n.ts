export type Lang = "en" | "es";

export const dictionary = {
  en: {
    meta: {
      title: "Paco Molina — AI Engineer",
      description:
        "Portfolio of Paco Molina, an AI Engineer based in Málaga, Spain. Mathematician and Computer Scientist, and builder of RedCheck, an AI-powered task manager.",
    },
    hero: {
      role: "AI Engineer",
      tagline: "Mathematician and Computer Scientist.",
      availability: "Working as an AI Engineer · Málaga",
    },
    cta: {
      linkedin: "Connect on LinkedIn",
      cv: "View CV",
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
      qr: "Show QR code",
      qrAlt: "QR code linking to pacomolina.dev",
      qrCaption: "Scan to open pacomolina.dev",
      copyEmail: "Copy email address",
      emailCopied: "Email copied",
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
        writtenAbout: "Written about this",
        updated: "Last push",
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
      now: {
        title: "Now",
        subtitle: "What I'm focused on at the moment.",
        updated: "Last updated",
        link: "What I'm doing now",
      },
      notFound: {
        title: "Page not found",
        subtitle: "This page doesn't exist, or it has moved.",
        home: "Back to home",
        orTry: "Or go to",
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
        all: "All",
        types: {
          article: "Article",
          talk: "Talk",
          linkedin: "LinkedIn",
          milestone: "Milestone",
          release: "Release",
          event: "Event",
          til: "Today I learned",
        },
        filters: {
          article: "Articles",
          talk: "Talks",
          linkedin: "LinkedIn",
          milestone: "Milestones",
          release: "Releases",
          event: "Events",
          til: "TIL",
        },
        topics: {
          ai: "AI",
          backend: "Backend",
          frontend: "Frontend",
          devops: "DevOps",
          maths: "Maths",
          career: "Career",
        },
        viewOnLinkedIn: "View on LinkedIn",
        eventPage: "Event page",
        share: "Share",
        linkCopied: "Link copied",
        recap: "Photos & recap",
        project: "Project",
        minRead: "min read",
        seriesPart: "Part {part} of {total}",
        series: "Series",
        seriesParts: "{n} parts",
        // One line under each series' title, by series id.
        seriesIntros: {
          "building-redcheck":
            "From localhost to a product other people can use: building an AI planner in public, one feature at a time.",
        } as Record<string, string>,
        readMore: "Read",
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
    search: {
      open: "Search",
      label: "Search the site",
      placeholder: "Search projects, work, posts…",
      empty: "Nothing matches that.",
      hint: "↑↓ to move · Enter to open · Esc to close",
      groups: {
        page: "Pages",
        project: "Projects",
        job: "Work",
        post: "Blog",
        action: "Actions",
        ask: "Assistant",
      },
      egg: {
        prompt: "[sudo] password for recruiter:",
        granted: "Access granted.",
        body: "Paco is working as an AI Engineer now, but he's always up for a chat. Next step's yours:",
        linkedin: "LinkedIn",
      },
      actions: {
        theme: "Toggle dark mode",
        lang: "Switch to Spanish",
        cv: "Download CV",
        viewCv: "View CV",
        email: "Copy email address",
        emailCopied: "Email copied",
      },
    },
    lightbox: {
      open: "Open image",
      close: "Close",
      prev: "Previous image",
      next: "Next image",
      of: "of",
    },
    assistant: {
      home: "Ask anything about Paco…",
      ask: "Ask about Paco",
      askQuery: "Ask about Paco",
      group: "Assistant",
      label: "Ask about Paco",
      placeholder: "Ask anything about Paco…",
      back: "Back to search",
      send: "Send",
      intro: "Ask about Paco's projects, experience, stack or what he's doing now. Answers come only from this site.",
      suggestions: [
        "What has Paco built with LLMs?",
        "What's RedCheck's architecture?",
        "What is he doing now?",
        "What did he study?",
      ],
      thinking: "Thinking…",
      disclaimer: "AI answers from this site's content — may be imperfect. Questions are kept anonymously for 90 days to improve it; don't share personal data.",
      clear: "New chat",
      errors: {
        busy: "The assistant is resting right now (its free quota ran out). Try again later, or write to Paco:",
        limited: "That's a lot of questions in a row — give it a minute.",
        failed: "Something went wrong answering that. Try again, or write to Paco:",
        offline: "You're offline — the assistant needs a connection.",
      },
    },
    docs: {
      titles: { cv: "CV — Paco Molina", "english-c1": "English C1 certificate — British Council" },
      page: "page",
      download: "Download PDF",
      verify: "Verify",
      verifyTitle: "Verify on the British Council website",
    },
  },
  es: {
    meta: {
      title: "Paco Molina — AI Engineer",
      description:
        "Portfolio de Paco Molina, AI Engineer en Málaga. Matemático e Informático, y creador de RedCheck, un gestor de tareas con IA.",
    },
    hero: {
      role: "AI Engineer",
      tagline: "Matemático e Ingeniero Informático.",
      availability: "Trabajando como AI Engineer · Málaga",
    },
    cta: {
      linkedin: "Conectar en LinkedIn",
      cv: "Ver CV",
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
      qr: "Mostrar código QR",
      qrAlt: "Código QR que enlaza a pacomolina.dev",
      qrCaption: "Escanea para abrir pacomolina.dev",
      copyEmail: "Copiar dirección de email",
      emailCopied: "Email copiado",
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
        writtenAbout: "Escrito sobre esto",
        updated: "Último push",
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
      now: {
        title: "Ahora",
        subtitle: "En qué ando ahora mismo.",
        updated: "Actualizado el",
        link: "Qué estoy haciendo ahora",
      },
      notFound: {
        title: "Página no encontrada",
        subtitle: "Esta página no existe, o se ha movido.",
        home: "Volver al inicio",
        orTry: "O ve a",
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
        all: "Todo",
        types: {
          article: "Artículo",
          talk: "Charla",
          linkedin: "LinkedIn",
          milestone: "Hito",
          release: "Lanzamiento",
          event: "Evento",
          til: "Aprendido hoy",
        },
        filters: {
          article: "Artículos",
          talk: "Charlas",
          linkedin: "LinkedIn",
          milestone: "Hitos",
          release: "Lanzamientos",
          event: "Eventos",
          til: "Aprendido hoy",
        },
        topics: {
          ai: "IA",
          backend: "Backend",
          frontend: "Frontend",
          devops: "DevOps",
          maths: "Matemáticas",
          career: "Carrera",
        },
        viewOnLinkedIn: "Ver en LinkedIn",
        eventPage: "Página del evento",
        share: "Compartir",
        linkCopied: "Enlace copiado",
        recap: "Fotos y crónica",
        project: "Proyecto",
        minRead: "min de lectura",
        seriesPart: "Parte {part} de {total}",
        series: "Serie",
        seriesParts: "{n} partes",
        seriesIntros: {
          "building-redcheck":
            "De localhost a un producto que otras personas pueden usar: construyendo en público un planificador con IA, funcionalidad a funcionalidad.",
        } as Record<string, string>,
        readMore: "Leer",
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
    search: {
      open: "Buscar",
      label: "Buscar en la web",
      placeholder: "Busca proyectos, trabajo, entradas…",
      empty: "No hay nada que coincida.",
      hint: "↑↓ para moverte · Enter para abrir · Esc para cerrar",
      groups: {
        page: "Páginas",
        project: "Proyectos",
        job: "Trabajo",
        post: "Blog",
        action: "Acciones",
        ask: "Asistente",
      },
      egg: {
        prompt: "[sudo] contraseña para recruiter:",
        granted: "Acceso concedido.",
        body: "Paco ya trabaja como AI Engineer, pero siempre le apetece charlar. El siguiente paso es tuyo:",
        linkedin: "LinkedIn",
      },
      actions: {
        theme: "Cambiar modo claro/oscuro",
        lang: "Cambiar a inglés",
        cv: "Descargar CV",
        viewCv: "Ver CV",
        email: "Copiar dirección de email",
        emailCopied: "Email copiado",
      },
    },
    lightbox: {
      open: "Abrir imagen",
      close: "Cerrar",
      prev: "Imagen anterior",
      next: "Imagen siguiente",
      of: "de",
    },
    assistant: {
      home: "Pregunta lo que quieras sobre Paco…",
      ask: "Pregunta sobre Paco",
      askQuery: "Preguntar sobre Paco",
      group: "Asistente",
      label: "Pregunta sobre Paco",
      placeholder: "Pregunta lo que quieras sobre Paco…",
      back: "Volver a la búsqueda",
      send: "Enviar",
      intro: "Pregunta por los proyectos, la experiencia, el stack o la situación actual de Paco. Las respuestas salen solo de esta web.",
      suggestions: [
        "¿Qué ha construido Paco con LLMs?",
        "¿Cómo es la arquitectura de RedCheck?",
        "¿A qué se dedica ahora?",
        "¿Qué ha estudiado?",
      ],
      thinking: "Pensando…",
      disclaimer: "Respuestas de IA a partir del contenido de esta web — pueden no ser perfectas. Las preguntas se guardan de forma anónima 90 días para mejorarlo; no compartas datos personales.",
      clear: "Nuevo chat",
      errors: {
        busy: "El asistente está descansando ahora mismo (se acabó su cuota gratuita). Prueba más tarde o escribe a Paco:",
        limited: "Son muchas preguntas seguidas — espera un minuto.",
        failed: "Algo ha fallado al responder. Prueba otra vez o escribe a Paco:",
        offline: "Estás sin conexión — el asistente necesita internet.",
      },
    },
    docs: {
      titles: { cv: "CV — Paco Molina", "english-c1": "Certificado de inglés C1 — British Council" },
      page: "página",
      download: "Descargar PDF",
      verify: "Verificar",
      verifyTitle: "Verificar en la web del British Council",
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
