/* ============================================================
   BeTheBest - Data layer
   - Seed exercise database
   - LocalStorage helpers (acts as our "database" in Phase 1)
   ============================================================ */

/* ---- Reference lists used by filters across the app ---- */
const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Dorsales",
  "Hombro",
  "Bíceps",
  "Tríceps",
  "Abdominales",
  "Cuádriceps",
  "Femoral",
  "Glúteo",
  "Gemelo",
];

const EQUIPMENT = ["Barra", "Mancuerna", "Polea", "Máquina", "Peso corporal"];

const DIFFICULTY = ["Principiante", "Intermedio", "Avanzado"];

/* ---- Seed exercise database ----
   Each exercise: id, name, muscle, equipment, difficulty, tips, media (placeholder)
*/
const SEED_EXERCISES = [
  { id: "ex_press_banca", name: "Press de banca", muscle: "Pecho", equipment: "Barra", difficulty: "Intermedio", tips: "Baja la barra controlando hasta el pecho y empuja sin rebotar.", media: "" },
  { id: "ex_press_inclinado", name: "Press inclinado con mancuernas", muscle: "Pecho", equipment: "Mancuerna", difficulty: "Intermedio", tips: "Inclina el banco unos 30° para trabajar la parte alta del pecho.", media: "" },
  { id: "ex_aperturas", name: "Aperturas en polea", muscle: "Pecho", equipment: "Polea", difficulty: "Principiante", tips: "Junta las manos al frente apretando el pecho.", media: "" },
  { id: "ex_dominadas", name: "Dominadas", muscle: "Dorsales", equipment: "Peso corporal", difficulty: "Avanzado", tips: "Sube llevando el pecho hacia la barra, sin balanceo.", media: "" },
  { id: "ex_remo_barra", name: "Remo con barra", muscle: "Dorsales", equipment: "Barra", difficulty: "Intermedio", tips: "Espalda recta y tira de la barra hacia el ombligo.", media: "" },
  { id: "ex_jalon", name: "Jalón al pecho", muscle: "Dorsales", equipment: "Polea", difficulty: "Principiante", tips: "Lleva la barra al pecho apretando la espalda.", media: "" },
  { id: "ex_encogimientos", name: "Encogimientos con mancuernas", muscle: "Espalda", equipment: "Mancuerna", difficulty: "Principiante", tips: "Sube los hombros hacia las orejas apretando el trapecio.", media: "" },
  { id: "ex_face_pull", name: "Face pull", muscle: "Espalda", equipment: "Polea", difficulty: "Principiante", tips: "Tira de la cuerda hacia la cara abriendo los codos.", media: "" },
  { id: "ex_press_militar", name: "Press militar", muscle: "Hombro", equipment: "Barra", difficulty: "Intermedio", tips: "Empuja la barra sobre la cabeza sin arquear la espalda.", media: "" },
  { id: "ex_elev_laterales", name: "Elevaciones laterales", muscle: "Hombro", equipment: "Mancuerna", difficulty: "Principiante", tips: "Sube los brazos hasta la altura de los hombros, codos ligeramente flexionados.", media: "" },
  { id: "ex_curl_barra", name: "Curl con barra", muscle: "Bíceps", equipment: "Barra", difficulty: "Principiante", tips: "Sube la barra sin mover los codos del costado.", media: "" },
  { id: "ex_curl_martillo", name: "Curl martillo", muscle: "Bíceps", equipment: "Mancuerna", difficulty: "Principiante", tips: "Agarre neutro (palmas enfrentadas) para trabajar el antebrazo.", media: "" },
  { id: "ex_press_frances", name: "Press francés", muscle: "Tríceps", equipment: "Barra", difficulty: "Intermedio", tips: "Baja la barra hacia la frente flexionando solo los codos.", media: "" },
  { id: "ex_ext_polea", name: "Extensión en polea", muscle: "Tríceps", equipment: "Polea", difficulty: "Principiante", tips: "Estira los brazos hacia abajo apretando el tríceps.", media: "" },
  { id: "ex_sentadilla", name: "Sentadilla", muscle: "Cuádriceps", equipment: "Barra", difficulty: "Avanzado", tips: "Baja con la espalda recta hasta que el muslo quede paralelo al suelo.", media: "" },
  { id: "ex_prensa", name: "Prensa de piernas", muscle: "Cuádriceps", equipment: "Máquina", difficulty: "Principiante", tips: "Empuja la plataforma sin bloquear de golpe las rodillas.", media: "" },
  { id: "ex_peso_muerto", name: "Peso muerto", muscle: "Femoral", equipment: "Barra", difficulty: "Avanzado", tips: "Mantén la barra pegada al cuerpo y la espalda neutra.", media: "" },
  { id: "ex_curl_femoral", name: "Curl femoral", muscle: "Femoral", equipment: "Máquina", difficulty: "Principiante", tips: "Lleva el talón hacia el glúteo apretando el femoral.", media: "" },
  { id: "ex_hip_thrust", name: "Hip thrust", muscle: "Glúteo", equipment: "Barra", difficulty: "Intermedio", tips: "Empuja con los talones y aprieta el glúteo arriba.", media: "" },
  { id: "ex_zancadas", name: "Zancadas", muscle: "Glúteo", equipment: "Mancuerna", difficulty: "Intermedio", tips: "Da un paso largo y baja la rodilla trasera casi al suelo.", media: "" },
  { id: "ex_elev_talones", name: "Elevación de talones", muscle: "Gemelo", equipment: "Máquina", difficulty: "Principiante", tips: "Sube de puntillas lo máximo y baja despacio estirando el gemelo.", media: "" },
  { id: "ex_plancha", name: "Plancha abdominal", muscle: "Abdominales", equipment: "Peso corporal", difficulty: "Principiante", tips: "Mantén el cuerpo recto, sin levantar ni hundir la cadera.", media: "" },
  { id: "ex_crunch", name: "Crunch en máquina", muscle: "Abdominales", equipment: "Máquina", difficulty: "Principiante", tips: "Enrolla el tronco apretando el abdomen.", media: "" },
];

