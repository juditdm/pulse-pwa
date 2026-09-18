# Fase 19 — Gráfico de evolución por ejercicio

## Objetivo de esta fase

En el panel de detalle de cada ejercicio (el que se abre al pulsar sobre él en Progreso o en la Biblioteca) mostramos hasta ahora solo una lista de sesiones. En esta fase añadimos un **gráfico de línea simple** que muestra visualmente cómo ha evolucionado tu peso máximo en cada sesión, con dos filtros de periodo.

Añadimos:

- Un gráfico de línea (SVG, sin librerías externas) dentro del panel de detalle de ejercicio.
- Selector de periodo: **1 mes**, **3 meses** y **Todo**.
- Un punto destacado en el valor más alto de la gráfica (tu récord dentro de ese periodo).
- El gráfico se recalcula al cambiar de periodo, sin cerrar el panel.

No tocamos:

- Ningún cálculo de récords, constancia, favoritos, plantillas ni duplicar sesión.
- El sistema de toasts ni la pantalla de arranque de la fase 18.

## Por qué esta técnica

Usamos un `<polyline>` de SVG generado con JavaScript a partir de tus datos, escalando los valores al espacio disponible. Es la forma más ligera de dibujar una gráfica de líneas sin depender de ninguna librería externa, algo importante porque Pulse debe seguir funcionando sin conexión y sin descargar nada de internet.

## Versión

Fase nueva completa:

```javascript
const CACHE_NAME = "pulse-static-v10";
```

Si hiciera falta una corrección puntual, usaríamos `v10.1`, `v10.2`, etc.

---

# Paso 1 — Copia de seguridad

1. Ve a **Perfil**.
2. Pulsa **Exportar copia de seguridad**.
3. Guarda el archivo JSON.
4. Haz una copia completa de la carpeta `pulse-pwa`.

---

# Paso 2 — Reemplazar `index.html`

