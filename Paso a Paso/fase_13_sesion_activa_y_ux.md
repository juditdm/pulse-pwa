# Fase 13 — Versión estable completa de Pulse

## Qué vamos a corregir

La versión anterior tenía un problema importante: el nombre del ejercicio se mostraba como un campo visual, pero la sesión no ofrecía una forma suficientemente clara y fiable de crear ejercicios desde cero.

En esta versión se corrige la estructura completa:

- El ejercicio nuevo empieza sin nombre.
- El nombre se escribe en un campo visible y editable.
- Se puede añadir un ejercicio usando un formulario emergente sencillo.
- El ejercicio solo se añade cuando confirmas el nombre.
- Se pueden añadir sets.
- Se pueden editar reps y peso.
- Se pueden eliminar sets.
- Se pueden marcar sets con `✓`.
- Se pueden eliminar ejercicios.
- Se pueden escribir notas por ejercicio.
- Se conservan los datos al recargar.
- Se mantiene la migración desde versiones anteriores.
- Se mantienen las sesiones existentes.
- Se mantiene la exportación e importación.
- No se añade temporizador.
- No se añade nota general.

Esta versión sustituye por completo la anterior y evita que queden fragmentos incompatibles.

---

# Paso 1 — Copia de seguridad

Antes de cambiar los archivos:

1. Abre la aplicación actual.
2. Ve a **Perfil**.
3. Pulsa **Exportar copia de seguridad**.
4. Guarda el archivo JSON.
5. Haz una copia de la carpeta `pulse-pwa`.
6. No borres los datos del navegador.

---

# Paso 2 — Reemplazar `index.html`

1. Abre `index.html`.
2. Pulsa `Ctrl + A`.
3. Borra todo.
4. Copia y pega este archivo completo:

