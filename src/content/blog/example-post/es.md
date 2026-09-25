---
title: "Entrada de ejemplo — cómo escribir una"
description: "Una plantilla en borrador: solo visible en modo desarrollo, nunca se publica. Copia esta carpeta para empezar una entrada nueva."
date: 2026-09-25
type: post
draft: true
---

Esto es un **borrador**, así que solo aparece con `astro dev` — el build de
producción lo ignora.

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

Las imágenes van en `public/images/blog/<tu-slug>/` y se enlazan como
`![texto alternativo](/images/blog/<tu-slug>/foto.webp)`.

> Las citas, el `código en línea`, las listas y los [enlaces](https://pacomolina.dev)
> tienen el mismo estilo que el resto de la web.