Solo cambia el panel de detalle de ejercicio, que ahora incluye el contenedor del gráfico y los botones de periodo. El resto del archivo es idéntico a la fase 18.

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
    <div id="boot-screen" class="boot-screen">
        <div class="boot-mark">Pulse</div>
    </div>

    <div id="toast-container" class="toast-container"></div>

    <main class="app-shell">
        <header class="topbar">
            <div><p class="eyebrow">TRAINING LOG</p><h1>Pulse</h1></div>
            <div id="connection-status" class="connection-status">Local</div>
        </header>

        <section id="summary-view" class="view active-view">
            <section class="summary-header premium-surface"><div><p class="eyebrow">TU HISTORIAL</p><h2>Entrenamientos</h2><p class="muted">Tu progreso, sesión a sesión.</p></div><div class="summary-count"><strong id="total-sessions">0</strong><span>sesiones</span></div></section>
            <div id="workout-list"></div>
        </section>

        <section id="progress-view" class="view hidden-view">
            <section class="section-heading"><div><p class="eyebrow">ANÁLISIS</p><h2>Tu progreso</h2></div></section>
            <div class="progress-card premium-surface">
                <p class="eyebrow">CONSTANCIA</p>
                <div class="consistency-grid">
                    <div><strong id="streak-weeks">0</strong><span>semanas seguidas</span></div>
                    <div><strong id="month-sessions">0</strong><span>sesiones este mes</span></div>
                    <div><strong id="month-diff">0</strong><span>vs. mes anterior</span></div>
                </div>
                <div id="type-breakdown" class="type-breakdown"></div>
            </div>
            <div class="progress-highlight premium-surface">
                <p class="eyebrow">MEJORES MARCAS</p>
                <h3>Récords por ejercicio</h3>
                <p class="muted">Pulsa un ejercicio para ver su evolución completa.</p>
            </div>
            <div class="progress-card premium-surface"><div id="exercise-summary"></div></div>
        </section>

        <section id="exercise-detail-panel" class="overlay-panel hidden-panel">
            <div class="overlay-card">
                <p class="eyebrow">HISTORIAL</p>
                <h2 id="exercise-detail-title">Ejercicio</h2>
                <div id="exercise-detail-record" class="exercise-detail-record"></div>

                <div class="chart-period-selector" id="chart-period-selector">
                    <button class="chart-period-button" data-period="30" type="button">1 mes</button>
                    <button class="chart-period-button" data-period="90" type="button">3 meses</button>
                    <button class="chart-period-button active" data-period="all" type="button">Todo</button>
                </div>
                <div class="chart-container" id="exercise-chart-container">
                    <svg id="exercise-chart-svg" viewBox="0 0 300 120" preserveAspectRatio="none"></svg>
                    <div id="exercise-chart-empty" class="chart-empty hidden-panel">No hay suficientes datos en este periodo.</div>
                </div>

                <div id="exercise-detail-history" class="exercise-detail-history"></div>
                <button id="close-exercise-detail" class="secondary-button" type="button">Cerrar</button>
            </div>
        </section>

        <section id="library-view" class="view hidden-view">
            <section class="section-heading"><div><p class="eyebrow">ORGANIZACIÓN</p><h2>Ejercicios</h2></div></section>
            <div class="library-card premium-surface">
                <div class="library-heading">
                    <div><p class="eyebrow">BIBLIOTECA</p><h3>Todos mis ejercicios</h3><p class="muted library-description">Ejercicios detectados en tus sesiones y creados manualmente.</p></div>
                    <button id="new-custom-exercise-button" class="small-action" type="button">+ Crear</button>
                </div>
                <span id="exercise-count" class="set-count exercise-count-badge">0</span>
                <div id="all-exercise-list"></div>
            </div>
            <div class="library-card premium-surface">
                <div class="library-heading"><div><p class="eyebrow">FAVORITOS</p><h3>Mis ejercicios favoritos</h3></div><span id="favorite-count" class="set-count">0</span></div>
                <div id="favorite-list"></div>
            </div>
            <div class="library-card premium-surface">
                <div class="library-heading"><div><p class="eyebrow">PLANTILLAS</p><h3>Mis entrenamientos</h3></div><button id="new-template-button" class="small-action" type="button">+ Crear</button></div>
                <div id="template-list"></div>
            </div>
        </section>

        <section id="profile-view" class="view hidden-view">
            <section class="section-heading"><div><p class="eyebrow">PERSONAL</p><h2>Perfil</h2></div></section>
            <div class="profile-card premium-surface"><div class="avatar">PT</div><h3>Tu perfil de entrenamiento</h3><p class="muted">Tus sesiones, favoritos y plantillas se guardan localmente.</p></div>
            <div class="profile-actions"><button id="export-button" class="secondary-button" type="button">Exportar copia de seguridad</button><label class="secondary-button file-button">Importar copia de seguridad<input id="import-input" type="file" accept="application/json"></label></div>
        </section>

        <section id="new-workout-view" class="view hidden-view">
            <section class="section-heading"><div><p class="eyebrow">NUEVO REGISTRO</p><h2>Iniciar sesión</h2></div><button id="close-workout-button" class="text-button" type="button">Cerrar</button></section>
            <div class="start-options"><button id="start-empty-workout-button" class="secondary-button" type="button">Sesión vacía</button><button id="choose-template-button" class="secondary-button" type="button">Usar plantilla</button></div>
            <form id="workout-form" class="workout-form premium-surface">
                <label>Día<input id="workout-date" type="date" required></label>
                <label>Duración estimada, minutos<input id="workout-duration" type="number" min="1" placeholder="60" required></label>
                <label>Tipo de entrenamiento<select id="workout-type" required><option value="">Selecciona una opción</option><option>Tren superior</option><option>Tren inferior</option><option>Core</option></select></label>
                <button class="primary-button" type="submit">Continuar</button>
            </form>
        </section>

        <section id="active-workout-view" class="view hidden-view">
            <section class="active-header premium-surface"><div><p class="eyebrow">SESIÓN ACTIVA</p><h2 id="active-workout-title">Entrenamiento</h2><span id="active-workout-meta" class="muted"></span><span id="active-save-status" class="save-status">Guardado local</span></div><button id="finish-workout-button" class="text-button" type="button">Finalizar</button></section>
            <div id="active-exercise-list"></div>
            <button id="add-active-exercise-button" class="secondary-button" type="button">+ Añadir ejercicio</button>
        </section>

        <section id="add-exercise-panel" class="overlay-panel hidden-panel">
            <div class="overlay-card">
                <p class="eyebrow">NUEVO EJERCICIO</p>
                <h2>Añadir ejercicio</h2>
                <p class="muted">Escribe el nombre del ejercicio.</p>
                <form id="add-exercise-form">
                    <label>Nombre del ejercicio<input id="add-exercise-name" type="text" autocomplete="off" placeholder="Ejemplo: Press banca" required></label>
                    <div class="dialog-actions"><button id="cancel-add-exercise" class="secondary-button" type="button">Cancelar</button><button class="primary-button" type="submit">Añadir ejercicio</button></div>
                </form>
            </div>
        </section>

        <section id="custom-exercise-panel" class="overlay-panel hidden-panel">
            <div class="overlay-card">
                <p class="eyebrow">EJERCICIO PERSONALIZADO</p>
                <h2>Crear ejercicio</h2>
                <p class="muted">Se guardará en tu biblioteca, aunque no lo hayas usado todavía en ninguna sesión.</p>
                <form id="custom-exercise-form">
                    <label>Nombre del ejercicio<input id="custom-exercise-name" type="text" autocomplete="off" placeholder="Ejemplo: Face pull" required></label>
                    <div class="dialog-actions"><button id="cancel-custom-exercise" class="secondary-button" type="button">Cancelar</button><button class="primary-button" type="submit">Crear ejercicio</button></div>
                </form>
            </div>
        </section>

        <section id="template-panel" class="overlay-panel hidden-panel">
            <div class="overlay-card">
                <p class="eyebrow">NUEVA PLANTILLA</p>
                <h2>Crear plantilla</h2>
                <p class="muted">Escribe un nombre y selecciona ejercicios.</p>
                <form id="template-form">
                    <label>Nombre de la plantilla<input id="template-name-input" type="text" autocomplete="off" placeholder="Ejemplo: Tren superior A" required></label>
                    <div id="template-exercise-options" class="template-exercise-options"></div>
                    <div class="dialog-actions"><button id="cancel-template-button" class="secondary-button" type="button">Cancelar</button><button class="primary-button" type="submit">Guardar plantilla</button></div>
                </form>
            </div>
        </section>

        <section id="select-template-panel" class="overlay-panel hidden-panel">
            <div class="overlay-card">
                <p class="eyebrow">PLANTILLAS</p>
                <h2>Elegir plantilla</h2>
                <p class="muted">Selecciona la plantilla que quieres utilizar.</p>
                <div id="select-template-list"></div>
                <button id="cancel-select-template" class="secondary-button" type="button">Cancelar</button>
            </div>
        </section>

        <section id="duplicate-workout-panel" class="overlay-panel hidden-panel">
            <div class="overlay-card">
                <p class="eyebrow">REPETIR SESIÓN</p>
                <h2>Nueva sesión desde una anterior</h2>
                <p class="muted">Vamos a copiar los ejercicios de esta sesión con los sets vacíos.</p>
                <form id="duplicate-workout-form">
                    <label>Día<input id="duplicate-workout-date" type="date" required></label>
                    <label>Duración estimada, minutos<input id="duplicate-workout-duration" type="number" min="1" placeholder="60" required></label>
                    <div id="duplicate-workout-exercises" class="duplicate-exercise-list"></div>
                    <div class="dialog-actions"><button id="cancel-duplicate-workout" class="secondary-button" type="button">Cancelar</button><button class="primary-button" type="submit">Crear sesión</button></div>
                </form>
            </div>
        </section>

        <button id="new-workout-button" class="primary-button floating-action" type="button">+ Nueva sesión</button>
        <nav class="bottom-nav">
            <button class="nav-button active" data-view="summary-view" type="button"><svg class="nav-icon" viewBox="0 0 24 24"><path d="M4 12 12 4l8 8M6 10v9h12v-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Resumen</span></button>
            <button class="nav-button" data-view="progress-view" type="button"><svg class="nav-icon" viewBox="0 0 24 24"><path d="M4 20V10M12 20V4M20 20v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Progreso</span></button>
            <button class="nav-button" data-view="library-view" type="button"><svg class="nav-icon" viewBox="0 0 24 24"><path d="M6 4v16M18 4v16M6 8h4M6 16h4M14 8h4M14 16h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Ejercicios</span></button>
            <button class="nav-button" data-view="profile-view" type="button"><svg class="nav-icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 20c1.5-3.5 4.5-5 7-5s5.5 1.5 7 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Perfil</span></button>
        </nav>
    </main>
    <script src="app.js"></script>
