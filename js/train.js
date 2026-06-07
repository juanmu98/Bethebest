/* ============================================================
   BeTheBest - Training mode
   Pick a routine -> live session with chronometer ->
   mark each set done -> save workout to history.
   ============================================================ */

// Live session state (null when not training)
let trainState = null;
let trainTimerId = null;

/* ---- Entry point called by the router ---- */
function renderTrain() {
  if (trainState && trainState.active) renderActiveSession();
  else renderRoutinePicker();
}

/* ============================================================
   PICKER: choose a routine to train
   ============================================================ */
function renderRoutinePicker() {
  const el = document.querySelector('[data-screen="train"]');
  const routines = getRoutines();

  el.innerHTML = `
    <h2 class="text-xl font-extrabold mb-4">Entrenar</h2>
    <p class="text-sm text-white/50 mb-4">Elige una rutina para empezar la sesión.</p>
    <div id="tr-list" class="space-y-3"></div>
  `;

  const list = el.querySelector("#tr-list");

  if (routines.length === 0) {
    list.innerHTML = `
      <div class="card p-8 text-center">
        <div class="text-5xl mb-4">⏱️</div>
        <p class="text-white/50 text-sm leading-relaxed">No tienes rutinas todavía.<br>Crea una en <span class="text-lime font-semibold">Rutinas</span> y vuelve aquí.</p>
      </div>`;
    return;
  }

  const allEx = getExercises();
  list.innerHTML = routines
    .map((r) => {
      const count = r.exercises.length;
      const sets = r.exercises.reduce((s, e) => s + (e.sets || 0), 0);
      return `
      <button data-start="${r.id}" class="card w-full p-4 flex items-center gap-3 text-left active:scale-[0.99] transition">
        <div class="w-11 h-11 rounded-lg bg-lime/10 flex items-center justify-center text-lg shrink-0">▶️</div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold truncate">${r.name || "Rutina sin nombre"}</p>
          <p class="text-xs text-white/50">${count} ejercicios · ${sets} series</p>
        </div>
        <span class="text-lime text-sm font-bold shrink-0">Empezar</span>
      </button>`;
    })
    .join("");

  list.querySelectorAll("[data-start]").forEach((b) => {
    b.addEventListener("click", () => startSession(b.dataset.start));
  });
}

/* ============================================================
   START a session from a routine
   ============================================================ */
function startSession(routineId) {
  const routine = getRoutines().find((r) => r.id === routineId);
  if (!routine) return;

  // Build a working copy: for each exercise, one row per set
  const entries = routine.exercises.map((e) => ({
    exerciseId: e.exerciseId,
    rest: e.rest || 0, // seconds of rest between sets, used by the rest timer
    sets: Array.from({ length: e.sets || 1 }, () => ({
      reps: e.reps || 0,
      weight: e.weight || 0,
      done: false,
    })),
  }));

  trainState = {
    active: true,
    routineId: routine.id,
    routineName: routine.name,
    startTime: Date.now(),
    entries,
  };

  startTimer();
  renderTrain();
}

/* ---- Chronometer ---- */
function startTimer() {
  stopTimer();
  trainTimerId = setInterval(updateTimerDisplay, 1000);
}
function stopTimer() {
  if (trainTimerId) clearInterval(trainTimerId);
  trainTimerId = null;
}
function updateTimerDisplay() {
  const elapsed = Math.floor((Date.now() - trainState.startTime) / 1000);
  const node = document.getElementById("tr-timer");
  if (node) node.textContent = formatTime(elapsed);
}
function formatTime(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return (h > 0 ? pad(h) + ":" : "") + pad(m) + ":" + pad(s);
}

/* ============================================================
   ACTIVE SESSION view
   ============================================================ */
