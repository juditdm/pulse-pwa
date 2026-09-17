# Fase 5 definitiva — Ejercicios, favoritos y plantillas

## Qué estaba fallando realmente

En las versiones anteriores, cada vez que actualizábamos una lista en pantalla (por ejemplo, la biblioteca de ejercicios o la sesión activa), reescribíamos todo su contenido con `innerHTML`. Eso borra los botones que había antes y crea botones nuevos con el mismo aspecto, pero **sin ninguna acción enganchada**, porque los "escuchadores de clic" (event listeners) se habían puesto sobre los botones antiguos, que ya no existen. [web:509][web:507]

Esto explica que:

- Primero fallara el botón de favoritos, porque se repintaba la lista después de crear los botones.
- Después fallara añadir ejercicios, porque al corregir una cosa se volvió a repintar otra parte en el momento equivocado.

## La solución de fondo

En esta versión, en lugar de poner un listener a cada botón, ponemos **un único listener a todo el contenedor** (por ejemplo, a toda la lista de ejercicios) y miramos qué botón exacto se ha pulsado dentro de él. Esta técnica se llama delegación de eventos: como el contenedor nunca se destruye, el listener nunca se pierde, sin importar cuántas veces cambie el contenido de dentro.

Esta versión es una reconstrucción completa y definitiva de la fase 5. Sustituye cualquier versión anterior (v5, v5.1, v5.2, v5.3).

La versión de esta fase será:

```javascript
const CACHE_NAME = "pulse-static-v5.4";
```

---

# Qué funciona en esta versión

- Ver sesiones anteriores.
- Crear sesión vacía.
- Añadir un ejercicio.
- Añadir varios ejercicios.
- Editar el nombre de un ejercicio.
- Añadir y quitar sets.
- Editar reps y peso.
- Marcar sets como completados.
- Añadir notas por ejercicio.
- Eliminar ejercicios de la sesión activa.
- Finalizar sesión.
- Ver ejercicios en Biblioteca.
- Marcar y quitar favoritos con un botón que siempre responde.
- Crear plantillas.
- Usar plantillas para iniciar sesiones.
- Exportar e importar copias con sesiones, favoritos y plantillas.
- Recuperar la sesión activa tras recargar la página.

---

# Paso 1 — Copia de seguridad