</body>
</html>
```

5. Guarda con `Ctrl + S`.

---

# Paso 3 — Añadir estilos

1. Abre `styles.css`.
2. Ve al final del archivo.
3. Pega este bloque completo:

```css
.chart-period-selector { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin-bottom:14px; }
.chart-period-button { padding:9px 6px; border:1px solid var(--border); border-radius:11px; background:#fff; color:var(--muted); font-size:11px; font-weight:800; }
.chart-period-button.active { border-color:var(--dark-green); background:var(--green); color:var(--dark-green); }
.chart-container { position:relative; height:130px; margin-bottom:18px; padding:10px 8px; border:1px solid var(--border); border-radius:16px; background:#fbfcfa; }
.chart-container svg { width:100%; height:100%; overflow:visible; }
.chart-line { fill:none; stroke:var(--dark-green); stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }
.chart-area { fill:rgba(49,93,71,.09); stroke:none; }
.chart-dot { fill:var(--dark-green); }
.chart-dot-record { fill:#fff; stroke:var(--dark-green); stroke-width:2; }
.chart-empty { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:12px; text-align:center; padding:0 20px; }
```

4. Guarda con `Ctrl + S`.

---

# Paso 4 — Reemplazar `app.js`

Añadimos la función que dibuja el gráfico y el manejo del selector de periodo. El resto del archivo es idéntico a la fase 18, salvo por lo indicado.

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
const FAVORITES_KEY = "pulse_favorite_exercises_v1";
const TEMPLATES_KEY = "pulse_templates_v1";
const CUSTOM_EXERCISES_KEY = "pulse_custom_exercises_v1";

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
const addExercisePanel = document.querySelector("#add-exercise-panel");
const addExerciseForm = document.querySelector("#add-exercise-form");
const addExerciseName = document.querySelector("#add-exercise-name");
const cancelAddExercise = document.querySelector("#cancel-add-exercise");
const newTemplateButton = document.querySelector("#new-template-button");
const templatePanel = document.querySelector("#template-panel");
const templateForm = document.querySelector("#template-form");
const templateNameInput = document.querySelector("#template-name-input");
const templateExerciseOptions = document.querySelector("#template-exercise-options");
const cancelTemplateButton = document.querySelector("#cancel-template-button");
const selectTemplatePanel = document.querySelector("#select-template-panel");
const selectTemplateList = document.querySelector("#select-template-list");
const cancelSelectTemplate = document.querySelector("#cancel-select-template");
const startEmptyWorkoutButton = document.querySelector("#start-empty-workout-button");
const chooseTemplateButton = document.querySelector("#choose-template-button");
const allExerciseList = document.querySelector("#all-exercise-list");
const favoriteListContainer = document.querySelector("#favorite-list");
const templateListContainer = document.querySelector("#template-list");
const exerciseSummaryContainer = document.querySelector("#exercise-summary");
const exerciseDetailPanel = document.querySelector("#exercise-detail-panel");
const exerciseDetailTitle = document.querySelector("#exercise-detail-title");
const exerciseDetailRecord = document.querySelector("#exercise-detail-record");
const exerciseDetailHistory = document.querySelector("#exercise-detail-history");
const closeExerciseDetail = document.querySelector("#close-exercise-detail");
const workoutListContainer = document.querySelector("#workout-list");
const duplicateWorkoutPanel = document.querySelector("#duplicate-workout-panel");
const duplicateWorkoutForm = document.querySelector("#duplicate-workout-form");
const duplicateWorkoutDate = document.querySelector("#duplicate-workout-date");
const duplicateWorkoutDuration = document.querySelector("#duplicate-workout-duration");
const duplicateWorkoutExercises = document.querySelector("#duplicate-workout-exercises");
const cancelDuplicateWorkout = document.querySelector("#cancel-duplicate-workout");
const newCustomExerciseButton = document.querySelector("#new-custom-exercise-button");
const customExercisePanel = document.querySelector("#custom-exercise-panel");
const customExerciseForm = document.querySelector("#custom-exercise-form");
const customExerciseName = document.querySelector("#custom-exercise-name");
const cancelCustomExercise = document.querySelector("#cancel-custom-exercise");
const bootScreen = document.querySelector("#boot-screen");
const toastContainer = document.querySelector("#toast-container");
const chartPeriodSelector = document.querySelector("#chart-period-selector");
const chartSvg = document.querySelector("#exercise-chart-svg");
const chartEmpty = document.querySelector("#exercise-chart-empty");

let workouts = [];
let activeWorkout = null;
let pendingTemplate = null;
let pendingDuplicate = null;
let databasePromise = openDatabase();
let saveSequence = Promise.resolve();
let currentDetailExercise = null;
let currentChartPeriod = "all";

function createId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showToast(message, variant = "default") {
    const toast = document.createElement("div");
    toast.className = `toast ${variant === "success" ? "toast-success" : ""}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast-visible"));
    setTimeout(() => {
        toast.classList.remove("toast-visible");
        setTimeout(() => toast.remove(), 250);
    }, 2400);
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: "id" });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function readAllWorkouts() {
    const database = await databasePromise;
    return new Promise((resolve, reject) => {
        const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
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

function loadJson(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function cleanExerciseName(name) {
    const value = String(name ?? "").trim();
    return value || "Nuevo ejercicio";
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

async function initialiseStorage() {
    let stored = await readAllWorkouts();
    if (!stored.length) {
        const legacy = normaliseWorkouts(loadJson(STORAGE_KEY, []));
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
        activeSaveStatus.classList.add("saving");
        saveJson(ACTIVE_KEY, activeWorkout);
        await new Promise((resolve) => setTimeout(resolve, 80));
        activeSaveStatus.textContent = "Guardado local";
        activeSaveStatus.classList.remove("saving");
        activeSaveStatus.classList.remove("saved-flash");
        void activeSaveStatus.offsetWidth;
        activeSaveStatus.classList.add("saved-flash");
    });
    return saveSequence;
}

function loadActiveWorkout() {
    const value = loadJson(ACTIVE_KEY, null);
    return value ? normaliseWorkouts([value])[0] : null;
}

function getFavorites() {
    return [...new Set(loadJson(FAVORITES_KEY, []).map((item) => String(item).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function isFavorite(name) {
    return getFavorites().some((item) => item.toLowerCase() === name.toLowerCase());
}

function toggleFavorite(name) {
    const favorites = getFavorites();
    const exists = favorites.some((item) => item.toLowerCase() === name.toLowerCase());
    const updated = exists ? favorites.filter((item) => item.toLowerCase() !== name.toLowerCase()) : [...favorites, name];
    saveJson(FAVORITES_KEY, updated.sort((a, b) => a.localeCompare(b)));
    showToast(exists ? `${name} ya no está en favoritos` : `${name} añadido a favoritos`, exists ? "default" : "success");
}

function getCustomExercises() {
    return [...new Set(loadJson(CUSTOM_EXERCISES_KEY, []).map((item) => String(item).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function isCustomExercise(name) {
    return getCustomExercises().some((item) => item.toLowerCase() === name.toLowerCase());
}

function exerciseAlreadyExists(name) {
    return getAllExerciseNames().some((item) => item.toLowerCase() === name.toLowerCase());
}

function addCustomExercise(name) {
    const cleanName = String(name || "").trim();
    if (!cleanName) return { ok: false, reason: "empty" };
    if (exerciseAlreadyExists(cleanName)) return { ok: false, reason: "duplicate" };

    const custom = getCustomExercises();
    custom.push(cleanName);
    saveJson(CUSTOM_EXERCISES_KEY, custom);
    return { ok: true };
}

function getAllExerciseNames() {
    const names = new Map();
    workouts.forEach((workout) => workout.exercises.forEach((exercise) => {
        const name = String(exercise.name || "").trim();
        if (name && name !== "Nuevo ejercicio") names.set(name.toLowerCase(), name);
    }));
    getFavorites().forEach((name) => names.set(name.toLowerCase(), name));
    getCustomExercises().forEach((name) => names.set(name.toLowerCase(), name));
    return [...names.values()].sort((a, b) => a.localeCompare(b));
}

function getTemplates() {
    return loadJson(TEMPLATES_KEY, []).filter((template) => template && template.id && template.name && Array.isArray(template.exercises));
}

function saveTemplates(templates) {
    saveJson(TEMPLATES_KEY, templates);
}

function today() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonth(dateString) {
    const [year, month] = dateString.split("-");
    return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(Number(year), Number(month) - 1, 1));
}

function formatDateShort(dateString) {
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(new Date(`${dateString}T00:00:00`));
}

function getIsoWeekKey(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day + 3);
    const firstThursday = new Date(date.getFullYear(), 0, 4);
    const week = 1 + Math.round(((date - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
    return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function daysBetween(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    const now = new Date(`${today()}T00:00:00`);
    return Math.round((now - date) / 86400000);
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
    activeWorkout.exercises.push({ id: createId(), name: cleanName, notes: "", sets: [{ id: createId(), number: 1, reps: 0, weight: 0, completed: false }] });
    return true;
}

function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

/* ---------- SESIÓN ACTIVA ---------- */

function renderActiveWorkout() {
    if (!activeWorkout) return;
    activeWorkoutTitle.textContent = activeWorkout.type;
    activeWorkoutMeta.textContent = `${activeWorkout.date} · ${activeWorkout.duration} min`;

    activeExerciseList.innerHTML = activeWorkout.exercises.map((exercise) => {
        const previous = previousPerformance(exercise.name, activeWorkout.id);
        const previousText = previous ? `Último registro: <strong>${previous.reps} reps · ${previous.weight} kg</strong>` : "Todavía no hay un registro anterior.";
        const setsHtml = exercise.sets.map((set) => `
            <div class="active-set-row" data-set-id="${set.id}">
                <label>SET<input class="active-set-number" type="number" value="${set.number}" readonly></label>
                <label>REPS<input class="active-reps" data-field="reps" type="number" min="1" value="${set.reps || ""}" placeholder="10"></label>
                <label>PESO<input class="active-weight" data-field="weight" type="number" min="0" step="0.5" value="${set.weight || ""}" placeholder="40"></label>
                <button class="complete-set-button ${set.completed ? "completed" : ""}" data-action="toggle-set" type="button">${set.completed ? "✓" : "○"}</button>
                <button class="remove-set-button" data-action="remove-set" type="button" aria-label="Eliminar set">×</button>
            </div>
        `).join("");

        return `
            <article class="active-exercise-card" data-exercise-id="${exercise.id}">
                <div class="active-exercise-title">
                    <h3>${escapeHtml(exercise.name)}</h3>
                    <div class="active-exercise-actions">
                        <span class="set-count">${exercise.sets.length} sets</span>
                        <button class="rename-active-exercise" data-action="rename-exercise" type="button">Editar nombre</button>
                        <button class="remove-active-exercise" data-action="remove-exercise" type="button">Eliminar</button>
                    </div>
                </div>
                <div class="previous-performance">${previousText}</div>
                <div class="active-sets-list">${setsHtml}</div>
                <textarea class="active-note" data-action="edit-note" placeholder="Notas del ejercicio">${escapeHtml(exercise.notes)}</textarea>
                <button class="active-add-set" data-action="add-set" type="button">+ Añadir set</button>
            </article>
        `;
    }).join("");
}

function findExercise(exerciseId) {
    return activeWorkout.exercises.find((exercise) => exercise.id === exerciseId);
}

activeExerciseList.addEventListener("click", async (event) => {
    const card = event.target.closest(".active-exercise-card");
    if (!card || !activeWorkout) return;
    const exercise = findExercise(card.dataset.exerciseId);
    if (!exercise) return;

    const actionButton = event.target.closest("[data-action]");
    const action = actionButton?.dataset.action;
    if (!action) return;

    if (action === "rename-exercise") {
        const newName = window.prompt("Nombre del ejercicio", exercise.name);
        if (newName === null) return;
        if (!newName.trim()) { window.alert("Escribe un nombre para el ejercicio."); return; }
        exercise.name = newName.trim();
        await persistActiveWorkout();
        renderActiveWorkout();
        return;
    }

    if (action === "remove-exercise") {
        activeWorkout.exercises = activeWorkout.exercises.filter((item) => item.id !== exercise.id);
        await persistActiveWorkout();
        renderActiveWorkout();
        showToast("Ejercicio eliminado de la sesión");
        return;
    }

    if (action === "add-set") {
        exercise.sets.push({ id: createId(), number: exercise.sets.length + 1, reps: 0, weight: 0, completed: false });
        await persistActiveWorkout();
        renderActiveWorkout();
        return;
    }

    if (action === "toggle-set") {
        const setRow = event.target.closest("[data-set-id]");
        const set = exercise.sets.find((item) => item.id === setRow.dataset.setId);
        if (!set) return;
        set.completed = !set.completed;
        await persistActiveWorkout();
        renderActiveWorkout();
        requestAnimationFrame(() => {
            const button = activeExerciseList.querySelector(`[data-set-id="${set.id}"] .complete-set-button`);
            if (button && set.completed) {
                button.classList.add("just-completed");
                setTimeout(() => button.classList.remove("just-completed"), 300);
            }
        });
        return;
    }

    if (action === "remove-set") {
        if (exercise.sets.length === 1) { window.alert("Debe quedar al menos un set."); return; }
        const setRow = event.target.closest("[data-set-id]");
        exercise.sets = exercise.sets.filter((item) => item.id !== setRow.dataset.setId);
        exercise.sets.forEach((item, index) => { item.number = index + 1; });
        await persistActiveWorkout();
        renderActiveWorkout();
    }
});

activeExerciseList.addEventListener("input", async (event) => {
    const card = event.target.closest(".active-exercise-card");
    if (!card || !activeWorkout) return;
    const exercise = findExercise(card.dataset.exerciseId);
    if (!exercise) return;

    if (event.target.dataset.action === "edit-note") {
        exercise.notes = event.target.value;
        await persistActiveWorkout();
        return;
    }

    const setRow = event.target.closest("[data-set-id]");
    if (!setRow) return;
    const set = exercise.sets.find((item) => item.id === setRow.dataset.setId);
    if (!set) return;

    if (event.target.dataset.field === "reps") set.reps = Number(event.target.value);
    if (event.target.dataset.field === "weight") set.weight = Number(event.target.value);
    await persistActiveWorkout();
});

/* ---------- ESTADÍSTICAS, RÉCORDS Y CONSTANCIA ---------- */

function calculateStats() {
    return { sessions: workouts.length, minutes: workouts.reduce((total, workout) => total + workout.duration, 0), types: new Set(workouts.map((workout) => workout.type)).size };
}

function calculateExerciseSummary() {
    const summary = {};
    workouts.forEach((workout) => workout.exercises.forEach((exercise) => {
        const name = exercise.name.trim();
        if (!name || name === "Nuevo ejercicio") return;
        if (!summary[name]) summary[name] = { name, sessions: 0, sets: 0, maxWeight: 0, recordDate: "", lastDate: "", lastWeight: 0, lastReps: 0, history: [] };
        summary[name].sessions += 1;
        summary[name].lastDate = workout.date > summary[name].lastDate ? workout.date : summary[name].lastDate;

        exercise.sets.forEach((set) => {
            summary[name].sets += 1;
            summary[name].history.push({ date: workout.date, weight: set.weight, reps: set.reps });
            if (set.weight >= summary[name].maxWeight) {
                summary[name].maxWeight = set.weight;
                summary[name].recordDate = workout.date;
            }
        });
    }));

    Object.values(summary).forEach((exercise) => {
        const lastSets = exercise.history.filter((item) => item.date === exercise.lastDate);
        if (lastSets.length) {
            const best = lastSets.reduce((max, item) => (item.weight > max.weight ? item : max), lastSets[0]);
            exercise.lastWeight = best.weight;
            exercise.lastReps = best.reps;
        }
    });

    return Object.values(summary).sort((a, b) => b.maxWeight - a.maxWeight || a.name.localeCompare(b.name));
}

function calculateConsistency() {
    const now = new Date();
    const currentMonthKey = today().slice(0, 7);
    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthKey = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}`;

    const monthSessions = workouts.filter((workout) => workout.date.slice(0, 7) === currentMonthKey).length;
    const previousMonthSessions = workouts.filter((workout) => workout.date.slice(0, 7) === previousMonthKey).length;

    const weeksWithSessions = new Set(workouts.map((workout) => getIsoWeekKey(workout.date)));
    let streak = 0;
    const cursor = new Date();
    while (true) {
        const key = getIsoWeekKey(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`);
        if (weeksWithSessions.has(key)) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 7);
        } else {
            break;
        }
    }

    const typeCounts = {};
    workouts.forEach((workout) => { typeCounts[workout.type] = (typeCounts[workout.type] || 0) + 1; });

    return { monthSessions, previousMonthSessions, streak, typeCounts };
}

function render() {
    const stats = calculateStats();
    document.querySelector("#total-sessions").textContent = stats.sessions;
    renderWorkouts();
    renderProgress();
    renderLibrary();
}

const emptyStateIcon = `<svg class="empty-state-icon" viewBox="0 0 24 24"><path d="M12 3v18M4 12h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".5"/></svg>`;

function renderWorkouts() {
    if (!workouts.length) {
        workoutListContainer.innerHTML = `<div class="empty-state">${emptyStateIcon}<p class="empty-state-text muted">Todavía no has registrado ningún entrenamiento.</p><button class="empty-state-action" id="empty-start-workout" type="button">Crear mi primera sesión</button></div>`;
        document.querySelector("#empty-start-workout")?.addEventListener("click", () => { pendingTemplate = null; prepareWorkoutForm(); showView("new-workout-view"); });
        return;
    }
    const groups = {};
    workouts.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach((workout) => { const key = workout.date.slice(0, 7); if (!groups[key]) groups[key] = []; groups[key].push(workout); });
    workoutListContainer.innerHTML = Object.entries(groups).map(([monthKey, monthWorkouts]) => {
        const cards = monthWorkouts.map((workout) => {
            const exercisesHtml = workout.exercises.map((exercise) => `<div class="exercise-block"><div class="exercise-title"><span>${escapeHtml(exercise.name)}</span><span class="set-count">${exercise.sets.length} sets</span></div>${exercise.sets.map((set) => `<div class="set-card"><div class="set-card-main"><span class="set-badge">Set ${set.number}</span><div><small>REPS</small><strong>${set.reps}</strong></div><div><small>PESO</small><strong>${set.weight} kg</strong></div></div></div>`).join("")}${exercise.notes ? `<p class="exercise-note">${escapeHtml(exercise.notes)}</p>` : ""}</div>`).join("");
            return `<article class="workout-card" data-workout-id="${workout.id}"><div class="workout-header"><div><span class="date-label">${workout.date}</span><h3>${escapeHtml(workout.type)}</h3></div><span class="duration-pill">${workout.duration} min</span></div>${exercisesHtml}<button class="duplicate-session-button" data-action="duplicate-workout" type="button">Repetir esta sesión</button></article>`;
        }).join("");
        return `<section class="month-section"><div class="month-heading"><h3>${formatMonth(`${monthKey}-01`)}</h3><span>${monthWorkouts.length} ${monthWorkouts.length === 1 ? "sesión" : "sesiones"}</span></div>${cards}</section>`;
    }).join("");
}

workoutListContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='duplicate-workout']");
    if (!button) return;
    const card = event.target.closest("[data-workout-id]");
    const workout = workouts.find((item) => item.id === card.dataset.workoutId);
    if (workout) openDuplicatePanel(workout);
});

function openDuplicatePanel(workout) {
    pendingDuplicate = workout;
    duplicateWorkoutDate.value = today();
    duplicateWorkoutDuration.value = workout.duration || "";
    duplicateWorkoutExercises.innerHTML = workout.exercises.map((exercise) => `<div class="duplicate-exercise-item">${escapeHtml(exercise.name)} · ${exercise.sets.length} sets</div>`).join("");
    openPanel(duplicateWorkoutPanel);
}

duplicateWorkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!pendingDuplicate) return;

    activeWorkout = {
        id: createId(),
        date: duplicateWorkoutDate.value,
        duration: Number(duplicateWorkoutDuration.value),
        type: pendingDuplicate.type,
        exercises: pendingDuplicate.exercises.map((exercise) => ({
            id: createId(),
            name: exercise.name,
            notes: "",
            sets: exercise.sets.map((set, index) => ({ id: createId(), number: index + 1, reps: 0, weight: 0, completed: false }))
        }))
    };

    pendingDuplicate = null;
    persistActiveWorkout();
    renderActiveWorkout();
    closePanel(duplicateWorkoutPanel);
    showView("active-workout-view");
    showToast("Sesión creada a partir de la anterior", "success");
});

cancelDuplicateWorkout.addEventListener("click", () => { pendingDuplicate = null; closePanel(duplicateWorkoutPanel); });
duplicateWorkoutPanel.addEventListener("click", (event) => { if (event.target === duplicateWorkoutPanel) { pendingDuplicate = null; closePanel(duplicateWorkoutPanel); } });

function renderProgress() {
    const consistency = calculateConsistency();
    document.querySelector("#streak-weeks").textContent = consistency.streak;
    document.querySelector("#month-sessions").textContent = consistency.monthSessions;

    const diff = consistency.monthSessions - consistency.previousMonthSessions;
    const diffLabel = diff > 0 ? `+${diff}` : String(diff);
    document.querySelector("#month-diff").textContent = diffLabel;

    const typeContainer = document.querySelector("#type-breakdown");
    const typeEntries = Object.entries(consistency.typeCounts).sort((a, b) => b[1] - a[1]);
    typeContainer.innerHTML = typeEntries.length ? typeEntries.map(([type, count]) => `<div class="type-breakdown-row"><span>${escapeHtml(type)}</span><span>${count} ${count === 1 ? "sesión" : "sesiones"}</span></div>`).join("") : `<p class="muted">Todavía no hay sesiones para repartir por tipo.</p>`;

    renderExerciseSummary();
}

function renderExerciseSummary() {
    const summary = calculateExerciseSummary();
    if (!summary.length) { exerciseSummaryContainer.innerHTML = `<div class="empty-state">${emptyStateIcon}<p class="empty-state-text muted">Todavía no hay ejercicios registrados.</p></div>`; return; }

    exerciseSummaryContainer.innerHTML = summary.map((exercise) => {
        const isRecord = exercise.lastWeight >= exercise.maxWeight;
        const diff = exercise.lastWeight - exercise.maxWeight;
        const diffLabel = isRecord ? "Es tu récord actual" : `${diff.toFixed(1)} kg respecto al récord`;
        const diffClass = isRecord ? "positive" : "neutral";
        return `
            <div class="exercise-summary-row" data-exercise-name="${escapeHtml(exercise.name)}">
                <div>
                    <strong>${escapeHtml(exercise.name)}</strong>
                    <span>${exercise.sessions} sesiones · Récord el ${formatDateShort(exercise.recordDate)}</span>
                </div>
                <div class="exercise-summary-value">
                    <strong>${exercise.maxWeight} kg</strong>
                    <span class="progress-diff ${diffClass}">${diffLabel}</span>
                </div>
            </div>
        `;
    }).join("");
}

exerciseSummaryContainer.addEventListener("click", (event) => {
    const row = event.target.closest("[data-exercise-name]");
    if (!row) return;
    openExerciseDetail(row.dataset.exerciseName);
});

function openExerciseDetail(name) {
    currentDetailExercise = name;
    currentChartPeriod = "all";
    chartPeriodSelector.querySelectorAll(".chart-period-button").forEach((button) => button.classList.toggle("active", button.dataset.period === "all"));

    const summary = calculateExerciseSummary().find((exercise) => exercise.name === name);
    if (!summary) {
        exerciseDetailTitle.textContent = name;
        exerciseDetailRecord.innerHTML = `<div><strong>Sin sesiones</strong><span>TODAVÍA NO REGISTRADO</span></div>`;
        exerciseDetailHistory.innerHTML = `<p class="muted">Este ejercicio no tiene historial todavía. Añádelo a una sesión para empezar a registrarlo.</p>`;
        renderExerciseChart([]);
        openPanel(exerciseDetailPanel);
        return;
    }

    exerciseDetailTitle.textContent = summary.name;
    exerciseDetailRecord.innerHTML = `
        <div><strong>${summary.maxWeight} kg</strong><span>RÉCORD PERSONAL</span></div>
        <div><strong>${formatDateShort(summary.recordDate)}</strong><span>FECHA DEL RÉCORD</span></div>
        <div><strong>${summary.lastWeight} kg × ${summary.lastReps}</strong><span>ÚLTIMA SESIÓN</span></div>
    `;

    const history = summary.history.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
    exerciseDetailHistory.innerHTML = history.map((item) => `<div class="exercise-detail-row"><span>${formatDateShort(item.date)}</span><strong>${item.reps} reps · ${item.weight} kg</strong></div>`).join("");

    renderExerciseChartForCurrentPeriod();
    openPanel(exerciseDetailPanel);
}

function renderExerciseChartForCurrentPeriod() {
    const summary = calculateExerciseSummary().find((exercise) => exercise.name === currentDetailExercise);
    if (!summary) { renderExerciseChart([]); return; }

    let points = summary.history.slice().sort((a, b) => a.date.localeCompare(b.date));
    if (currentChartPeriod !== "all") {
        const limitDays = Number(currentChartPeriod);
        points = points.filter((item) => daysBetween(item.date) <= limitDays);
    }

    const byDate = new Map();
    points.forEach((item) => {
        const existing = byDate.get(item.date);
        if (!existing || item.weight > existing.weight) byDate.set(item.date, item);
    });

    renderExerciseChart([...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)));
}

function renderExerciseChart(points) {
    chartSvg.innerHTML = "";

    if (points.length < 2) {
        chartEmpty.classList.remove("hidden-panel");
        return;
    }
    chartEmpty.classList.add("hidden-panel");

    const width = 300;
    const height = 120;
    const paddingX = 10;
    const paddingY = 14;

    const weights = points.map((point) => point.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const range = maxWeight - minWeight || 1;

    const coordinates = points.map((point, index) => {
        const x = paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
        const y = height - paddingY - ((point.weight - minWeight) / range) * (height - paddingY * 2);
        return { x, y, weight: point.weight, date: point.date };
    });

    const linePoints = coordinates.map((coordinate) => `${coordinate.x.toFixed(1)},${coordinate.y.toFixed(1)}`).join(" ");
    const areaPoints = `${paddingX},${height - paddingY} ${linePoints} ${coordinates[coordinates.length - 1].x.toFixed(1)},${height - paddingY}`;

    const svgNamespace = "http://www.w3.org/2000/svg";

    const area = document.createElementNS(svgNamespace, "polygon");
    area.setAttribute("points", areaPoints);
    area.setAttribute("class", "chart-area");
    chartSvg.appendChild(area);

    const line = document.createElementNS(svgNamespace, "polyline");
    line.setAttribute("points", linePoints);
    line.setAttribute("class", "chart-line");
    chartSvg.appendChild(line);

    const maxPointWeight = Math.max(...coordinates.map((coordinate) => coordinate.weight));

    coordinates.forEach((coordinate) => {
        const circle = document.createElementNS(svgNamespace, "circle");
        circle.setAttribute("cx", coordinate.x.toFixed(1));
        circle.setAttribute("cy", coordinate.y.toFixed(1));
        const isTop = coordinate.weight === maxPointWeight;
        circle.setAttribute("r", isTop ? "4.2" : "2.4");
        circle.setAttribute("class", isTop ? "chart-dot-record" : "chart-dot");
        chartSvg.appendChild(circle);
    });
}

chartPeriodSelector.addEventListener("click", (event) => {
    const button = event.target.closest(".chart-period-button");
    if (!button) return;
    currentChartPeriod = button.dataset.period;
    chartPeriodSelector.querySelectorAll(".chart-period-button").forEach((item) => item.classList.toggle("active", item === button));
    renderExerciseChartForCurrentPeriod();
});

closeExerciseDetail.addEventListener("click", () => closePanel(exerciseDetailPanel));
exerciseDetailPanel.addEventListener("click", (event) => { if (event.target === exerciseDetailPanel) closePanel(exerciseDetailPanel); });

/* ---------- BIBLIOTECA, FAVORITOS, PERSONALIZADOS Y PLANTILLAS ---------- */

function renderLibrary() {
    const names = getAllExerciseNames();
    document.querySelector("#exercise-count").textContent = names.length;

    allExerciseList.innerHTML = names.length ? names.map((name) => {
        const active = isFavorite(name);
        const custom = isCustomExercise(name);
        const metaText = active ? "Guardado como favorito" : (custom ? "Ejercicio personalizado, sin sesiones todavía" : "Disponible para guardar");
        return `<div class="library-item" data-exercise-open="${escapeHtml(name)}"><div><span class="library-item-name">${escapeHtml(name)}</span><span class="library-item-meta">${metaText}${custom ? ` <span class="custom-exercise-tag">PERSONALIZADO</span>` : ""}</span></div><button class="favorite-button ${active ? "active" : ""}" data-favorite-name="${escapeHtml(name)}" type="button"><span>${active ? "★" : "☆"}</span>${active ? "Guardado" : "Favorito"}</button></div>`;
    }).join("") : `<div class="empty-state">${emptyStateIcon}<p class="empty-state-text muted">Todavía no hay ejercicios.</p><button class="empty-state-action" id="empty-create-exercise" type="button">Crear mi primer ejercicio</button></div>`;

    document.querySelector("#empty-create-exercise")?.addEventListener("click", () => { customExerciseName.value = ""; openPanel(customExercisePanel); });

    const favorites = getFavorites();
    document.querySelector("#favorite-count").textContent = favorites.length;
    favoriteListContainer.innerHTML = favorites.length ? favorites.map((name) => `<div class="library-item"><div><span class="library-item-name">${escapeHtml(name)}</span><span class="library-item-meta">Ejercicio favorito</span></div><button class="favorite-button active" data-favorite-name="${escapeHtml(name)}" type="button"><span>★</span>Guardado</button></div>`).join("") : `<p class="muted">Pulsa el botón ☆ Favorito para guardar un ejercicio.</p>`;

    renderTemplates();
}

allExerciseList.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest("[data-favorite-name]");
    if (favoriteButton) { toggleFavorite(favoriteButton.dataset.favoriteName); renderLibrary(); return; }

    const item = event.target.closest("[data-exercise-open]");
    if (item) openExerciseDetail(item.dataset.exerciseOpen);
});

favoriteListContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-name]");
    if (!button) return;
    toggleFavorite(button.dataset.favoriteName);
    renderLibrary();
});

