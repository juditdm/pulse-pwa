# Corrección — Nombre del ejercicio

## Qué ocurría

He revisado la fase anterior y tienes razón: había un error.

El ejercicio se creaba automáticamente con el texto:

```text
Nuevo ejercicio
```

pero ese texto se mostraba como un encabezado y no como un campo editable. Por eso no podías escribir el nombre.

La solución es convertir el nombre en un campo de texto editable dentro de cada ejercicio activo.

Ahora podrás:

- Escribir el nombre del ejercicio.
- Cambiarlo después.
- Guardarlo automáticamente.
- Verlo en el historial.
- Usarlo para encontrar el último rendimiento anterior.

El evento `input` permite reaccionar a cada cambio que haces al escribir en un campo de texto. [web:498][web:503]

---

# Paso 1 — Copia de seguridad

Antes de modificar nada:

1. Abre la aplicación.
2. Ve a **Perfil**.
3. Pulsa **Exportar copia de seguridad**.
4. Guarda el archivo JSON.
5. Haz una copia de la carpeta `pulse-pwa`.

---

# Paso 2 — Reemplazar `app.js`

1. Abre la carpeta `pulse-pwa`.
2. Abre el archivo `app.js`.
3. Pulsa `Ctrl + A`.
4. Borra todo.
5. Copia y pega el contenido completo siguiente.
6. Guarda con `Ctrl + S`.