```html
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#f5f4f0">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Pulse">
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="icon.svg">
    <link rel="stylesheet" href="styles.css">
    <title>Pulse Training</title>
</head>
<body>
    <main class="app-shell">
        <header class="topbar">
            <div>
                <p class="eyebrow">TRAINING LOG</p>
                <h1>Pulse</h1>
            </div>
            <div class="connection-status" id="connection-status">Local</div>
        </header>

        <section id="summary-view" class="view active-view">
            <section class="summary-header premium-surface">
                <div>
                    <p class="eyebrow">TU HISTORIAL</p>
                    <h2>Entrenamientos</h2>
                    <p class="muted">Tu progreso, sesión a sesión.</p>
                </div>
                <div class="summary-count">
                    <strong id="total-sessions">0</strong>
                    <span>sesiones</span>
                </div>
            </section>
            <div id="workout-list"></div>
        </section>

        <section id="progress-view" class="view hidden-view">
            <section class="section-heading">
                <div>
                    <p class="eyebrow">ANÁLISIS</p>
                    <h2>Tu progreso</h2>
                </div>
            </section>
            <div class="progress-highlight premium-surface">
                <p class="eyebrow">MEJORES MARCAS</p>
                <h3>Tu peso máximo por ejercicio</h3>
                <p class="muted">La evolución que puedes aplicar en la próxima sesión.</p>
            </div>
            <div class="progress-card premium-surface">
                <div id="exercise-summary"></div>
            </div>
            <div class="progress-card premium-surface">
                <p class="eyebrow">CONSTANCIA</p>
                <div class="consistency-grid">
                    <div><strong id="progress-sessions">0</strong><span>sesiones</span></div>
                    <div><strong id="progress-minutes">0</strong><span>minutos</span></div>
                    <div><strong id="progress-types">0</strong><span>tipos usados</span></div>
                </div>
            </div>
        </section>

        <section id="profile-view" class="view hidden-view">
            <section class="section-heading">
                <div>
                    <p class="eyebrow">PERSONAL</p>
                    <h2>Perfil</h2>
                </div>
            </section>
            <div class="profile-card premium-surface">
                <div class="avatar">PT</div>
                <h3>Tu perfil de entrenamiento</h3>
                <p class="muted">Tus sesiones se guardan localmente en este dispositivo.</p>
            </div>
            <div class="profile-actions">
                <button class="secondary-button" id="export-button" type="button">Exportar copia de seguridad</button>
                <label class="secondary-button file-button">
                    Importar copia de seguridad
                    <input id="import-input" type="file" accept="application/json">
                </label>
            </div>
        </section>

        <section id="new-workout-view" class="view hidden-view">
            <section class="section-heading">
                <div>
                    <p class="eyebrow">NUEVO REGISTRO</p>
                    <h2>Iniciar sesión</h2>
                </div>
                <button id="close-workout-button" class="text-button" type="button">Cerrar</button>
            </section>

            <form id="workout-form" class="workout-form premium-surface">
                <label>
                    Día
                    <input id="workout-date" type="date" required>
                </label>
                <label>
                    Duración estimada, minutos
                    <input id="workout-duration" type="number" min="1" placeholder="60" required>
                </label>
                <label>
                    Tipo de entrenamiento
                    <select id="workout-type" required>
                        <option value="">Selecciona una opción</option>
                        <option>Tren superior</option>
                        <option>Tren inferior</option>
                        <option>Core</option>
                    </select>
                </label>
                <button class="primary-button" type="submit">Iniciar entrenamiento</button>
            </form>
        </section>

        <section id="active-workout-view" class="view hidden-view">
            <section class="active-header premium-surface">
                <div>
                    <p class="eyebrow">SESIÓN ACTIVA</p>
                    <h2 id="active-workout-title">Entrenamiento</h2>
                    <span class="muted" id="active-workout-meta"></span>
                    <span class="save-status" id="active-save-status">Guardado local</span>
                </div>
                <button id="finish-workout-button" class="text-button" type="button">Finalizar</button>
            </section>

            <div id="active-exercise-list"></div>

            <button id="add-active-exercise-button" class="secondary-button" type="button">+ Añadir ejercicio</button>
        </section>

        <dialog id="exercise-dialog" class="exercise-dialog">
            <form id="exercise-form" method="dialog" class="exercise-dialog-card">
                <p class="eyebrow">NUEVO EJERCICIO</p>
                <h2>Añadir ejercicio</h2>
                <p class="muted">Escribe el nombre para poder registrarlo.</p>
                <label>
                    Nombre del ejercicio
                    <input id="exercise-name-input" type="text" autocomplete="off" placeholder="Ejemplo: Press banca" required>
                </label>
                <div class="dialog-actions">
                    <button id="cancel-exercise-button" class="secondary-button" type="button">Cancelar</button>
                    <button class="primary-button" type="submit">Añadir ejercicio</button>
                </div>
            </form>
        </dialog>

        <button class="primary-button floating-action" id="new-workout-button" type="button">+ Nueva sesión</button>

        <nav class="bottom-nav">
            <button class="nav-button active" data-view="summary-view" type="button">Resumen</button>
            <button class="nav-button" data-view="progress-view" type="button">Progreso</button>
            <button class="nav-button" data-view="profile-view" type="button">Perfil</button>
        </nav>
    </main>

    <script src="app.js"></script>
</body>
</html>
```

5. Guarda con `Ctrl + S`.

---

# Paso 3 — Reemplazar `styles.css`

1. Abre `styles.css`.
2. Pulsa `Ctrl + A`.
3. Borra todo.
4. Copia y pega este archivo completo:

```css
:root {
    --background: #f5f4f0;
    --card: #ffffff;
    --ink: #18211c;
    --muted: #87918a;
    --green: #c6dfcc;
    --dark-green: #315d47;
    --border: #e2e7e2;
    --danger: #a45555;
    --shadow: 0 18px 45px rgba(34, 52, 40, .08);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--background); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; touch-action: pan-y; }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; -webkit-tap-highlight-color: transparent; }

.app-shell { width: min(100%, 780px); margin: auto; padding: max(25px, env(safe-area-inset-top)) 15px calc(110px + env(safe-area-inset-bottom)); }
.topbar, .section-heading, .summary-header, .active-header, .bottom-nav { display: flex; align-items: center; justify-content: space-between; }
.eyebrow { margin: 0 0 7px; color: var(--dark-green); font-size: 10px; font-weight: 900; letter-spacing: 2px; }
h1 { margin: 0; font-size: 40px; letter-spacing: -2px; }
h2, h3, p { margin-top: 0; }
h2 { margin-bottom: 0; font-size: 23px; letter-spacing: -.6px; }
h3 { margin-bottom: 0; font-size: 19px; }
.muted { color: var(--muted); }
.connection-status { padding: 7px 10px; border: 1px solid var(--border); border-radius: 10px; background: rgba(255, 255, 255, .65); color: var(--dark-green); font-size: 11px; font-weight: 800; }
.premium-surface { border: 1px solid var(--border); border-radius: 24px; background: rgba(255, 255, 255, .88); box-shadow: var(--shadow); }

.summary-header { margin: 28px 0 22px; padding: 23px; }
.summary-header h2 { font-size: 26px; }
.summary-header p:last-child { margin: 8px 0 0; font-size: 13px; }
.summary-count { text-align: right; }
.summary-count strong { display: block; color: var(--dark-green); font-size: 32px; }
.summary-count span { color: var(--muted); font-size: 11px; }
.month-section { margin-bottom: 28px; }
.month-heading { display: flex; align-items: baseline; justify-content: space-between; margin: 28px 2px 12px; }
.month-heading h3 { color: var(--dark-green); font-size: 16px; }
.month-heading span { color: var(--muted); font-size: 12px; }
.workout-card { margin-bottom: 12px; padding: 19px; border: 1px solid var(--border); border-radius: 22px; background: var(--card); }
.workout-header { display: flex; align-items: center; justify-content: space-between; }
.date-label { color: var(--muted); font-size: 13px; font-weight: 700; }
.duration-pill, .set-count { padding: 7px 9px; border-radius: 9px; background: #edf5ee; color: var(--dark-green); font-size: 11px; font-weight: 800; }
.exercise-block { margin-top: 19px; padding-top: 15px; border-top: 1px solid var(--border); }
.exercise-title { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 9px; font-size: 15px; font-weight: 800; }
.set-card { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; padding: 11px; border: 1px solid var(--border); border-radius: 14px; background: #fbfcfa; }
.set-card-main { display: grid; grid-template-columns: auto repeat(2, 1fr); align-items: center; gap: 9px; width: 100%; }
.set-card small { display: block; color: var(--muted); font-size: 9px; font-weight: 800; }
.set-card strong { display: block; margin-top: 3px; font-size: 13px; white-space: nowrap; }
.set-badge { padding: 7px 8px; border-radius: 9px; background: var(--green); color: var(--dark-green); font-size: 10px; font-weight: 800; }

.primary-button { width: 100%; margin-top: 10px; padding: 15px; border: 0; border-radius: 15px; background: var(--ink); color: #fff; font-weight: 850; }
.floating-action { margin-top: 18px; }
.secondary-button { display: block; width: 100%; padding: 13px; border: 1px solid var(--dark-green); border-radius: 14px; background: transparent; color: var(--dark-green); text-align: center; font-weight: 800; }
.text-button { min-height: 38px; padding: 8px 10px; border: 0; border-radius: 10px; background: transparent; color: var(--dark-green); font-size: 13px; font-weight: 800; }
.bottom-nav { position: fixed; right: 50%; bottom: max(15px, env(safe-area-inset-bottom)); width: calc(100% - 30px); max-width: 740px; padding: 11px 10px; transform: translateX(50%); border: 1px solid var(--border); border-radius: 18px; background: rgba(255, 255, 255, .94); box-shadow: var(--shadow); backdrop-filter: blur(12px); z-index: 10; }
.nav-button { min-height: 38px; padding: 8px 12px; border: 0; border-radius: 10px; background: transparent; color: var(--muted); font-size: 12px; font-weight: 700; }
.nav-button.active { background: #edf5ee; color: var(--dark-green); }
.hidden-view { display: none !important; }
.view { animation: appear .25s ease; }
@keyframes appear { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.progress-highlight { margin-bottom: 16px; padding: 23px; background: var(--green); }
.progress-highlight h3, .progress-highlight .eyebrow { color: var(--dark-green); }
.progress-highlight p:last-child { margin-bottom: 0; color: var(--dark-green); }
.progress-card, .profile-card { margin-bottom: 16px; padding: 21px; }
.exercise-summary-row { display: flex; justify-content: space-between; gap: 10px; padding: 15px 0; border-bottom: 1px solid var(--border); }
.exercise-summary-row:last-child { border-bottom: 0; }
.exercise-summary-row strong { font-size: 14px; }
.exercise-summary-row span { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; }
.exercise-summary-value { text-align: right; }
.exercise-summary-value strong { color: var(--dark-green); font-size: 18px; }
.progress-up { color: var(--dark-green) !important; font-weight: 800; }
.consistency-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-top: 16px; }
.consistency-grid div { padding: 13px 8px; border-radius: 14px; background: #f6f8f5; text-align: center; }
.consistency-grid strong { display: block; color: var(--dark-green); font-size: 21px; }
.consistency-grid span { display: block; margin-top: 4px; color: var(--muted); font-size: 10px; }
.avatar { display: grid; width: 50px; height: 50px; margin-bottom: 17px; place-items: center; border-radius: 16px; background: var(--green); color: var(--dark-green); font-weight: 800; }
.profile-actions { display: grid; gap: 12px; }
.file-button { cursor: pointer; }
.file-button input { display: none; }

.active-header { margin-bottom: 18px; padding: 21px; }
.active-header h2 { margin-bottom: 5px; }
.save-status { display: block; margin-top: 8px; color: var(--dark-green); font-size: 11px; font-weight: 800; }
.save-status.saving { color: #9b7b35; }
.save-status.saved { color: var(--dark-green); }
.active-exercise-card { margin-bottom: 14px; padding: 18px; border: 1px solid var(--border); border-radius: 22px; background: var(--card); box-shadow: var(--shadow); }
.active-exercise-title { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
.active-exercise-actions { display: flex; align-items: center; gap: 7px; }
.remove-active-exercise { min-height: 34px; padding: 6px 9px; border: 0; border-radius: 9px; background: #fbeaea; color: var(--danger); font-size: 11px; font-weight: 800; }
.exercise-name-input { display: block; width: 100%; margin: 0 0 12px; padding: 13px; border: 1px solid var(--border); border-radius: 12px; background: #fbfcfa; color: var(--ink); font-size: 17px; font-weight: 800; }
.exercise-name-input:focus { border-color: var(--dark-green); outline: none; background: #f7faf6; }
.exercise-name-input::placeholder { color: var(--muted); font-weight: 600; }
.previous-performance { margin-bottom: 13px; padding: 10px 12px; border-radius: 12px; background: #f5f8f4; color: var(--muted); font-size: 12px; }
.previous-performance strong { color: var(--dark-green); }
.active-set-row { display: grid; grid-template-columns: auto 1fr 1fr 42px; align-items: end; gap: 7px; margin-bottom: 8px; }
.active-set-row input { display: block; width: 100%; margin-top: 6px; padding: 11px 8px; border: 1px solid var(--border); border-radius: 11px; background: #fbfcfa; font-size: 16px; }
.active-set-row input[readonly] { background: #edf5ee; color: var(--dark-green); font-weight: 800; text-align: center; }
.complete-set-button { width: 42px; height: 44px; border: 1px solid var(--border); border-radius: 11px; background: #fff; color: var(--muted); font-size: 20px; transition: transform .15s ease, background .15s ease; }
.complete-set-button.completed { border-color: var(--dark-green); background: var(--green); color: var(--dark-green); }
.complete-set-button:active { transform: scale(.92); }
.active-add-set { margin-top: 8px; border: 0; background: transparent; color: var(--dark-green); font-size: 13px; font-weight: 800; }
.active-note { width: 100%; min-height: 55px; margin-top: 12px; padding: 11px; border: 1px solid var(--border); border-radius: 11px; background: #fbfcfa; font-size: 16px; resize: vertical; }
.active-note:focus { border-color: var(--dark-green); outline: none; background: #f7faf6; }

.workout-form { display: grid; gap: 15px; padding: 21px; }
.workout-form label, .exercise-dialog-card label { display: block; color: var(--muted); font-size: 13px; font-weight: 700; }
.workout-form input, .workout-form select, .exercise-dialog-card input { display: block; width: 100%; margin-top: 7px; padding: 13px; border: 1px solid var(--border); border-radius: 12px; background: #fbfcfa; font-size: 16px; }
.empty-state { padding: 35px 20px; border: 1px dashed var(--border); border-radius: 20px; color: var(--muted); text-align: center; }
.exercise-note { margin: 12px 0 0; padding: 10px 12px; border-left: 3px solid var(--green); color: var(--muted); font-size: 12px; font-style: italic; }

.exercise-dialog { width: min(calc(100% - 30px), 430px); padding: 0; border: 0; border-radius: 24px; background: transparent; }
.exercise-dialog::backdrop { background: rgba(24, 33, 28, .35); backdrop-filter: blur(4px); }
.exercise-dialog-card { padding: 24px; border: 1px solid var(--border); border-radius: 24px; background: var(--card); box-shadow: var(--shadow); }
.exercise-dialog-card h2 { margin-bottom: 8px; }
.exercise-dialog-card p.muted { margin-bottom: 18px; font-size: 13px; }
.dialog-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; }
.dialog-actions .primary-button { margin-top: 0; }

@media (max-width: 540px) {
    .app-shell { padding-right: 15px; padding-left: 15px; }
    h1 { font-size: 39px; }
    .set-card-main { grid-template-columns: auto repeat(2, 1fr); gap: 7px; }
    .set-card strong { font-size: 12px; }
    .consistency-grid strong { font-size: 18px; }
    .active-set-row { grid-template-columns: auto 1fr 1fr 42px; }
    .active-exercise-title { align-items: flex-start; }
    .active-exercise-actions { flex-direction: column; align-items: flex-end; }
}
```

