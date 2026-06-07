---
proyecto: BeTheBest
ultima_actualizacion: 2026-06-07
---

# 07 - Changelog de sesiones

> Una entrada por sesion, la mas reciente arriba.

## 2026-06-07 (cont.) — Detalle de musculo: pesos por rango
**Cambio:** el detalle de un musculo (`openMuscleDetail` en `js/ranks.js`) ahora muestra una **tabla de los kg necesarios para cada uno de los 8 rangos** segun tu peso corporal y sexo (ratio × peso), con el rango actual resaltado. Nuevo helper `rankFloors(muscle, gender)` en `js/data.js` (umbrales ajustados; `rankFromRatio` lo reutiliza). Verificado: Pecho a 80 kg → Bronce 40 / Plata 60 / Oro 100 / Platino 120 / Diamante 140 / Gladiador 150 / Titán 160 / Olimpo 170 kg.

## 2026-06-07 (cont.) — Ratios calibrados con StrengthLevel.com
**Cambio:** `RANK_RATIOS` (`js/data.js`) actualizada con los estandares reales de **StrengthLevel.com** por ejercicio rey. Mapeo 5 niveles → 8 rangos: Bronce=Principiante, Plata=Novato, Oro=Intermedio, Diamante=Avanzado, Titán=Élite; Platino/Gladiador = medias; Olimpo extrapolado. Reyes ajustados: Abdominales=Crunch en polea (cable crunch), Gemelo=Elev. talones en máquina (machine calf raise). Ahora son mas exigentes y realistas (p. ej. Bíceps Oro pide ×0.60, antes ×0.45). Verificado con ejemplos. Ver tabla en [[04 - Rangos y Wilks]].

## 2026-06-07 (cont.) — Nuevo motor de rangos: ratios por musculo + ejercicio rey
**Decision:** se sustituye el calculo **Wilks** (un umbral igual para todos) por **ratios por musculo + ejercicio rey** (mas justo). Elegido tras comparar ambos.
**Cambios (`js/data.js`):** añadidos `KING_EXERCISE`, `RANK_RATIOS` (8 suelos por musculo, hombres), `UPPER_BODY`+`FEMALE_FACTOR`, `EXERCISE_FACTORS` (conversion al rey) y `rankFromRatio()`. `RANKS` pierde el campo `min` (Wilks). Eliminado el uso de Wilks.
**Cambios (`js/ranks.js`):** `computeMuscleRanks` ahora calcula 1RM→1RM equivalente(×factor)→ratio(÷peso)→rango por musculo; devuelve `{best1RM, ratio, rank}`. UI muestra "1RM equiv." y "Ratio ×N"; el detalle muestra el ejercicio rey. Borradas las funciones Wilks.
**Cambios (`js/achievements.js`):** musclesWithData usa `rank.key!=='none'`.
**Pruebas (JS):** hombre 80 kg → sentadilla 140×5 ratio ×2.04 = Gladiador; press inclinado 80×5 con factor 0.85 → Pecho ×0.99 = Plata (sin conversion seria Oro ✓); curl 40×8 = Bíceps ×0.63 Platino. Logros OK.
**Pendiente:** Fase B (afinar factores), abdominales por tiempo de plancha, dominadas con carga total. Ver [[04 - Rangos y Wilks]].

## 2026-06-07 (cont.) — Vuelta a silueta SVG + 11 grupos musculares
**Decision:** se descarta la imagen anatomica real (Rangos) y se vuelve a la **silueta SVG dibujada** para centrarse en otras partes de la app. Se borran `img/cuerpo-*.png`, `img/masks`, `img/originales`, `tools/`, `node_modules`, `package*.json`.
**Cambios:**
- `js/data.js`: `MUSCLE_GROUPS` pasa a **11 grupos** (Pecho, Espalda, Dorsales, Hombro, Bíceps, Tríceps, Abdominales, Cuádriceps, Femoral, Glúteo, Gemelo). Ejercicios remapeados a los nuevos grupos y añadidos 4 (encogimientos, face pull, curl femoral, elevación de talones) → 23 ejercicios.
- `js/ranks.js`: `bodyFrontSVG`/`bodyBackSVG` redibujadas con los 11 musculos (frontal 6, trasera 7); coloreado vuelve a `rank.color` directo.
**Pruebas (captura + JS):** 11 grupos; frontal colorea Pecho/Cuádriceps/Gemelo, trasera Dorsales/Gemelo; rangos calculados OK. El visor de capturas **vuelve a funcionar**.

