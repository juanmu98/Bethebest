/* ============================================================
   BeTheBest - Workout history
   A screen listing past training sessions, with detail & delete.
   ============================================================ */

// Which month the calendar is showing (defaults to current month)
let historyMonth = { year: new Date().getFullYear(), month: new Date().getMonth() };

function deleteWorkout(id) {
  const left = getWorkouts().filter((w) => w.id !== id);
  saveData(STORAGE_KEYS.workouts, left);
}

/* ---- Local date key "YYYY-MM-DD" from an ISO date ---- */
function dayKey(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

/* ---- Set of days (keys) that have at least one workout ---- */
function trainedDaySet() {
  const set = new Set();
  getWorkouts().forEach((w) => {
    const d = new Date(w.date);
    set.add(dayKey(d.getFullYear(), d.getMonth(), d.getDate()));
  });
  return set;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"]; // week starts Monday

/* ---- Build the month calendar HTML ---- */
function calendarHTML() {
  const { year, month } = historyMonth;
  const trained = trainedDaySet();
  const today = new Date();
  const todayKey = dayKey(today.getFullYear(), today.getMonth(), today.getDate());

  // How many days in this month, and which weekday the 1st falls on (Mon=0)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat
  firstWeekday = (firstWeekday + 6) % 7; // shift so Monday=0

  // Count trained days this month (for the little summary)
  let trainedThisMonth = 0;

  let cells = "";
  // Empty cells before day 1
  for (let i = 0; i < firstWeekday; i++) cells += `<div></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const key = dayKey(year, month, d);
    const isTrained = trained.has(key);
    if (isTrained) trainedThisMonth++;
    const isToday = key === todayKey;
    cells += `
      <div class="aspect-square flex items-center justify-center rounded-lg text-sm
        ${isTrained ? "bg-lime text-ink font-bold" : "text-white/60"}
        ${isToday && !isTrained ? "ring-1 ring-lime/60" : ""}">
        ${d}
      </div>`;
  }

  return `
    <div class="card p-4 mb-5">
      <div class="flex items-center justify-between mb-3">
        <button id="cal-prev" class="w-8 h-8 rounded-lg bg-white/5 text-white/70">‹</button>
        <p class="font-bold">${MONTH_NAMES[month]} ${year}</p>
        <button id="cal-next" class="w-8 h-8 rounded-lg bg-white/5 text-white/70">›</button>
      </div>
      <div class="grid grid-cols-7 gap-1 mb-1 text-center text-[11px] text-white/40">
        ${WEEKDAYS.map((w) => `<div>${w}</div>`).join("")}
      </div>
      <div class="grid grid-cols-7 gap-1">${cells}</div>
      <p class="text-xs text-white/50 mt-3 text-center">
        <span class="inline-block w-3 h-3 rounded-sm bg-lime align-middle mr-1"></span>
        ${trainedThisMonth} día${trainedThisMonth === 1 ? "" : "s"} entrenado${trainedThisMonth === 1 ? "" : "s"} este mes
      </p>
    </div>`;
}

function changeMonth(delta) {
  let m = historyMonth.month + delta;
  let y = historyMonth.year;
  if (m < 0) { m = 11; y--; }
  if (m > 11) { m = 0; y++; }
  historyMonth = { year: y, month: m };
  renderHistory();
}

function formatWorkoutDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long" }) +
    " · " + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function renderHistory() {
  const el = document.querySelector('[data-screen="history"]');
  // Most recent first
  const workouts = getWorkouts().slice().reverse();

  el.innerHTML = `
    <div class="flex items-center gap-3 mb-4">
      <button id="hs-back" class="text-white/60 text-xl">‹</button>
      <h2 class="text-xl font-extrabold flex-1">Historial</h2>
      <span class="text-sm font-bold text-lime">${workouts.length}</span>
    </div>
    ${calendarHTML()}
    <div id="hs-list" class="space-y-3"></div>
  `;

  // Month navigation
  el.querySelector("#cal-prev").addEventListener("click", () => changeMonth(-1));
  el.querySelector("#cal-next").addEventListener("click", () => changeMonth(1));

  const list = el.querySelector("#hs-list");

  if (workouts.length === 0) {
    list.innerHTML = `
      <div class="card p-8 text-center">
        <div class="text-5xl mb-4">📖</div>
        <p class="text-white/50 text-sm leading-relaxed">Aún no has entrenado.<br>Cuando termines un entreno aparecerá aquí.</p>
      </div>`;
  } else {
    list.innerHTML = workouts
      .map((w) => {
        const doneSets = w.entries.reduce(
          (s, e) => s + e.sets.filter((x) => x.done).length,
          0
        );
        return `
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-lg bg-lime/10 flex items-center justify-center text-lg shrink-0">✅</div>
            <button data-detail="${w.id}" class="flex-1 min-w-0 text-left">
              <p class="font-semibold truncate">${w.routineName || "Entreno"}</p>
              <p class="text-xs text-white/50">${formatWorkoutDate(w.date)}</p>
            </button>
            <button data-del="${w.id}" class="text-white/30 hover:text-red-400 px-2 text-lg shrink-0">🗑️</button>
          </div>
          <div class="flex gap-4 mt-3 text-xs text-white/60">
            <span>⏱️ ${formatTime(w.durationSec || 0)}</span>
            <span>🏋️ ${Math.round(w.volume || 0).toLocaleString("es-ES")} kg</span>
            <span>✔️ ${doneSets} series</span>
          </div>
        </div>`;
      })
      .join("");
  }

  el.querySelector("#hs-back").addEventListener("click", () => goTo("home"));

  list.querySelectorAll("[data-detail]").forEach((b) => {
    b.addEventListener("click", () => openWorkoutDetail(b.dataset.detail));
  });
  list.querySelectorAll("[data-del]").forEach((b) => {
    b.addEventListener("click", () => {
      if (confirm("¿Borrar este entreno del historial?")) {
        deleteWorkout(b.dataset.del);
        renderHistory();
      }
    });
  });
}

function openWorkoutDetail(id) {
  const w = getWorkouts().find((x) => x.id === id);
  if (!w) return;
  const allEx = getExercises();

  const body = w.entries
    .map((entry) => {
      const ex = allEx.find((e) => e.id === entry.exerciseId);
      const setRows = entry.sets
        .map(
          (s, i) =>
            `<div class="flex justify-between text-xs ${s.done ? "" : "opacity-40 line-through"}">
              <span class="text-white/50">Serie ${i + 1}</span>
              <span>${s.weight} kg × ${s.reps}</span>
            </div>`
        )
        .join("");
      return `
        <div class="mb-3">
          <p class="font-semibold text-sm mb-1">${ex ? ex.name : "Ejercicio"}</p>
          <div class="space-y-0.5">${setRows}</div>
        </div>`;
    })
    .join("");

  openModal(`
    <h3 class="text-lg font-extrabold">${w.routineName || "Entreno"}</h3>
    <p class="text-xs text-white/50 mb-4">${formatWorkoutDate(w.date)}</p>
    <div class="flex gap-4 mb-4 text-sm">
      <span>⏱️ ${formatTime(w.durationSec || 0)}</span>
      <span>🏋️ ${Math.round(w.volume || 0).toLocaleString("es-ES")} kg</span>
    </div>
    <div class="max-h-[45vh] overflow-y-auto">${body}</div>
  `);
}
