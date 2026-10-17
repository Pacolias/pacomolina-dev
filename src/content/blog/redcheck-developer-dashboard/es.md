---
title: "Un panel solo para mí"
description: "Construir un panel de desarrollador privado dentro de RedCheck: una bandeja de feedback, lo que cuesta la IA, dos definiciones honestas de usuario activo y una respuesta de un vistazo a \"¿qué versión está corriendo?\""
date: 2026-10-17
type: article
project: redcheck
series:
  id: building-redcheck
  title: "Construyendo RedCheck"
  part: 17
  arc: "Ya en el mundo real"
topics: [backend, frontend, devops]
---

Desde septiembre, RedCheck tiene un pequeño formulario en Ajustes para
reportar un bug o sugerir algo. Funcionaba. La única forma de leer lo que
enviaba la gente era abrir una consola de MySQL en el servidor de
producción y lanzar un `SELECT`.

Eso vale una vez. No vale como forma de escuchar a tus usuarios. Así que
empecé a esbozar un panel dentro de RedCheck, visible solo para mí. Luego
paré y me pregunté si merecía la pena construirlo.

## Lo que no construir

Un "panel de desarrollador" invita a inflar el alcance: gráficas de
latencia, tasas de error, CPU, memoria, una lista con todos los usuarios.
Recorté casi todo antes de escribir una línea.

- **Nada de monitorizar rendimiento.** Herramientas como Sentry, Grafana
  o Uptime Kuma lo hacen mejor, y siguen funcionando cuando la app se
  cae. Un panel que vive dentro del backend no puede avisarte de que el
  backend se ha caído.
- **Nada de curiosear los datos de cada usuario.** Aunque solo lo vea yo,
  el panel muestra agregados. La única excepción es el feedback, donde
  necesito el email del autor para poder responderle.
- **Lo que queda es lo que solo sabe mi base de datos:** el feedback,
  cuánto se usa la IA (que es lo que cuesta dinero) y si la gente vuelve.

Lo dividí en tres fases: primero la bandeja de feedback y el uso de la
IA, después los usuarios activos y por último una pequeña sección de
sistema. Todo vivió en una rama, se probó en local y solo entonces se
convirtió en una pull request.

## Solo yo, y lo impone el backend

Hay exactamente un administrador, así que una tabla de roles habría sido
pura ceremonia. El acceso es una lista de emails permitidos en una
variable de entorno, `ADMIN_EMAILS`, y Spring Security restringe todo lo
que cuelga de `/admin/**` a esa lista. El endpoint del perfil devuelve
además un `isAdmin` para que el frontend sepa si mostrar la entrada en
Ajustes. Ese indicador es solo estético: quien escriba `/developer` a
mano recibe un `403` de la API y una pantalla de "Sin acceso".

El test de esa regla cazó algo antes de salir a producción. Un usuario
normal recibía `200` en lugar de `403`. La regla estaba bien; el test no.
La entidad `User` de RedCheck usa
`@EqualsAndHashCode(onlyExplicitlyIncluded = true)` de Lombok sin ningún
campo incluido, así que **todos los usuarios son iguales entre sí**. Un
mock preparado para decir "sí" al administrador le decía "sí" a todo el
mundo. Ahora el stub compara por email, y esa rareza está documentada
donde la va a buscar el siguiente que toque el código.

## Una bandeja de feedback

Casi todo el problema de la tabla de feedback era que no tenía estado. No
había forma de saber qué habías leído ya. Cada entrada tiene ahora un
estado (nuevo, visto, en curso, hecho, descartado) y una nota privada. Al
abrir una entrada nueva se marca sola como vista, así que el contador de
nuevos significa algo sin un paso aparte de "marcar como leído".

![La bandeja de feedback del panel: filtros por estado y categoría, un bug nuevo y una sugerencia abierta con los botones de estado, una nota interna, "Reply by email" y un bloque "Notify in the app" con la casilla "Also send by email".](./inbox.webp "La bandeja de feedback. Los emails de los autores están difuminados.")

Cuando guardas una nota y cierras la entrada, la nota sigue visible
debajo de la línea del autor, así que no hace falta volver a abrir nada
para recordar por qué.

![Una fila de feedback cerrada con el autor, la fecha, el estado "Seen" y, debajo, "Internal note: I'm the only person who can see this note!".](./note-preview.webp "Una entrada cerrada con su nota interna.")

También me llega un email por cada envío nuevo. Reutiliza la
configuración de Resend de la recuperación de contraseña
([parte 13](/blog/redcheck-password-reset/)), y el mensaje del usuario se
escapa como HTML antes de meterlo en el correo, porque es texto que
escribe el usuario.

![Un correo de Gmail titulado "[RedCheck] PRAISE: Test feedback!" con la categoría, "Nuevo feedback en RedCheck", el email del remitente, el mensaje en un recuadro gris y un botón "Abrir panel de desarrollador".](./email-new-feedback.webp "El aviso que me llega con cada envío nuevo.")

La decisión interesante fue cómo responder. Había tres opciones:

- **Un enlace `mailto:`.** Sin nada de backend, y la conversación sigue en
  mi bandeja. Pero no queda nada registrado en la app.
- **Una notificación dentro de RedCheck.** Barata, y la persona ve que su
  sugerencia sirvió para algo. Pero solo si vuelve a abrir la app.
- **Un email desde la dirección no-reply de la app.** Llega a quien no
  vuelve. Pero es de un solo sentido: una respuesta no llega a ninguna
  parte.

Puse las tres, por capas: el `mailto:` para conversar, la notificación
dentro de la app como respuesta por defecto y una casilla para enviarla
también por email. El email cita su mensaje original y dice claramente
que esa dirección no admite respuestas.

