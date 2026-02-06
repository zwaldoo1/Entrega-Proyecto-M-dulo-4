# TaskFlow (Módulo 4)

Aplicación web para gestionar tareas usando:
- Programación Orientada a Objetos (clases `Task` y `TaskManager`)
- ES6+ (let/const, template literals, arrow functions, destructuring, spread)
- Manipulación del DOM y eventos (submit, click, mouseover, keyup)
- Asincronía (`setTimeout`, `setInterval`, Promises/async-await)
- Consumo de API (fetch a JSONPlaceholder) y persistencia en `localStorage`

## Cómo ejecutar
1. Abrir `index.html` en el navegador (recomendado con Live Server en VS Code).
2. Crear tareas en el formulario.
3. Probar:
   - Buscar con el input (keyup)
   - Filtrar por estado
   - Botón “Cargar tareas desde API”
   - Fecha límite y contador regresivo

## Estructura
- `src/models`: clases y lógica de negocio
- `src/services`: API + localStorage
- `src/ui`: helpers de render del DOM
- `src/app.js`: orquestación y eventos