function renderTemplates() {
    const templates = getTemplates();
    templateListContainer.innerHTML = templates.length ? templates.map((template) => `<div class="library-item"><div><span class="library-item-name">${escapeHtml(template.name)}</span><span class="library-item-meta">${template.exercises.length} ejercicios</span></div><button class="small-action" data-template-id="${template.id}" type="button">Usar</button></div>`).join("") : `<p class="muted">Pulsa + Crear para guardar una rutina reutilizable.</p>`;
}

templateListContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-template-id]");
    if (!button) return;
    const template = getTemplates().find((item) => item.id === button.dataset.templateId);
    if (template) startTemplateFlow(template);
});

function renderTemplateOptions() {
    const names = getAllExerciseNames();
    templateExerciseOptions.innerHTML = names.length ? names.map((name) => `<label class="template-exercise-option"><input type="checkbox" value="${escapeHtml(name)}"><span>${escapeHtml(name)}</span></label>`).join("") : `<p class="muted">Primero crea un ejercicio o regístralo en una sesión.</p>`;
}

function renderTemplateSelector() {
    const templates = getTemplates();
    selectTemplateList.innerHTML = templates.length ? templates.map((template) => `<button class="secondary-button template-choice" data-template-id="${template.id}" type="button">${escapeHtml(template.name)} <span>${template.exercises.length} ejercicios</span></button>`).join("") : `<p class="muted">Todavía no tienes plantillas. Créala desde Ejercicios.</p>`;
}