function renderActiveSession() {
  const el = document.querySelector('[data-screen="train"]');
  const allEx = getExercises();
  const st = trainState;

  // Progress numbers
  const totalSets = st.entries.reduce((s, e) => s + e.sets.length, 0);
  const doneSets = st.entries.reduce(
    (s, e) => s + e.sets.filter((x) => x.done).length,
    0
  );

  el.innerHTML = `
    <div class="card p-4 mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs text-white/50">Entrenando</p>
        <p class="font-bold">${st.routineName || "Sesión"}</p>
      </div>
      <div class="text-right">
        <p id="tr-timer" class="text-2xl font-extrabold text-lime tabular-nums">00:00</p>
        <p class="text-[11px] text-white/40">${doneSets}/${totalSets} series</p>
      </div>
    </div>

    <div id="tr-entries" class="space-y-4"></div>

    <button id="tr-finish" class="mt-5 w-full py-3.5 rounded-xl bg-lime text-ink font-extrabold active:scale-95 transition">
      Terminar entreno
    </button>
    <button id="tr-cancel" class="mt-3 w-full py-3 rounded-xl bg-white/5 text-white/50 font-medium">
      Cancelar
    </button>
  `;

  updateTimerDisplay();

  // Render each exercise with its set rows
  const wrap = el.querySelector("#tr-entries");
  wrap.innerHTML = st.entries
    .map((entry, ei) => {
      const ex = allEx.find((x) => x.id === entry.exerciseId);
      const rows = entry.sets
        .map(
          (set, si) => `
        <div class="flex items-center gap-2 ${set.done ? "opacity-60" : ""}">
          <span class="w-6 text-xs text-white/40 text-center">${si + 1}</span>
          <input type="number" min="0" inputmode="numeric" data-ei="${ei}" data-si="${si}" data-k="weight"
            value="${set.weight}" class="w-full bg-ink border border-white/10 rounded-lg py-2 text-center text-sm outline-none focus:border-lime/60" />
          <span class="text-white/30 text-xs">kg ×</span>
          <input type="number" min="0" inputmode="numeric" data-ei="${ei}" data-si="${si}" data-k="reps"
            value="${set.reps}" class="w-full bg-ink border border-white/10 rounded-lg py-2 text-center text-sm outline-none focus:border-lime/60" />
          <span class="text-white/30 text-xs">reps</span>
          <button data-toggle data-ei="${ei}" data-si="${si}"
            class="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-base border transition
            ${set.done ? "bg-lime border-lime text-ink" : "bg-ink border-white/15 text-white/40"}">✓</button>
        </div>`
        )
        .join("");

      return `
      <div class="card p-4">
        <p class="font-semibold text-sm mb-3">${ex ? ex.name : "Ejercicio"}</p>
        <div class="space-y-2">${rows}</div>
      </div>`;
    })
    .join("");

  // Editable weight/reps
  wrap.querySelectorAll("input[data-k]").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const { ei, si, k } = e.target.dataset;
      st.entries[ei].sets[si][k] = Number(e.target.value) || 0;
    });
  });

  // Toggle a set done
  wrap.querySelectorAll("[data-toggle]").forEach((b) => {
    b.addEventListener("click", () => {
      const { ei, si } = b.dataset;
      const set = st.entries[ei].sets[si];
      set.done = !set.done;
      // When you complete a set, start the rest countdown for that exercise
      if (set.done) {
        const rest = st.entries[ei].rest;
        if (rest > 0) startRest(rest);
      }
      renderActiveSession(); // repaint to update counter + styles
    });
  });

  // Finish
  el.querySelector("#tr-finish").addEventListener("click", finishSession);

  // Cancel
  el.querySelector("#tr-cancel").addEventListener("click", () => {
    if (confirm("¿Cancelar el entreno? No se guardará.")) {
      stopTimer();
      stopRest();
      trainState = null;
      renderTrain();
    }
  });
}

/* ============================================================
   REST TIMER
   A floating banner with a countdown shown after completing a set.
   Lives outside the screen so it survives re-renders.
   ============================================================ */
let restState = null;     // { remaining, intervalId }

function startRest(seconds) {
  stopRest();
  restState = { remaining: seconds, intervalId: null };
  renderRestBanner();
  restState.intervalId = setInterval(() => {
    restState.remaining -= 1;
    if (restState.remaining <= 0) {
      stopRest();
    } else {
      renderRestBanner();
    }
  }, 1000);
}

function stopRest() {
  if (restState && restState.intervalId) clearInterval(restState.intervalId);
  restState = null;
  const node = document.getElementById("rest-banner");
  if (node) node.remove();
}

function renderRestBanner() {
  let node = document.getElementById("rest-banner");
  if (!node) {
    node = document.createElement("div");
    node.id = "rest-banner";
    node.className =
      "fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-40 " +
      "bg-lime text-ink rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg";
    document.body.appendChild(node);
  }
  node.innerHTML = `
    <span class="text-xl">⏳</span>
    <div class="flex-1">
      <p class="text-[11px] font-semibold leading-none opacity-70">Descanso</p>
      <p class="text-xl font-extrabold tabular-nums leading-tight">${formatTime(restState.remaining)}</p>
    </div>
    <button id="rest-plus" class="px-3 py-1.5 rounded-lg bg-ink/15 text-sm font-bold">+15s</button>
    <button id="rest-skip" class="px-3 py-1.5 rounded-lg bg-ink text-lime text-sm font-bold">Saltar</button>
  `;
  node.querySelector("#rest-plus").onclick = () => {
    if (restState) { restState.remaining += 15; renderRestBanner(); }
  };
  node.querySelector("#rest-skip").onclick = stopRest;
}

/* ============================================================
   FINISH: save the workout to history
   ============================================================ */
function finishSession() {
  const st = trainState;
  const durationSec = Math.floor((Date.now() - st.startTime) / 1000);

  // Volume = sum of (weight * reps) over completed sets
  let volume = 0;
  let doneSets = 0;
  st.entries.forEach((e) =>
    e.sets.forEach((s) => {
      if (s.done) {
        volume += s.weight * s.reps;
        doneSets++;
      }
    })
  );

  if (doneSets === 0) {
    if (!confirm("No has marcado ninguna serie. ¿Terminar igualmente sin guardar progreso?")) return;
  }

  const workout = {
    id: "wk_" + Date.now(),
    date: new Date().toISOString(),
    routineId: st.routineId,
    routineName: st.routineName,
    durationSec,
    volume,
    entries: st.entries,
  };

  const workouts = getWorkouts();
  workouts.push(workout);
  saveData(STORAGE_KEYS.workouts, workouts);

  stopTimer();
  stopRest();
  trainState = null;

  alert(`¡Entreno guardado! 💪\nDuración: ${formatTime(durationSec)}\nVolumen: ${Math.round(volume).toLocaleString("es-ES")} kg`);
  goTo("home");
}
