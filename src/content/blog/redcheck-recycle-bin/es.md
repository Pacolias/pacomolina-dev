---
title: "La papelera de RedCheck"
description: "Borrado lógico y papelera para RedCheck — y por qué una funcionalidad de «añadir una columna y listo» acabó tocando media arquitectura."
date: 2026-08-21
type: linkedin
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7496618991306821632/
project: redcheck
series:
  id: building-redcheck
  title: "Construyendo RedCheck"
  part: 3
topics: [backend, frontend]
images:
  - src: ./empty-bin.webp
    alt: "La papelera de RedCheck vacía: un estado vacío amable que indica que ahí aparecerán los elementos eliminados."
  - src: ./bin-with-items.webp
    alt: "La papelera de RedCheck con una asignatura y tres tareas eliminadas, cada una con acciones de restaurar y eliminar para siempre, y un botón de «Vaciar papelera»."
---

¿Has borrado algo sin querer? Tranquilo, RedCheck ya tiene papelera. 🗑️

Los borrados accidentales son muy habituales y una forma segura de estropear la experiencia de usuario. Por eso la última funcionalidad en la que he estado trabajando es un sistema completo de borrado lógico (soft delete) con papelera.

Sobre el papel suena a añadir una columna nueva a la base de datos y listo. Pero implementarlo de forma robusta rompió los contratos iniciales de nuestras entidades, lo que supuso una refactorización profunda:

**🛠️ Backend y base de datos**

- Migré el modelo de datos para incluir marcas de borrado lógico (`deleted`).
- Refactoricé consultas y endpoints para que los elementos eliminados no ensucien las vistas principales.
- Actualicé procedimientos almacenados y eventos de MySQL para que las nuevas restricciones de las entidades no rompieran la automatización en segundo plano.

**🎨 Frontend**

- Diseñé una vista propia con animaciones de transición suaves, para que restaurar o eliminar definitivamente una tarea se sienta fluido.
- Creé estados vacíos amables y acciones globales como «Vaciar papelera».

¿La principal lección de esta iteración? Ninguna funcionalidad, por trivial que parezca, es nunca un arreglo rápido. Solo modificar los contratos base de las entidades obligó a repensar buena parte de la arquitectura para mantener la base de datos consistente y el frontend impecable.

¡Échale un vistazo en [redcheck.es](https://redcheckapp.com/)! Cualquier feedback o sugerencia de mejora es más que bienvenido.