1. Ve a **Perfil**.
2. Pulsa **Exportar copia de seguridad**.
3. Guarda el archivo JSON en una carpeta segura.
4. Haz una copia completa de la carpeta `pulse-pwa`.
5. No borres los datos del navegador todavía.

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
            <div><p class="eyebrow">TRAINING LOG</p><h1>Pulse</h1></div>
            <div id="connection-status" class="connection-status">Local</div>
        </header>

        <section id="summary-view" class="view active-view">
            <section class="summary-header premium-surface"><div><p class="eyebrow">TU HISTORIAL</p><h2>Entrenamientos</h2><p class="muted">Tu progreso, sesión a sesión.</p></div><div class="summary-count"><strong id="total-sessions">0</strong><span>sesiones</span></div></section>
            <div id="workout-list"></div>
        </section>

        <section id="progress-view" class="view hidden-view">
            <section class="section-heading"><div><p class="eyebrow">ANÁLISIS</p><h2>Tu progreso</h2></div></section>
            <div class="progress-highlight premium-surface"><p class="eyebrow">MEJORES MARCAS</p><h3>Tu peso máximo por ejercicio</h3><p class="muted">La evolución que puedes aplicar en la próxima sesión.</p></div>
            <div class="progress-card premium-surface"><div id="exercise-summary"></div></div>
            <div class="progress-card premium-surface"><p class="eyebrow">CONSTANCIA</p><div class="consistency-grid"><div><strong id="progress-sessions">0</strong><span>sesiones</span></div><div><strong id="progress-minutes">0</strong><span>minutos</span></div><div><strong id="progress-types">0</strong><span>tipos usados</span></div></div></div>
        </section>

        <section id="library-view" class="view hidden-view">
            <section class="section-heading"><div><p class="eyebrow">ORGANIZACIÓN</p><h2>Ejercicios</h2></div></section>
            <div class="library-card premium-surface">
                <div class="library-heading"><div><p class="eyebrow">BIBLIOTECA</p><h3>Todos mis ejercicios</h3><p class="muted library-description">Ejercicios detectados en tus sesiones.</p></div><span id="exercise-count" class="set-count">0</span></div>
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

        <button id="new-workout-button" class="primary-button floating-action" type="button">+ Nueva sesión</button>
        <nav class="bottom-nav">
            <button class="nav-button active" data-view="summary-view" type="button">Resumen</button>
            <button class="nav-button" data-view="progress-view" type="button">Progreso</button>
            <button class="nav-button" data-view="library-view" type="button">Ejercicios</button>
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
:root { --background:#f5f4f0; --card:#fff; --ink:#18211c; --muted:#87918a; --green:#c6dfcc; --dark-green:#315d47; --border:#e2e7e2; --danger:#a45555; --shadow:0 18px 45px rgba(34,52,40,.08); }
* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { margin:0; background:var(--background); color:var(--ink); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; touch-action:pan-y; }
button,input,select,textarea { font:inherit; }
button { cursor:pointer; -webkit-tap-highlight-color:transparent; }
.app-shell { width:min(100%,780px); margin:auto; padding:max(25px,env(safe-area-inset-top)) 15px calc(110px + env(safe-area-inset-bottom)); }
.topbar,.section-heading,.summary-header,.active-header,.bottom-nav,.library-heading { display:flex; align-items:center; justify-content:space-between; }
.eyebrow { margin:0 0 7px; color:var(--dark-green); font-size:10px; font-weight:900; letter-spacing:2px; }
h1 { margin:0; font-size:40px; letter-spacing:-2px; }
h2,h3,p { margin-top:0; }
h2 { margin-bottom:0; font-size:23px; letter-spacing:-.6px; }
h3 { margin-bottom:0; font-size:19px; }
.muted { color:var(--muted); }
.connection-status { padding:7px 10px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.65); color:var(--dark-green); font-size:11px; font-weight:800; }
.premium-surface { border:1px solid var(--border); border-radius:24px; background:rgba(255,255,255,.88); box-shadow:var(--shadow); }
.summary-header { margin:28px 0 22px; padding:23px; }
.summary-header h2 { font-size:26px; }
.summary-header p:last-child { margin:8px 0 0; font-size:13px; }
.summary-count { text-align:right; }
.summary-count strong { display:block; color:var(--dark-green); font-size:32px; }
.summary-count span { color:var(--muted); font-size:11px; }
.month-section { margin-bottom:28px; }
.month-heading { display:flex; align-items:baseline; justify-content:space-between; margin:28px 2px 12px; }
.month-heading h3 { color:var(--dark-green); font-size:16px; }
.month-heading span { color:var(--muted); font-size:12px; }
.workout-card { margin-bottom:12px; padding:19px; border:1px solid var(--border); border-radius:22px; background:var(--card); }
.workout-header { display:flex; align-items:center; justify-content:space-between; }
.date-label { color:var(--muted); font-size:13px; font-weight:700; }
.duration-pill,.set-count { padding:7px 9px; border-radius:9px; background:#edf5ee; color:var(--dark-green); font-size:11px; font-weight:800; }
.exercise-block { margin-top:19px; padding-top:15px; border-top:1px solid var(--border); }
.exercise-title { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:9px; font-size:15px; font-weight:800; }
.set-card { display:flex; align-items:center; gap:10px; margin-bottom:7px; padding:11px; border:1px solid var(--border); border-radius:14px; background:#fbfcfa; }
.set-card-main { display:grid; grid-template-columns:auto repeat(2,1fr); align-items:center; gap:9px; width:100%; }
.set-card small { display:block; color:var(--muted); font-size:9px; font-weight:800; }
.set-card strong { display:block; margin-top:3px; font-size:13px; white-space:nowrap; }
.set-badge { padding:7px 8px; border-radius:9px; background:var(--green); color:var(--dark-green); font-size:10px; font-weight:800; }
.primary-button { width:100%; margin-top:10px; padding:15px; border:0; border-radius:15px; background:var(--ink); color:#fff; font-weight:850; }
.floating-action { margin-top:18px; }
.secondary-button { display:block; width:100%; padding:13px; border:1px solid var(--dark-green); border-radius:14px; background:transparent; color:var(--dark-green); text-align:center; font-weight:800; }
.text-button { min-height:38px; padding:8px 10px; border:0; border-radius:10px; background:transparent; color:var(--dark-green); font-size:13px; font-weight:800; }
.small-action { padding:8px 10px; border:0; border-radius:10px; background:#edf5ee; color:var(--dark-green); font-size:12px; font-weight:800; }
.bottom-nav { position:fixed; right:50%; bottom:max(15px,env(safe-area-inset-bottom)); width:calc(100% - 30px); max-width:740px; padding:9px 7px; transform:translateX(50%); border:1px solid var(--border); border-radius:18px; background:rgba(255,255,255,.94); box-shadow:var(--shadow); backdrop-filter:blur(12px); z-index:10; }
.nav-button { min-height:38px; padding:8px 9px; border:0; border-radius:10px; background:transparent; color:var(--muted); font-size:11px; font-weight:700; }
.nav-button.active { background:#edf5ee; color:var(--dark-green); }
.hidden-view,.hidden-panel { display:none!important; }
.view { animation:appear .25s ease; }
@keyframes appear { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.progress-highlight { margin-bottom:16px; padding:23px; background:var(--green); }
.progress-highlight h3,.progress-highlight .eyebrow { color:var(--dark-green); }
.progress-highlight p:last-child { margin-bottom:0; color:var(--dark-green); }
.progress-card,.profile-card,.library-card { margin-bottom:16px; padding:21px; }
.exercise-summary-row { display:flex; justify-content:space-between; gap:10px; padding:15px 0; border-bottom:1px solid var(--border); }
.exercise-summary-row:last-child { border-bottom:0; }
.exercise-summary-row strong { font-size:14px; }
.exercise-summary-row span { display:block; margin-top:4px; color:var(--muted); font-size:11px; }
.exercise-summary-value { text-align:right; }
.exercise-summary-value strong { color:var(--dark-green); font-size:18px; }
.consistency-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; margin-top:16px; }
.consistency-grid div { padding:13px 8px; border-radius:14px; background:#f6f8f5; text-align:center; }
.consistency-grid strong { display:block; color:var(--dark-green); font-size:21px; }
.consistency-grid span { display:block; margin-top:4px; color:var(--muted); font-size:10px; }
.avatar { display:grid; width:50px; height:50px; margin-bottom:17px; place-items:center; border-radius:16px; background:var(--green); color:var(--dark-green); font-weight:800; }
.profile-actions { display:grid; gap:12px; }
.file-button { cursor:pointer; }
.file-button input { display:none; }
.active-header { margin-bottom:18px; padding:21px; }
.active-header h2 { margin-bottom:5px; }
.save-status { display:block; margin-top:8px; color:var(--dark-green); font-size:11px; font-weight:800; }
.save-status.saving { color:#9b7b35; }
.active-exercise-card { margin-bottom:14px; padding:18px; border:1px solid var(--border); border-radius:22px; background:var(--card); box-shadow:var(--shadow); }
.active-exercise-title { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:12px; }
.active-exercise-actions { display:flex; align-items:center; gap:7px; }
.rename-active-exercise { min-height:34px; padding:6px 9px; border:0; border-radius:9px; background:#edf5ee; color:var(--dark-green); font-size:11px; font-weight:800; }
.remove-active-exercise { min-height:34px; padding:6px 9px; border:0; border-radius:9px; background:#fbeaea; color:var(--danger); font-size:11px; font-weight:800; }
.previous-performance { margin-bottom:13px; padding:10px 12px; border-radius:12px; background:#f5f8f4; color:var(--muted); font-size:12px; }
.previous-performance strong { color:var(--dark-green); }
.active-set-row { display:grid; grid-template-columns:auto 1fr 1fr 42px 32px; align-items:end; gap:7px; margin-bottom:8px; }
.active-set-row input { display:block; width:100%; margin-top:6px; padding:11px 8px; border:1px solid var(--border); border-radius:11px; background:#fbfcfa; font-size:16px; }
.active-set-row input[readonly] { background:#edf5ee; color:var(--dark-green); font-weight:800; text-align:center; }
.complete-set-button { width:42px; height:44px; border:1px solid var(--border); border-radius:11px; background:#fff; color:var(--muted); font-size:20px; }
.complete-set-button.completed { border-color:var(--dark-green); background:var(--green); color:var(--dark-green); }
.remove-set-button { width:32px; height:44px; border:0; border-radius:11px; background:#fbeaea; color:var(--danger); font-size:21px; }
.active-add-set { margin-top:8px; border:0; background:transparent; color:var(--dark-green); font-size:13px; font-weight:800; }
.active-note { width:100%; min-height:55px; margin-top:12px; padding:11px; border:1px solid var(--border); border-radius:11px; background:#fbfcfa; font-size:16px; resize:vertical; }
.workout-form { display:grid; gap:15px; padding:21px; }
.workout-form label,.overlay-card label { display:block; color:var(--muted); font-size:13px; font-weight:700; }
.workout-form input,.workout-form select,.overlay-card input { display:block; width:100%; margin-top:7px; padding:13px; border:1px solid var(--border); border-radius:12px; background:#fbfcfa; font-size:16px; }
.empty-state { padding:35px 20px; border:1px dashed var(--border); border-radius:20px; color:var(--muted); text-align:center; }
.exercise-note { margin:12px 0 0; padding:10px 12px; border-left:3px solid var(--green); color:var(--muted); font-size:12px; font-style:italic; }
.library-heading { margin-bottom:16px; }
.library-heading h3 { font-size:17px; }
.library-description { margin:5px 0 0; font-size:12px; }
.library-item { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:15px 0; border-bottom:1px solid var(--border); }
.library-item:last-child { border-bottom:0; }
.library-item-name { font-size:14px; font-weight:800; }
.library-item-meta { display:block; margin-top:4px; color:var(--muted); font-size:11px; }
.favorite-button { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-width:116px; min-height:40px; padding:8px 11px; border:1px solid var(--dark-green); border-radius:11px; background:#fff; color:var(--dark-green); font-size:12px; font-weight:800; pointer-events:auto; }
.favorite-button.active { background:var(--green); }
.favorite-button span { font-size:17px; line-height:1; pointer-events:none; }
.template-exercise-options { display:grid; gap:8px; max-height:220px; margin-top:15px; overflow:auto; }
.template-exercise-option { display:flex; align-items:center; gap:9px; padding:10px; border:1px solid var(--border); border-radius:11px; font-size:13px; }
.template-exercise-option input { width:18px; height:18px; margin:0; }
.start-options { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
.overlay-panel { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; padding:15px; background:rgba(24,33,28,.35); backdrop-filter:blur(4px); z-index:30; }
.overlay-card { width:min(100%,430px); max-height:90vh; overflow:auto; padding:24px; border:1px solid var(--border); border-radius:24px; background:var(--card); box-shadow:var(--shadow); }
.overlay-card h2 { margin-bottom:8px; }
.overlay-card p.muted { margin-bottom:18px; font-size:13px; }
.dialog-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:18px; }
.dialog-actions .primary-button { margin-top:0; }
.template-choice { display:flex; justify-content:space-between; gap:10px; margin-bottom:9px; text-align:left; }
@media(max-width:540px) {
    .app-shell { padding-right:15px; padding-left:15px; }
    h1 { font-size:39px; }
    .set-card-main { grid-template-columns:auto repeat(2,1fr); gap:7px; }
    .set-card strong { font-size:12px; }
    .consistency-grid strong { font-size:18px; }
    .active-set-row { grid-template-columns:auto 1fr 1fr 42px 32px; }
    .active-exercise-title { align-items:flex-start; }
    .active-exercise-actions { flex-direction:column; align-items:flex-end; }
    .nav-button { padding:8px 6px; font-size:10px; }
    .favorite-button { min-width:105px; padding:7px 8px; font-size:11px; }
}
```

5. Guarda con `Ctrl + S`.

---

# Paso 4 — Reemplazar `app.js`

Este es el cambio más importante de esta corrección. Fíjate en que ahora los botones de favoritos, plantillas y sets **no** reciben un `addEventListener` individual: en su lugar, cada contenedor tiene un único listener que revisa qué se ha pulsado dentro (delegación de eventos). Esto es lo que hace que la aplicación no se rompa cada vez que se repinta una lista. [web:509][web:507]

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

let workouts = [];
let activeWorkout = null;
let pendingTemplate = null;
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
}

function getAllExerciseNames() {
    const names = new Map();
    workouts.forEach((workout) => workout.exercises.forEach((exercise) => {
        const name = String(exercise.name || "").trim();
        if (name && name !== "Nuevo ejercicio") names.set(name.toLowerCase(), name);
    }));
    getFavorites().forEach((name) => names.set(name.toLowerCase(), name));
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

/* ---------- SESIÓN ACTIVA (delegación de eventos en el contenedor) ---------- */

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

    const action = event.target.closest("[data-action]")?.dataset.action;
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

/* ---------- ESTADÍSTICAS Y RESUMEN ---------- */

function calculateStats() {
    return { sessions: workouts.length, minutes: workouts.reduce((total, workout) => total + workout.duration, 0), types: new Set(workouts.map((workout) => workout.type)).size };
}

function calculateExerciseSummary() {
    const summary = {};
    workouts.forEach((workout) => workout.exercises.forEach((exercise) => {
        const name = exercise.name.trim();
        if (!name || name === "Nuevo ejercicio") return;
        if (!summary[name]) summary[name] = { name, sessions: 0, sets: 0, maxWeight: 0 };
        summary[name].sessions += 1;
        exercise.sets.forEach((set) => { summary[name].sets += 1; summary[name].maxWeight = Math.max(summary[name].maxWeight, set.weight); });
    }));
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
    renderLibrary();
}

function renderWorkouts() {
    const container = document.querySelector("#workout-list");
    if (!workouts.length) { container.innerHTML = `<div class="empty-state">Todavía no hay entrenamientos registrados.</div>`; return; }
    const groups = {};
    workouts.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach((workout) => { const key = workout.date.slice(0, 7); if (!groups[key]) groups[key] = []; groups[key].push(workout); });
    container.innerHTML = Object.entries(groups).map(([monthKey, monthWorkouts]) => {
        const cards = monthWorkouts.map((workout) => {
            const exercisesHtml = workout.exercises.map((exercise) => `<div class="exercise-block"><div class="exercise-title"><span>${escapeHtml(exercise.name)}</span><span class="set-count">${exercise.sets.length} sets</span></div>${exercise.sets.map((set) => `<div class="set-card"><div class="set-card-main"><span class="set-badge">Set ${set.number}</span><div><small>REPS</small><strong>${set.reps}</strong></div><div><small>PESO</small><strong>${set.weight} kg</strong></div></div></div>`).join("")}${exercise.notes ? `<p class="exercise-note">${escapeHtml(exercise.notes)}</p>` : ""}</div>`).join("");
            return `<article class="workout-card"><div class="workout-header"><div><span class="date-label">${workout.date}</span><h3>${escapeHtml(workout.type)}</h3></div><span class="duration-pill">${workout.duration} min</span></div>${exercisesHtml}</article>`;
        }).join("");
        return `<section class="month-section"><div class="month-heading"><h3>${formatMonth(`${monthKey}-01`)}</h3><span>${monthWorkouts.length} ${monthWorkouts.length === 1 ? "sesión" : "sesiones"}</span></div>${cards}</section>`;
    }).join("");
}

function renderExerciseSummary() {
    const container = document.querySelector("#exercise-summary");
    const summary = calculateExerciseSummary();
    container.innerHTML = summary.length ? summary.map((exercise) => `<div class="exercise-summary-row"><div><strong>${escapeHtml(exercise.name)}</strong><span>${exercise.sessions} sesiones · ${exercise.sets} sets</span></div><div class="exercise-summary-value"><strong>${exercise.maxWeight} kg</strong><span>máximo</span></div></div>`).join("") : `<p class="muted">Todavía no hay ejercicios.</p>`;
}

/* ---------- BIBLIOTECA, FAVORITOS Y PLANTILLAS (delegación de eventos) ---------- */

function renderLibrary() {
    const names = getAllExerciseNames();
    document.querySelector("#exercise-count").textContent = names.length;

    allExerciseList.innerHTML = names.length ? names.map((name) => {
        const active = isFavorite(name);
        return `<div class="library-item"><div><span class="library-item-name">${escapeHtml(name)}</span><span class="library-item-meta">${active ? "Guardado como favorito" : "Disponible para guardar"}</span></div><button class="favorite-button ${active ? "active" : ""}" data-favorite-name="${escapeHtml(name)}" type="button"><span>${active ? "★" : "☆"}</span>${active ? "Guardado" : "Favorito"}</button></div>`;
    }).join("") : `<p class="muted">Todavía no hay ejercicios registrados. Crea una sesión y añade un ejercicio.</p>`;

    const favorites = getFavorites();
    document.querySelector("#favorite-count").textContent = favorites.length;
    favoriteListContainer.innerHTML = favorites.length ? favorites.map((name) => `<div class="library-item"><div><span class="library-item-name">${escapeHtml(name)}</span><span class="library-item-meta">Ejercicio favorito</span></div><button class="favorite-button active" data-favorite-name="${escapeHtml(name)}" type="button"><span>★</span>Guardado</button></div>`).join("") : `<p class="muted">Pulsa el botón ☆ Favorito para guardar un ejercicio.</p>`;

    renderTemplates();
}

allExerciseList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-name]");
    if (!button) return;
    toggleFavorite(button.dataset.favoriteName);
    renderLibrary();
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
    templateExerciseOptions.innerHTML = names.length ? names.map((name) => `<label class="template-exercise-option"><input type="checkbox" value="${escapeHtml(name)}"><span>${escapeHtml(name)}</span></label>`).join("") : `<p class="muted">Primero registra un ejercicio en una sesión.</p>`;
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
}

/* ---------- COPIAS DE SEGURIDAD ---------- */

function exportBackup() {
    const backup = { version: "5.4", workouts, favorites: getFavorites(), templates: getTemplates() };
    const file = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
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
            const imported = JSON.parse(reader.result);
            workouts = normaliseWorkouts(Array.isArray(imported) ? imported : imported.workouts);
            saveJson(FAVORITES_KEY, Array.isArray(imported.favorites) ? imported.favorites : []);
            saveJson(TEMPLATES_KEY, Array.isArray(imported.templates) ? imported.templates : []);
            await persist();
            render();
            window.alert("Copia importada correctamente");
        } catch { window.alert("No se ha podido importar el archivo"); }
    };
    reader.readAsText(file);
}

/* ---------- LISTENERS FIJOS (elementos que nunca se destruyen) ---------- */

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
const CACHE_NAME = "pulse-static-v5.4";
```

No cambies ninguna otra línea del archivo.

---

# Paso 6 — Reiniciar y forzar la actualización

Esto es importante: si no completas este paso, el navegador puede seguir mostrándote la versión rota anterior aunque hayas guardado los archivos nuevos.

1. Exporta una copia de seguridad si tienes datos que proteger.
2. Detén el servidor con `Ctrl + C`.
3. Vuelve a iniciarlo:

```powershell
python -m http.server 8000
```

4. Abre:

```text
http://127.0.0.1:8000
```

5. Pulsa `F12` para abrir las herramientas del navegador.
6. Ve a **Application > Service Workers**.
7. Pulsa **Unregister** en cualquier service worker que aparezca.
8. Ve a **Application > Storage**.
9. Si tienes copia JSON exportada, puedes pulsar **Clear site data**. Si no la tienes, no lo hagas.
10. Cierra las herramientas de desarrollo.
11. Recarga con:

```text
Ctrl + F5
```

---

# Paso 7 — Prueba obligatoria antes del commit

No hagas commit hasta completar estas pruebas en orden.

## A. Añadir ejercicios

1. Pulsa **+ Nueva sesión** → **Sesión vacía**.
2. Completa día, duración y tipo. Pulsa **Continuar**.
3. Debe abrirse el panel **Añadir ejercicio**.
4. Escribe `Press banca` y pulsa **Añadir ejercicio**.
5. Confirma que aparece la tarjeta `Press banca`.
6. Pulsa **+ Añadir ejercicio** otra vez.
7. Escribe `Remo con mancuerna` y confirma.
8. Confirma que ahora hay dos tarjetas.
9. Pulsa **+ Añadir ejercicio** una tercera vez y añade `Sentadilla`.
10. Confirma que hay tres tarjetas y que las anteriores no han desaparecido.

## B. Sets

1. En `Press banca`, introduce reps y peso.
2. Pulsa `○` y confirma que cambia a `✓`.
3. Pulsa `✓` otra vez y confirma que vuelve a `○`.
4. Pulsa **+ Añadir set** dos veces.
5. Pulsa `×` en uno de los sets nuevos y confirma que se elimina y los números se reordenan.

## C. Finalizar y comprobar Biblioteca

1. Pulsa **Finalizar**.
2. Ve a **Ejercicios**.
3. Deben aparecer `Press banca`, `Remo con mancuerna` y `Sentadilla`, cada uno con el botón:

```text
☆ Favorito
```

## D. Favoritos, la prueba clave

1. Pulsa `☆ Favorito` en `Press banca`.
2. Confirma que cambia a `★ Guardado` inmediatamente.
3. Confirma que `Press banca` aparece en **Mis ejercicios favoritos**.
4. Pulsa `☆ Favorito` en `Sentadilla`.
5. Confirma que también cambia y aparece en favoritos.
6. Ahora pulsa `★ Guardado` sobre `Press banca` para quitarlo.
7. Confirma que vuelve a `☆ Favorito` y desaparece de la lista de favoritos.
8. Repite el paso 1 sobre `Press banca` una segunda vez. Esta prueba es la que fallaba antes: confirma que sigue funcionando igual de bien la segunda vez que la primera.

## E. Plantillas

1. Marca `Sentadilla` y `Remo con mancuerna` como favoritos.
2. Pulsa **+ Crear** junto a Plantillas.
3. Escribe `Tren completo A`.
4. Marca ambos ejercicios.
5. Pulsa **Guardar plantilla**.
6. Confirma que aparece en la lista con el botón **Usar**.
7. Pulsa **Usar**.
8. Completa día y duración. Pulsa **Continuar**.
9. Confirma que los dos ejercicios aparecen automáticamente en la sesión activa.

## F. Recuperación y copias

1. Añade datos a la sesión activa sin finalizar.
2. Recarga la página con `Ctrl + F5`.
3. Confirma que la sesión activa sigue ahí con sus datos.
4. Ve a **Perfil** y exporta una copia.
5. Importa esa misma copia.
6. Confirma que sesiones, favoritos y plantillas siguen intactos.

---

# Paso 8 — Commit

Solo cuando **todas** las pruebas anteriores hayan funcionado sin fallos:

```text
Reconstruir fase 5 con delegacion de eventos estable
```

Pulsa **Commit to main** y después **Push origin**.

## Si algo sigue sin funcionar

Antes de pedir otra corrección, abre `F12 > Console` y dime exactamente qué mensaje de error aparece en rojo cuando pulsas el botón que falla. Ese mensaje me indica la línea exacta del problema y evita que sigamos corrigiendo a ciegas.
