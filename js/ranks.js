/* ============================================================
   BeTheBest - Ranks & body map (Phase 2)
   Flow:  weight + reps -> Epley (1RM) -> king-equivalent (factor)
          -> ratio (1RM / bodyweight) -> per-muscle rank
   Shows a body silhouette colored by the rank of each muscle.
   ============================================================ */

// Which view of the body is showing
let ranksView = "front";

/* ---- Step 1: Epley estimated 1RM ---- */
function estimate1RM(weight, reps) {
  if (!weight || weight <= 0) return 0;
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
}

/* ============================================================
   Compute best ratio & rank per muscle from workout history.
   For each muscle we keep the best "king-equivalent" 1RM
   (each exercise's 1RM is converted to the muscle's king exercise),
   then ratio = best1RM / bodyweight decides the rank.
   Returns: { "Pecho": { best1RM, ratio, rank }, ... }
   ============================================================ */
function computeMuscleRanks() {
  const profile = getProfile();
  const bw = Math.max(profile.bodyweight || 75, 30);
  const exercises = getExercises();
  const workouts = getWorkouts();

  // muscle -> best king-equivalent 1RM found in history
  const best1RM = {};
  MUSCLE_GROUPS.forEach((m) => (best1RM[m] = 0));

  workouts.forEach((w) => {
    w.entries.forEach((entry) => {
      const ex = exercises.find((e) => e.id === entry.exerciseId);
      if (!ex) return;
      const factor = exerciseFactor(ex.id); // convert to king exercise
      entry.sets.forEach((s) => {
        // Only completed sets count towards your rank
        if (s.done && s.weight > 0 && s.reps > 0) {
          const oneRM = estimate1RM(s.weight, s.reps) * factor;
          if (oneRM > best1RM[ex.muscle]) best1RM[ex.muscle] = oneRM;
        }
      });
    });
  });

  const result = {};
  MUSCLE_GROUPS.forEach((m) => {
    const rm = best1RM[m];
    if (rm > 0) {
      const ratio = rm / bw;
      result[m] = { best1RM: rm, ratio, rank: rankFromRatio(m, ratio, profile.gender) };
    } else {
      result[m] = { best1RM: 0, ratio: null, rank: RANK_NONE };
    }
  });
  return result;
}

/* ============================================================
   MAIN render
   ============================================================ */