5. Guarda con `Ctrl + S`.

---

# Paso 4 — Reemplazar `app.js`

1. Abre `app.js`.
2. Pulsa `Ctrl + A`.
3. Borra todo.
4. Copia y pega este archivo completo:

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
const exerciseDialog = document.querySelector("#exercise-dialog");
const exerciseForm = document.querySelector("#exercise-form");
const exerciseNameInput = document.querySelector("#exercise-name-input");
const cancelExerciseButton = document.querySelector("#cancel-exercise-button");

let workouts = [];
let activeWorkout = null;
let databasePromise = openDatabase();
let saveSequence = Promise.resolve();

function createId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
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
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
            items.forEach((item) => store.put(item));
        };

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
            name: cleanExerciseName(exercise.name || exercise.nombre || "Nuevo ejercicio"),
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

function cleanExerciseName(name) {
    const value = String(name ?? "").trim();
    return value || "Nuevo ejercicio";
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
        if (!activeWorkout) return;

        activeSaveStatus.textContent = "Guardando...";
        activeSaveStatus.classList.remove("saved");
        activeSaveStatus.classList.add("saving");

        localStorage.setItem(ACTIVE_KEY, JSON.stringify(activeWorkout));
        await new Promise((resolve) => setTimeout(resolve, 80));

        activeSaveStatus.textContent = "Guardado local";
        activeSaveStatus.classList.remove("saving");
        activeSaveStatus.classList.add("saved");
    });

    return saveSequence;
}