```javascript
const STORAGE_KEY = "pulse_workouts_v1";
const DB_NAME = "pulse_database";
const DB_VERSION = 1;
const STORE_NAME = "workouts";
const ACTIVE_KEY = "pulse_active_workout_v1";

const navButtons = document.querySelectorAll(".nav-button");
const views = document.querySelectorAll(".view");
const newWorkoutButton = document.querySelector("#new-workout-button");
const closeWorkoutButton = document.querySelector("#close-workout-button");
const workoutForm = document.querySelector("#workout-form");
const exportButton = document.querySelector("#export-button");
const importInput = document.querySelector("#import-input");
const activeWorkoutTitle = document.querySelector("#active-workout-title");
const activeWorkoutMeta = document.querySelector("#active-workout-meta");
const activeSaveStatus = document.querySelector("#active-save-status");
const activeExerciseList = document.querySelector("#active-exercise-list");
const finishWorkoutButton = document.querySelector("#finish-workout-button");
const addActiveExerciseButton = document.querySelector("#add-active-exercise-button");
const connectionStatus = document.querySelector("#connection-status");

let workouts = [];
let activeWorkout = null;
let databasePromise = openDatabase();
let saveSequence = Promise.resolve();

function createId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

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
        const request = transaction.objectStore(STORE_NAME).getAll();
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
        id: workout.id || createId(),
        date: workout.date || workout.dia || today(),
        duration: Number(workout.duration ?? workout.duracion ?? workout.duracion_minutos ?? 0),
        type: workout.type || workout.tipo || "Core",
        exercises: (workout.exercises || workout.ejercicios || []).map((exercise) => ({
            id: exercise.id || createId(),
            name: exercise.name || exercise.nombre || "Ejercicio",
            notes: exercise.notes || exercise.notas || "",
            sets: (exercise.sets || []).map((set, index) => ({
                id: set.id || createId(),
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

function persistActiveWorkout() {
    saveSequence = saveSequence.then(async () => {
        activeSaveStatus.textContent = "Guardando...";
        activeSaveStatus.classList.remove("saved");
        activeSaveStatus.classList.add("saving");

        localStorage.setItem(ACTIVE_KEY, JSON.stringify(activeWorkout));

        await new Promise((resolve) => setTimeout(resolve, 120));

        activeSaveStatus.textContent = "Guardado local";
        activeSaveStatus.classList.remove("saving");
        activeSaveStatus.classList.add("saved");
    });

    return saveSequence;
}

function loadActiveWorkout() {
    try {
        return JSON.parse(localStorage.getItem(ACTIVE_KEY));
    } catch {
        return null;
    }
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

    navButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.view === viewId);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function previousPerformance(name, currentWorkoutId) {
    const records = [];

    workouts.forEach((workout) => {
        if (workout.id === currentWorkoutId) return;

        workout.exercises.forEach((exercise) => {
            if (exercise.name.trim().toLowerCase() !== name.trim().toLowerCase()) return;
            exercise.sets.forEach((set) => records.push({ date: workout.date, reps: set.reps, weight: set.weight }));
        });
    });

    records.sort((a, b) => b.date.localeCompare(a.date));
    return records[0] || null;
}

function renderActiveWorkout() {
    if (!activeWorkout) return;

    activeWorkoutTitle.textContent = activeWorkout.type;
    activeWorkoutMeta.textContent = `${activeWorkout.date} · ${activeWorkout.duration} min`;
    activeExerciseList.innerHTML = "";

    activeWorkout.exercises.forEach((exercise) => {
        const card = document.createElement("article");
        card.className = "active-exercise-card";

        const previous = previousPerformance(exercise.name, activeWorkout.id);
        const previousText = previous
            ? `Último registro: <strong>${previous.reps} reps · ${previous.weight} kg</strong>`
            : "Escribe el nombre para consultar el último registro.";

        card.innerHTML = `
            <div class="active-exercise-title">
                <label class="exercise-name-field">
                    <span>NOMBRE DEL EJERCICIO</span>
                    <input class="active-exercise-name" type="text" value="${escapeHtml(exercise.name === "Nuevo ejercicio" ? "" : exercise.name)}" placeholder="Ej. Press banca" autocomplete="off">
                </label>
                <div class="active-exercise-actions">
                    <span class="set-count">${exercise.sets.length} sets</span>
                    <button class="remove-active-exercise" type="button">Eliminar</button>
                </div>
            </div>
            <div class="previous-performance">${previousText}</div>
            <div class="active-sets-list"></div>
            <textarea class="active-note" placeholder="Notas del ejercicio">${escapeHtml(exercise.notes)}</textarea>
            <button class="active-add-set" type="button">+ Añadir set</button>
        `;

        const setsContainer = card.querySelector(".active-sets-list");
        exercise.sets.forEach((set) => appendActiveSet(setsContainer, exercise, set));

        const exerciseNameInput = card.querySelector(".active-exercise-name");
        exerciseNameInput.addEventListener("input", async (event) => {
            exercise.name = event.target.value.trim();
            const currentPrevious = previousPerformance(exercise.name, activeWorkout.id);
            const previousElement = card.querySelector(".previous-performance");
            previousElement.innerHTML = currentPrevious
                ? `Último registro: <strong>${currentPrevious.reps} reps · ${currentPrevious.weight} kg</strong>`
                : "No hay un registro anterior para este ejercicio.";
            await persistActiveWorkout();
        });

        card.querySelector(".remove-active-exercise").addEventListener("click", async () => {
            activeWorkout.exercises = activeWorkout.exercises.filter((item) => item.id !== exercise.id);
            await persistActiveWorkout();
            renderActiveWorkout();
        });

        card.querySelector(".active-add-set").addEventListener("click", async () => {
            exercise.sets.push({ id: createId(), number: exercise.sets.length + 1, reps: 0, weight: 0, completed: false });
            await persistActiveWorkout();
            renderActiveWorkout();
        });

        card.querySelector(".active-note").addEventListener("input", async (event) => {
            exercise.notes = event.target.value;
            await persistActiveWorkout();
        });

        activeExerciseList.appendChild(card);
    });
}

function appendActiveSet(container, exercise, set) {
    const row = document.createElement("div");
    row.className = "active-set-row";

    row.innerHTML = `
        <label>SET<input class="active-set-number" type="number" value="${set.number}" readonly></label>
        <label>REPS<input class="active-reps" type="number" min="1" value="${set.reps || ""}" placeholder="10"></label>
        <label>PESO<input class="active-weight" type="number" min="0" step="0.5" value="${set.weight || ""}" placeholder="40"></label>
        <button class="complete-set-button ${set.completed ? "completed" : ""}" type="button">${set.completed ? "✓" : "○"}</button>
    `;

    row.querySelector(".active-reps").addEventListener("input", async (event) => {
        set.reps = Number(event.target.value);
        await persistActiveWorkout();
    });

    row.querySelector(".active-weight").addEventListener("input", async (event) => {
        set.weight = Number(event.target.value);
        await persistActiveWorkout();
    });

    row.querySelector(".complete-set-button").addEventListener("click", async () => {
        set.completed = !set.completed;
        await persistActiveWorkout();
        renderActiveWorkout();
    });

    container.appendChild(row);
}

function calculateStats() {
    return {
        sessions: workouts.length,
        minutes: workouts.reduce((total, workout) => total + workout.duration, 0),
        types: new Set(workouts.map((workout) => workout.type)).size
    };
}

function calculateExerciseSummary() {
    const summary = {};

    workouts.forEach((workout) => {
        workout.exercises.forEach((exercise) => {
            const name = exercise.name.trim();
            if (!name) return;

            if (!summary[name]) summary[name] = { name, sessions: 0, sets: 0, maxWeight: 0, history: [] };

            summary[name].sessions += 1;

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
        const section = document.createElement("section");
        section.className = "month-section";
        section.innerHTML = `<div class="month-heading"><h3>${formatMonth(`${monthKey}-01`)}</h3><span>${monthWorkouts.length} ${monthWorkouts.length === 1 ? "sesión" : "sesiones"}</span></div>`;

        monthWorkouts.forEach((workout) => {
            const card = document.createElement("article");
            card.className = "workout-card";

            const exercisesHtml = workout.exercises.map((exercise) => {
                const setsHtml = exercise.sets.map((set) => `
                    <div class="set-card">
                        <div class="set-card-main">
                            <span class="set-badge">Set ${set.number}</span>
                            <div><small>REPS</small><strong>${set.reps}</strong></div>
                            <div><small>PESO</small><strong>${set.weight} kg</strong></div>
                        </div>
                    </div>
                `).join("");

                const noteHtml = exercise.notes ? `<p class="exercise-note">${escapeHtml(exercise.notes)}</p>` : "";

                return `<div class="exercise-block"><div class="exercise-title"><span>${escapeHtml(exercise.name)}</span><span class="set-count">${exercise.sets.length} sets</span></div>${setsHtml}${noteHtml}</div>`;
            }).join("");

            card.innerHTML = `<div class="workout-header"><div><span class="date-label">${workout.date}</span><h3>${escapeHtml(workout.type)}</h3></div><span class="duration-pill">${workout.duration} min</span></div>${exercisesHtml}`;
            section.appendChild(card);
        });

        container.appendChild(section);
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

function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
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
    reader.onload = async () => {
        try {
            workouts = normaliseWorkouts(JSON.parse(reader.result));
            await persist();
            render();
            alert("Copia importada correctamente");
        } catch {
            alert("No se ha podido importar el archivo");
        }
    };
    reader.readAsText(file);
}

function startWorkout(event) {
    event.preventDefault();

    activeWorkout = {
        id: createId(),
        date: document.querySelector("#workout-date").value,
        duration: Number(document.querySelector("#workout-duration").value),
        type: document.querySelector("#workout-type").value,
        exercises: [{
            id: createId(),
            name: "",
            notes: "",
            sets: [{ id: createId(), number: 1, reps: 0, weight: 0, completed: false }]
        }]
    };

    persistActiveWorkout();
    renderActiveWorkout();
    showView("active-workout-view");
}

async function finishWorkout() {
    if (!activeWorkout) return;

    await saveSequence;

    const clean = normaliseWorkouts([activeWorkout])[0];
    workouts.push(clean);
    await persist();
    localStorage.removeItem(ACTIVE_KEY);
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

addActiveExerciseButton.addEventListener("click", async () => {
    activeWorkout.exercises.push({
        id: createId(),
        name: "",
        notes: "",
        sets: [{ id: createId(), number: 1, reps: 0, weight: 0, completed: false }]
    });

    await persistActiveWorkout();
    renderActiveWorkout();
});

async function initialise() {
    try {
        await initialiseStorage();
        activeWorkout = loadActiveWorkout();

        if (activeWorkout) {
            renderActiveWorkout();
        }

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
```

