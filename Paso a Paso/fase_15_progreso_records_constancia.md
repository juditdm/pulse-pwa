# Fase 15 — Récords personales y constancia

## Objetivo de esta fase

Hasta ahora, la pantalla **Progreso** solo mostraba el peso máximo por ejercicio. En esta fase la convertimos en una pantalla realmente útil para decidir qué peso usar en tu próxima sesión y para ver si estás siendo constante.

Añadiremos:

- Récord personal por ejercicio, con fecha.
- Comparación entre tu último registro y tu mejor marca.
- Detalle de un ejercicio al pulsarlo: historial completo de sesiones.
- Racha de semanas entrenando.
- Sesiones del mes actual frente al mes anterior.
- Reparto de sesiones por tipo de entrenamiento.

No añadiremos:

- Temporizador de descanso.
- Nota general de sesión.
- Volumen como métrica.
- Comparación con otras personas.

## Versión

Esta es una fase nueva completa, así que seguimos tu regla de numeración:

```javascript
const CACHE_NAME = "pulse-static-v6";
```

Si necesitamos una corrección puntual dentro de esta misma fase, usaremos `v6.1`, `v6.2`, etc.

---

# Paso 1 — Copia de seguridad

1. Ve a **Perfil**.
2. Pulsa **Exportar copia de seguridad**.
3. Guarda el archivo JSON en una carpeta segura.
4. Haz una copia completa de la carpeta `pulse-pwa`.
5. No borres datos del navegador todavía.

---

# Paso 2 — Reemplazar `index.html`

