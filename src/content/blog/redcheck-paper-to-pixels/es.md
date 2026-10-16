---
title: "Del papel a la pantalla"
description: "Diez días para convertir un boceto a mano en la interfaz de RedCheck: qué sobrevivió de la libreta, qué cambió de sitio y los pequeños detalles que hacen que un planificador transmita calma."
date: 2026-03-30
type: article
project: redcheck
series:
  id: building-redcheck
  title: "Construyendo RedCheck"
  part: 3
  arc: "Los inicios"
topics: [frontend]
---

El 20 de marzo RedCheck tenía una API completa y ninguna interfaz
([parte 2](/es/blog/redcheck-backend-first/)). El 21 de marzo creé el
proyecto de React. Diez días después, el dashboard tenía calendario, mapa
de calor, modo foco y un botón de IA. Esta parte va de esos diez días.

Una nota sobre las capturas: no son de entonces. Para conseguirlas,
recuperé el frontend exactamente como estaba en cada fecha, lo arranqué
en local y le di datos de ejemplo. Lo que ves es el código real de ese
día, con asignaturas y tareas inventadas.

## Día tres: la libreta en una pantalla

React, TypeScript, Vite y Tailwind CSS. El login el primer día, el
registro el segundo. El tercero, 23 de marzo, el primer dashboard: un
saludo, la fecha y las tareas agrupadas por asignatura, cada una con su
casilla y su fecha límite.

![El primer dashboard de RedCheck: una barra lateral blanca con las asignaturas, el número de tareas de cada una y un círculo de progreso, y una zona principal que saluda al usuario con la fecha de hoy y lista las tareas agrupadas por asignatura, cada una con casilla, fecha límite y botones "Editar tarea" y "Borrar tarea".](./dashboard-march-23.webp "23 de marzo de 2026: el primer dashboard. Recreado a partir del código de ese día, con datos de ejemplo.")

Es sencillo, y se parece mucho al boceto de la
[parte 1](/es/blog/redcheck-before-first-commit/), que a su vez se parecía
mucho a mi libreta. Todas las llamadas HTTP vivían desde el principio en
una pequeña capa de API, con un interceptor que añade el JWT a cada
petición. Como el backend ya existía y estaba documentado, el frontend
nunca tuvo que esperar a ningún endpoint.

## Qué cambió de sitio, y por qué

Durante la semana siguiente el diseño cambió más de lo que esperaba, y el
boceto perdió alguna discusión con la realidad.

- **El calendario pasó al centro.** En el boceto era un pequeño mes
  metido en la barra lateral. En cuanto cada día mostró cuántas tareas
  tenía y cuántas estaban hechas, se convirtió en lo más útil de la
  pantalla, y se merecía el espacio. La lista de tareas pasó a una
  columna a la derecha.
- **La barra lateral se volvió un panel propio.** El círculo de progreso
  se quedó, y se le unió un gráfico de "balance de tareas": las tres
  asignaturas con más trabajo pendiente, para ver de un vistazo dónde
  poner el esfuerzo.
- **Las tareas atrasadas tuvieron su propio bloque.** En la libreta, una
  tarea atrasada simplemente se copiaba a la página siguiente, una y otra
  vez. En pantalla, una tarea que pasa su fecha límite va a una sección
  aparte, "Fuera de plazo", agrupada también por asignatura. Sigue a la
  vista sin ensuciar el plan del día.
- **Las fechas se volvieron palabras.** En lugar de `07/04/2026, 20:00`,
  una fecha límite dice "Hoy, 20:00" en rojo, "Mañana" en amarillo o
  "Pasado mañana" en verde. Nadie debería tener que hacer cuentas con
  fechas para saber qué es urgente.

![El dashboard de RedCheck el 7 de abril de 2026: una barra lateral con círculo de progreso, gráfico de balance de tareas y tarjetas de SmartCheck AI, un calendario mensual en el centro con los días pasados en verde indicando tareas completadas sobre el total, y una columna a la derecha que saluda al usuario y lista las tareas por asignatura con etiquetas de fecha de colores.](./dashboard-april-7.webp "7 de abril de 2026: el diseño dos semanas después. Recreado a partir del código de ese día, con datos de ejemplo.")

## Un mapa de calor para la constancia

La libreta me decía cómo iba el día. No me decía cómo había ido el último
mes. Eso era lo segundo que quería de una app, y el motivo por el que el
backend guarda una foto del progreso de cada día.

La interfaz convierte cada foto en un color, inspirado en el gráfico de
contribuciones de GitHub: un día sin nada planificado queda en blanco, un
día en el que no se hizo nada recibe un rojo muy suave, y a partir de ahí
pasa por tres verdes a medida que el porcentaje completado supera el 50 %
y el 80 %. El calendario mensual usa la misma escala, así que una buena
semana se ve, literalmente, verde.

El modo foco oculta el calendario por completo y pone el mapa de calor
junto a las tareas de hoy: solo la lista y tu historial, nada más.

![El modo foco de RedCheck el 7 de abril de 2026: la barra lateral a la izquierda, las tareas de hoy agrupadas por asignatura en el centro y, a la derecha, un panel "Tu rendimiento" con un mapa de calor de actividad diaria al estilo de GitHub de enero a abril, casi todo verde en marzo.](./focus-mode-april-7.webp "El modo foco: las tareas de hoy y el mapa de calor, sin el calendario. Recreado a partir del código del 7 de abril, con datos de ejemplo.")

## Pequeñas decisiones

- **Sin librería de estado.** Los hooks de React bastaban: `useState`
  para la interfaz, estado normal para lo que venía del servidor y
  `useMemo` para los datos derivados, como las tareas de hoy o el mapa de
  calor, para que solo se recalculen cuando cambian sus entradas. Redux o
  Zustand habrían sido una cosa más que aprender y mantener sin ningún
  beneficio visible a este tamaño.
- **Componentes divididos tarde.** El dashboard empezó como un único
  archivo grande. El cuarto día se dividió en `Sidebar`,
  `SubjectSection`, `TaskItem` y `OverdueSection`, cuando ya estaba claro
  qué piezas se repetían. Dividirlo antes habría sido adivinar.
- **Animaciones, con un coste que aún no veía.** El 27 de marzo añadí
  `framer-motion` para las transiciones entre páginas y pequeñas
  animaciones: una casilla que hace pop, tareas que entran y salen
  deslizándose. Hizo que la app pareciera terminada. También se usaba en
  un único sitio, y sus animaciones de salida nunca llegaron a
  ejecutarse. Quitarla, meses después, ahorró unos 120 KB
  ([parte 15](/es/blog/redcheck-native-feel/)).

## Con qué me quedo de esta etapa

- Un boceto es una hipótesis. Que el calendario pasara al centro no fue
  un fallo del boceto, fue lo primero que aprendí usando la cosa real.
- Tener la API terminada antes salió exactamente como esperaba: diez días
  de trabajo solo de interfaz, sin desvíos al backend.
- Los detalles que hacen que una app transmita calma son baratos:
  palabras en lugar de fechas, tareas atrasadas apartadas en lugar de
  amontonadas encima.

En mitad de esos diez días, el 26 de marzo, apareció un botón nuevo en la
barra lateral: *Análisis diario de tareas*. Esa es la siguiente parte.