selectTemplateList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-template-id]");
    if (!button) return;
    const template = getTemplates().find((item) => item.id === button.dataset.templateId);
    closePanel(selectTemplatePanel);
    if (template) startTemplateFlow(template);
});

newCustomExerciseButton.addEventListener("click", () => { customExerciseName.value = ""; openPanel(customExercisePanel); });
cancelCustomExercise.addEventListener("click", () => closePanel(customExercisePanel));
customExercisePanel.addEventListener("click", (event) => { if (event.target === customExercisePanel) closePanel(customExercisePanel); });

customExerciseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = customExerciseName.value.trim();
    if (!name) return;

    const result = addCustomExercise(name);
    if (!result.ok && result.reason === "duplicate") {
        window.alert(`Ya existe un ejercicio llamado "${name}" en tu biblioteca.`);
        return;
    }
    if (!result.ok) return;

    renderLibrary();
    customExerciseForm.reset();
    closePanel(customExercisePanel);
    showToast(`${name} creado en tu biblioteca`, "success");
});

/* ---------- FLUJO DE SESIONES ---------- */

function startTemplateFlow(template) {
    pendingTemplate = template;
    prepareWorkoutForm();
    document.querySelector("#workout-type").value = template.name;
    showView("new-workout-view");
}

function prepareWorkoutForm() {
    document.querySelector("#workout-date").value = today();
    document.querySelector("#workout-duration").value = "";
    document.querySelector("#workout-type").value = "";
}

