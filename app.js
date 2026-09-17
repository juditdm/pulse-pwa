const STORAGE_KEY = "pulse_workouts_v1";
const DB_NAME = "pulse_database";
const DB_VERSION = 1;
const STORE_NAME = "workouts";

const navButtons = document.querySelectorAll(".nav-button");
const views = document.querySelectorAll(".view");
const newWorkoutButton = document.querySelector("#new-workout-button");
const closeWorkoutButton = document.querySelector("#close-workout-button");
const workoutForm = document.querySelector("#workout-form");
const exportButton = document.querySelector("#export-button");
const importInput = document.querySelector("#import-input");
const activeWorkoutTitle = document.querySelector("#active-workout-title");
const activeWorkoutMeta = document.querySelector("#active-workout-meta");
const activeExerciseList = document.querySelector("#active-exercise-list");
const finishWorkoutButton = document.querySelector("#finish-workout-button");
const addActiveExerciseButton = document.querySelector("#add-active-exercise-button");
const connectionStatus = document.querySelector("#connection-status");

let workouts = [];
let activeWorkout = null;
let databasePromise = openDatabase();

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function readAllWorkouts() {
    const database = await databasePromise;

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function writeWorkouts(items) {
    const database = await databasePromise;

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.clear();
        items.forEach((item) => store.put(item));
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
    });
}

function loadLegacyWorkouts() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function normaliseWorkouts(items) {
    if (!Array.isArray(items)) return [];

    return items.map((workout) => ({
        id: workout.id || crypto.randomUUID(),
        date: workout.date || workout.dia || today(),
        duration: Number(workout.duration ?? workout.duracion ?? workout.duracion_minutos ?? 0),
        type: workout.type || workout.tipo || "Core",
        exercises: (workout.exercises || workout.ejercicios || []).map((exercise) => ({
            id: exercise.id || crypto.randomUUID(),
            name: exercise.name || exercise.nombre || "Ejercicio",
            notes: exercise.notes || exercise.notas || "",
            sets: (exercise.sets || []).map((set, index) => ({
                id: set.id || crypto.randomUUID(),
                number: Number(set.number ?? set.numero ?? set.numero_set ?? index + 1),
                reps: Number(set.reps ?? set.repeticiones ?? 0),
                weight: Number(set.weight ?? set.peso ?? set.peso_kg ?? 0),
                completed: Boolean(set.completed)
            }))
        }))
    }));
}

async function initialiseStorage() {
    let stored = await readAllWorkouts();

    if (!stored.length) {
        const legacy = normaliseWorkouts(loadLegacyWorkouts());
        if (legacy.length) {
            await writeWorkouts(legacy);
            stored = legacy;
        }
    }

    workouts = normaliseWorkouts(stored);
    await writeWorkouts(workouts);
}

async function persist() {
    await writeWorkouts(workouts);
}

function today() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonth(dateString) {
    const [year, month] = dateString.split("-");
    return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(Number(year), Number(month) - 1, 1));
}