![Un correo titulado "A reply to your feedback" con el logo de RedCheck, el texto de la respuesta, el mensaje original citado bajo "Your message" y un pie que avisa de que la dirección no admite respuestas.](./email-reply.webp "La copia opcional por email de una respuesta, enviada desde la dirección no-reply.")

La parte de la app escondía una sorpresa. El backend de RedCheck llevaba
meses creando notificaciones, y el frontend no había mostrado ni una. La
campana solo enseñaba un aviso local de "tu plan de IA está listo".
Listarlas todas habría soltado de golpe a cada usuario meses de avisos de
IA sin leer y solo en inglés. Así que las notificaciones tienen ahora un
tipo, y la campana solo muestra las respuestas a tu feedback.

![El menú lateral de RedCheck en el móvil con el panel de notificaciones abierto y una entrada: "Reply to your feedback: Thanks for your feedback! We've received it and are looking into it."](./mobile-bell.webp "Lo que ve el usuario: la respuesta en sus notificaciones.")

## Lo que cuesta la IA

La forma obvia de contar el uso de la IA era la tabla donde se guardan
los análisis. Habría fallado por partida doble: lanzar un análisis nuevo
borra el anterior del mismo día, y las llamadas fallidas no se guardan
nunca. Así que cada llamada al motor de IA escribe ahora una fila en su
propio registro: el tipo de llamada, si salió bien y cuánto tardó. Esa
escritura va en su propia transacción y captura sus propios errores.
Perder una fila del registro no pasa nada. Romperle el análisis a alguien
porque falló el registro, sí.

![La sección SmartCheck AI: análisis de hoy, análisis en el periodo, tasa de fallo del 0,0 % y duración media de 14,7 s, sobre una gráfica de columnas por día de los últimos 30 días.](./ai-usage.webp "El registro de uso de la IA en su primer día: un análisis, 14,7 segundos.")

El límite honesto: esto cuenta llamadas, no tokens. El motor reintenta
con Gemini hasta tres veces por dentro y todavía no devuelve el consumo
de tokens, así que un análisis cuesta entre una y tres llamadas al modelo
más un embedding. Para tener tokens reales hay que cambiar el propio
motor, y el panel lo dice en lugar de enseñar un número que parece
preciso y no lo es.

## Dos definiciones de usuario activo

"¿Cuántos usuarios activos tengo?" suena a un solo número. Acabé
mostrando dos, porque cada uno es honesto con algo distinto.

- **Activos**: han hecho alguna petición con sesión iniciada en el
  periodo. RedCheck guarda ahora un `lastSeenAt` por usuario. Para no
  escribir en la base de datos en cada petición, se actualiza como mucho
  una vez por hora, y la comprobación se hace en memoria con el usuario
  que el filtro JWT ya ha cargado. Es exacto, pero solo empieza a contar
  desde el día en que se desplegó.
- **Usan la app**: han completado una tarea o han creado una a mano en el
  periodo. Se calcula con datos que RedCheck ya tenía, así que tiene
  histórico completo desde el primer día. Las tareas que generan las
  rutinas no cuentan como "creadas", porque no las creó el usuario, pero
  completarlas sí cuenta.

Las dos dejan fuera las cuentas demo públicas, que comparte cualquiera
que prueba RedCheck, y mi propia cuenta. Cualquiera de ellas inflaría
todas las cifras.

![La sección de usuarios el 17/10/2026: 7 usuarios, 0 activos hoy, 0 activos en 7 y 30 días, 2 que usan la app en 7 y 30 días, 0 altas y una gráfica por día de usuarios que usan la app en los últimos 30 días.](./users.webp "Tomada el 17 de octubre de 2026, el día en que lastSeenAt empezó a registrarse: todavía nadie cuenta como activo, mientras que la actividad de tareas ya tiene un mes de histórico.")

La diferencia entre las dos ya es útil en sí misma. Alguien que abre la
app todos los días y nunca completa nada también me está diciendo algo.

## ¿Qué versión está corriendo?

La última sección es la más pequeña, y probablemente la que más voy a
abrir. Muestra el commit y la fecha de compilación del backend que está
corriendo, la fecha de compilación del frontend, el tiempo en marcha, la
memoria y si el motor de IA responde a su comprobación de salud.

Cuando algo que debería funcionar no funciona, la primera pregunta es
siempre la misma: ¿el código que estoy mirando es el que está corriendo?
En la [parte 13](/blog/redcheck-password-reset/), la nueva configuración
del correo nunca llegó a producción porque un repositorio no tenía
pipeline de despliegue, y hizo falta una sesión en el servidor para
descubrirlo. Ahora la respuesta está en una página. El pipeline de CI le
pasa el commit a la imagen de Docker al construirla, y el backend lo
muestra. Una build local dice "build local" en lugar de fingir que lo
sabe.

![La sección de sistema: motor SmartCheck AI operativo con 3 ms de respuesta, backend 0.0.1-SNAPSHOT en el commit e0cbd3f compilado el 17 de octubre de 2026, tiempo en marcha y memoria, y la fecha de compilación del frontend.](./system.webp "La sección de sistema en producción.")

## Con qué me quedo

- Antes de construir un panel, decide para qué no es. Una monitorización
  que se cae con tu app no es monitorización.
- Cuenta a partir de un registro de eventos, no de tablas que solo
  guardan el último estado.
- "Usuario activo" es una definición, no un hecho. Muestra cuál usas.
- "¿Qué commit está corriendo?" debería responderse de un vistazo, no
  con una sesión SSH.
- La respuesta que puedes enviar con un clic es la que de verdad vas a
  enviar.

Si has enviado feedback desde los Ajustes de RedCheck, ya no se queda
en una tabla. Lo estoy leyendo.
