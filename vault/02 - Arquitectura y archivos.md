# 02 - Arquitectura y archivos

App de una sola pagina (SPA sencilla): un unico `index.html` con varias "pantallas" que se muestran/ocultan. No hay servidor; los datos viven en LocalStorage.

## Arbol de carpetas

```
BeTheBest/
├─ index.html        → estructura HTML, cabecera, nav inferior, carga de scripts
├─ css/
│  └─ styles.css     → estilos propios (nav, tarjetas, animaciones, colores de rango)
├─ js/
│  ├─ data.js        → base de ejercicios + helpers de LocalStorage
│  ├─ routines.js    → pantalla de Rutinas (lista + editor)
│  ├─ train.js       → modo entrenamiento (cronometro + marcar series)
│  ├─ ranks.js       → rangos por musculo (Epley + Wilks) + silueta + editor perfil
│  ├─ achievements.js→ logros/medallas (se calculan de los datos existentes)
│  ├─ history.js     → historial de entrenos (lista + detalle + borrar)
│  └─ app.js         → router de pantallas + Inicio + Ejercicios + modales
├─ img/              → (vacio de momento)
└─ vault/            → esta boveda de Obsidian (documentacion)
```

## Rol de cada archivo

- **`index.html`**: cabecera, contenedor `#screens` con una `<section data-screen="...">` por pantalla, y la barra de navegacion inferior (`.nav-btn` con `data-nav`). Carga Tailwind por CDN y configura el tema (color `lime` y `ink`). Orden de scripts: data → routines → train → app.
- **`js/data.js`**: listas de referencia (`MUSCLE_GROUPS`, `EQUIPMENT`, `DIFFICULTY`), la semilla `SEED_EXERCISES` (19 ejercicios), las claves `STORAGE_KEYS`, helpers `loadData/saveData/initStorage` + getters (`getExercises`, `getRoutines`, `getWorkouts`, `getProfile`).
- **`js/routines.js`**: estado `routineView` (`list` | `editor`), funciones `renderRoutines`, `renderRoutineList`, `renderRoutineEditor`, `saveRoutine`, `deleteRoutine`, selector de ejercicios.
- **`js/train.js`**: estado `trainState` (null si no se entrena) y `trainTimerId`. Funciones `renderTrain`, `renderRoutinePicker`, `startSession`, `renderActiveSession`, `finishSession`, cronometro (`startTimer/stopTimer/updateTimerDisplay/formatTime`). **Temporizador de descanso**: `restState` + `startRest/stopRest/renderRestBanner` (aviso flotante con cuenta atras, +15s y Saltar; el banner vive en `document.body` para sobrevivir a los repintados). Las `entries` llevan `rest` (segundos) copiado de la rutina.
- **`js/history.js`**: `renderHistory` (calendario mensual + lista de entrenos), `calendarHTML`/`changeMonth`/`trainedDaySet`/`dayKey` (calendario, estado `historyMonth`), `openWorkoutDetail` (modal con series), `deleteWorkout`, `formatWorkoutDate`.
- **`js/ranks.js`** (silueta SVG dibujada, 11 grupos musculares): `ranksView` (`front`|`back`). Formulas `estimate1RM` (Epley), `wilksCoefficient`/`wilksScore` (Wilks), `computeMuscleRanks` (mejor serie hecha por musculo → rango). `renderRanks` (silueta + leyenda + lista), `openMuscleDetail`, `openProfileEditor`, y los SVG `bodyFrontSVG`/`bodyBackSVG`.
- **`js/achievements.js`**: `ACHIEVEMENTS` (catalogo con `check(ctx)`), `buildAchievementContext` (deriva totales de workouts/routines/ranks), `computeAchievements` (marca desbloqueados) y `renderAchievements` (cuadricula de insignias + barra de progreso). No usa almacenamiento propio.
- **`js/app.js`**: `goTo(screen)` cambia de pantalla y llama a `renderScreen` (incluye caso `achievements`). Contiene `renderHome` (con acceso a Logros), `renderExercises`, el modal reutilizable (`openModal/closeModal`) y `renderChips`.

## Flujo de datos
1. Al cargar, `initStorage()` siembra los datos si es la primera vez.
2. Cada pantalla **lee** de LocalStorage al renderizarse (getters) y **escribe** con `saveData` cuando el usuario guarda.
3. La navegacion re-renderiza la pantalla destino cada vez (no cachea HTML).

Ver claves y formato en [[05 - Modelo de datos]].

#bethebest #fase-1 #arquitectura
