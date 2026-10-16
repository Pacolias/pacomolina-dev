---
title: "Nativa, sin app store"
description: "Hacer que RedCheck se sienta como una app móvil nativa siendo una PWA: gestos, hojas inferiores y los bugs que solo aparecen en un móvil de verdad."
date: 2026-09-14T22:28:00+02:00
type: article
project: redcheck
series:
  id: building-redcheck
  title: "Construyendo RedCheck"
  part: 10
topics: [frontend]
---

La mayoría de la gente abre una app de productividad en el móvil, muchas
veces al día y unos pocos segundos cada vez. Hasta septiembre, RedCheck
era una app de escritorio que técnicamente cargaba en un móvil: solo el
calendario tenía un ancho mínimo fijo de 700 píxeles.

Este post cuenta el trabajo para que se sienta como una app que
instalarías, no como una web que toleras, sin escribir una app nativa ni
pasar por una tienda de aplicaciones.

## Paso uno: que sea responsive de verdad

Por debajo de 640 px, el dashboard intentaba meter una barra lateral, un
calendario, una lista de tareas y un panel de estadísticas uno al lado
del otro. Ahora funciona como una app móvil:

- La barra lateral se convierte en un cajón que se abre con un botón de
  menú o deslizando desde el borde, y se cierra deslizando de vuelta.
- Los tres paneles principales (calendario, tareas y progreso) se
  muestran de uno en uno, y se cambia entre ellos con una barra de
  pestañas inferior.
- Todas las vistas por encima de 640 px se quedaron exactamente igual. El
  móvil recibió su propio diseño; el de escritorio no se rehízo alrededor
  de él.

Un detalle pequeño pero importante: la altura de la app usa `100dvh` en
lugar de `100vh`. En los navegadores móviles, `100vh` ignora que la barra
de direcciones se esconde y reaparece, y eso dejaba la barra de pestañas
inferior fuera de la pantalla.

![Cuatro capturas de RedCheck en un móvil en modo oscuro: la lista de tareas con la barra de pestañas inferior, el cajón lateral, Ajustes como hoja inferior con asa y el calendario mensual.](./mobile-screens.webp "Tareas, el cajón lateral, una hoja inferior y el calendario en un móvil.")

## Por qué una PWA y no una app nativa

La petición que lo empezó todo era simple: "¿podemos ocultar la barra de
direcciones del navegador?". Una página web no puede, a propósito. Si un
script pudiera ocultar la barra de direcciones real, una página de
phishing podría dibujar una falsa.

La forma legítima de conseguirlo es hacer que la app sea instalable.
RedCheck incluye ahora un manifiesto de aplicación web, así que "Añadir a
pantalla de inicio" te da un icono que la abre a pantalla completa, sin
nada del navegador. Además:

- **Accesos directos** en el icono de la pantalla de inicio (pulsación
  larga: Hoy, Calendario, Ajustes).
- **Un globo en el icono** con el número de tareas pendientes, usando la
  Badging API donde la plataforma la soporta.
- **Una barra de estado** que sigue el tema claro u oscuro.
- **Márgenes de zona segura**, para que nada quede debajo del notch o de
  la barra de gestos.

El compromiso frente a una app nativa es alcance frente a capacidad. Una
PWA es un único código, se despliega al instante y no pasa por ninguna
revisión. A cambio, algunas cosas son más difíciles, y las notificaciones
push son la más evidente. Más sobre eso abajo.

## Gestos, y conseguir que se sientan bien

Las apps nativas se sienten nativas sobre todo por los gestos, así que
RedCheck ya los tiene:

- **Pulsación larga** sobre una tarea o asignatura para entrar en modo
  selección, y luego tocar para añadir más, como en una galería de fotos.
  Al deseleccionar la última, se sale del modo.
- **Deslizar una tarea a la derecha** para completarla y **a la
  izquierda** para borrarla.
- **Todos los modales son hojas inferiores** en móvil, y se cierran
  arrastrando su asa hacia abajo. La excepción es la paleta de comandos:
  una hoja inferior choca con el teclado en pantalla, así que se queda
  centrada.
- **Deslizar para recargar** en la lista de tareas, porque una PWA
  instalada no tiene el gesto de recarga del navegador.

Cada uno necesitó más iteraciones de las que esperaba:

- La primera versión de arrastrar para cerrar guardaba la posición de la
  hoja en el estado de React. Cada `touchmove` provocaba un renderizado
  completo, y en un modal pesado como Ajustes se notaban tirones. La
  solución fue saltarse React en la parte de alta frecuencia: mover la
  hoja escribiendo su `transform` directamente a través de una ref,
  agrupado con `requestAnimationFrame`, y volver a React solo cuando
  termina el gesto.
- Arrastrar una hoja hacia abajo también activaba el "deslizar para
  recargar" de Chrome y recargaba la app. `touch-action: none` en el asa
  no bastaba, porque ese gesto es a nivel de documento.
  `overscroll-behavior-y: none` más bloquear el scroll de la página
  mientras hay un modal abierto lo arregló por fin.
