# 04 - Rangos (sistema de ratios + ejercicio rey)

> **Funcion estrella** de BeTheBest. ✅ IMPLEMENTADA en `js/ranks.js` (Fase 2). NOTA: se cambio el motor de **Wilks** (un umbral para todos) al sistema de **ratios por musculo + ejercicio rey** (mas justo).

## Proceso
```
Peso + Reps → Epley (1RM) → 1RM equivalente al "rey" (× factor)
            → Ratio (1RM ÷ peso corporal) → Rango (por musculo)
```
Para cada musculo se coge la **mejor serie marcada como hecha** del historial.

## Concepto: ejercicio rey
Cada musculo tiene un **ejercicio rey** = unidad de medida estandar (NO hay que entrenarlo). Cualquier ejercicio se convierte a su rey con un **factor** (`EXERCISE_FACTORS` en `js/data.js`; los no listados y los reyes = 1.0). Ej: press inclinado factor 0.85 → un 1RM de 93 kg cuenta como 79 kg de banca.

## Formulas (en `js/ranks.js` y `js/data.js`)
- **Epley** (`estimate1RM`): `1RM = peso × (1 + reps/30)`. Si reps ≤ 1, `1RM = peso`.
- **1RM equivalente**: `1RM × exerciseFactor(id)`.
- **Ratio**: `1RM_equiv ÷ peso_corporal`.
- **Ratio → Rango** (`rankFromRatio(muscle, ratio, gender)` en `js/data.js`): compara el ratio con los suelos de ese musculo.

## Tablas de ratios (config en `js/data.js` → `RANK_RATIOS`)
Suelos de ratio (1RM ÷ peso corporal) por musculo, **hombres**. Indice 0=Bronce … 7=Olimpo.
**Basadas en StrengthLevel.com** (5 niveles) mapeadas a nuestros 8 rangos:
Bronce=Principiante, Plata=Novato, Oro=Intermedio, Diamante=Avanzado, Titán=Élite; **Platino**=media(Inter,Avan), **Gladiador**=media(Avan,Élite), **Olimpo**=extrapolado por encima de Élite. Fuente por musculo = su ejercicio rey.

| Musculo (rey StrengthLevel) | 🥉 | 🥈 | 🥇 | 💠 | 💎 | ⚔️ | 🗿 | ⚡ |
|---|---|---|---|---|---|---|---|---|
| Pecho (bench press) | 0.50 | 0.75 | 1.25 | 1.50 | 1.75 | 1.88 | 2.00 | 2.13 |
| Bíceps (EZ bar curl) | 0.25 | 0.40 | 0.60 | 0.73 | 0.85 | 0.98 | 1.10 | 1.23 |
| Tríceps (close-grip bench) | 0.50 | 0.75 | 1.25 | 1.38 | 1.50 | 1.75 | 2.00 | 2.25 |
| Espalda (bent-over row) | 0.50 | 0.75 | 1.00 | 1.25 | 1.50 | 1.63 | 1.75 | 1.88 |
| Dorsales (pull-ups, carga total) | 0.90 | 1.15 | 1.45 | 1.60 | 1.75 | 1.93 | 2.10 | 2.25 |
| Glúteo (hip thrust) | 0.50 | 1.00 | 1.75 | 2.13 | 2.50 | 3.00 | 3.50 | 4.00 |
| Abdominales (cable crunch) | 0.25 | 0.50 | 1.00 | 1.25 | 1.50 | 1.88 | 2.25 | 2.63 |
| Cuádriceps (squat) | 0.75 | 1.25 | 1.50 | 1.88 | 2.25 | 2.50 | 2.75 | 3.00 |
| Femoral (RDL) | 0.75 | 1.00 | 1.50 | 1.75 | 2.00 | 2.38 | 2.75 | 3.13 |
| Gemelo (machine calf raise) | 0.50 | 1.00 | 1.75 | 2.25 | 2.75 | 3.38 | 4.00 | 4.63 |
| Hombro (military press) | 0.40 | 0.55 | 0.80 | 0.93 | 1.05 | 1.20 | 1.35 | 1.50 |

Rangos (`RANKS` en `js/data.js`): Bronce 🥉, Plata 🥈, Oro 🥇, Platino 💠, Diamante 💎, Gladiador ⚔️, Titán 🗿, Olimpo ⚡. Sin datos ⚪ `#2f352a`.

**Mujeres** (`FEMALE_FACTOR`): se multiplican los suelos por 0.65 (tren superior) / 0.75 (tren inferior). *(Mejora futura: usar las tablas femeninas propias de StrengthLevel.)*

## Pendiente (Fase B / mejoras)
- Afinar factores de conversion por ejercicio (`EXERCISE_FACTORS`).
- Abdominales: idealmente medir por **tiempo de plancha**; ahora usa ratio de crunch con peso (la plancha a peso corporal no puntua).
- Dominadas: el "peso" deberia ser carga total (peso corporal + lastre); ahora usa el peso introducido tal cual.

## Cuerpo (silueta SVG dibujada)
Se usa una **silueta SVG estilizada** (no imagen). Decision: el enfoque de imagen anatomica real se descarto para centrarse en otras partes de la app (se borraron `img/cuerpo-*.png`, mascaras y tooling).
- En `js/ranks.js`, `bodyFrontSVG()` / `bodyBackSVG()` dibujan la figura (viewBox 0 0 240 480). Partes neutras (cabeza, antebrazos, pies) en `SKIN`; cada musculo es una forma con `data-muscle` que `renderRanks` colorea con el color del rango (`MUSCLE_BASE` por defecto; "Sin datos" usa el color oscuro de `RANK_NONE`).
- **11 grupos musculares** (con tildes EXACTAS, deben coincidir con `MUSCLE_GROUPS`):
  - Frontal: Hombro, Pecho, Bíceps, Abdominales, Cuádriceps, Gemelo.
  - Trasera: Hombro, Espalda (zona alta), Dorsales, Tríceps, Glúteo, Femoral, Gemelo.
- Coordenadas faciles de ajustar dentro de cada `<rect>`/`<ellipse>`.

## Datos necesarios
- Peso corporal y sexo: en `btb_profile` (editables con el boton ⚙️ de la pantalla Rangos). Ver [[05 - Modelo de datos]].
- Mejor marca por musculo: del historial `btb_workouts` (solo series con `done: true`).

#bethebest #fase-2 #rangos #wilks