function loadActiveWorkout() {
    try {
        const stored = JSON.parse(localStorage.getItem(ACTIVE_KEY));
        if (!stored) return null;
        return normaliseWorkouts([stored])[0];
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
    const cleanName = name.trim().toLowerCase();
    if (!cleanName || cleanName === "nuevo ejercicio") return null;

    const records = [];

    workouts.forEach((workout) => {
        if (workout.id === currentWorkoutId) return;

        workout.exercises.forEach((exercise) => {
            if (exercise.name.trim().toLowerCase() !== cleanName) return;
            exercise.sets.forEach((set) => records.push({ date: workout.date, reps: set.reps, weight: set.weight }));
        });
    });

    records.sort((a, b) => b.date.localeCompare(a.date));
    return records[0] || null;
}

function addExerciseWithName(name) {
    const cleanName = String(name || "").trim();
    if (!cleanName || !activeWorkout) return false;

    activeWorkout.exercises.push({
        id: createId(),
        name: cleanName,
        notes: "",
        sets: [{ id: createId(), number: 1, reps: 0, weight: 0, completed: false }]
    });

    return true;
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
        const previousText = previous ? `Último registro: <strong>${previous.reps} reps · ${previous.weight} kg</strong>` : "Todavía no hay un registro anterior.";

        card.innerHTML = `
            <div class="active-exercise-title">
                <h3>${escapeHtml(exercise.name)}</h3>
                <div class="active-exercise-actions">
                    <span class="set-count">${exercise.sets.length} sets</span>
                    <button class="rename-active-exercise" type="button">Editar nombre</button>
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

        card.querySelector(".rename-active-exercise").addEventListener("click", () => {
            const newName = window.prompt("Nombre del ejercicio", exercise.name === "Nuevo ejercicio" ? "" : exercise.name);
            if (newName === null) return;

            const cleanName = newName.trim();
            if (!cleanName) {
                window.alert("Escribe un nombre para el ejercicio.");
                return;
            }

            exercise.name = cleanName;
            persistActiveWorkout();
            renderActiveWorkout();
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
        <button class="remove-set-button" type="button" aria-label="Eliminar set">×</button>
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

    row.querySelector(".remove-set-button").addEventListener("click", async () => {
        if (exercise.sets.length === 1) {
            window.alert("Debe quedar al menos un set. Puedes dejar sus campos vacíos.");
            return;
        }

        exercise.sets = exercise.sets.filter((item) => item.id !== set.id);
        exercise.sets.forEach((item, index) => { item.number = index + 1; });
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
            if (!name || name === "Nuevo ejercicio") return;

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
            window.alert("Copia importada correctamente");
        } catch {
            window.alert("No se ha podido importar el archivo");
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
        exercises: []
    };

    persistActiveWorkout();
    renderActiveWorkout();
    showView("active-workout-view");
    openExerciseDialog();
}

function openExerciseDialog() {
    exerciseNameInput.value = "";
    exerciseDialog.showModal();
    window.setTimeout(() => exerciseNameInput.focus(), 50);
}

function closeExerciseDialog() {
    if (exerciseDialog.open) exerciseDialog.close();
}

async function finishWorkout() {
    if (!activeWorkout) return;

    if (!activeWorkout.exercises.length) {
        window.alert("Añade al menos un ejercicio antes de finalizar la sesión.");
        return;
    }

    const invalidExercise = activeWorkout.exercises.find((exercise) => !exercise.name.trim() || exercise.name === "Nuevo ejercicio");
    if (invalidExercise) {
        window.alert("Todos los ejercicios deben tener un nombre.");
        return;
    }

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

addActiveExerciseButton.addEventListener("click", openExerciseDialog);
cancelExerciseButton.addEventListener("click", closeExerciseDialog);

exerciseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = exerciseNameInput.value.trim();
    if (!name || !activeWorkout) return;

    addExerciseWithName(name);
    await persistActiveWorkout();
    renderActiveWorkout();
    closeExerciseDialog();
});

exerciseDialog.addEventListener("click", (event) => {
    if (event.target === exerciseDialog) closeExerciseDialog();
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

5. Guarda con `Ctrl + S`.

---

# Paso 5 — Actualizar el service worker

1. Abre `service-worker.js`.
2. Busca la línea del nombre de caché.
3. Sustituye el valor actual por:

```javascript
const CACHE_NAME = "pulse-static-v6";
```

4. Guarda con `Ctrl + S`.
5. No cambies el resto del archivo.

---

# Paso 6 — Reiniciar correctamente la aplicación

Para evitar que el navegador siga usando la versión antigua:

1. Cierra todas las pestañas de Pulse.
2. Detén el servidor con `Ctrl + C`.
3. Vuelve a iniciar:

```powershell
python -m http.server 8000
```

4. Abre:

```text
http://127.0.0.1:8000
```

5. Haz una recarga forzada con:

```text
Ctrl + F5
```

Si sigues viendo el diseño antiguo:

1. Pulsa `F12`.
2. Abre **Application**.
3. Entra en **Service Workers**.
4. Pulsa **Unregister**.
5. Entra en **Storage**.
6. Pulsa **Clear site data** solamente si ya has guardado el JSON de seguridad.
7. Recarga con `Ctrl + F5`.
8. Importa de nuevo la copia JSON desde **Perfil** si fuese necesario.

---

# Paso 7 — Prueba completa de la aplicación

## A. Resumen

1. Abre **Resumen**.
2. Comprueba que las sesiones antiguas aparecen.
3. Comprueba que están agrupadas por mes.
4. Comprueba que se ven ejercicios, sets, reps y peso.

## B. Crear sesión

1. Pulsa **+ Nueva sesión**.
2. Completa el día.
3. Completa la duración.
4. Selecciona el tipo.
5. Pulsa **Iniciar entrenamiento**.

Debe abrirse automáticamente la ventana:

```text
Añadir ejercicio
Nombre del ejercicio
[ Ejemplo: Press banca ]
[Cancelar] [Añadir ejercicio]
```

6. Escribe:

```text
Press banca
```

7. Pulsa **Añadir ejercicio**.

Debe aparecer una tarjeta con el título `Press banca`.

## C. Sets

1. Introduce `10` en reps.
2. Introduce `40` en peso.
3. Pulsa `○`.
4. Debe cambiar a `✓`.
5. Pulsa **+ Añadir set**.
6. Introduce otros valores.
7. Pulsa `×` en el segundo set.
8. Debe desaparecer.

## D. Nombre del ejercicio

1. Pulsa **Editar nombre**.
2. Cambia `Press banca` por `Press banca inclinado`.
3. Acepta el cuadro de texto.
4. Comprueba que el título cambia.
5. Añade una nota.
6. Recarga la página.
7. Comprueba que todo sigue guardado.

## E. Añadir segundo ejercicio

1. Pulsa **+ Añadir ejercicio**.
2. Escribe:

```text
Remo con mancuerna
```

3. Pulsa **Añadir ejercicio**.
4. Comprueba que aparecen dos tarjetas.
5. Elimina una de ellas.
6. Comprueba que solo queda la otra.

## F. Finalizar

1. Comprueba que todos los ejercicios tienen nombre.
2. Pulsa **Finalizar**.
3. Comprueba que la sesión aparece en Resumen.
4. Entra en Progreso.
5. Comprueba que los ejercicios aparecen en la lista.

## G. Recuperación

1. Inicia otra sesión.
2. Añade un ejercicio.
3. Introduce datos.
4. Cierra la pestaña sin finalizar.
5. Abre de nuevo la aplicación.
6. Comprueba que la sesión activa se conserva.

## H. Copia de seguridad

1. Ve a Perfil.
2. Exporta una copia.
3. Importa esa misma copia.
4. Comprueba que las sesiones siguen visibles.

---

# Paso 8 — Qué funciona en esta versión

| Función | Estado |
|---|---|
| Ver sesiones anteriores | Incluida |
| Agrupar por meses | Incluida |
| Crear sesión | Incluida |
| Añadir ejercicio con nombre | Incluida |
| Editar nombre | Incluida |
| Añadir sets | Incluida |
| Editar reps | Incluida |
| Editar peso | Incluida |
| Eliminar sets | Incluida |
| Marcar set completado | Incluida |
| Eliminar ejercicio | Incluida |
| Notas por ejercicio | Incluida |
| Último registro | Incluida |
| Guardado durante sesión | Incluida |
| Recuperación tras recarga | Incluida |
| Exportar copia | Incluida |
| Importar copia | Incluida |
| Progreso básico | Incluida |
| Temporizador | No incluido por decisión |
| Nota general | No incluida por decisión |
| Volumen | No incluido por decisión |

---

# Paso 9 — Subir a GitHub Desktop

Cuando hayas superado toda la prueba:

1. Exporta una copia JSON.
2. Abre GitHub Desktop.
3. Revisa los cambios.
4. Escribe:

```text
Crear versión estable del registro de ejercicios
```

5. Pulsa **Commit to main**.
6. Pulsa **Push origin**.

No hagas el commit hasta comprobar que puedes escribir el nombre del ejercicio y finalizar una sesión correctamente.
