---
title: "Actívalas cuanto antes"
description: "Chrome puede saltarse las transiciones entre páginas en móviles lentos si el CSS que las activa llega tarde."
date: 2026-09-26
type: til
topics: [frontend]
# Draft until Paco approves the wording.
draft: true
---

Chrome puede saltarse sin avisar una transición entre páginas en un móvil lento si la regla `@view-transition` llega tarde. En esta web, moverla de la hoja de estilos al final del `<head>` a un `<style>` en línea al principio pasó de funcionar la mitad de las veces a funcionar siempre.
