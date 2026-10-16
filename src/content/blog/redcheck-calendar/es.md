---
title: "Un calendario de verdad"
description: "Convertir el calendario de RedCheck de un adorno en una herramienta para planificar: historial de días pasados, prioridades, rutinas recurrentes con rachas y eventos de calendario."
date: 2026-09-14T02:44:00+02:00
type: article
project: redcheck
series:
  id: building-redcheck
  title: "Construyendo RedCheck"
  part: 14
  arc: "Ya en el mundo real"
topics: [backend, frontend]
---

RedCheck tenía un calendario con vistas de Día, Semana y Mes. Siendo
sincero, dos de las tres eran decorativas. La vista de Semana dibujaba
una caja vacía con borde discontinuo por cada día. La de Día dibujaba una
cuadrícula por horas con una línea de "ahora", y luego listaba tus
tareas por encima, ignorando las horas por completo.

Este post trata de convertir ese calendario, y las rutinas que hay
detrás, en algo con lo que de verdad planificarías tu semana. También es
la primera vez en esta serie en la que la mayor parte del trabajo empezó
en el backend.

![La vista de mes de RedCheck: días coloreados según el cumplimiento, tareas en los próximos días y eventos como una sprint review o un cumpleaños en forma de banda.](./calendar-month.webp "Vista de mes con tareas, el mapa de calor y eventos.")

## Vistas que muestran algo

La vista de Semana muestra ahora las tareas reales de cada día,
coloreadas por asignatura. La de Día coloca cada tarea en su hora real a
lo largo de las 24 horas, con una franja de "todo el día" para las fechas
límite sin hora, y al abrirse se desplaza hasta la hora actual.

En escritorio puedes arrastrar cualquier tarea a otro día u otra hora
para reprogramarla. Usé el drag and drop nativo de HTML5, que por diseño
solo funciona con ratón. En dispositivos táctiles, un toque sigue
abriendo el editor de la tarea, así que el comportamiento nunca es
ambiguo.

Construir la vista de Día sacó a la luz un montón de bugs de maquetación
que estaban ocultos porque antes nada estaba alineado de verdad con la
cuadrícula: una columna de horas y otra de tareas que hacían scroll por
separado y solo coincidían por casualidad, filas flex que se encogían por
debajo de su altura y un fondo que dejaba de pintarse a mediodía por cómo
estira flexbox los elementos. Ninguno era interesante por separado.
Juntos fueron un buen recordatorio de que "se ve bien" y "está bien
hecho" son cosas distintas.

## Los días pasados estaban vacíos y el dashboard era lento

Enseguida aparecieron dos problemas de backend.

**El dashboard hacía una petición por asignatura.** Pedía la lista de
asignaturas y luego las tareas de cada una. Con diez asignaturas, son
once peticiones HTTP para pintar una pantalla: el clásico problema N+1,
solo que a través de la red en lugar de dentro de la base de datos. Un
endpoint nuevo devuelve las asignaturas con sus tareas en una sola
respuesta, usando exactamente dos consultas (asignaturas y, después,
todas las tareas relevantes del usuario) agrupadas en memoria.

**El calendario no podía mostrar historial.** El dashboard solo carga
las tareas pendientes y las completadas hoy, así que un día pasado en el
calendario no mostraba más que un recuento del mapa de calor. Un nuevo
endpoint de primer nivel devuelve todas las tareas, pendientes o
completadas, cuya fecha límite cae dentro de un rango. Lo hice de primer
nivel en lugar de anidarlo bajo una asignatura por el mismo motivo del
N+1. El calendario pide un rango por vista, y solo cuando ese rango
incluye algún día pasado.

## Prioridades, y una estrategia de migraciones que tuve que asumir

Las tareas tienen ahora prioridad: baja, media o alta. Hay dos decisiones
que merece la pena explicar.

**La media es invisible.** Todas las tareas tienen prioridad media por
defecto, y la media no muestra ninguna etiqueta. Solo la baja y la alta.
Si todas las tareas llevan una etiqueta, nadie lee las etiquetas.

**La prioridad tiene su propia paleta de colores**, separada de la de
las asignaturas, porque son dos dimensiones distintas y el calendario ya
usa el color para las asignaturas.

La parte menos vistosa: RedCheck no tiene una herramienta de migraciones
como Flyway o Liquibase. Los cambios de esquema los aplica Hibernate con
`ddl-auto=update`. Añadir una columna no nula a una tabla con filas
existentes solo funciona si la propia base de datos tiene un valor por
defecto, así que la columna lo declara a nivel de base de datos, no solo
en Java. Funciona, y ahora está documentado, pero sé que es un atajo. El
primer cambio de esquema que `update` no pueda expresar de forma segura
(un renombrado, una columna que se divide) será el día en que introduzca
una herramienta de migraciones de verdad.

## Rutinas que se comportan como rutinas

Las tareas recurrentes admitían cuatro opciones fijas: diaria, semanal,
cada dos semanas y mensual. Las rutinas reales no son así.

**Días concretos de la semana.** "Lunes y jueves" se guarda como una
expresión cron restringida y se evalúa con el propio `CronExpression` de
Spring, sin dependencias nuevas. La validación solo acepta esa forma
exacta, así que cualquier valor guardado se puede convertir siempre de
vuelta en casillas en el formulario de edición. Aceptar cualquier cron
habría sido más flexible e imposible de editar desde una interfaz.