function startWorkout(event) {
    event.preventDefault();
    activeWorkout = { id: createId(), date: document.querySelector("#workout-date").value, duration: Number(document.querySelector("#workout-duration").value), type: document.querySelector("#workout-type").value, exercises: [] };
    if (pendingTemplate) pendingTemplate.exercises.forEach((name) => addExerciseWithName(name));
    persistActiveWorkout();
    renderActiveWorkout();
    showView("active-workout-view");
    if (!pendingTemplate) openPanel(addExercisePanel);
    pendingTemplate = null;
}

function openPanel(panel) {
    panel.classList.remove("hidden-panel");
    const input = panel.querySelector("input");
    if (input) setTimeout(() => input.focus(), 50);
}

function closePanel(panel) {
    panel.classList.add("hidden-panel");
}

async function finishWorkout() {
    if (!activeWorkout) return;
    if (!activeWorkout.exercises.length) { window.alert("Añade al menos un ejercicio antes de finalizar la sesión."); return; }
    if (activeWorkout.exercises.some((exercise) => !exercise.name.trim() || exercise.name === "Nuevo ejercicio")) { window.alert("Todos los ejercicios deben tener un nombre."); return; }
    await saveSequence;
    workouts.push(normaliseWorkouts([activeWorkout])[0]);
    await persist();
    localStorage.removeItem(ACTIVE_KEY);
    activeWorkout = null;
    render();
    showView("summary-view");
    showToast("Sesión guardada correctamente", "success");
}