/* ============================================================
   Storage keys (all app data lives under these)
   ============================================================ */
const STORAGE_KEYS = {
  exercises: "btb_exercises",
  routines: "btb_routines",
  workouts: "btb_workouts",   // completed training sessions (history)
  profile: "btb_profile",
};

/* ---- Generic helpers ---- */
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("Error reading storage", key, e);
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---- First run: seed exercises and a default profile ---- */
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.exercises)) {
    saveData(STORAGE_KEYS.exercises, SEED_EXERCISES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.routines)) {
    saveData(STORAGE_KEYS.routines, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.workouts)) {
    saveData(STORAGE_KEYS.workouts, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.profile)) {
    saveData(STORAGE_KEYS.profile, {
      name: "Atleta",
      bodyweight: 75,   // kg, used later for Wilks ranks
      gender: "male",
    });
  }
}

/* ---- Convenience getters ---- */
const getExercises = () => loadData(STORAGE_KEYS.exercises, SEED_EXERCISES);
const getRoutines = () => loadData(STORAGE_KEYS.routines, []);
const getWorkouts = () => loadData(STORAGE_KEYS.workouts, []);
const getProfile = () => loadData(STORAGE_KEYS.profile, { name: "Atleta", bodyweight: 75, gender: "male" });
const saveProfile = (profile) => saveData(STORAGE_KEYS.profile, profile);

/* ============================================================
   RANKS configuration (8 tiers)
   ============================================================ */
const RANKS = [
  { key: "olympus",   name: "Olimpo",    emoji: "⚡", color: "#bdf60a" },
  { key: "titan",     name: "Titán",     emoji: "🗿", color: "#b061ff" },
  { key: "gladiator", name: "Gladiador", emoji: "⚔️", color: "#ff5470" },
  { key: "diamond",   name: "Diamante",  emoji: "💎", color: "#8ab4ff" },
  { key: "plat",      name: "Platino",   emoji: "💠", color: "#5fd0e0" },
  { key: "gold",      name: "Oro",       emoji: "🥇", color: "#ffd34d" },
  { key: "silver",    name: "Plata",     emoji: "🥈", color: "#c0c0c0" },
  { key: "bronze",    name: "Bronce",    emoji: "🥉", color: "#cd7f32" },
];

// Returned when a muscle has no logged sets yet
const RANK_NONE = { key: "none", name: "Sin datos", emoji: "⚪", color: "#2f352a" };

// Rank keys from lowest to highest (matches the ratio-floor arrays below)
const RANK_KEYS_ASC = ["bronze", "silver", "gold", "plat", "diamond", "gladiator", "titan", "olympus"];
const rankByKey = (key) => RANKS.find((r) => r.key === key) || RANK_NONE;

/* ============================================================
   STRENGTH RATIO SYSTEM (per-muscle, "king exercise" standard)
   Each muscle is judged by its own ratio = (king-equivalent 1RM) / bodyweight.
   RANK_RATIOS[muscle] = 8 floors, from Bronce(0) to Olimpo(7).
   Easy to tune: just change the numbers.
   ============================================================ */

