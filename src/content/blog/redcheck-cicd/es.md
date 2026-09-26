---
title: "Adiós a desplegar a mano"
description: "Llevar RedCheck de los despliegues manuales a un pipeline de CI/CD totalmente automatizado: GitHub Actions, Docker Hub y un servidor de producción limpio."
date: 2026-07-01
type: linkedin
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7478121077211172865/
project: redcheck
series:
  id: building-redcheck
  title: "Construyendo RedCheck"
  part: 2
topics: [devops, backend]
images:
  - src: ./github-actions.webp
    alt: "Una ejecución de GitHub Actions del deploy.yml de RedCheck: build-and-push (36 s) y después deploy (18 s) — completada en 1 m 3 s."
---

Decir adiós a los despliegues manuales es uno de los hitos más satisfactorios de la ingeniería de software. 🚀

Los despliegues manuales son un cuello de botella. Para escalar RedCheck de forma eficiente necesitaba eliminarlos por completo. Acabo de rehacer nuestra arquitectura de despliegue, pasando de un montaje manual tradicional a un pipeline de CI/CD totalmente automatizado, y el salto de arquitectura es enorme.

Así queda el nuevo stack, en resumen:

- **GitHub Actions** orquestando todo el pipeline (tests, build y despliegue).
- **Docker Hub** como registro de imágenes inmutables.
- **Un servidor limpio.** Producción es ahora solo un entorno de ejecución. Ni código fuente, ni herramientas de build, ni .jar movidos a mano; solo contenedores Docker orquestados de forma segura por SSH.

Automatizar esta infraestructura hace que el foco esté por completo en escribir código Java y Spring Boot limpio y SOLID, sabiendo que el pipeline actúa como un guardián implacable de la calidad y la estabilidad.

Construir una plataforma de productividad está muy bien, pero lo que de verdad la mantiene estable a largo plazo es una infraestructura automatizada sólida. 💻⚙️
