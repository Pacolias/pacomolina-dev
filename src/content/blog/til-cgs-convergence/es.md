---
title: "La convergencia de CGS"
description: "El Gradiente Conjugado Cuadrado puede alcanzar la tolerancia con un residuo que salta sin control."
date: 2026-03-14
type: til
project: krylov-solvers
topics: [maths]
---

CGS (Gradiente Conjugado Cuadrado) puede alcanzar la tolerancia y aun así parecer un caos por el camino: con la matriz sherman1 su residuo salta órdenes de magnitud de una iteración a otra, mientras que BiCGSTAB — su primo estabilizado — baja con suavidad.