// Reference ("king") exercise per muscle = the standard unit of measure.
// The user does NOT have to train it; other exercises are converted to it.
const KING_EXERCISE = {
  "Pecho":       "Press de banca plano",
  "Bíceps":      "Curl con barra EZ",
  "Tríceps":     "Press cerrado / Fondos lastrados",
  "Espalda":     "Remo con barra",
  "Dorsales":    "Dominadas (con lastre)",
  "Glúteo":      "Hip thrust con barra",
  "Abdominales": "Crunch en polea",
  "Cuádriceps":  "Sentadilla trasera",
  "Femoral":     "Peso muerto rumano",
  "Gemelo":      "Elevación de talones en máquina",
  "Hombro":      "Press militar de pie",
};

// Ratio floors per muscle (1RM ÷ bodyweight), MEN. Index 0=Bronce ... 7=Olimpo.
// Based on StrengthLevel.com standards mapped to our 8 ranks:
//   Bronce=Principiante, Plata=Novato, Oro=Intermedio, Diamante=Avanzado, Titán=Élite;
//   Platino y Gladiador son puntos medios; Olimpo extrapola por encima de Élite.
const RANK_RATIOS = {
  "Pecho":       [0.50, 0.75, 1.25, 1.50, 1.75, 1.88, 2.00, 2.13], // Press de banca
  "Bíceps":      [0.25, 0.40, 0.60, 0.73, 0.85, 0.98, 1.10, 1.23], // Curl barra EZ
  "Tríceps":     [0.50, 0.75, 1.25, 1.38, 1.50, 1.75, 2.00, 2.25], // Press cerrado
  "Espalda":     [0.50, 0.75, 1.00, 1.25, 1.50, 1.63, 1.75, 1.88], // Remo con barra
  "Dorsales":    [0.90, 1.15, 1.45, 1.60, 1.75, 1.93, 2.10, 2.25], // Dominadas (carga total)
  "Glúteo":      [0.50, 1.00, 1.75, 2.13, 2.50, 3.00, 3.50, 4.00], // Hip thrust
  "Abdominales": [0.25, 0.50, 1.00, 1.25, 1.50, 1.88, 2.25, 2.63], // Crunch en polea
  "Cuádriceps":  [0.75, 1.25, 1.50, 1.88, 2.25, 2.50, 2.75, 3.00], // Sentadilla
  "Femoral":     [0.75, 1.00, 1.50, 1.75, 2.00, 2.38, 2.75, 3.13], // Peso muerto rumano
  "Gemelo":      [0.50, 1.00, 1.75, 2.25, 2.75, 3.38, 4.00, 4.63], // Elev. talones máquina
  "Hombro":      [0.40, 0.55, 0.80, 0.93, 1.05, 1.20, 1.35, 1.50], // Press militar
};

// Upper-body muscles need a different female adjustment than lower-body.
const UPPER_BODY = ["Pecho", "Bíceps", "Tríceps", "Espalda", "Dorsales", "Hombro", "Abdominales"];
const FEMALE_FACTOR = { upper: 0.65, lower: 0.75 };

// Conversion factors: an exercise's 1RM -> "king-equivalent" 1RM.
// King exercises (and anything not listed) default to 1.0.
const EXERCISE_FACTORS = {
  ex_press_inclinado: 0.85, ex_aperturas: 0.60,        // Pecho
  ex_curl_martillo: 0.90,                              // Bíceps
  ex_press_frances: 0.60, ex_ext_polea: 0.50,          // Tríceps
  ex_encogimientos: 1.30, ex_face_pull: 0.40,          // Espalda
  ex_jalon: 0.85,                                      // Dorsales
  ex_elev_laterales: 0.40,                             // Hombro
  ex_prensa: 0.50,                                     // Cuádriceps
  ex_curl_femoral: 0.40,                               // Femoral
  ex_zancadas: 0.40,                                   // Glúteo
};
const exerciseFactor = (id) => (EXERCISE_FACTORS[id] != null ? EXERCISE_FACTORS[id] : 1.0);

// Ratio floors for a muscle, adjusted by sex (women: lower the bar).
function rankFloors(muscle, gender) {
  const base = RANK_RATIOS[muscle];
  if (!base) return null;
  if (gender === "female") {
    const f = UPPER_BODY.includes(muscle) ? FEMALE_FACTOR.upper : FEMALE_FACTOR.lower;
    return base.map((v) => v * f);
  }
  return base.slice();
}

// Given a muscle and a strength ratio, return the rank object.
function rankFromRatio(muscle, ratio, gender) {
  if (ratio == null || ratio <= 0) return RANK_NONE;
  const floors = rankFloors(muscle, gender);
  if (!floors) return RANK_NONE;
  let idx = -1;
  for (let i = 0; i < floors.length; i++) if (ratio >= floors[i]) idx = i;
  if (idx < 0) idx = 0; // has data but below Bronce floor -> still Bronce
  return rankByKey(RANK_KEYS_ASC[idx]);
}
