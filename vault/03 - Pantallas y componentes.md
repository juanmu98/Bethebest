# 03 - Pantallas y componentes

La app tiene una **barra de navegacion inferior** con 5 secciones. Cada boton (`.nav-btn[data-nav]`) llama a `goTo()`.

## Inicio
`renderHome()` en `js/app.js`.
- Tarjeta de perfil (inicial del nombre + peso corporal).
- 3 estadisticas: nº de entrenos, nº de rutinas, kg totales movidos (suma de `volume` del historial `btb_workouts`).
- 3 accesos rapidos a Entrenar / Rutinas / Rangos.

## Ejercicios
`renderExercises()` en `js/app.js`. **Completa.**
- Buscador por texto (`exerciseFilters.search`).
- Filtros tipo "chip" por **musculo** y por **equipo** (incluyen "Todos").
- Lista filtrada; al tocar un ejercicio se abre una **ficha** (modal) con musculo, equipo, dificultad y consejos de tecnica.

## Rutinas
`renderRoutines()` en `js/routines.js`. **Completa.** Dos vistas segun `routineView.mode`:
- **Lista**: tarjetas de rutinas (nombre + nº de ejercicios + vista previa de nombres) con borrar y "+ Nueva".
- **Editor**: nombre + lista de ejercicios; por cada uno 4 campos numericos (**series, reps, peso, descanso**). "+ Anadir ejercicio" abre un selector (modal). Botones Guardar y volver. Al guardar valida que haya nombre.

## Entrenar
`renderTrain()` en `js/train.js`. **Completa.** Dos vistas:
- **Selector** (`renderRoutinePicker`): lista de rutinas; cada una muestra nº de ejercicios y series totales; boton "Empezar".
- **Sesion activa** (`renderActiveSession`): cabecera con nombre + **cronometro** (`#tr-timer`, sube cada segundo) y contador `hechas/total series`. Por cada ejercicio, una fila por serie con campos editables de **peso** y **reps** y un boton **✓** para marcarla hecha. Botones **Terminar entreno** (guarda) y **Cancelar** (descarta).
- **Temporizador de descanso**: al marcar una serie como hecha, si el ejercicio tiene descanso (`rest`>0) aparece un aviso flotante con cuenta atras (`startRest`), con botones **+15s** y **Saltar**. Se cierra solo al llegar a 0.
- Al terminar (`finishSession`): calcula `volume` = suma de peso×reps de las series marcadas, guarda el entreno en `btb_workouts`, para el cronometro y vuelve a Inicio mostrando un aviso con duracion y volumen.

## Rangos
`renderRanks()` en `js/ranks.js`. **Completa (Fase 2).**
- Toggle **Frontal / Trasera** (`ranksView`) sobre una silueta SVG; cada musculo se pinta del color de su rango.
- Boton **⚙️ perfil** (peso + sexo) que abre `openProfileEditor` (modal); Wilks los necesita.
- **Leyenda** de colores de rango.
- **Lista** por musculo: medalla, 1RM equivalente y ratio. Tocar un musculo (silueta o lista) abre detalle (`openMuscleDetail`): ejercicio rey, tu 1RM/ratio, y **tabla de kg necesarios para cada uno de los 8 rangos** segun tu peso corporal (rango actual resaltado).
- Calculo en `computeMuscleRanks()`: por musculo, mejor serie **marcada como hecha** → Epley → Wilks → rango. Ver [[04 - Rangos y Wilks]].

## Logros
`renderAchievements()` en `js/achievements.js`. **Completa.** No tiene pestana en la nav; se entra desde el acceso "🏆 Logros" de Inicio (boton volver ‹ regresa a Inicio).
- Cuadricula de **insignias**: desbloqueadas a color, bloqueadas en gris con 🔒. Barra de progreso y contador `X/Y`.
- Cada logro tiene una funcion `check(ctx)` que se evalua con `buildAchievementContext()` (entrenos, rutinas, volumen total, duracion maxima, mejor 1RM, mejor rango alcanzado, musculos con datos). Se desbloquean solos al cumplir el hito.
- Logros actuales: primer/5/10 entrenos, primera/3 rutinas, mover 10k/100k kg, 1RM ≥150, entreno >1h, llegar a Oro/Diamante/Olimpo, cuerpo completo (rango en los 8 musculos).

## Historial
`renderHistory()` en `js/history.js`. **Completa.** Sin pestana; se entra desde "📖 Historial" en Inicio (boton volver ‹).
- **Calendario mensual** arriba (`calendarHTML`): rejilla por semanas (empieza en lunes, `WEEKDAYS`), con los dias entrenados marcados en **verde lima** y el dia de hoy con un borde. Flechas ‹ › para cambiar de mes (`changeMonth`, estado `historyMonth`). Resumen "N dias entrenados este mes". Los dias entrenados se sacan de `trainedDaySet()` (clave local `YYYY-MM-DD` por entreno).
- Debajo, lista de entrenos (mas reciente arriba): nombre de rutina, fecha/hora, duracion, volumen (kg) y series hechas. Tocar abre detalle (`openWorkoutDetail`) con cada ejercicio y sus series (tachadas las no hechas). Boton borrar por entreno.

## Componentes compartidos
- **Modal / bottom-sheet**: `openModal(html)` / `closeModal()` en `js/app.js`. Reutilizado por la ficha de ejercicio y el selector de rutinas/entreno.
- **Chips de filtro**: `renderChips()` en `js/app.js`.

#bethebest #fase-1 #ui