Solo cambia la sección `progress-view` y se añade un panel de detalle. El resto del archivo permanece igual que en la fase 5 definitiva.

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
                <div id="exercise-detail-history" class="exercise-detail-history"></div>
                <button id="close-exercise-detail" class="secondary-button" type="button">Cerrar</button>
            </div>
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
.exercise-summary-row { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:15px 0; border-bottom:1px solid var(--border); cursor:pointer; }
.exercise-summary-row:last-child { border-bottom:0; }
.exercise-summary-row:active { background:#f7faf6; }
.exercise-summary-row strong { font-size:14px; }
.exercise-summary-row span { display:block; margin-top:4px; color:var(--muted); font-size:11px; }
.exercise-summary-value { text-align:right; }
.exercise-summary-value strong { color:var(--dark-green); font-size:18px; }
.exercise-summary-value .progress-diff { display:block; margin-top:4px; font-size:11px; font-weight:800; }
.progress-diff.positive { color:var(--dark-green); }
.progress-diff.neutral { color:var(--muted); }
.consistency-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; margin-top:16px; }
.consistency-grid div { padding:13px 8px; border-radius:14px; background:#f6f8f5; text-align:center; }
.consistency-grid strong { display:block; color:var(--dark-green); font-size:21px; }
.consistency-grid span { display:block; margin-top:4px; color:var(--muted); font-size:10px; }
.type-breakdown { display:grid; gap:8px; margin-top:16px; }
.type-breakdown-row { display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:12px; }
.type-breakdown-row span:first-child { color:var(--muted); font-weight:700; }
.type-breakdown-row span:last-child { color:var(--dark-green); font-weight:800; }
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
.exercise-detail-record { display:flex; justify-content:space-between; gap:10px; padding:16px; margin-bottom:16px; border-radius:16px; background:var(--green); color:var(--dark-green); }
.exercise-detail-record div strong { display:block; font-size:22px; }
.exercise-detail-record div span { display:block; margin-top:3px; font-size:11px; font-weight:700; }
.exercise-detail-history { display:grid; gap:8px; max-height:320px; margin-bottom:18px; overflow:auto; }
.exercise-detail-row { display:flex; justify-content:space-between; padding:11px 12px; border:1px solid var(--border); border-radius:12px; background:#fbfcfa; font-size:12px; }
.exercise-detail-row strong { color:var(--dark-green); }
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

Este archivo añade el cálculo de récords, constancia y el panel de detalle, manteniendo intacta la delegación de eventos que ya funciona bien para favoritos, plantillas y sets.

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
const exerciseSummaryContainer = document.querySelector("#exercise-summary");
const exerciseDetailPanel = document.querySelector("#exercise-detail-panel");
const exerciseDetailTitle = document.querySelector("#exercise-detail-title");
const exerciseDetailRecord = document.querySelector("#exercise-detail-record");
const exerciseDetailHistory = document.querySelector("#exercise-detail-history");
const closeExerciseDetail = document.querySelector("#close-exercise-detail");

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
    if (!summary.length) { exerciseSummaryContainer.innerHTML = `<p class="muted">Todavía no hay ejercicios registrados.</p>`; return; }

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
    const summary = calculateExerciseSummary().find((exercise) => exercise.name === name);
    if (!summary) return;

    exerciseDetailTitle.textContent = summary.name;
    exerciseDetailRecord.innerHTML = `
        <div><strong>${summary.maxWeight} kg</strong><span>RÉCORD PERSONAL</span></div>
        <div><strong>${formatDateShort(summary.recordDate)}</strong><span>FECHA DEL RÉCORD</span></div>
        <div><strong>${summary.lastWeight} kg × ${summary.lastReps}</strong><span>ÚLTIMA SESIÓN</span></div>
    `;

    const history = summary.history.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
    exerciseDetailHistory.innerHTML = history.map((item) => `<div class="exercise-detail-row"><span>${formatDateShort(item.date)}</span><strong>${item.reps} reps · ${item.weight} kg</strong></div>`).join("");

    openPanel(exerciseDetailPanel);
}

closeExerciseDetail.addEventListener("click", () => closePanel(exerciseDetailPanel));
exerciseDetailPanel.addEventListener("click", (event) => { if (event.target === exerciseDetailPanel) closePanel(exerciseDetailPanel); });

/* ---------- BIBLIOTECA, FAVORITOS Y PLANTILLAS ---------- */

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
    const backup = { version: "6", workouts, favorites: getFavorites(), templates: getTemplates() };
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
const CACHE_NAME = "pulse-static-v6";
```

No cambies ninguna otra línea.

---

# Paso 6 — Reiniciar y forzar actualización

1. Exporta una copia de seguridad.
2. Detén el servidor con `Ctrl + C`.
3. Reinícialo:

```powershell
python -m http.server 8000
```

4. Abre:

```text
http://127.0.0.1:8000
```

5. Pulsa `F12` → **Application > Service Workers** → **Unregister**.
6. Recarga con:

```text
Ctrl + F5
```

No borres el almacenamiento del sitio sin haber exportado antes el JSON.

---

# Paso 7 — Prueba completa

## A. Constancia

1. Entra en **Progreso**.
2. Comprueba que aparecen tres números: semanas seguidas, sesiones de este mes y diferencia con el mes anterior.
3. Comprueba que aparece un reparto por tipo de entrenamiento, por ejemplo:

```text
Tren superior     4 sesiones
Tren inferior     2 sesiones
```

## B. Récords por ejercicio

1. Debajo debe aparecer la lista de ejercicios con su récord y la fecha en la que lo conseguiste.
2. Si tu último registro iguala o supera el récord, debe aparecer:

```text
Es tu récord actual
```

3. Si tu último registro es menor, debe aparecer algo como:

```text
-2.5 kg respecto al récord
```

## C. Detalle de un ejercicio

1. Pulsa sobre cualquier ejercicio de la lista.
2. Debe abrirse un panel con:
   - Récord personal y fecha.
   - Tu última sesión.
   - Un historial con las últimas sesiones registradas, más recientes primero.
3. Pulsa **Cerrar** y comprueba que el panel se cierra correctamente.

## D. Que nada se haya roto

1. Añade una nueva sesión con dos ejercicios.
2. Marca favoritos.
3. Crea o usa una plantilla.
4. Recarga a mitad de sesión y comprueba que se recupera.
5. Exporta e importa una copia.

---

# Paso 8 — Commit

Cuando todo funcione:

```text
Fase 15: añadir records personales y constancia
```

Pulsa **Commit to main** y después **Push origin**.

## Siguiente paso

Si aparece alguna corrección puntual de esta fase, usaremos `v6.1`. La siguiente fase nueva será la **fase 16**, con `pulse-static-v7`.
