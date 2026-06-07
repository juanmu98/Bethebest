/* ============================================================
   BeTheBest - Data layer
   - Seed exercise database
   - LocalStorage helpers (acts as our "database" in Phase 1)
   ============================================================ */

/* ---- Reference lists used by filters across the app ---- */
const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Hombro",
  "Bíceps",
  "Tríceps",
  "Pierna",
  "Glúteo",
  "Abdomen",
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
  { id: "ex_dominadas", name: "Dominadas", muscle: "Espalda", equipment: "Peso corporal", difficulty: "Avanzado", tips: "Sube llevando el pecho hacia la barra, sin balanceo.", media: "" },
  { id: "ex_remo_barra", name: "Remo con barra", muscle: "Espalda", equipment: "Barra", difficulty: "Intermedio", tips: "Espalda recta y tira de la barra hacia el ombligo.", media: "" },
  { id: "ex_jalon", name: "Jalón al pecho", muscle: "Espalda", equipment: "Polea", difficulty: "Principiante", tips: "Lleva la barra al pecho apretando la espalda.", media: "" },
  { id: "ex_press_militar", name: "Press militar", muscle: "Hombro", equipment: "Barra", difficulty: "Intermedio", tips: "Empuja la barra sobre la cabeza sin arquear la espalda.", media: "" },
  { id: "ex_elev_laterales", name: "Elevaciones laterales", muscle: "Hombro", equipment: "Mancuerna", difficulty: "Principiante", tips: "Sube los brazos hasta la altura de los hombros, codos ligeramente flexionados.", media: "" },
  { id: "ex_curl_barra", name: "Curl con barra", muscle: "Bíceps", equipment: "Barra", difficulty: "Principiante", tips: "Sube la barra sin mover los codos del costado.", media: "" },
  { id: "ex_curl_martillo", name: "Curl martillo", muscle: "Bíceps", equipment: "Mancuerna", difficulty: "Principiante", tips: "Agarre neutro (palmas enfrentadas) para trabajar el antebrazo.", media: "" },
  { id: "ex_press_frances", name: "Press francés", muscle: "Tríceps", equipment: "Barra", difficulty: "Intermedio", tips: "Baja la barra hacia la frente flexionando solo los codos.", media: "" },
  { id: "ex_ext_polea", name: "Extensión en polea", muscle: "Tríceps", equipment: "Polea", difficulty: "Principiante", tips: "Estira los brazos hacia abajo apretando el tríceps.", media: "" },
  { id: "ex_sentadilla", name: "Sentadilla", muscle: "Pierna", equipment: "Barra", difficulty: "Avanzado", tips: "Baja con la espalda recta hasta que el muslo quede paralelo al suelo.", media: "" },
  { id: "ex_prensa", name: "Prensa de piernas", muscle: "Pierna", equipment: "Máquina", difficulty: "Principiante", tips: "Empuja la plataforma sin bloquear de golpe las rodillas.", media: "" },
  { id: "ex_peso_muerto", name: "Peso muerto", muscle: "Pierna", equipment: "Barra", difficulty: "Avanzado", tips: "Mantén la barra pegada al cuerpo y la espalda neutra.", media: "" },
  { id: "ex_hip_thrust", name: "Hip thrust", muscle: "Glúteo", equipment: "Barra", difficulty: "Intermedio", tips: "Empuja con los talones y aprieta el glúteo arriba.", media: "" },
  { id: "ex_zancadas", name: "Zancadas", muscle: "Glúteo", equipment: "Mancuerna", difficulty: "Intermedio", tips: "Da un paso largo y baja la rodilla trasera casi al suelo.", media: "" },
  { id: "ex_plancha", name: "Plancha abdominal", muscle: "Abdomen", equipment: "Peso corporal", difficulty: "Principiante", tips: "Mantén el cuerpo recto, sin levantar ni hundir la cadera.", media: "" },
  { id: "ex_crunch", name: "Crunch en máquina", muscle: "Abdomen", equipment: "Máquina", difficulty: "Principiante", tips: "Enrolla el tronco apretando el abdomen.", media: "" },
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
