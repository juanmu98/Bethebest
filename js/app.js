/* ============================================================
   BeTheBest - App controller
   Handles navigation between screens and rendering.
   ============================================================ */

initStorage();

/* ---- Navigation ---- */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

function goTo(screenName) {
  // Toggle screens
  screens.forEach((s) => {
    s.classList.toggle("hidden", s.dataset.screen !== screenName);
  });
  // Toggle nav active state
  navButtons.forEach((b) => {
    b.classList.toggle("active", b.dataset.nav === screenName);
  });
  // Render the screen content fresh each time
  renderScreen(screenName);
  // Scroll back to top
  document.getElementById("screens").scrollTop = 0;
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => goTo(btn.dataset.nav));
});

function renderScreen(name) {
  switch (name) {
    case "home": renderHome(); break;
    case "exercises": renderExercises(); break;
    case "routines": renderRoutines(); break;
    case "train": renderTrain(); break;
    case "ranks": renderRanks(); break;
  }
}

/* ============================================================
   HOME / PROFILE
   ============================================================ */
function renderHome() {
  const el = document.querySelector('[data-screen="home"]');
  const profile = getProfile();
  const workouts = getWorkouts();
  const routines = getRoutines();

  // Quick stats from history
  const totalSessions = workouts.length;
  const totalVolume = workouts.reduce((sum, w) => sum + (w.volume || 0), 0);

  el.innerHTML = `
    <div class="card p-5 mb-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-lime/15 flex items-center justify-center text-2xl font-extrabold text-lime">
          ${profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p class="text-lg font-bold">${profile.name}</p>
          <p class="text-sm text-white/50">${profile.bodyweight} kg de peso corporal</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3 mb-5">
      ${statCard(totalSessions, "Entrenos")}
      ${statCard(routines.length, "Rutinas")}
      ${statCard(Math.round(totalVolume).toLocaleString("es-ES"), "Kg movidos")}
    </div>

    <h2 class="text-base font-bold mb-3">Empieza ahora</h2>
    <div class="space-y-3">
      ${actionRow("⏱️", "Entrenar", "Inicia una sesión y cronómetro", "train")}
      ${actionRow("📋", "Mis rutinas", "Crea o edita tus rutinas", "routines")}
      ${actionRow("🏅", "Mis rangos", "Mira tu nivel por músculo", "ranks")}
    </div>
  `;

  // Wire action rows
  el.querySelectorAll("[data-go]").forEach((row) => {
    row.addEventListener("click", () => goTo(row.dataset.go));
  });
}

function statCard(value, label) {
  return `
    <div class="card p-3 text-center">
      <p class="text-xl font-extrabold text-lime">${value}</p>
      <p class="text-[11px] text-white/50 mt-1">${label}</p>
    </div>`;
}

function actionRow(icon, title, subtitle, go) {
  return `
    <button data-go="${go}" class="card w-full p-4 flex items-center gap-4 text-left active:scale-[0.99] transition">
      <span class="text-2xl">${icon}</span>
      <span class="flex-1">
        <span class="block font-semibold">${title}</span>
        <span class="block text-xs text-white/50">${subtitle}</span>
      </span>
      <span class="text-white/30">›</span>
    </button>`;
}

/* ============================================================
   EXERCISES  (fully functional: search + filters + detail)
   ============================================================ */
let exerciseFilters = { search: "", muscle: "Todos", equipment: "Todos" };

function renderExercises() {
  const el = document.querySelector('[data-screen="exercises"]');
  const exercises = getExercises();

  el.innerHTML = `
    <h2 class="text-xl font-extrabold mb-3">Ejercicios</h2>

    <input id="ex-search" type="text" placeholder="Buscar ejercicio..."
      value="${exerciseFilters.search}"
      class="w-full bg-panel border border-white/10 rounded-xl px-4 py-3 text-sm mb-3 outline-none focus:border-lime/60" />

    <div class="flex gap-2 overflow-x-auto pb-2 mb-1" id="ex-muscle-chips"></div>
    <div class="flex gap-2 overflow-x-auto pb-3" id="ex-equip-chips"></div>

    <p id="ex-count" class="text-xs text-white/40 mb-3"></p>
    <div id="ex-list" class="space-y-2"></div>
  `;

  // Build filter chips
  renderChips("ex-muscle-chips", ["Todos", ...MUSCLE_GROUPS], exerciseFilters.muscle, (val) => {
    exerciseFilters.muscle = val;
    paintExerciseList();
  });
  renderChips("ex-equip-chips", ["Todos", ...EQUIPMENT], exerciseFilters.equipment, (val) => {
    exerciseFilters.equipment = val;
    paintExerciseList();
  });

  // Search input
  el.querySelector("#ex-search").addEventListener("input", (e) => {
    exerciseFilters.search = e.target.value;
    paintExerciseList();
  });

  paintExerciseList();
}

