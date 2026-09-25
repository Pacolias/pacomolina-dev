import type { Localized } from "./i18n";
import { withBase } from "./site";

// About page: a short first-person intro, then a chronological timeline
// (oldest → "now") so it reads as a story top to bottom.

export const intro: Localized[] = [
  {
    en: "I'm Paco, a mathematician and computer scientist from Málaga. I studied both at once — a dual degree at the University of Málaga — and the combination stuck: maths taught me to be precise about what a system can and can't guarantee, software taught me what it takes to actually ship one.",
    es: "Soy Paco, matemático e informático de Málaga. Estudié las dos cosas a la vez — un doble grado en la Universidad de Málaga — y la combinación se quedó: las matemáticas me enseñaron a ser preciso sobre lo que un sistema puede y no puede garantizar, y el software me enseñó lo que cuesta de verdad sacarlo adelante.",
  },
  {
    en: "Today I build AI products end to end: RAG pipelines, multi-agent systems, MCP servers, and the plain, reliable backend and infrastructure underneath them. I'm most interested in the part where a model becomes something people can depend on.",
    es: "Hoy construyo productos con IA de principio a fin: pipelines RAG, sistemas multiagente, servidores MCP y el backend y la infraestructura, sencillos y fiables, que hay debajo. Lo que más me interesa es el momento en el que un modelo se convierte en algo en lo que la gente puede confiar.",
  },
];

export type TimelineItem = {
  kind: "education" | "work" | "project" | "milestone";
  date: Localized;
  title: Localized;
  body: Localized;
  link?: { label: Localized; href: string };
};

export const timeline: TimelineItem[] = [
  {
    kind: "education",
    date: { en: "Sep 2021", es: "Sep 2021" },
    title: {
      en: "Dual degree in Mathematics and Computer Science",
      es: "Doble Grado en Matemáticas e Ingeniería Informática",
    },
    body: {
      en: "Started at the University of Málaga (UMA): proofs and numerical methods on one side, systems and software engineering on the other.",
      es: "Empiezo en la Universidad de Málaga (UMA): demostraciones y métodos numéricos por un lado, sistemas e ingeniería del software por otro.",
    },
  },
  {
    kind: "work",
    date: { en: "Apr – Sep 2022", es: "Abr – Sep 2022" },
    title: {
      en: "First job: Backend Software Engineer at Quimify",
      es: "Primer trabajo: Backend Software Engineer en Quimify",
    },
    body: {
      en: "Remote, during my first year of university: Java domain logic for a chemistry app — parsing formulas and computing molecular masses — plus SQL for data integrity.",
      es: "En remoto, durante mi primer año de carrera: lógica de dominio en Java para una app de química — parsear fórmulas y calcular masas moleculares — y SQL para la integridad de los datos.",
    },
    link: { label: { en: "See work", es: "Ver trabajo" }, href: withBase("/work/") },
  },
  {
    kind: "milestone",
    date: { en: "During the degree", es: "Durante el grado" },
    title: {
      en: "Perfect scores in AI, honours in maths",
      es: "Dieces en IA, matrículas en matemáticas",
    },
    body: {
      en: "A perfect 10/10 in both Computational Learning (machine learning) and Intelligent Systems, and Highest Honours in Complex Analysis and in Local and Global Differential Geometry.",
      es: "Un 10/10 tanto en Aprendizaje Computacional (machine learning) como en Sistemas Inteligentes, y Matrícula de Honor en Análisis Complejo y en Geometría Diferencial Local y Global.",
    },
  },
  {
    kind: "project",
    date: { en: "Mar 2026", es: "Mar 2026" },
    title: { en: "Founded RedCheck", es: "Fundo RedCheck" },
    body: {
      en: "An AI-powered smart planner, built alone from scratch and running in production: Spring Boot core API, a RAG microservice with FastAPI, ChromaDB and Gemini, and a React app behind NGINX.",
      es: "Un planificador inteligente con IA, construido yo solo desde cero y en producción: API core en Spring Boot, un microservicio RAG con FastAPI, ChromaDB y Gemini, y una app en React detrás de NGINX.",
    },
    link: { label: { en: "See project", es: "Ver proyecto" }, href: withBase("/projects/") },
  },
  {
    kind: "education",
    date: { en: "Jul 2026", es: "Jul 2026" },
    title: { en: "Graduated, with two theses", es: "Graduado, con dos TFG" },
    body: {
      en: "Maths: numerical linear algebra and Krylov subspace methods (GMRES, BiCGSTAB), implemented in Python — defended with 9.0/10. Computer Science: a production-ready full-stack application integrating AI microservices. Final GPA 8.03/10.",
      es: "Matemáticas: álgebra lineal numérica y métodos de subespacios de Krylov (GMRES, BiCGSTAB), implementados en Python — defendido con un 9,0/10. Informática: una aplicación full stack lista para producción que integra microservicios de IA. Nota media final: 8,03/10.",
    },
  },
  {
    kind: "milestone",
    date: { en: "Now", es: "Ahora" },
    title: {
      en: "Building in the open, looking for my first AI Engineer role",
      es: "Construyendo en abierto, buscando mi primer puesto de AI Engineer",
    },
    body: {
      en: "Shipping side projects around agents, MCP and safer AI tooling — ShellMate, spotify-mcp, a LangGraph multi-agent planner. Based in Málaga, open to remote, hybrid or on-site roles, available immediately.",
      es: "Sacando proyectos en torno a agentes, MCP y herramientas de IA más seguras — ShellMate, spotify-mcp, un planificador multiagente con LangGraph. En Málaga, abierto a remoto, híbrido o presencial, con disponibilidad inmediata.",
    },
  },
];
