/* ============================================================
   BeTheBest - Achievements / medals (Phase 2)
   Badges that unlock automatically when milestones are met.
   Everything is derived from existing data (no extra storage).
   ============================================================ */

/* ---- Build a context with everything the checks may need ---- */
function buildAchievementContext() {
  const workouts = getWorkouts();
  const routines = getRoutines();
  const ranks = computeMuscleRanks();

  const totalVolume = workouts.reduce((s, w) => s + (w.volume || 0), 0);
  const maxDuration = workouts.reduce((m, w) => Math.max(m, w.durationSec || 0), 0);

  // Best estimated 1RM across every completed set
  let max1RM = 0;
  workouts.forEach((w) =>
    w.entries.forEach((e) =>
      e.sets.forEach((s) => {
        if (s.done && s.weight > 0 && s.reps > 0) {
          max1RM = Math.max(max1RM, estimate1RM(s.weight, s.reps));
        }
      })
    )
  );

  // Rank ladder: lower index in RANKS = higher rank. Find the best reached.
  let bestRankIndex = RANKS.length; // worse than bronze
  let musclesWithData = 0;
  MUSCLE_GROUPS.forEach((m) => {
    if (ranks[m].rank.key !== "none") {
      musclesWithData++;
      const idx = RANKS.findIndex((r) => r.key === ranks[m].rank.key);
      if (idx >= 0 && idx < bestRankIndex) bestRankIndex = idx;
    }
  });

  return {
    workoutCount: workouts.length,
    routineCount: routines.length,
    totalVolume,
    maxDuration,
    max1RM,
    bestRankIndex,
    musclesWithData,
    totalMuscles: MUSCLE_GROUPS.length,
  };
}

// Helper: index in RANKS of a given rank key (0 = Olimpo, highest)
function rankKeyIndex(key) {
  return RANKS.findIndex((r) => r.key === key);
}

/* ---- The achievement catalogue ----
   check(ctx) returns true when unlocked.
*/
const ACHIEVEMENTS = [
  { id: "first_workout", emoji: "🔥", name: "Primer sudor", desc: "Completa tu primer entreno", check: (c) => c.workoutCount >= 1 },
  { id: "five_workouts", emoji: "📅", name: "Cogiendo el ritmo", desc: "Completa 5 entrenos", check: (c) => c.workoutCount >= 5 },
  { id: "ten_workouts", emoji: "💪", name: "Sin excusas", desc: "Completa 10 entrenos", check: (c) => c.workoutCount >= 10 },
  { id: "first_routine", emoji: "📋", name: "Con un plan", desc: "Crea tu primera rutina", check: (c) => c.routineCount >= 1 },
  { id: "three_routines", emoji: "🗂️", name: "Estratega", desc: "Ten 3 rutinas creadas", check: (c) => c.routineCount >= 3 },
  { id: "vol_10k", emoji: "🏋️", name: "Toneladas", desc: "Mueve 10.000 kg en total", check: (c) => c.totalVolume >= 10000 },
  { id: "vol_100k", emoji: "🚗", name: "Levantaste un coche", desc: "Mueve 100.000 kg en total", check: (c) => c.totalVolume >= 100000 },
  { id: "strong_150", emoji: "🦍", name: "Fuerza bruta", desc: "Alcanza un 1RM estimado de 150 kg", check: (c) => c.max1RM >= 150 },
  { id: "marathon", emoji: "⏳", name: "Maratón", desc: "Un entreno de más de 1 hora", check: (c) => c.maxDuration >= 3600 },
  { id: "rank_gold", emoji: "🥇", name: "Primer Oro", desc: "Llega a Oro o más en algún músculo", check: (c) => c.bestRankIndex <= rankKeyIndex("gold") },
  { id: "rank_diamond", emoji: "💎", name: "Diamante en bruto", desc: "Llega a Diamante o más en algún músculo", check: (c) => c.bestRankIndex <= rankKeyIndex("diamond") },
  { id: "rank_olympus", emoji: "⚡", name: "Semidiós", desc: "Alcanza el rango Olimpo en algún músculo", check: (c) => c.bestRankIndex <= rankKeyIndex("olympus") },
  { id: "full_body", emoji: "🧍", name: "Cuerpo completo", desc: "Consigue rango en todos los músculos", check: (c) => c.musclesWithData >= c.totalMuscles },
];

/* ---- Compute unlocked state ---- */
function computeAchievements() {
  const ctx = buildAchievementContext();
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: !!a.check(ctx) }));
}

/* ============================================================
   RENDER
   ============================================================ */
function renderAchievements() {
  const el = document.querySelector('[data-screen="achievements"]');
  const list = computeAchievements();
  const unlocked = list.filter((a) => a.unlocked).length;
  const total = list.length;
  const pct = Math.round((unlocked / total) * 100);

  el.innerHTML = `
    <div class="flex items-center gap-3 mb-4">
      <button id="ac-back" class="text-white/60 text-xl">‹</button>
      <h2 class="text-xl font-extrabold flex-1">Logros</h2>
      <span class="text-sm font-bold text-lime">${unlocked}/${total}</span>
    </div>

    <div class="w-full h-2 rounded-full bg-white/10 mb-5 overflow-hidden">
      <div class="h-full bg-lime transition-all" style="width:${pct}%"></div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      ${list.map(achievementCard).join("")}
    </div>
  `;

  el.querySelector("#ac-back").addEventListener("click", () => goTo("home"));
}

function achievementCard(a) {
  if (a.unlocked) {
    return `
      <div class="card p-4 text-center border-lime/30">
        <div class="text-4xl mb-2">${a.emoji}</div>
        <p class="font-bold text-sm">${a.name}</p>
        <p class="text-[11px] text-white/50 mt-1 leading-snug">${a.desc}</p>
      </div>`;
  }
  return `
    <div class="card p-4 text-center opacity-50">
      <div class="text-4xl mb-2 grayscale">🔒</div>
      <p class="font-bold text-sm text-white/60">${a.name}</p>
      <p class="text-[11px] text-white/40 mt-1 leading-snug">${a.desc}</p>
    </div>`;
}
