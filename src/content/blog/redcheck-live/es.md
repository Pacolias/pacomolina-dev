---
title: "RedCheck, en producción"
description: "Desplegar RedCheck en su propio dominio — Docker, un servidor desde cero, llamadas asíncronas al LLM y un pequeño detalle de UX."
date: 2026-06-02
type: linkedin
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7467504912843702272/
project: redcheck
series:
  id: building-redcheck
  title: "Construyendo RedCheck"
  part: 1
topics: [backend, devops, ai]
images:
  - src: ./dashboard.webp
    alt: "El dashboard de RedCheck: el calendario del mes coloreado según la carga de trabajo, el balance de tareas por asignatura y la lista de tareas agrupada por asignatura."
  - src: ./focus-mode.webp
    alt: "El Modo Foco de RedCheck: las tareas de hoy con sus etiquetas de fecha límite y, al lado, el mapa de actividad."
---

Hay un abismo entre el código que funciona en localhost y una aplicación en producción. Este fin de semana decidí cruzar esa línea y desplegué RedCheck en su propio dominio: [redcheck.es](https://redcheckapp.com/). 🚀

Empezó como un gestor de tareas al uso, pero quería ir un paso más allá integrando SmartCheck AI para analizar la carga de trabajo. Llevarlo a producción fue todo un reto técnico:

- ⚙️ **El backend y el despliegue:** sacar la app de mi entorno local implicó contenerizarla con Docker, montar el servidor desde cero y encargarme de la infraestructura.
- 🧠 **Optimizar los tokens de la IA:** sinceramente, lo más difícil no fue la IA en sí, sino diseñar la arquitectura del backend para gestionar peticiones asíncronas al LLM y optimizar el uso de tokens sin quemar recursos.
- 🎨 **Un guiño a la UX:** soy más de backend, pero creo en reducir la carga cognitiva. En lugar de fechas a secas, las fechas límite aparecen como "Hoy" (rojo pastel), "Mañana" (amarillo pastel) o "Pasado mañana" (verde pastel). Un detalle mínimo de frontend, pero le ahorra al usuario tener que calcular días.

¡Juega con ella, prueba la IA o intenta tumbar el servidor! Cualquier feedback sobre la arquitectura o el rendimiento es más que bienvenido. 🏗️

*Actualización: RedCheck vive ahora en [redcheckapp.com](https://redcheckapp.com/) — la antigua dirección redcheck.es redirige allí.*