function renderChips(containerId, values, active, onPick) {
  const c = document.getElementById(containerId);
  c.innerHTML = values
    .map(
      (v) => `<button data-val="${v}"
        class="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition
        ${v === active ? "bg-lime text-ink border-lime" : "bg-panel text-white/60 border-white/10"}">${v}</button>`
    )
    .join("");
  c.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => {
      // repaint chips active state
      c.querySelectorAll("button").forEach((x) => {
        const on = x.dataset.val === b.dataset.val;
        x.className = `shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
          on ? "bg-lime text-ink border-lime" : "bg-panel text-white/60 border-white/10"
        }`;
      });
      onPick(b.dataset.val);
    });
  });
}

function paintExerciseList() {
  const exercises = getExercises();
  const { search, muscle, equipment } = exerciseFilters;
  const term = search.trim().toLowerCase();

  const filtered = exercises.filter((ex) => {
    const matchSearch = !term || ex.name.toLowerCase().includes(term);
    const matchMuscle = muscle === "Todos" || ex.muscle === muscle;
    const matchEquip = equipment === "Todos" || ex.equipment === equipment;
    return matchSearch && matchMuscle && matchEquip;
  });

  document.getElementById("ex-count").textContent =
    `${filtered.length} ejercicio${filtered.length === 1 ? "" : "s"}`;

  const list = document.getElementById("ex-list");
  if (filtered.length === 0) {
    list.innerHTML = `<p class="text-center text-white/40 py-10 text-sm">No hay ejercicios con esos filtros.</p>`;
    return;
  }

  list.innerHTML = filtered
    .map(
      (ex) => `
      <button data-id="${ex.id}" class="card w-full p-4 flex items-center gap-3 text-left active:scale-[0.99] transition">
        <div class="w-11 h-11 rounded-lg bg-lime/10 flex items-center justify-center text-lg shrink-0">🏋️</div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold truncate">${ex.name}</p>
          <p class="text-xs text-white/50">${ex.muscle} · ${ex.equipment}</p>
        </div>
        <span class="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/50 shrink-0">${ex.difficulty}</span>
      </button>`
    )
    .join("");

  list.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => openExerciseDetail(b.dataset.id));
  });
}

function openExerciseDetail(id) {
  const ex = getExercises().find((e) => e.id === id);
  if (!ex) return;
  openModal(`
    <div class="w-12 h-12 rounded-xl bg-lime/15 flex items-center justify-center text-2xl mb-3">🏋️</div>
    <h3 class="text-xl font-extrabold mb-1">${ex.name}</h3>
    <div class="flex flex-wrap gap-2 mb-4">
      <span class="text-xs px-2 py-1 rounded-full bg-lime/15 text-lime">${ex.muscle}</span>
      <span class="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60">${ex.equipment}</span>
      <span class="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60">${ex.difficulty}</span>
    </div>
    <p class="text-sm text-white/70 leading-relaxed mb-2"><span class="text-lime font-semibold">Técnica:</span> ${ex.tips}</p>
    <p class="text-xs text-white/30">🎬 Vídeo demostrativo (próximamente)</p>
  `);
}

/* ============================================================
   Simple reusable bottom-sheet modal
   ============================================================ */
function openModal(innerHTML) {
  let overlay = document.getElementById("modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "modal-overlay";
    overlay.className =
      "fixed inset-0 z-40 bg-black/60 flex items-end justify-center";
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="w-full max-w-md bg-panel rounded-t-3xl p-6 pb-10 border-t border-white/10 animate-[fade_0.2s_ease]">
      <div class="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5"></div>
      ${innerHTML}
      <button id="modal-close" class="mt-6 w-full py-3 rounded-xl bg-white/5 text-white/70 font-medium">Cerrar</button>
    </div>`;
  overlay.classList.remove("hidden");
  overlay.querySelector("#modal-close").onclick = closeModal;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}
function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) overlay.remove();
}

/* ============================================================
   PLACEHOLDER SCREENS (built in next steps)
   ============================================================ */
/* renderRoutines() lives in js/routines.js */
function renderTrain() {
  placeholder("train", "⏱️", "Entrenar", "Cronómetro y registro de series en tiempo real. Próximo paso.");
}
function renderRanks() {
  placeholder("ranks", "🏅", "Rangos", "Mapa del cuerpo con tu nivel por músculo (bronce, plata, oro...). Fase 2.");
}

function placeholder(screen, icon, title, text) {
  const el = document.querySelector(`[data-screen="${screen}"]`);
  el.innerHTML = `
    <h2 class="text-xl font-extrabold mb-6">${title}</h2>
    <div class="card p-8 text-center">
      <div class="text-5xl mb-4">${icon}</div>
      <p class="text-white/50 text-sm leading-relaxed">${text}</p>
    </div>`;
}

/* ---- Boot: show home ---- */
goTo("home");