function renderRanks() {
  const el = document.querySelector('[data-screen="ranks"]');
  const profile = getProfile();
  const data = computeMuscleRanks();

  el.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-extrabold">Tus rangos</h2>
      <button id="rk-profile" class="text-xs bg-white/5 text-white/70 px-3 py-1.5 rounded-lg">
        ⚙️ ${profile.bodyweight} kg · ${profile.gender === "female" ? "Mujer" : "Hombre"}
      </button>
    </div>

    <!-- Front / back toggle -->
    <div class="flex gap-2 mb-3">
      <button data-view="front" class="rk-tab flex-1 py-2 rounded-lg text-sm font-semibold ${ranksView === "front" ? "bg-lime text-ink" : "bg-panel text-white/60"}">Frontal</button>
      <button data-view="back" class="rk-tab flex-1 py-2 rounded-lg text-sm font-semibold ${ranksView === "back" ? "bg-lime text-ink" : "bg-panel text-white/60"}">Trasera</button>
    </div>

    <!-- Body figure -->
    <div class="card p-4 mb-4 flex justify-center">
      ${ranksView === "front" ? bodyFrontSVG() : bodyBackSVG()}
    </div>

    <!-- Rank legend -->
    <div class="flex flex-wrap gap-2 mb-5 justify-center">
      ${RANKS.slice().reverse().map((r) => `
        <span class="flex items-center gap-1 text-[11px] text-white/60">
          <span class="w-3 h-3 rounded-full" style="background:${r.color}"></span>${r.name}
        </span>`).join("")}
    </div>

    <!-- Detail list -->
    <div class="space-y-2">
      ${MUSCLE_GROUPS.map((m) => muscleRow(m, data[m])).join("")}
    </div>
  `;

  // Color each muscle shape by its rank ("Sin datos" -> its dark neutral color)
  Object.keys(data).forEach((m) => {
    const fill = data[m].rank.color;
    el.querySelectorAll(`[data-muscle="${m}"]`).forEach((node) => {
      node.setAttribute("fill", fill);
    });
  });

  // Wire view tabs
  el.querySelectorAll("[data-view]").forEach((b) => {
    b.addEventListener("click", () => {
      ranksView = b.dataset.view;
      renderRanks();
    });
  });

  // Tapping a muscle in the SVG scrolls/highlights its row (simple: open info)
  el.querySelectorAll("[data-muscle]").forEach((node) => {
    node.style.cursor = "pointer";
    node.addEventListener("click", () => openMuscleDetail(node.dataset.muscle, data[node.dataset.muscle]));
  });

  // Edit profile
  el.querySelector("#rk-profile").addEventListener("click", openProfileEditor);
}

function muscleRow(muscle, info) {
  const r = info.rank;
  const ratio = info.ratio != null ? "×" + info.ratio.toFixed(2) : "—";
  const rm = info.best1RM > 0 ? Math.round(info.best1RM) + " kg" : "sin registro";
  return `
    <div class="card p-3 flex items-center gap-3">
      <span class="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style="background:${r.color}22">${r.emoji}</span>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm">${muscle}</p>
        <p class="text-xs text-white/50">1RM equiv.: ${rm} · Ratio: ${ratio}</p>
      </div>
      <span class="text-xs font-bold px-2 py-1 rounded-full shrink-0" style="color:${r.color};background:${r.color}1a">${r.name}</span>
    </div>`;
}

function openMuscleDetail(muscle, info) {
  const r = info.rank;
  const profile = getProfile();
  const bw = Math.max(profile.bodyweight || 75, 30);
  const floors = rankFloors(muscle, profile.gender);

  // One row per rank: the 1RM (kg) you need on the king exercise at your bodyweight.
  let targets = "";
  if (floors) {
    targets = RANK_KEYS_ASC.map((key, i) => {
      const rk = RANKS.find((x) => x.key === key);
      const kg = Math.round(floors[i] * bw);
      const isCurrent = key === r.key;
      return `
        <div class="flex items-center justify-between rounded-lg px-3 py-1.5 ${isCurrent ? "ring-1 ring-lime" : ""}"
             style="background:${rk.color}14">
          <span class="flex items-center gap-2 text-sm">${rk.emoji} <span style="color:${rk.color}">${rk.name}</span></span>
          <span class="font-semibold text-sm">${kg} kg</span>
        </div>`;
    }).reverse().join(""); // highest rank on top
  }

  openModal(`
    <div class="text-center">
      <div class="text-5xl mb-2">${r.emoji}</div>
      <h3 class="text-xl font-extrabold">${muscle}</h3>
      <p class="text-sm font-bold mb-3" style="color:${r.color}">${r.name}</p>
    </div>
    <div class="space-y-1.5 text-sm mb-4">
      <div class="flex justify-between"><span class="text-white/50">Ejercicio de referencia</span><span class="font-semibold text-right">${KING_EXERCISE[muscle] || "—"}</span></div>
      <div class="flex justify-between"><span class="text-white/50">Tu mejor 1RM equiv.</span><span class="font-semibold">${info.best1RM > 0 ? Math.round(info.best1RM) + " kg" : "—"}</span></div>
      <div class="flex justify-between"><span class="text-white/50">Tu ratio</span><span class="font-semibold">${info.ratio != null ? "×" + info.ratio.toFixed(2) : "—"}</span></div>
    </div>
    <p class="text-xs text-white/40 mb-2">Peso necesario en ${KING_EXERCISE[muscle] || "el ejercicio rey"} con tus ${bw} kg:</p>
    <div class="space-y-1 max-h-[40vh] overflow-y-auto">${targets}</div>
  `);
}

/* ============================================================
   Profile editor (bodyweight + gender)
   ============================================================ */
function openProfileEditor() {
  const p = getProfile();
  openModal(`
    <h3 class="text-lg font-extrabold mb-4">Tu perfil</h3>
    <label class="block text-xs text-white/50 mb-1">Nombre</label>
    <input id="pf-name" type="text" value="${p.name}" class="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-lime/60" />
    <label class="block text-xs text-white/50 mb-1">Peso corporal (kg)</label>
    <input id="pf-bw" type="number" min="30" max="250" value="${p.bodyweight}" class="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-lime/60" />
    <label class="block text-xs text-white/50 mb-1">Sexo</label>
    <div class="flex gap-2 mb-2">
      <button data-sex="male" class="pf-sex flex-1 py-3 rounded-xl text-sm font-semibold ${p.gender !== "female" ? "bg-lime text-ink" : "bg-ink border border-white/10 text-white/60"}">Hombre</button>
      <button data-sex="female" class="pf-sex flex-1 py-3 rounded-xl text-sm font-semibold ${p.gender === "female" ? "bg-lime text-ink" : "bg-ink border border-white/10 text-white/60"}">Mujer</button>
    </div>
    <button id="pf-save" class="mt-4 w-full py-3 rounded-xl bg-lime text-ink font-extrabold">Guardar</button>
  `);

  let chosenSex = getProfile().gender || "male";
  document.querySelectorAll(".pf-sex").forEach((b) => {
    b.addEventListener("click", () => {
      chosenSex = b.dataset.sex;
      document.querySelectorAll(".pf-sex").forEach((x) => {
        const on = x.dataset.sex === chosenSex;
        x.className = `pf-sex flex-1 py-3 rounded-xl text-sm font-semibold ${on ? "bg-lime text-ink" : "bg-ink border border-white/10 text-white/60"}`;
      });
    });
  });

  document.getElementById("pf-save").addEventListener("click", () => {
    const name = document.getElementById("pf-name").value.trim() || "Atleta";
    const bw = Number(document.getElementById("pf-bw").value) || 75;
    saveProfile({ name, bodyweight: bw, gender: chosenSex });
    closeModal();
    renderRanks();
  });
}

/* ============================================================
   Body silhouettes (simple, stylized front & back).
   Neutral parts (head, forearms, feet) in dark gray; each muscle
   region has data-muscle so renderRanks() colors it by rank.
   ============================================================ */
const SKIN = "#23271f";        // neutral body parts
const MUSCLE_BASE = "#2f352a"; // default muscle color (overwritten by rank)

function bodyFrontSVG() {
  return `
  <svg viewBox="0 0 240 480" width="200" class="select-none">
    <!-- neutral structure -->
    <circle cx="120" cy="36" r="24" fill="${SKIN}"/>
    <rect x="110" y="56" width="20" height="14" fill="${SKIN}"/>
    <rect x="49" y="168" width="16" height="70" rx="8" fill="${SKIN}"/>
    <rect x="175" y="168" width="16" height="70" rx="8" fill="${SKIN}"/>
    <ellipse cx="106" cy="402" rx="11" ry="7" fill="${SKIN}"/>
    <ellipse cx="134" cy="402" rx="11" ry="7" fill="${SKIN}"/>
    <!-- ===== muscles ===== -->
    <ellipse cx="80"  cy="92" rx="20" ry="15" fill="${MUSCLE_BASE}" data-muscle="Hombro"/>
    <ellipse cx="160" cy="92" rx="20" ry="15" fill="${MUSCLE_BASE}" data-muscle="Hombro"/>
    <rect x="90"  y="88" width="26" height="32" rx="9" fill="${MUSCLE_BASE}" data-muscle="Pecho"/>
    <rect x="124" y="88" width="26" height="32" rx="9" fill="${MUSCLE_BASE}" data-muscle="Pecho"/>
    <ellipse cx="62"  cy="135" rx="12" ry="24" fill="${MUSCLE_BASE}" data-muscle="Bíceps"/>
    <ellipse cx="178" cy="135" rx="12" ry="24" fill="${MUSCLE_BASE}" data-muscle="Bíceps"/>
    <rect x="96" y="126" width="48" height="78" rx="12" fill="${MUSCLE_BASE}" data-muscle="Abdominales"/>
    <rect x="95"  y="218" width="24" height="82" rx="12" fill="${MUSCLE_BASE}" data-muscle="Cuádriceps"/>
    <rect x="121" y="218" width="24" height="82" rx="12" fill="${MUSCLE_BASE}" data-muscle="Cuádriceps"/>
    <rect x="97"  y="306" width="20" height="86" rx="10" fill="${MUSCLE_BASE}" data-muscle="Gemelo"/>
    <rect x="123" y="306" width="20" height="86" rx="10" fill="${MUSCLE_BASE}" data-muscle="Gemelo"/>
  </svg>`;
}

function bodyBackSVG() {
  return `
  <svg viewBox="0 0 240 480" width="200" class="select-none">
    <!-- neutral structure -->
    <circle cx="120" cy="36" r="24" fill="${SKIN}"/>
    <rect x="110" y="56" width="20" height="14" fill="${SKIN}"/>
    <rect x="49" y="168" width="16" height="70" rx="8" fill="${SKIN}"/>
    <rect x="175" y="168" width="16" height="70" rx="8" fill="${SKIN}"/>
    <ellipse cx="106" cy="402" rx="11" ry="7" fill="${SKIN}"/>
    <ellipse cx="134" cy="402" rx="11" ry="7" fill="${SKIN}"/>
    <!-- ===== muscles ===== -->
    <ellipse cx="80"  cy="92" rx="20" ry="15" fill="${MUSCLE_BASE}" data-muscle="Hombro"/>
    <ellipse cx="160" cy="92" rx="20" ry="15" fill="${MUSCLE_BASE}" data-muscle="Hombro"/>
    <rect x="96" y="84" width="48" height="30" rx="8" fill="${MUSCLE_BASE}" data-muscle="Espalda"/>
    <rect x="90"  y="116" width="26" height="42" rx="8" fill="${MUSCLE_BASE}" data-muscle="Dorsales"/>
    <rect x="124" y="116" width="26" height="42" rx="8" fill="${MUSCLE_BASE}" data-muscle="Dorsales"/>
    <ellipse cx="62"  cy="138" rx="12" ry="24" fill="${MUSCLE_BASE}" data-muscle="Tríceps"/>
    <ellipse cx="178" cy="138" rx="12" ry="24" fill="${MUSCLE_BASE}" data-muscle="Tríceps"/>
    <ellipse cx="108" cy="210" rx="15" ry="17" fill="${MUSCLE_BASE}" data-muscle="Glúteo"/>
    <ellipse cx="132" cy="210" rx="15" ry="17" fill="${MUSCLE_BASE}" data-muscle="Glúteo"/>
    <rect x="95"  y="234" width="24" height="70" rx="12" fill="${MUSCLE_BASE}" data-muscle="Femoral"/>
    <rect x="121" y="234" width="24" height="70" rx="12" fill="${MUSCLE_BASE}" data-muscle="Femoral"/>
    <rect x="97"  y="310" width="20" height="82" rx="10" fill="${MUSCLE_BASE}" data-muscle="Gemelo"/>
    <rect x="123" y="310" width="20" height="82" rx="10" fill="${MUSCLE_BASE}" data-muscle="Gemelo"/>
  </svg>`;
}
