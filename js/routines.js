/* ============================================================
   BeTheBest - Routines screen
   Create / edit / delete training routines.
   Two views inside the same screen:
     - "list":   all saved routines
     - "editor": create or edit one routine
   ============================================================ */

// View state for the routines screen
let routineView = { mode: "list", draft: null };

/* ---- Storage helpers ---- */
function saveRoutine(routine) {
  const routines = getRoutines();
  const idx = routines.findIndex((r) => r.id === routine.id);
  if (idx >= 0) routines[idx] = routine;
  else routines.push(routine);
  saveData(STORAGE_KEYS.routines, routines);
}

function deleteRoutine(id) {
  const routines = getRoutines().filter((r) => r.id !== id);
  saveData(STORAGE_KEYS.routines, routines);
}

function newDraftRoutine() {
  return { id: "rt_" + Date.now(), name: "", exercises: [] };
}

/* ---- Entry point called by the router ---- */
function renderRoutines() {
  if (routineView.mode === "editor") renderRoutineEditor();
  else renderRoutineList();
}

/* ============================================================
   LIST VIEW
   ============================================================ */
function renderRoutineList() {
  const el = document.querySelector('[data-screen="routines"]');
  const routines = getRoutines();

  el.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-extrabold">Mis rutinas</h2>
      <button id="rt-new" class="bg-lime text-ink font-bold text-sm px-4 py-2 rounded-xl active:scale-95 transition">+ Nueva</button>
    </div>
    <div id="rt-list" class="space-y-3"></div>
  `;

  const list = el.querySelector("#rt-list");

  if (routines.length === 0) {
    list.innerHTML = `
      <div class="card p-8 text-center">
        <div class="text-5xl mb-4">📋</div>
        <p class="text-white/50 text-sm leading-relaxed">Aún no tienes rutinas.<br>Pulsa <span class="text-lime font-semibold">+ Nueva</span> para crear la primera.</p>
      </div>`;
  } else {
    const allEx = getExercises();
    list.innerHTML = routines
      .map((r) => {
        const count = r.exercises.length;
        // Show up to 3 exercise names as a preview
        const names = r.exercises
          .slice(0, 3)
          .map((e) => allEx.find((x) => x.id === e.exerciseId)?.name)
          .filter(Boolean)
          .join(" · ");
        return `
        <div class="card p-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-lg bg-lime/10 flex items-center justify-center text-lg shrink-0">📋</div>
            <button data-edit="${r.id}" class="flex-1 min-w-0 text-left">
              <p class="font-semibold truncate">${r.name || "Rutina sin nombre"}</p>
              <p class="text-xs text-white/50 truncate">${count} ejercicio${count === 1 ? "" : "s"}${names ? " · " + names : ""}</p>
            </button>
            <button data-del="${r.id}" class="text-white/30 hover:text-red-400 px-2 text-lg shrink-0">🗑️</button>
          </div>
        </div>`;
      })
      .join("");
  }

  // Wire buttons
  el.querySelector("#rt-new").addEventListener("click", () => {
    routineView = { mode: "editor", draft: newDraftRoutine() };
    renderRoutines();
  });
  list.querySelectorAll("[data-edit]").forEach((b) => {
    b.addEventListener("click", () => {
      const r = getRoutines().find((x) => x.id === b.dataset.edit);
      // Deep copy so editing doesn't touch storage until saved
      routineView = { mode: "editor", draft: JSON.parse(JSON.stringify(r)) };
      renderRoutines();
    });
  });
  list.querySelectorAll("[data-del]").forEach((b) => {
    b.addEventListener("click", () => {
      const r = getRoutines().find((x) => x.id === b.dataset.del);
      if (confirm(`¿Borrar la rutina "${r.name || "sin nombre"}"?`)) {
        deleteRoutine(b.dataset.del);
        renderRoutines();
      }
    });
  });
}

/* ============================================================
   EDITOR VIEW
   ============================================================ */
function renderRoutineEditor() {
  const el = document.querySelector('[data-screen="routines"]');
  const draft = routineView.draft;
  const allEx = getExercises();

  el.innerHTML = `
    <div class="flex items-center gap-3 mb-4">
      <button id="rt-back" class="text-white/60 text-xl">‹</button>
      <h2 class="text-xl font-extrabold flex-1">Editar rutina</h2>
      <button id="rt-save" class="bg-lime text-ink font-bold text-sm px-4 py-2 rounded-xl active:scale-95 transition">Guardar</button>
    </div>

    <input id="rt-name" type="text" placeholder="Nombre de la rutina (ej. Día de pierna)"
      value="${draft.name}"
      class="w-full bg-panel border border-white/10 rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-lime/60" />

    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-bold text-white/70">Ejercicios (${draft.exercises.length})</h3>
      <button id="rt-add-ex" class="text-lime text-sm font-semibold">+ Añadir ejercicio</button>
    </div>

    <div id="rt-ex-list" class="space-y-3"></div>
  `;

  // Keep name in sync
  el.querySelector("#rt-name").addEventListener("input", (e) => {
    draft.name = e.target.value;
  });

  // Render the exercise rows
  const list = el.querySelector("#rt-ex-list");
  if (draft.exercises.length === 0) {
    list.innerHTML = `<p class="text-center text-white/40 py-8 text-sm">Aún no hay ejercicios.<br>Pulsa "+ Añadir ejercicio".</p>`;
  } else {
    list.innerHTML = draft.exercises
      .map((item, i) => {
        const ex = allEx.find((x) => x.id === item.exerciseId);
        return `
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="font-semibold text-sm">${ex ? ex.name : "Ejercicio"}</p>
            <button data-remove="${i}" class="text-white/30 hover:text-red-400 text-base">✕</button>
          </div>
          <div class="grid grid-cols-4 gap-2 text-center">
            ${numField("Series", "sets", i, item.sets)}
            ${numField("Reps", "reps", i, item.reps)}
            ${numField("Peso(kg)", "weight", i, item.weight)}
            ${numField("Desc.(s)", "rest", i, item.rest)}
          </div>
        </div>`;
      })
      .join("");
  }

  // Number field inputs update the draft live
  list.querySelectorAll("input[data-field]").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const i = Number(e.target.dataset.index);
      const field = e.target.dataset.field;
      draft.exercises[i][field] = Number(e.target.value) || 0;
    });
  });

  // Remove exercise
  list.querySelectorAll("[data-remove]").forEach((b) => {
    b.addEventListener("click", () => {
      draft.exercises.splice(Number(b.dataset.remove), 1);
      renderRoutineEditor();
    });
  });

  // Back to list (without forcing save)
  el.querySelector("#rt-back").addEventListener("click", () => {
    routineView = { mode: "list", draft: null };
    renderRoutines();
  });

  // Save
  el.querySelector("#rt-save").addEventListener("click", () => {
    if (!draft.name.trim()) {
      alert("Ponle un nombre a la rutina antes de guardar.");
      return;
    }
    saveRoutine(draft);
    routineView = { mode: "list", draft: null };
    renderRoutines();
  });

  // Add exercise (opens picker)
  el.querySelector("#rt-add-ex").addEventListener("click", openExercisePicker);
}

function numField(label, field, index, value) {
  return `
    <div>
      <input type="number" min="0" inputmode="numeric"
        data-field="${field}" data-index="${index}" value="${value}"
        class="w-full bg-ink border border-white/10 rounded-lg py-2 text-center text-sm outline-none focus:border-lime/60" />
      <p class="text-[10px] text-white/40 mt-1">${label}</p>
    </div>`;
}

/* ---- Exercise picker (reuses the modal) ---- */
function openExercisePicker() {
  const allEx = getExercises();
  const rows = allEx
    .map(
      (ex) => `
      <button data-pick="${ex.id}" class="w-full p-3 flex items-center gap-3 text-left rounded-xl active:bg-white/5 transition">
        <span class="w-9 h-9 rounded-lg bg-lime/10 flex items-center justify-center text-base shrink-0">🏋️</span>
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-medium truncate">${ex.name}</span>
          <span class="block text-xs text-white/40">${ex.muscle} · ${ex.equipment}</span>
        </span>
      </button>`
    )
    .join("");

  openModal(`
    <h3 class="text-lg font-extrabold mb-3">Añadir ejercicio</h3>
    <div class="max-h-[55vh] overflow-y-auto -mx-2 px-2">${rows}</div>
  `);

  document.querySelectorAll("[data-pick]").forEach((b) => {
    b.addEventListener("click", () => {
      routineView.draft.exercises.push({
        exerciseId: b.dataset.pick,
        sets: 4,
        reps: 10,
        weight: 0,
        rest: 90,
      });
      closeModal();
      renderRoutineEditor();
    });
  });
}