**Un día concreto del mes, o el último.** Esto se resuelve a mano, no
con cron. La implementación de cron de Spring no tiene operador de
"último día del mes", y una regla simple de "día 31" se salta en
silencio todos los meses que no lo tienen. Para una rutina como "pagar
el alquiler el día 31", el usuario quiere decir "el último día", no
"siete veces al año".

**Una hora del día y una fecha de fin.** Las tareas generadas tienen
ahora una hora límite real, y una rutina con fecha de fin genera su
última repetición ese día y después se desactiva sola.

**Una vista previa en directo** en el formulario muestra las próximas
fechas en las que saltará una rutina, calculadas en el cliente para que
se actualicen mientras escribes. Replica a propósito una peculiaridad del
planificador del backend (la primera repetición de una rutina nueva es
siempre en la siguiente ejecución del planificador), para que la vista
previa nunca prometa algo que el servidor no vaya a hacer.

**Rachas y tasa de cumplimiento** por rutina. Se calculan a partir del
historial completo de la rutina en cada lectura, no se guardan como
contadores. Un contador guardado se desincroniza en cuanto alguien borra
o desmarca una repetición pasada. El historial de una rutina es lo
bastante pequeño como para que recalcularlo sea barato, y así nunca puede
estar mal.

Con esto llegó también una mejora de robustez: el planificador procesaba
todas las rutinas en un único bucle, así que una sola frecuencia
imposible de interpretar abortaba la generación para todos los usuarios.
Ahora cada rutina se procesa de forma aislada.

![La vista "Mis rutinas": rutinas activas, mejor racha y cumplimiento medio arriba, y cada rutina con su frecuencia y próxima repetición.](./routines.webp "Todas las rutinas de todas las asignaturas, en una sola petición.")

## Un despliegue que devolvía lo que no era, con éxito

La nueva vista de "todas mis rutinas" funcionaba en local y fallaba en
producción. La causa: nginx solo redirigía al backend una lista conocida
de rutas de la API. La nueva ruta `/recurring-tasks` no estaba en ella,
así que caía en la ruta comodín de la single-page app y devolvía
`index.html` con un `200 OK`. Ningún error en ninguna parte; la respuesta
simplemente era HTML en lugar de JSON. `curl` y la cabecera
`Content-Type` lo encontraron en un minuto, en cuanto se me ocurrió
mirar.

## Los eventos no son tareas

Lo último que he añadido son los eventos de calendario: reuniones,
cumpleaños, viajes. Era tentador modelarlos como tareas con un flag. No
lo hice, porque son cosas realmente distintas. Una tarea tiene una fecha
límite y se completa. Un evento tiene un inicio y un fin y simplemente
ocurre. Mezclarlos habría contaminado cada estadística y cada recuento de
"pendientes" de la app.

Así que los eventos son un dominio propio: categorías definidas por el
usuario y con colores, eventos puntuales y recurrentes (con una nueva
frecuencia anual para los cumpleaños), de todo el día y con hora. En la
vista de Día, los eventos con hora son bloques que ocupan su duración, y
puedes mantener pulsado y arrastrar sobre la línea de tiempo para crear
uno. En la vista de Mes, los eventos de varios días se dibujan como
bandas continuas a lo largo de los días que abarcan.

Esas bandas provocaron mi bug favorito del mes. Bandas y celdas de día
comparten una misma cuadrícula CSS. Las bandas tenían posiciones
explícitas; las celdas dependían de la colocación automática. Según la
especificación de CSS Grid, los elementos colocados automáticamente se
saltan las celdas que ya ocupa uno colocado explícitamente, así que
cualquier día con una banda empujaba en silencio todos los días
siguientes de esa fila al día de la semana equivocado. Ahora las celdas
también tienen coordenadas explícitas. Ya puesto, reescribí toda la
lógica de comparación de días para usar enteros de día completo en lugar
de timestamps, lo que eliminó toda una familia de bugs en los límites
entre días.

Las cuentas demo se actualizaron con eventos de ejemplo, con fechas
relativas al día actual para que sigan vigentes tras el reinicio de cada
hora. Eso destapó un problema más: dos ejecuciones solapadas del
procedimiento de reinicio podían insertar cada una su propia copia de
los datos. Ahora va envuelto en un bloqueo con nombre que no espera; una
segunda ejecución simultánea simplemente no hace nada.

![La vista de día: un evento de cumpleaños de todo el día arriba y una cena de cumpleaños colocada a su hora real en la línea de tiempo.](./day-view-events.webp "Vista de día: un evento de todo el día y otro con hora.")

## Lo siguiente

La sincronización con Google Calendar está diseñada (una capa de solo
lectura con tus eventos, más una exportación opcional de las tareas de
RedCheck a un calendario dedicado) y esperando a la verificación OAuth de
Google, un proceso cuya historia conté en la parte 13.

## Con qué me quedo

- Los problemas N+1 también ocurren por HTTP. Cuenta tus peticiones, no
  solo tus consultas.
- Restringe los formatos flexibles a lo que tu interfaz pueda volver a
  editar.
- Calcula las estadísticas derivadas al leer hasta que tengas un motivo
  para no hacerlo.
- Modela lo que las cosas *son*, no lo que resulta cómodo: los eventos no
  son tareas.
- Si no usas una herramienta de migraciones, escribe por qué, y cuándo la
  vas a usar.

Planifica tu semana con la cuenta demo en
[redcheckapp.com](https://redcheckapp.com/).