---

# Paso 3 — Añadir estilos del nombre

1. Abre `styles.css`.
2. No borres el contenido.
3. Ve al final del archivo.
4. Copia y pega:

```css
.exercise-name-field {
    display: block;
    flex: 1;
    min-width: 0;
}

.exercise-name-field span {
    display: block;
    margin-bottom: 6px;
    color: var(--muted);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 1px;
}

.active-exercise-name {
    width: 100%;
    min-width: 0;
    padding: 11px 12px;
    border: 1px solid var(--border);
    border-radius: 11px;
    background: #fbfcfa;
    color: var(--ink);
    font-size: 16px;
    font-weight: 800;
}

.active-exercise-name::placeholder {
    color: #aab3ad;
    font-weight: 500;
}

.active-exercise-name:focus {
    border-color: var(--dark-green);
    outline: none;
    background: #f7faf6;
}

@media (max-width: 540px) {
    .active-exercise-title {
        display: block;
    }

    .active-exercise-actions {
        flex-direction: row;
        justify-content: flex-end;
        margin-top: 10px;
    }
}
```

4. Guarda con `Ctrl + S`.

---

# Paso 4 — Actualizar `service-worker.js`

1. Abre `service-worker.js`.
2. Busca:

```javascript
const CACHE_NAME = "pulse-static-v4";
```