function showView(viewId) {
    views.forEach((view) => {
        view.classList.toggle("hidden-view", view.id !== viewId);
        view.classList.toggle("active-view", view.id === viewId);
    });
    newWorkoutButton.classList.toggle("hidden-view", viewId === "new-workout-view" || viewId === "active-workout-view");
    navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function calculateStats() {
    return {
        sessions: workouts.length,
        minutes: workouts.reduce((total, workout) => total + workout.duration, 0),
        types: new Set(workouts.map((workout) => workout.type)).size
    };
}

function previousPerformance(name, currentWorkoutId) {
    const records = [];

    workouts.forEach((workout) => {
        if (workout.id === currentWorkoutId) return;
        workout.exercises.forEach((exercise) => {
            if (exercise.name.toLowerCase() !== name.toLowerCase()) return;
            exercise.sets.forEach((set) => records.push({ date: workout.date, reps: set.reps, weight: set.weight }));
        });
    });

    records.sort((a, b) => b.date.localeCompare(a.date));
    return records[0] || null;
}

function calculateExerciseSummary() {
    const summary = {};

    workouts.forEach((workout) => {
        workout.exercises.forEach((exercise) => {
            const name = exercise.name.trim();
            if (!name) return;

            if (!summary[name]) summary[name] = { name, sessions: 0, sets: 0, maxWeight: 0, lastDate: "", history: [] };
            summary[name].sessions += 1;
            summary[name].lastDate = workout.date > summary[name].lastDate ? workout.date : summary[name].lastDate;

            exercise.sets.forEach((set) => {
                summary[name].sets += 1;
                summary[name].maxWeight = Math.max(summary[name].maxWeight, set.weight);
                summary[name].history.push({ date: workout.date, weight: set.weight });
            });
        });
    });

    return Object.values(summary).sort((a, b) => b.maxWeight - a.maxWeight || a.name.localeCompare(b.name));
}

function render() {
    const stats = calculateStats();
    document.querySelector("#total-sessions").textContent = stats.sessions;
    document.querySelector("#progress-sessions").textContent = stats.sessions;
    document.querySelector("#progress-minutes").textContent = stats.minutes;
    document.querySelector("#progress-types").textContent = stats.types;
    renderWorkouts();
    renderExerciseSummary();
}

function renderWorkouts() {
    const container = document.querySelector("#workout-list");
    container.innerHTML = "";

    if (!workouts.length) {
        container.innerHTML = `<div class="empty-state">Todavía no hay entrenamientos registrados.</div>`;
        return;
    }

    const groups = {};
    workouts.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach((workout) => {
        const key = workout.date.slice(0, 7);
        if (!groups[key]) groups[key] = [];
        groups[key].push(workout);
    });

    Object.entries(groups).forEach(([monthKey, monthWorkouts]) => {
        const monthSection = document.createElement("section");
        monthSection.className = "month-section";
        monthSection.innerHTML = `<div class="month-heading"><h3>${formatMonth(`${monthKey}-01`)}</h3><span>${monthWorkouts.length} ${monthWorkouts.length === 1 ? "sesión" : "sesiones"}</span></div>`;

        monthWorkouts.forEach((workout) => {
            const card = document.createElement("article");
            card.className = "workout-card";
            const exercisesHtml = workout.exercises.map((exercise) => {
                const setsHtml = exercise.sets.map((set) => `<div class="set-card"><div class="set-card-main"><span class="set-badge">Set ${set.number}</span><div><small>REPS</small><strong>${set.reps}</strong></div><div><small>PESO</small><strong>${set.weight} kg</strong></div></div></div>`).join("");
                const noteHtml = exercise.notes ? `<p class="exercise-note">${escapeHtml(exercise.notes)}</p>` : "";
                return `<div class="exercise-block"><div class="exercise-title"><span>${escapeHtml(exercise.name)}</span><span class="set-count">${exercise.sets.length} sets</span></div>${setsHtml}${noteHtml}</div>`;
            }).join("");

            card.innerHTML = `<div class="workout-header"><div><span class="date-label">${workout.date}</span><h3>${escapeHtml(workout.type)}</h3></div><span class="duration-pill">${workout.duration} min</span></div>${exercisesHtml}`;
            monthSection.appendChild(card);
        });
        container.appendChild(monthSection);
    });
}

function renderExerciseSummary() {
    const container = document.querySelector("#exercise-summary");
    const summary = calculateExerciseSummary();

    if (!summary.length) {
        container.innerHTML = `<p class="muted">Todavía no hay ejercicios.</p>`;
        return;
    }

    container.innerHTML = summary.map((exercise) => {
        const previous = exercise.history.filter((item) => item.weight < exercise.maxWeight).sort((a, b) => b.date.localeCompare(a.date))[0];
        const improvement = previous ? `<span class="progress-up">+${(exercise.maxWeight - previous.weight).toFixed(1)} kg desde ${previous.weight} kg</span>` : `<span>Primer registro o mejor marca inicial</span>`;
        return `<div class="exercise-summary-row"><div><strong>${escapeHtml(exercise.name)}</strong><span>${exercise.sessions} sesiones · ${exercise.sets} sets</span>${improvement}</div><div class="exercise-summary-value"><strong>${exercise.maxWeight} kg</strong><span>máximo</span></div></div>`;
    }).join("");
}

function renderActiveWorkout() {
    activeWorkoutTitle.textContent = activeWorkout.type;
    activeWorkoutMeta.textContent = `${activeWorkout.date} · ${activeWorkout.duration} min`;
    activeExerciseList.innerHTML = "";

    activeWorkout.exercises.forEach((exercise) => {
        const card = document.createElement("article");
        card.className = "active-exercise-card";
        const previous = previousPerformance(exercise.name, activeWorkout.id);
        const previousText = previous ? `Último registro: <strong>${previous.reps} reps · ${previous.weight} kg</strong>` : "Todavía no hay un registro anterior.";

        card.innerHTML = `<div class="active-exercise-title"><h3>${escapeHtml(exercise.name)}</h3><span class="set-count">${exercise.sets.length} sets</span></div><div class="previous-performance">${previousText}</div><div class="active-sets-list"></div><textarea class="active-note" placeholder="Notas del ejercicio">${escapeHtml(exercise.notes)}</textarea><button class="active-add-set" type="button">+ Añadir set</button>`;

        const setsContainer = card.querySelector(".active-sets-list");
        exercise.sets.forEach((set) => appendActiveSet(setsContainer, exercise, set));

        card.querySelector(".active-add-set").addEventListener("click", () => {
            const set = { id: crypto.randomUUID(), number: exercise.sets.length + 1, reps: 0, weight: 0, completed: false };
            exercise.sets.push(set);
            appendActiveSet(setsContainer, exercise, set);
            renumberActiveSets(exercise, setsContainer);
            persistActiveWorkout();
        });

        card.querySelector(".active-note").addEventListener("input", (event) => {
            exercise.notes = event.target.value;
            persistActiveWorkout();
        });

        activeExerciseList.appendChild(card);
    });
}

function appendActiveSet(container, exercise, set) {
    const row = document.createElement("div");
    row.className = "active-set-row";
    row.innerHTML = `<label>SET<input class="active-set-number" type="number" value="${set.number}" readonly></label><label>REPS<input class="active-reps" type="number" min="1" value="${set.reps || ""}" placeholder="10"></label><label>PESO<input class="active-weight" type="number" min="0" step="0.5" value="${set.weight || ""}" placeholder="40"></label><button class="complete-set-button ${set.completed ? "completed" : ""}" type="button">${set.completed ? "✓" : "○"}</button>`;

    row.querySelector(".active-reps").addEventListener("input", (event) => { set.reps = Number(event.target.value); persistActiveWorkout(); });
    row.querySelector(".active-weight").addEventListener("input", (event) => { set.weight = Number(event.target.value); persistActiveWorkout(); });
    row.querySelector(".complete-set-button").addEventListener("click", () => { set.completed = !set.completed; renderActiveWorkout(); persistActiveWorkout(); });
    container.appendChild(row);
}

function renumberActiveSets(exercise, container) {
    exercise.sets.forEach((set, index) => { set.number = index + 1; container.querySelectorAll(".active-set-number")[index].value = index + 1; });
}

function persistActiveWorkout() {
    localStorage.setItem("pulse_active_workout_v1", JSON.stringify(activeWorkout));
}

function loadActiveWorkout() {
    try { return JSON.parse(localStorage.getItem("pulse_active_workout_v1")); } catch { return null; }
}

function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

function readFormExercises() {
    return [];
}

function exportBackup() {
    const file = new Blob([JSON.stringify(workouts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pulse-backup-${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => { try { workouts = normaliseWorkouts(JSON.parse(reader.result)); await persist(); render(); alert("Copia importada correctamente"); } catch { alert("No se ha podido importar el archivo"); } };
    reader.readAsText(file);
}

function startWorkout(event) {
    event.preventDefault();
    activeWorkout = { id: crypto.randomUUID(), date: document.querySelector("#workout-date").value, duration: Number(document.querySelector("#workout-duration").value), type: document.querySelector("#workout-type").value, exercises: [] };
    activeWorkout.exercises.push({ id: crypto.randomUUID(), name: "Nuevo ejercicio", notes: "", sets: [{ id: crypto.randomUUID(), number: 1, reps: 0, weight: 0, completed: false }] });
    persistActiveWorkout();
    renderActiveWorkout();
    showView("active-workout-view");
}

async function finishWorkout() {
    if (!activeWorkout) return;
    const clean = normaliseWorkouts([activeWorkout])[0];
    workouts.push(clean);
    await persist();
    localStorage.removeItem("pulse_active_workout_v1");
    activeWorkout = null;
    render();
    showView("summary-view");
}

navButtons.forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
newWorkoutButton.addEventListener("click", () => showView("new-workout-view"));
closeWorkoutButton.addEventListener("click", () => showView("summary-view"));
workoutForm.addEventListener("submit", startWorkout);
finishWorkoutButton.addEventListener("click", finishWorkout);
exportButton.addEventListener("click", exportBackup);
importInput.addEventListener("change", importBackup);
addActiveExerciseButton.addEventListener("click", () => { activeWorkout.exercises.push({ id: crypto.randomUUID(), name: "Nuevo ejercicio", notes: "", sets: [{ id: crypto.randomUUID(), number: 1, reps: 0, weight: 0, completed: false }] }); renderActiveWorkout(); persistActiveWorkout(); });

async function initialise() {
    try {
        await initialiseStorage();
        activeWorkout = loadActiveWorkout();
        if (activeWorkout) renderActiveWorkout();
        render();
        connectionStatus.textContent = navigator.onLine ? "Online" : "Offline";
    } catch (error) {
        console.error(error);
        connectionStatus.textContent = "Error local";
    }
}

window.addEventListener("online", () => { connectionStatus.textContent = "Online"; });
window.addEventListener("offline", () => { connectionStatus.textContent = "Offline"; });

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}

initialise();