- Una pulsación larga sobre el texto de una tarea competía con la
  selección de texto nativa del navegador, y a menudo perdía. Desactivar
  la selección de texto en esas filas, solo en dispositivos táctiles, lo
  arregló.
- React registra los listeners táctiles como pasivos, así que
  `preventDefault()` dentro de una prop `onTouchMove` no hace nada en
  silencio. Los gestos que necesitan quedarse con el scroll registran un
  listener no pasivo de verdad.

También aprendí a condicionar el comportamiento táctil a la *capacidad*
del dispositivo, no al ancho de pantalla. Una ventana estrecha de
escritorio sigue teniendo ratón; una tablet grande sigue sin hover. Las
media queries como `(hover: none)` describen el dispositivo de entrada,
que es lo que importa de verdad.

## Los bugs que solo enseña un móvil de verdad

Algunos bugs simplemente no existen en las herramientas de desarrollo
del escritorio.

**La vibración.** Completar una tarea produce una pequeña vibración.
Funcionaba en la emulación de escritorio y no hacía nada en un móvil
Android real. La causa: la Vibration API exige un gesto activo del
usuario, y ese contexto no sobrevive a un `await`. La vibración se
lanzaba después de que respondiera la petición a la API. Moverla a la
primera línea del manejador del clic lo arregló. Aun así, en un móvil
real seguía sin vibrar, y desde fuera dos causas se ven idénticas: que el
navegador rechace la llamada o que acepte un pulso de 15 ms demasiado
corto para que el motor responda. Así que el pulso subió a 40 ms y, en
lugar de volver a adivinar, Ajustes tiene ahora un botón de "Probar
vibración" que indica si el navegador aceptó o rechazó la llamada.

**El filtro para daltonismo.** Añadí filtros para distintos tipos de
daltonismo usando matrices de color SVG referenciadas desde CSS. Llegaron
a producción dos veces sin ningún efecto visible. Nunca di del todo con
el porqué (lo más probable, cómo resuelven los navegadores las
referencias a filtros SVG en el elemento raíz), y los sustituí por
funciones de filtro CSS normales. No es una respuesta satisfactoria, pero
es una que funciona, y prefiero decirlo así que fingir lo contrario.

**El tamaño de letra.** El ajuste de accesibilidad de tamaño de letra
cambiaba el tamaño de fuente raíz. Como casi todas las utilidades de
espaciado de Tailwind también van en `rem`, escalaba márgenes, iconos y
anchos de tarjeta junto con el texto. Ahora solo escala los tokens de
tamaño de texto mediante una variable CSS.

## Notificaciones push: la versión honesta

Los recordatorios de tareas existen, pero en el cliente: mientras
RedCheck está abierta en una pestaña o como app instalada, comprueba cada
minuto si hay tareas que vencen en los próximos 30 minutos y muestra una
notificación. Las notificaciones push de verdad, las que te llegan con la
app cerrada, necesitan un service worker, claves VAPID y un backend que
las dispare. Eso es un proyecto en sí mismo, así que publiqué la versión
ligera y la llamé por su nombre en lugar de fingir otra cosa.

## El resto del pulido

La misma tanda trajo muchas cosas más pequeñas, la mayoría también en
escritorio: una paleta de comandos (Ctrl/Cmd+K), toasts en lugar de
`alert()`, un toast de "Deshacer" al borrar (que fue barato de construir
porque todo borrado ya va a la papelera de la parte 3), estados de carga
con esqueleto, un tour inicial, foco atrapado dentro de los modales,
soporte para `prefers-reduced-motion` y casillas personalizables. Quitar
`framer-motion`, que se usaba en un único sitio y cuyas animaciones de
salida en realidad nunca se ejecutaban, ahorró unos 120 KB.

No todo salió bien. Una tanda de ajustes de espaciado y tamaño en la
pantalla de login quedaba peor en un móvil real y se revirtió el mismo
día.

## El bug que más me enseñó

Un comentario CSS que contenía `animate-*/transition-*` se cerraba antes
de tiempo en el `*/`, y el resto de la frase se interpretaba como CSS. El
servidor de desarrollo, el linter, el comprobador de tipos y los tests
pasaban. Solo fallaba el build de producción. Cada despliegue posterior a
ese commit falló en silencio dentro del build de Docker, mientras yo
creía que todo se estaba publicando.

Desde entonces, `npm run build` forma parte de la lista antes de cada
push, no es algo que confíe en que me avise el pipeline.

## Con qué me quedo

- Una PWA te lleva casi hasta lo "nativo" por una fracción del coste.
  Ten claro qué partes no puede hacer.
- Los gestos tienen que saltarse React en los fotogramas que importan.
- Condiciona el comportamiento a la capacidad de entrada, no al ancho de
  pantalla.
- Prueba en un dispositivo real. Los emuladores no vibran.
- Si el build de producción no está en tu lista local, no sabes si estás
  publicando.

Abre [redcheckapp.com](https://redcheckapp.com/) en el móvil, instálala
en la pantalla de inicio e intenta romperla.