3. Sustitúyelo por:

```javascript
const CACHE_NAME = "pulse-static-v5";
```

4. No cambies ninguna otra línea.
5. Guarda con `Ctrl + S`.

---

# Paso 5 — Probar en local

Dentro de la carpeta `pulse-pwa`, ejecuta:

```powershell
python -m http.server 8000
```

Abre:

```text
http://127.0.0.1:8000
```

## Prueba principal

1. Pulsa **+ Nueva sesión**.
2. Completa día, duración y tipo.
3. Pulsa **Iniciar entrenamiento**.
4. Comprueba que aparece el campo:

```text
NOMBRE DEL EJERCICIO
```

5. Escribe, por ejemplo:

```text
Press banca
```

6. Comprueba que el nombre permanece visible.
7. Introduce reps y peso.
8. Pulsa `✓`.
9. Añade otro ejercicio.
10. Escribe:

```text
Remo con mancuerna
```

11. Escribe una nota.
12. Recarga la página.
13. Comprueba que ambos nombres siguen guardados.
14. Finaliza la sesión.
15. Ve a **Resumen**.
16. Comprueba que aparecen los nombres reales.

## Prueba del último registro

1. Inicia una nueva sesión.
2. Escribe exactamente el nombre de un ejercicio anterior.
3. Comprueba que aparece el último registro:

```text
Último registro: 10 reps · 40 kg
```

---

# Paso 6 — Limpiar caché si sigue apareciendo la versión antigua

Si después de sustituir los archivos sigue apareciendo `Nuevo ejercicio` sin campo de texto:

1. Abre la aplicación.
2. Pulsa `F12`.
3. Ve a **Application**.
4. Entra en **Storage**.
5. Pulsa **Clear site data**.
6. Cierra las herramientas.
7. Recarga con `Ctrl + F5`.

Antes de borrar datos, confirma que tienes la copia JSON exportada.

Si usas la aplicación instalada en el iPhone, abre la versión web una vez con conexión para que descargue la caché `v5`.

---

# Paso 7 — Subir a GitHub Desktop

1. Comprueba primero que el nombre del ejercicio funciona.
2. Exporta una copia de seguridad.
3. Abre GitHub Desktop.
4. Escribe:

```text
Corregir nombre editable de ejercicios
```

5. Pulsa **Commit to main**.
6. Pulsa **Push origin**.

---

# Resultado esperado

En cada ejercicio de una sesión activa debe aparecer un campo similar a:

```text
NOMBRE DEL EJERCICIO
[ Press banca                         ]
```

El nombre se guarda mientras escribes, se conserva tras recargar y aparece correctamente en Resumen y Progreso.
