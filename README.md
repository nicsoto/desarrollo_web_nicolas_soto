# CC5002 - Tarea 1

Prototipo HTML/CSS/JS para registrar miembros y actividades de la comunidad DCC.

## Decisiones principales

- Se implementaron 5 pantallas: inicio, registro de miembro, registro de actividad, listado y metricas.
- La validacion de formularios se hace en JavaScript (sin depender de `required`).
- El listado usa datos de ejemplo en memoria y permite filtrar por tipo, ordenar y paginar.
- Las metricas muestran graficos de barras simples con datos de ejemplo (sin librerias externas).
- No hay backend ni persistencia, tal como pide el enunciado para esta tarea.