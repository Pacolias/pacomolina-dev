---
title: "Entrada de ejemplo"
description: "Una plantilla en borrador: solo visible en modo desarrollo, nunca se publica. Copia esta carpeta para empezar una entrada nueva."
date: 2026-09-25
type: article
draft: true
---

Esto es un **borrador**, así que solo aparece con `astro dev` — el build de
producción lo ignora.

![Una imagen de prueba cálida y borrosa que solo dice "Foto de prueba"](./prueba-1.webp "Toca cualquier imagen de una entrada para abrirla a pantalla completa.")

## Escribir una entrada nueva

1. Copia `src/content/blog/example-post/` a `src/content/blog/<tu-slug>/`.
   El nombre de la carpeta es la URL: `/blog/<tu-slug>/`.
2. Escribe `en.md` y `es.md`. Si solo escribes uno, ambos idiomas lo
   muestran con una nota de "solo disponible en…".
3. Pon `draft: false` cuando esté lista.

## Para una charla

Pon `type: talk`, añade el `event` y los `links` que tengas:

```yaml
type: talk
event: "PyData Málaga"
links:
  slides: https://example.com/slides.pdf
  video: https://youtube.com/...
  repo: https://github.com/Pacolias/...
```

## Imágenes

Ponlas en la propia carpeta de la entrada, junto a `en.md`/`es.md`, y
enlázalas con ruta relativa — Astro las optimiza al hacer el build:

```md
![Texto alternativo, describiendo la imagen](./foto.webp "Pie de foto opcional")
```

El texto entre comillas se convierte en un pie de foto bajo la imagen (y en
el visor). Quítalo si la imagen no necesita pie.

Todas las imágenes de una entrada se abren en el mismo visor a pantalla
completa, y se pueden ir pasando en orden:

![Una imagen de prueba vertical, para comprobar fotos en retrato](./prueba-2.webp)

![Una imagen de prueba panorámica](./prueba-3.webp "La última — la flecha de siguiente vuelve a la primera.")

> Las citas, el `código en línea`, las listas y los [enlaces](https://pacomolina.dev)
> tienen el mismo estilo que el resto de la web.
