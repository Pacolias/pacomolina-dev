---
title: "RedCheck, código abierto"
description: "Por qué elegí AGPLv3, y todo lo que tuvo que cambiar en el código antes de que lo pudieran leer desconocidos."
date: 2026-09-03
type: article
project: redcheck
series:
  id: building-redcheck
  title: "Construyendo RedCheck"
  part: 10
  arc: "Ya en el mundo real"
topics: [backend, devops]
---

A principios de septiembre, los repositorios de RedCheck pasaron a ser
públicos. El backend, el motor de IA, el frontend y la landing los puede
leer cualquiera en [GitHub](https://github.com/redcheckapp).

Cambiar la visibilidad es un clic. Llegar al punto de estar tranquilo
haciendo ese clic me llevó un par de días de trabajo que no tenían nada
que ver con funcionalidades, y me enseñaron más sobre mi propio código
que la mayoría de funcionalidades.

![La organización redcheckapp en GitHub, con su README y los lenguajes usados en los repositorios: Python, Java, TypeScript y Astro.](./github-org.webp "github.com/redcheckapp")

## Por qué abrir el código

Tres razones, ordenadas de más a menos sincera:

1. **Es mi portfolio.** Estoy buscando mi primer puesto como ingeniero.
   "He construido una app en producción con un servicio de IA" es una
   afirmación. Un repositorio público es una prueba.
2. **Cambia cómo escribo código.** Saber que alguien puede leer un
   fichero hace que nombres mejor las cosas, borres el código muerto y
   escribas el comentario que explica el *porqué*. Ese efecto empieza en
   cuanto decides publicarlo, no cuando alguien lo lee de verdad.
3. **Es una herramienta de productividad.** Es lógico que la gente mire
   con cuidado a dónde van sus tareas. Poder señalar el código que las
   gestiona vale algo.

## Por qué AGPLv3 y no MIT

MIT fue lo primero que consideré. Es sencilla y deja a cualquiera hacer
casi cualquier cosa. El problema es ese "casi cualquier cosa" en una
aplicación web: alguien podría coger RedCheck, modificarlo, ofrecerlo
como servicio y no compartir ni una línea de sus cambios. Con la mayoría
de licencias eso está permitido, porque nunca *distribuyen* el software,
solo lo ejecutan.

La GNU Affero GPL cierra exactamente ese hueco. Si ofreces una versión
modificada como servicio en red, tienes que ofrecer su código a los
usuarios de ese servicio. Para un SaaS que se puede autoalojar, es la
propiedad que quiero: cualquiera puede aprender de él, alojarlo o
contribuir, pero nadie puede convertirlo discretamente en un competidor
cerrado.

El coste es real. Algunas empresas tienen una política general en contra
del código AGPL, así que se reutilizará menos comercialmente. Para este
proyecto, es aceptable.

## Preparar la publicación: la lista

Antes de publicar nada, repasé cada repositorio como si fuera un revisor
que lo ve por primera vez.

### Secretos y configuración

- **La clave para firmar los JWT estaba escrita en el código.** Ahora se
  lee de una variable de entorno. Pero moverla no basta: el valor antiguo
  sigue en el historial de git, que está a punto de hacerse público. Un
  secreto que ha estado alguna vez en un commit hay que darlo por
  filtrado y no volver a usarlo jamás.
- Las credenciales de la base de datos, la URL del motor de IA y los
  orígenes permitidos perdieron sus valores por defecto "cómodos" en el
  fichero de configuración. Si falta una variable, la app debe fallar al
  arrancar, no conectarse en silencio a algo con una contraseña por
  defecto.
- El modo de esquema de Hibernate pasa a ser `validate` por defecto en
  lugar de `update`, salvo que un entorno pida explícitamente otra cosa.

### CORS

Todos los controladores tenían `@CrossOrigin(origins = "*")`, herencia
del día en que la app de React necesitó llamar a la API por primera vez.
Ahora cada uno lee los orígenes permitidos de la configuración. Permitir
cualquier origen es una costumbre que facilita el desarrollo en local y
es fácil de olvidar, así que repasé los controladores uno a uno en lugar
de fiarme de un ajuste global.

### Código que pueda leer un desconocido

- Los DTO de petición y respuesta pasaron a ser `record` de Java:
  inmutables, sin el boilerplate de Lombok y con la intención clara a
  primera vista.
- `System.out.println` pasó a ser logging de verdad.
- `equals`, `hashCode` y `toString` de las entidades ahora excluyen las
  relaciones perezosas, como el usuario propietario. Incluirlas es una
  forma clásica de provocar cargas inesperadas en la base de datos o una
  recursión infinita entre dos entidades que se referencian.
- Los comentarios y mensajes de log, muchos en español, se tradujeron al
  inglés. El texto que ve el usuario sigue siendo bilingüe, claro.
- En algún momento se habían subido al repositorio los ficheros
  compilados. Ya no están, igual que otros ficheros obsoletos, y el
  `.gitignore` quedó limpio.

### Le toca al frontend

El frontend tenía 24 errores de ESLint y 11 de TypeScript. Dejar ambos a
cero no fue cosmético: uno era un bug real, una función tipada como si
devolviera un objeto mientras todos sus usos trataban el resultado como
un array. Las herramientas estrictas solo ayudan si están en verde.

En la misma pasada, el único bundle de JavaScript de 697 kB se dividió en
chunks por ruta, y los modales que solo aparecen tras un clic deliberado
pasaron a cargarse bajo demanda. El chunk del dashboard pasó de 121 kB a
84 kB, y quien entra directamente al dashboard ya no descarga el fondo
animado de la pantalla de login.

### Documentación para personas

Cada repositorio tiene ahora un README con un diagrama de arquitectura,
instrucciones de instalación y la licencia, además de un
`CONTRIBUTING.md` que explica los estándares y el flujo de pull requests.

## Con qué me quedo

- Elige la licencia según cómo se *usa* tu software, no solo cómo se
  distribuye. Para un servicio web, AGPL y MIT protegen cosas muy
  distintas.
- Trata como público cualquier secreto que haya estado en un commit,
  aunque el repositorio fuera privado.
- Los valores por defecto son decisiones. Una contraseña por defecto
  "cómoda" es una vulnerabilidad con aspecto de funcionalidad.
- La mejor revisión de código que he hecho en este proyecto fue la que
  hice imaginando que la leía otra persona.

El código está en [github.com/redcheckapp](https://github.com/redcheckapp).
Issues, sugerencias y pull requests son bienvenidos.