/* ---------- COPIAS DE SEGURIDAD ---------- */

function exportBackup() {
    const backup = { version: "10", workouts, favorites: getFavorites(), templates: getTemplates(), customExercises: getCustomExercises() };
    const file = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pulse-backup-${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Copia de seguridad exportada", "success");
}

function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const imported = JSON.parse(reader.result);
            workouts = normaliseWorkouts(Array.isArray(imported) ? imported : imported.workouts);
            saveJson(FAVORITES_KEY, Array.isArray(imported.favorites) ? imported.favorites : []);
            saveJson(TEMPLATES_KEY, Array.isArray(imported.templates) ? imported.templates : []);
            saveJson(CUSTOM_EXERCISES_KEY, Array.isArray(imported.customExercises) ? imported.customExercises : []);
            await persist();
            render();
            showToast("Copia importada correctamente", "success");
        } catch { window.alert("No se ha podido importar el archivo"); }
    };
    reader.readAsText(file);
}

/* ---------- LISTENERS FIJOS ---------- */

navButtons.forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
newWorkoutButton.addEventListener("click", () => { pendingTemplate = null; prepareWorkoutForm(); showView("new-workout-view"); });
closeWorkoutButton.addEventListener("click", () => showView("summary-view"));
workoutForm.addEventListener("submit", startWorkout);
finishWorkoutButton.addEventListener("click", finishWorkout);
exportButton.addEventListener("click", exportBackup);
importInput.addEventListener("change", importBackup);
addActiveExerciseButton.addEventListener("click", () => openPanel(addExercisePanel));
cancelAddExercise.addEventListener("click", () => closePanel(addExercisePanel));
newTemplateButton.addEventListener("click", () => { renderTemplateOptions(); openPanel(templatePanel); });
cancelTemplateButton.addEventListener("click", () => closePanel(templatePanel));
chooseTemplateButton.addEventListener("click", () => { renderTemplateSelector(); openPanel(selectTemplatePanel); });
startEmptyWorkoutButton.addEventListener("click", () => { pendingTemplate = null; prepareWorkoutForm(); });
cancelSelectTemplate.addEventListener("click", () => closePanel(selectTemplatePanel));

addExerciseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = addExerciseName.value.trim();
    if (!name || !activeWorkout) return;
    addExerciseWithName(name);
    await persistActiveWorkout();
    renderActiveWorkout();
    addExerciseForm.reset();
    closePanel(addExercisePanel);
});

templateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = templateNameInput.value.trim();
    const exercises = [...templateExerciseOptions.querySelectorAll("input:checked")].map((input) => input.value);
    if (!name || !exercises.length) { window.alert("Escribe un nombre y selecciona al menos un ejercicio."); return; }
    const templates = getTemplates();
    templates.push({ id: createId(), name, exercises });
    saveTemplates(templates);
    renderLibrary();
    templateForm.reset();
    closePanel(templatePanel);
    showToast(`Plantilla "${name}" guardada`, "success");
});

[addExercisePanel, templatePanel, selectTemplatePanel].forEach((panel) => panel.addEventListener("click", (event) => { if (event.target === panel) closePanel(panel); }));

async function initialise() {
    try {
        await initialiseStorage();
        activeWorkout = loadActiveWorkout();
        if (activeWorkout) renderActiveWorkout();
        prepareWorkoutForm();
        render();
        connectionStatus.textContent = navigator.onLine ? "Online" : "Offline";
    } catch (error) {
        console.error(error);
        connectionStatus.textContent = "Error local";
    } finally {
        bootScreen.classList.add("boot-hidden");
        setTimeout(() => bootScreen.remove(), 400);
    }
}

window.addEventListener("online", () => { connectionStatus.textContent = "Online"; });
window.addEventListener("offline", () => { connectionStatus.textContent = "Offline"; });
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
initialise();
```

5. Guarda con `Ctrl + S`.

---

# Paso 5 — Actualizar el service worker

Abre `service-worker.js` y deja exactamente esta línea:

```javascript
const CACHE_NAME = "pulse-static-v10";
```

---

# Paso 6 — Reiniciar y forzar actualización

1. Exporta una copia de seguridad.
2. Detén el servidor con `Ctrl + C`.
3. Reinícialo:

```powershell
python -m http.server 8000
```

4. Abre `http://127.0.0.1:8000`.
5. `F12` → **Application > Service Workers** → **Unregister**.
6. Recarga con `Ctrl + F5`.

---

# Paso 7 — Prueba

## A. Gráfico básico

1. Ve a **Progreso**.
2. Pulsa sobre un ejercicio que tenga al menos 2 sesiones registradas.
3. Confirma que aparece una gráfica de línea con el peso a lo largo del tiempo.
4. Confirma que el punto más alto de la gráfica aparece resaltado con un círculo distinto.

## B. Selector de periodo

1. Dentro del panel, pulsa **1 mes**.
2. Confirma que la gráfica se actualiza mostrando solo esos datos (o el aviso de "no hay suficientes datos" si no tienes sesiones recientes).
3. Pulsa **3 meses** y confirma el cambio.
4. Pulsa **Todo** y confirma que vuelve a mostrar el historial completo.

## C. Ejercicio con pocos datos

1. Abre el detalle de un ejercicio con una sola sesión registrada.
2. Confirma que aparece el mensaje "No hay suficientes datos en este periodo" en vez de un error o una gráfica vacía rota.

## D. Que nada se haya roto

1. Toasts, iconos, pantalla de arranque y animación de sets siguen funcionando.
2. Favoritos, plantillas, duplicar sesión y ejercicios personalizados siguen funcionando.
3. Exporta e importa una copia y confirma que todo se conserva.

---

# Paso 8 — Commit

```text
Fase 19: grafico de evolucion por ejercicio
```

Pulsa **Commit to main** y después **Push origin**.

---

# Paso 9 — Actualizar en el iPhone

Sigue el mismo proceso que en fases anteriores: abre Pulse con conexión, ciérrala del todo y vuelve a abrirla. Confirma que al pulsar un ejercicio en Progreso aparece ya la gráfica con los botones de periodo.

La siguiente fase nueva será la **fase 20**, con `pulse-static-v11`.
