# 05 - Modelo de datos

Todo se guarda en **LocalStorage** del navegador. Claves en `js/data.js` → `STORAGE_KEYS`.

## Claves

| Clave | Contenido | Por defecto |
|-------|-----------|-------------|
| `btb_exercises` | Lista de ejercicios | semilla de 19 |
| `btb_routines` | Rutinas del usuario | `[]` |
| `btb_workouts` | Historial de entrenos | `[]` |
| `btb_profile` | Datos del usuario | ver abajo |

## Formato de cada objeto

### Grupos musculares (`MUSCLE_GROUPS` en `js/data.js`)
**11 grupos**: Pecho, Espalda (zona alta), Dorsales, Hombro, Bíceps, Tríceps, Abdominales, Cuádriceps, Femoral, Glúteo, Gemelo. Se usan en los filtros de Ejercicios y en los rangos. La semilla tiene **23 ejercicios** con al menos uno por grupo (p. ej. Espalda: encogimientos, face pull; Femoral: peso muerto, curl femoral; Gemelo: elevación de talones).

### Ejercicio (`btb_exercises[]`)
```json
{ "id": "ex_sentadilla", "name": "Sentadilla", "muscle": "Pierna",
  "equipment": "Barra", "difficulty": "Avanzado", "tips": "...", "media": "" }
```

### Rutina (`btb_routines[]`)
```json
{
  "id": "rt_1780829369590",
  "name": "Dia de pierna",
  "exercises": [
    { "exerciseId": "ex_sentadilla", "sets": 4, "reps": 8, "weight": 80, "rest": 120 }
  ]
}
```
`weight` en kg, `rest` en segundos. `id` = `"rt_" + Date.now()`.

### Perfil (`btb_profile`)
```json
{ "name": "Atleta", "bodyweight": 75, "gender": "male" }
```
`bodyweight` (kg) y `gender` (`male`|`female`) se usan para el calculo Wilks de los [[04 - Rangos y Wilks|rangos]]. Editable desde el boton ⚙️ de la pantalla Rangos (`saveProfile` en `js/data.js`).

### Config de rangos (en codigo `js/data.js`, no en LocalStorage)
- `RANKS`: 8 tiers `{ key, name, emoji, color }` (Bronce→Olimpo). `RANK_NONE`="Sin datos". `RANK_KEYS_ASC` ordena de menor a mayor.
- `RANK_RATIOS`: suelos de ratio (1RM÷peso) por musculo (hombres). `FEMALE_FACTOR` (upper/lower) ajusta para mujeres.
- `KING_EXERCISE`: ejercicio rey (unidad) por musculo. `EXERCISE_FACTORS`: factor de conversion de cada ejercicio a su rey (default 1.0).
- `rankFromRatio(muscle, ratio, gender)`: devuelve el rango. Ver detalle en [[04 - Rangos y Wilks]].

### Entreno (`btb_workouts[]`) — IMPLEMENTADO
Lo crea `finishSession()` en `js/train.js`:
```json
{
  "id": "wk_1780830000000",
  "date": "2026-06-07T13:00:00.000Z",
  "routineId": "rt_...",
  "routineName": "Dia de pierna",
  "durationSec": 9,
  "volume": 1280,
  "entries": [
    { "exerciseId": "ex_sentadilla",
      "sets": [ { "reps": 8, "weight": 80, "done": true } ] }
  ]
}
```
- `volume` = suma de `weight * reps` de las series con `done: true`.
- `durationSec` = segundos del cronometro.
- Inicio usa `volume` (kg movidos) y el numero de entrenos.

#bethebest #fase-1 #localstorage #modelo-datos