## 2026-06-07 (cont.) — Cuerpo con imagen anatomica real (DESCARTADO)
**Cambio:** sustituida la silueta SVG de Rangos por la **imagen anatomica** del usuario (`img/cuerpo-frontal.png` / `cuerpo-trasero.png`). Limpieza con script Node+pngjs (recorte al cuerpo, fondo transparente por flood-fill, mayor componente conectado para quitar texto; originales en `img/originales/`). En `js/ranks.js`, nuevo `bodyFigure` = `<img>` + overlay SVG de **elipses borrosas por musculo** (`FRONT_GLOWS`/`BACK_GLOWS`, coords %), con `mix-blend-mode:multiply` para auto-recortarse al cuerpo. `.gitignore`: ignora node_modules/package*.
**Pendiente de validacion VISUAL por el usuario** (el visor de capturas da timeout): ajustar posicion/tamano de los glows si no cuadran. Ver [[04 - Rangos y Wilks#Cuerpo (imagen anatomica real + glow por musculo)]].

## 2026-06-07 (cont.) — Calendario en el historial
**Cambio:** `js/history.js` ahora muestra un **calendario mensual** arriba del historial. Dias entrenados en verde lima, hoy con borde, flechas para cambiar de mes (`historyMonth`, `changeMonth`), semana empieza en lunes, resumen de dias entrenados del mes. Dias sacados de `trainedDaySet()`.
**Pruebas (JS):** con entrenos el 3, 7 y 15 de junio → esos dias salen verdes, resumen "3 dias entrenados este mes"; flechas Mayo/Julio OK; 1-jun-2026 alineado en lunes.

## 2026-06-07 (cont.) — Historial + temporizador de descanso
**Decision usuario:** el servidor y la parte social (Fase 3) se dejan para el final.
**Cambios:**
- Nuevo `js/history.js` + pantalla `history` (sin pestana, acceso "📖 Historial" en Inicio): lista de entrenos, detalle por serie y borrar.
- `js/train.js`: **temporizador de descanso** (`restState`, `startRest/stopRest/renderRestBanner`); aviso flotante con cuenta atras al marcar serie, +15s y Saltar. Las `entries` ahora copian `rest` de la rutina. Se para al terminar/cancelar.
- `index.html`: nuevas `<section>` y `<script>` (history); `app.js`: casos del router y accesos en Inicio.
**Pruebas (JS):** historial lista el entreno con fecha/duracion/series ✓. Descanso 120s→"02:00", +15s suma, sobrevive al repintado, Saltar cierra ✓.

## 2026-06-07 (cont.) — Logros/medallas (cierra Fase 2)
**Cambio:** nuevo `js/achievements.js` con 13 logros que se desbloquean solos segun los datos (entrenos, rutinas, volumen, duracion, 1RM, rangos). Pantalla `achievements` (sin pestana, se entra desde "🏆 Logros" en Inicio): cuadricula de insignias + barra de progreso + contador. `index.html` carga el script y tiene la nueva `<section data-screen="achievements">`; `app.js` añade el caso al router y el acceso en Inicio.
**Pruebas (JS):** con 1 entreno + Pierna Platino: desbloquea Primer sudor, Con un plan, Fuerza bruta (1RM 163≥150) y Primer Oro; bloquea bien Diamante/Cuerpo completo/Maraton. Logica de rangos (≥) correcta. Boton volver OK.
**Estado:** **Fase 2 COMPLETA.**

## 2026-06-07 (cont.) — 8 rangos
**Cambio:** ampliados los rangos de 5 a 8 en `js/data.js` → `RANKS`. Nuevos tiers top: **Gladiador ⚔️ (≥150), Titán 🗿 (≥175), Olimpo ⚡ (≥200, color lima)**. Diamante baja a ≥125 con color azul `#8ab4ff`. Verificado que `rankForScore` asigna bien y la leyenda muestra los 8. Ver [[04 - Rangos y Wilks]].

## 2026-06-07 (cont.) — Fase 2: rangos por musculo (Wilks)
**Objetivo:** funcion estrella — rangos por musculo sobre silueta del cuerpo.

**Cambios:**
- `js/data.js`: añadido `saveProfile`, config `RANKS` (umbrales/colores/emoji), `RANK_NONE` y `rankForScore`.
- Nuevo `js/ranks.js`: Epley (`estimate1RM`), Wilks (`wilksCoefficient`/`wilksScore`), `computeMuscleRanks` (solo series con `done:true`), `renderRanks` (silueta frontal/trasera coloreada + leyenda + lista por musculo), detalle por musculo y editor de perfil (peso + sexo).
- `js/app.js`: quitado el placeholder de `renderRanks` (ahora vive en ranks.js).
- `index.html`: carga `js/ranks.js`.

**Proceso implementado:** Peso+Reps → Epley → 1RM → Wilks → Puntuacion → Rango (🥉🥈🥇💠💎).

**Umbrales iniciales (por calibrar):** Bronce 0, Plata 50, Oro 75, Platino 100, Diamante 130.

**Pruebas (via JS, el visor de fotos da timeout):** Epley 80×8=101,3 ✓; coef Wilks 75kg=0,7126 ✓. Entreno de prueba (banca 100×5 hecha, sentadilla 140×5 hecha, banca 200×1 NO hecha): Pecho→117kg, Wilks 83, **Oro**; Pierna→163kg, Wilks 116, **Platino**; la serie no marcada se ignora ✓. Silueta colorea Pecho dorado y Pierna azul; toggle frontal/trasera OK.

**Pendiente:** subir a GitHub cuando el usuario lo pida. Decidir siguiente: logros/medallas o Fase 3 (social).

Enlaces: [[04 - Rangos y Wilks]] · [[03 - Pantallas y componentes#Rangos]] · [[01 - Estado del proyecto]]

#bethebest #fase-2 #rangos #sesion-2026-06-07

## 2026-06-07 — Arranque del proyecto y Fase 1 completa
**Objetivo:** crear desde cero la app BeTheBest y completar la Fase 1.

**Cambios realizados:**
- Estructura base: `index.html` (cabecera, nav inferior de 5 secciones, tema oscuro+lima), `css/styles.css`.
- Capa de datos: `js/data.js` (semilla de 19 ejercicios + helpers de LocalStorage).
- Pantalla **Inicio**: perfil + estadisticas + accesos rapidos (`renderHome`).
- Pantalla **Ejercicios** completa: buscador, filtros por musculo/equipo, ficha en modal.
- Pantalla **Rutinas** completa: `js/routines.js` (lista, editor, anadir/quitar ejercicios, series/reps/peso/descanso, guardar/borrar).
- **Modo entrenamiento** completo: `js/train.js` (elegir rutina, cronometro, marcar series con peso/reps editables, guardar entreno en `btb_workouts` con volumen).
- Creada la **boveda de Obsidian** (`vault/`).

**Comportamiento nuevo:** el usuario puede explorar ejercicios, crear/editar/borrar rutinas, y entrenar una rutina marcando series; el entreno queda guardado y suma en las estadisticas de Inicio.

**Pruebas:** verificado en navegador (via evaluacion de JS, el visor de capturas daba timeout). Entreno de prueba de "Dia de pierna": 2 series marcadas, volumen 1280 kg, guardado OK, Inicio muestra "1 Entrenos".

**Incidencias:** la carpeta `vault/` se borro una vez por un proceso externo; recreada con nombres de archivo sin tildes. El codigo nunca se vio afectado.

**Decisiones:** ver [[06 - Decisiones tecnicas]].

**Estado:** **Fase 1 COMPLETA**. Pendiente subir a GitHub cuando el usuario lo pida (cambios en `index.html`, `js/app.js`, nuevo `js/train.js` y `vault/`).

**Proximo:** Fase 2 — [[04 - Rangos y Wilks]].

Enlaces: [[01 - Estado del proyecto]] · [[03 - Pantallas y componentes]] · [[05 - Modelo de datos]]

#bethebest #fase-1 #sesion-2026-06-07
