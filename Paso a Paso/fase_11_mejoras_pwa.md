# Fase 11 — Mejoras de Pulse PWA

En esta fase aplicaremos las mejoras que has detectado usando la aplicación:

1. Evitar que el iPhone amplíe la pantalla al introducir sets o repeticiones.
2. Poder eliminar sets añadidos por error.
3. Mejorar Resumen y eliminar la tarjeta verde inicial.
4. Agrupar sesiones por meses.
5. Quitar el volumen de toda la interfaz.
6. Mejorar Progreso con récords y evolución por ejercicio.
7. Añadir notas o comentarios a cada ejercicio.
8. Mantener los entrenamientos existentes del iPhone.

## Importante sobre los datos

La aplicación actual utiliza esta clave:

```javascript
const STORAGE_KEY = "pulse_workouts_v1";
```

El código nuevo conservará exactamente la misma clave y leerá los campos antiguos. `localStorage` mantiene los datos entre recargas y sesiones del navegador mientras no se borren los datos del sitio. [web:453][web:454]

No borres:

```text
localStorage
```

No cambies:

```javascript
const STORAGE_KEY = "pulse_workouts_v1";
```

Antes de actualizar, recomiendo exportar una copia JSON desde **Perfil > Exportar copia de seguridad**. No es obligatorio para actualizar, pero es una medida prudente.

---

# Parte 1 — Preparar los archivos

Trabajaremos con estos tres archivos de tu carpeta `pulse-pwa`:

```text
index.html
styles.css
app.js
```

No cambiaremos todavía:

```text
manifest.json
service-worker.js
icon.svg
```

Al final actualizaremos la caché del service worker para que el iPhone reciba la nueva versión.

---

# Parte 2 — Reemplazar `index.html`

Abre `index.html`, pulsa `Ctrl + A`, elimina todo y pega este código completo:

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
                                                                                                                        <button class="icon-button" id="menu-button" type="button" aria-label="Abrir menú">⋯</button>
                                                                                                                                </header>
                                                                                                                                
                                                                                                                                        <section class="summary-header">
                                                                                                                                                    <div>
                                                                                                                                                                    <p class="eyebrow">TU HISTORIAL</p>
                                                                                                                                                                                    <h2>Entrenamientos</h2>
                                                                                                                                                                                                </div>
                                                                                                                                                                                                            <div class="summary-count">
                                                                                                                                                                                                                            <strong id="total-sessions">0</strong>
                                                                                                                                                                                                                                            <span>sesiones</span>
                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                </section>
                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                        <section id="summary-view" class="view active-view">
                                                                                                                                                                                                                                                                                    <div id="workout-list"></div>
                                                                                                                                                                                                                                                                                            </section>
                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                    <section id="progress-view" class="view hidden-view">
                                                                                                                                                                                                                                                                                                                <section class="section-heading">
                                                                                                                                                                                                                                                                                                                                <div>
                                                                                                                                                                                                                                                                                                                                                    <p class="eyebrow">ANÁLISIS</p>
                                                                                                                                                                                                                                                                                                                                                                        <h2>Tu progreso</h2>
                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                    </section>
                                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                                                <div class="progress-highlight">
                                                                                                                                                                                                                                                                                                                                                                                                                                <p class="eyebrow">MEJORES MARCAS</p>
                                                                                                                                                                                                                                                                                                                                                                                                                                                <h3>Tu peso máximo por ejercicio</h3>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                <p class="muted">Observa cómo avanzas ejercicio a ejercicio.</p>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div class="progress-card">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div id="exercise-summary"></div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <div class="progress-card">
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <div class="profile-card">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <div class="avatar">PT</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <h3>Tu perfil de entrenamiento</h3>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <p class="muted">Tus sesiones se guardan en este dispositivo.</p>
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <h2>Crear sesión</h2>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <button id="close-workout-button" class="text-button" type="button">Cerrar</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </section>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <form id="workout-form" class="workout-form">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <label>Día<input id="workout-date" type="date" required></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <label>Duración, minutos<input id="workout-duration" type="number" min="1" placeholder="60" required></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <label>Tipo de entrenamiento<select id="workout-type" required><option value="">Selecciona una opción</option><option>Tren superior</option><option>Tren inferior</option><option>Core</option></select></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <div id="exercise-list"></div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <button id="add-exercise-button" class="secondary-button" type="button">+ Añadir ejercicio</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <button class="primary-button" type="submit">Guardar sesión</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </form>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </section>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <button class="primary-button" id="new-workout-button" type="button">+ Nueva sesión</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <nav class="bottom-nav">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <button class="nav-button active" data-view="summary-view" type="button">Resumen</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <button class="nav-button" data-view="progress-view" type="button">Progreso</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <button class="nav-button" data-view="profile-view" type="button">Perfil</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </nav>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </main>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <template id="exercise-template">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <div class="exercise-form-card">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div class="exercise-form-header">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <label>Ejercicio<input class="exercise-name" type="text" placeholder="Ej. Press banca" required></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <button class="remove-exercise-button" type="button">Eliminar</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <div class="exercise-notes-field">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <label>Notas del ejercicio<textarea class="exercise-notes" rows="2" placeholder="Ej. Me costó la última serie..."></textarea></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div class="sets-list">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div class="set-inputs">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <label>Set<input class="set-number-input" type="number" min="1" readonly required></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <label>Reps<input class="reps-input" type="number" min="1" placeholder="10" required></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <label>Peso kg<input class="weight-input" type="number" min="0" step="0.5" placeholder="40" required></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <button class="remove-set-button" type="button" aria-label="Eliminar set">×</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <button class="add-set-button" type="button">+ Añadir set</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </template>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <script src="app.js"></script>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </body>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </html>>
```

Guarda con:

```text
Ctrl + S
```

---

# Parte 3 — Reemplazar `styles.css`

Abre `styles.css`, pulsa `Ctrl + A`, elimina todo y pega:

```css
:root {
    --background: #f5f4f0;
    --card: #ffffff;
    --ink: #1d2420;
    --muted: #89918b;
    --green: #c6dfcc;
    --dark-green: #315d47;
    --border: #e6e8e4;
    --danger: #a45555;
    --shadow: 0 12px 35px rgba(34, 52, 40, .07);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--background); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; touch-action: pan-y; }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; -webkit-tap-highlight-color: transparent; }

.app-shell { width: min(100%, 780px); margin: auto; padding: max(25px, env(safe-area-inset-top)) 15px calc(105px + env(safe-area-inset-bottom)); }
.topbar, .workout-header, .section-heading, .exercise-title, .bottom-nav, .summary-header { display: flex; align-items: center; }
.topbar, .workout-header, .section-heading, .summary-header { justify-content: space-between; }
.eyebrow { margin: 0 0 7px; color: var(--dark-green); font-size: 11px; font-weight: 800; letter-spacing: 2px; }
h1 { margin: 0; font-size: 40px; letter-spacing: -2px; }
h2, h3, p { margin-top: 0; }
h2 { margin-bottom: 0; font-size: 22px; }
h3 { margin-bottom: 0; font-size: 20px; }
.muted { color: var(--muted); }

.icon-button { width: 44px; height: 44px; border: 1px solid var(--border); border-radius: 15px; background: var(--card); color: var(--ink); font-size: 24px; }
.summary-header { margin: 28px 0 20px; padding: 20px; border: 1px solid var(--border); border-radius: 22px; background: var(--card); box-shadow: var(--shadow); }
.summary-header h2 { font-size: 25px; }
.summary-count { text-align: right; }
.summary-count strong { display: block; color: var(--dark-green); font-size: 30px; }
.summary-count span { color: var(--muted); font-size: 11px; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
.stat-card, .workout-card, .progress-card, .progress-highlight, .profile-card, .exercise-form-card { border: 1px solid var(--border); border-radius: 22px; background: var(--card); box-shadow: var(--shadow); }
.stat-card { padding: 17px; }
.stat-number { display: block; margin-bottom: 4px; font-size: 29px; font-weight: 800; }

.month-section { margin-bottom: 26px; }
.month-heading { display: flex; align-items: baseline; justify-content: space-between; margin: 28px 2px 12px; }
.month-heading h3 { color: var(--dark-green); font-size: 16px; }
.month-heading span { color: var(--muted); font-size: 12px; }
.workout-card { margin-bottom: 12px; padding: 18px; box-shadow: none; }
.date-label { color: var(--muted); font-size: 13px; font-weight: 700; }
.duration-pill, .set-count { border-radius: 10px; background: #edf5ee; color: var(--dark-green); font-size: 12px; font-weight: 800; }
.duration-pill { padding: 8px 10px; }

.exercise-block { margin-top: 19px; padding-top: 15px; border-top: 1px solid var(--border); }
.exercise-title { justify-content: space-between; gap: 8px; margin-bottom: 10px; font-size: 15px; font-weight: 800; }
.set-count { padding: 6px 8px; }
.set-card { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; padding: 11px; border: 1px solid var(--border); border-radius: 14px; background: #fbfcfa; }
.set-card-main { display: grid; grid-template-columns: auto repeat(2, 1fr); align-items: center; gap: 9px; width: 100%; }
.set-card small { display: block; color: var(--muted); font-size: 9px; font-weight: 800; }
.set-card strong { display: block; margin-top: 3px; font-size: 13px; white-space: nowrap; }
.set-badge { padding: 7px 8px; border-radius: 9px; background: var(--green); color: var(--dark-green); font-size: 10px; font-weight: 800; white-space: nowrap; }
.exercise-note { margin: 10px 0 0; padding: 10px 12px; border-left: 3px solid var(--green); border-radius: 8px; background: #f7faf6; color: var(--muted); font-size: 12px; line-height: 1.4; }
.empty-state { padding: 35px; border: 1px dashed #cdd5ce; border-radius: 22px; color: var(--muted); text-align: center; }

.primary-button { width: 100%; margin-top: 10px; padding: 15px; border: 0; border-radius: 15px; background: var(--ink); color: #fff; font-weight: 800; }
.secondary-button { display: block; width: 100%; padding: 13px; border: 1px solid var(--dark-green); border-radius: 14px; background: transparent; color: var(--dark-green); text-align: center; font-weight: 800; }
.text-button { min-height: 38px; padding: 8px 10px; border: 0; border-radius: 10px; background: transparent; color: var(--dark-green); font-size: 13px; font-weight: 800; }

.bottom-nav { position: fixed; right: 50%; bottom: max(15px, env(safe-area-inset-bottom)); justify-content: space-around; width: calc(100% - 30px); max-width: 740px; padding: 11px 10px; transform: translateX(50%); border: 1px solid var(--border); border-radius: 18px; background: rgba(255, 255, 255, .94); box-shadow: var(--shadow); backdrop-filter: blur(12px); z-index: 10; }
.nav-button { min-height: 38px; padding: 8px 12px; border: 0; border-radius: 10px; background: transparent; color: var(--muted); font-size: 12px; font-weight: 700; }
.nav-button.active { background: #edf5ee; color: var(--dark-green); }
.hidden-view { display: none !important; }
.view { animation: appear .25s ease; }
@keyframes appear { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.progress-highlight { margin-bottom: 16px; padding: 23px; background: var(--green); box-shadow: none; }
.progress-highlight .eyebrow, .progress-highlight h3 { color: var(--dark-green); }
.progress-highlight p:last-child { margin-bottom: 0; color: var(--dark-green); }
.exercise-summary-row { display: flex; justify-content: space-between; gap: 10px; padding: 15px 0; border-bottom: 1px solid var(--border); }
.exercise-summary-row:last-child { border-bottom: 0; }
.exercise-summary-row strong { font-size: 14px; }
.exercise-summary-row span { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; }
.exercise-summary-value { text-align: right; }
.exercise-summary-value strong { color: var(--dark-green); font-size: 18px; }
.consistency-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-top: 16px; }
.consistency-grid div { padding: 13px 8px; border-radius: 14px; background: #f6f8f5; text-align: center; }
.consistency-grid strong { display: block; color: var(--dark-green); font-size: 21px; }
.consistency-grid span { display: block; margin-top: 4px; color: var(--muted); font-size: 10px; }

.profile-card, .exercise-form-card, .progress-card { margin-bottom: 16px; padding: 21px; }
.avatar { display: grid; width: 50px; height: 50px; margin-bottom: 17px; place-items: center; border-radius: 16px; background: var(--green); color: var(--dark-green); font-weight: 800; }
.profile-actions { display: grid; gap: 12px; }
.file-button { cursor: pointer; }
.file-button input { display: none; }

.workout-form { display: grid; gap: 15px; }
.workout-form label, .exercise-form-card label { display: block; color: var(--muted); font-size: 13px; font-weight: 700; }
.workout-form input, .workout-form select, .exercise-form-card input, .exercise-form-card textarea { display: block; width: 100%; margin-top: 7px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: #fbfcfa; color: var(--ink); font-size: 16px; }
.exercise-form-card textarea { resize: vertical; line-height: 1.4; }
.exercise-form-header { display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 12px; }
.remove-exercise-button { min-height: 38px; border: 0; background: transparent; color: var(--danger); font-size: 12px; font-weight: 800; }
.exercise-notes-field { margin-top: 14px; }
.sets-list { display: grid; gap: 8px; }
.set-inputs { display: grid; grid-template-columns: .65fr 1fr 1fr 36px; align-items: end; gap: 7px; margin-top: 13px; }
.set-inputs input[readonly] { background: #edf5ee; color: var(--dark-green); font-weight: 800; text-align: center; }
.remove-set-button { width: 36px; height: 44px; border: 0; border-radius: 11px; background: #fbeaea; color: var(--danger); font-size: 22px; line-height: 1; }
.add-set-button { min-height: 38px; margin-top: 14px; border: 0; background: transparent; color: var(--dark-green); font-size: 13px; font-weight: 800; }

@media (max-width: 540px) {
    .app-shell { padding-right: 15px; padding-left: 15px; }
    h1 { font-size: 39px; }
    .set-card-main { grid-template-columns: auto repeat(2, 1fr); gap: 7px; }
    .set-card strong { font-size: 12px; }
    .exercise-form-header { grid-template-columns: 1fr; }
    .remove-exercise-button { justify-self: start; }
    .set-inputs { grid-template-columns: .65fr 1fr 1fr 36px; gap: 6px; }
    .set-inputs label { font-size: 11px; }
    .consistency-grid strong { font-size: 18px; }
}
```

La ampliación automática del iPhone se produce normalmente cuando los campos tienen un tamaño de texto inferior a 16 píxeles. Por eso los `input`, `select` y `textarea` utilizan `font-size: 16px`. [web:460][web:466]

---

# Parte 4 — Reemplazar `app.js`

Abre `app.js`, pulsa `Ctrl + A`, elimina todo y pega:

```javascript
const STORAGE_KEY = "pulse_workouts_v1";

const navButtons = document.querySelectorAll(".nav-button");
const views = document.querySelectorAll(".view");
const newWorkoutButton = document.querySelector("#new-workout-button");
const closeWorkoutButton = document.querySelector("#close-workout-button");
const workoutForm = document.querySelector("#workout-form");
const exerciseList = document.querySelector("#exercise-list");
const exerciseTemplate = document.querySelector("#exercise-template");
const addExerciseButton = document.querySelector("#add-exercise-button");
const exportButton = document.querySelector("#export-button");
const importInput = document.querySelector("#import-input");

let workouts = normaliseWorkouts(loadWorkouts());

function loadWorkouts() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveWorkouts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

function normaliseWorkouts(items) {
    if (!Array.isArray(items)) return [];

    return items.map((workout) => ({
        id: workout.id || crypto.randomUUID(),
        date: workout.date || workout.dia || today(),
        duration: Number(workout.duration ?? workout.duracion ?? workout.duracion_minutos ?? 0),
        type: workout.type || workout.tipo || "Core",
        exercises: (workout.exercises || workout.ejercicios || []).map((exercise) => ({
            name: exercise.name || exercise.nombre || "Ejercicio",
            notes: exercise.notes || exercise.notas || "",
            sets: (exercise.sets || []).map((set, index) => ({
                number: Number(set.number ?? set.numero ?? set.numero_set ?? index + 1),
                reps: Number(set.reps ?? set.repeticiones ?? 0),
                weight: Number(set.weight ?? set.peso ?? set.peso_kg ?? 0)
            }))
        }))
    }));
}

function today() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonth(dateString) {
    const [year, month] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(date);
}

function showView(viewId) {
    views.forEach((view) => {
        view.classList.toggle("hidden-view", view.id !== viewId);
        view.classList.toggle("active-view", view.id === viewId);
    });

    newWorkoutButton.classList.toggle("hidden-view", viewId === "new-workout-view");

    navButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.view === viewId);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
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

            if (!summary[name]) {
                summary[name] = {
                    name,
                    sessions: 0,
                    sets: 0,
                    maxWeight: 0,
                    lastDate: "",
                    history: []
                };
            }

            summary[name].sessions += 1;
            summary[name].lastDate = workout.date > summary[name].lastDate ? workout.date : summary[name].lastDate;

            exercise.sets.forEach((set) => {
                const weight = Number(set.weight);
                summary[name].sets += 1;
                summary[name].maxWeight = Math.max(summary[name].maxWeight, weight);
                summary[name].history.push({ date: workout.date, weight });
            });
        });
    });

    return Object.values(summary).sort((a, b) => b.maxWeight - a.maxWeight || a.name.localeCompare(b.name));
}

function render() {
    const stats = calculateStats();
    const summary = calculateExerciseSummary();

    document.querySelector("#total-sessions").textContent = stats.sessions;
    document.querySelector("#progress-sessions").textContent = stats.sessions;
    document.querySelector("#progress-minutes").textContent = stats.minutes;
    document.querySelector("#progress-types").textContent = stats.types;

    renderWorkouts();
    renderExerciseSummary(summary);
}

function renderWorkouts() {
    const container = document.querySelector("#workout-list");
    container.innerHTML = "";

    if (!workouts.length) {
        container.innerHTML = `<div class="empty-state">Todavía no hay entrenamientos registrados.</div>`;
        return;
    }

    const groups = {};

    workouts
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .forEach((workout) => {
            const monthKey = workout.date.slice(0, 7);
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(workout);
        });

    Object.entries(groups).forEach(([monthKey, monthWorkouts]) => {
        const monthSection = document.createElement("section");
        monthSection.className = "month-section";
        monthSection.innerHTML = `
            <div class="month-heading">
                <h3>${formatMonth(`${monthKey}-01`)}</h3>
                <span>${monthWorkouts.length} ${monthWorkouts.length === 1 ? "sesión" : "sesiones"}</span>
            </div>
        `;

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

                const noteHtml = exercise.notes
                    ? `<p class="exercise-note">${escapeHtml(exercise.notes)}</p>`
                    : "";

                return `
                    <div class="exercise-block">
                        <div class="exercise-title">
                            <span>${escapeHtml(exercise.name)}</span>
                            <span class="set-count">${exercise.sets.length} sets</span>
                        </div>
                        ${setsHtml}
                        ${noteHtml}
                    </div>
                `;
            }).join("");

            card.innerHTML = `
                <div class="workout-header">
                    <div>
                        <span class="date-label">${workout.date}</span>
                        <h3>${escapeHtml(workout.type)}</h3>
                    </div>
                    <span class="duration-pill">${workout.duration} min</span>
                </div>
                ${exercisesHtml}
            `;

            monthSection.appendChild(card);
        });

        container.appendChild(monthSection);
    });
}

function renderExerciseSummary(summary) {
    const container = document.querySelector("#exercise-summary");

    if (!summary.length) {
        container.innerHTML = `<p class="muted">Todavía no hay ejercicios.</p>`;
        return;
    }

    container.innerHTML = summary.map((exercise) => {
        const previous = exercise.history
            .filter((item) => item.weight < exercise.maxWeight)
            .sort((a, b) => b.date.localeCompare(a.date))[0];

        const improvement = previous
            ? `<span class="progress-up">+${(exercise.maxWeight - previous.weight).toFixed(1)} kg desde ${previous.weight} kg</span>`
            : `<span>Primer registro o mejor marca inicial</span>`;

        return `
            <div class="exercise-summary-row">
                <div>
                    <strong>${escapeHtml(exercise.name)}</strong>
                    <span>${exercise.sessions} sesiones · ${exercise.sets} sets</span>
                    ${improvement}
                </div>
                <div class="exercise-summary-value">
                    <strong>${exercise.maxWeight} kg</strong>
                    <span>máximo</span>
                </div>
            </div>
        `;
    }).join("");
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renumberSets(card) {
    card.querySelectorAll(".set-inputs").forEach((row, index) => {
        row.querySelector(".set-number-input").value = index + 1;
    });
}

function createExercise() {
    const fragment = exerciseTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".exercise-form-card");
    const removeButton = fragment.querySelector(".remove-exercise-button");
    const addSetButton = fragment.querySelector(".add-set-button");

    removeButton.addEventListener("click", () => card.remove());

    card.querySelector(".remove-set-button").addEventListener("click", (event) => {
        const rows = card.querySelectorAll(".set-inputs");
        if (rows.length > 1) {
            event.currentTarget.closest(".set-inputs").remove();
            renumberSets(card);
        }
    });

    addSetButton.addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "set-inputs";
        row.innerHTML = `
            <label>Set<input class="set-number-input" type="number" min="1" readonly required></label>
            <label>Reps<input class="reps-input" type="number" min="1" placeholder="10" required></label>
            <label>Peso kg<input class="weight-input" type="number" min="0" step="0.5" placeholder="40" required></label>
            <button class="remove-set-button" type="button" aria-label="Eliminar set">×</button>
        `;

        row.querySelector(".remove-set-button").addEventListener("click", () => {
            row.remove();
            renumberSets(card);
        });

        card.querySelector(".sets-list").appendChild(row);
        renumberSets(card);
    });

    exerciseList.appendChild(fragment);
    renumberSets(card);
}

function readExercises() {
    return Array.from(document.querySelectorAll(".exercise-form-card")).map((card) => ({
        name: card.querySelector(".exercise-name").value.trim(),
        notes: card.querySelector(".exercise-notes").value.trim(),
        sets: Array.from(card.querySelectorAll(".set-inputs")).map((row) => ({
            number: Number(row.querySelector(".set-number-input").value),
            reps: Number(row.querySelector(".reps-input").value),
            weight: Number(row.querySelector(".weight-input").value)
        }))
    }));
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
    reader.onload = () => {
        try {
            workouts = normaliseWorkouts(JSON.parse(reader.result));
            saveWorkouts();
            render();
            alert("Copia importada correctamente");
        } catch {
            alert("No se ha podido importar el archivo");
        }
    };
    reader.readAsText(file);
}

navButtons.forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
newWorkoutButton.addEventListener("click", () => showView("new-workout-view"));
closeWorkoutButton.addEventListener("click", () => showView("summary-view"));
addExerciseButton.addEventListener("click", createExercise);
exportButton.addEventListener("click", exportBackup);
importInput.addEventListener("change", importBackup);

workoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const workout = {
        id: crypto.randomUUID(),
        date: document.querySelector("#workout-date").value,
        duration: Number(document.querySelector("#workout-duration").value),
        type: document.querySelector("#workout-type").value,
        exercises: readExercises()
    };

    workouts.push(workout);
    saveWorkouts();
    workoutForm.reset();
    exerciseList.innerHTML = "";
    document.querySelector("#workout-date").value = today();
    createExercise();
    render();
    showView("summary-view");
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}

createExercise();
render();
```

Guarda con:

```text
Ctrl + S
```

---

# Parte 5 — Conservar los datos existentes

La aplicación mantiene:

```javascript
const STORAGE_KEY = "pulse_workouts_v1";
```

Además, `normaliseWorkouts()` entiende tanto los nombres antiguos como los nuevos:

```text
name / nombre
notes / notas
sets
```

Por tanto, las sesiones existentes deberían seguir apareciendo y sus sets se conservarán.

No cambies la constante `STORAGE_KEY`.

## Copia de seguridad recomendada

Antes de subir la nueva versión:

1. Abre la versión actual de Pulse.
2. Ve a **Perfil**.
3. Pulsa **Exportar copia de seguridad**.
4. Guarda el archivo JSON en una carpeta segura.

La actualización de GitHub Pages no borra el almacenamiento local porque los datos están asociados al origen de la aplicación, no al contenido concreto de `app.js`. `localStorage` persiste entre recargas y sesiones del navegador mientras no se elimine el almacenamiento del sitio. [web:453][web:454]

---

# Parte 6 — Actualizar el service worker

Abre `service-worker.js` y cambia únicamente:

```javascript
const CACHE_NAME = "pulse-static-v1";
```

por:

```javascript
const CACHE_NAME = "pulse-static-v2";
```

Esto obliga al navegador a descargar la versión nueva de `index.html`, `styles.css` y `app.js`.

El contenido completo de `service-worker.js` debe quedar así:

```javascript
const CACHE_NAME = "pulse-static-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./manifest.json",
    "./icon.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key !== CACHE_NAME)
                .map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
```

---

# Parte 7 — Probar en el ordenador

## Paso 1: iniciar servidor local

Dentro de `pulse-pwa` ejecuta:

```powershell
python -m http.server 8000
```

Abre:

```text
http://127.0.0.1:8000
```

## Paso 2: probar el zoom

En la vista de iPhone 13 Pro:

1. Pulsa un campo de reps.
2. Escribe un número.
3. Pulsa un campo de peso.
4. Comprueba que la pantalla no cambia de tamaño.

En iOS, los controles de entrada con texto inferior a 16 píxeles pueden provocar ampliación automática; esta versión fija los controles a 16 píxeles. [web:460][web:466]

## Paso 3: probar eliminar sets

1. Pulsa **Nueva sesión**.
2. Añade un ejercicio.
3. Añade cuatro sets.
4. Pulsa `×` en el set 4.
5. Comprueba que quedan 1, 2 y 3.
6. Elimina el set 2.
7. Comprueba que los restantes vuelven a numerarse 1 y 2.

El primer set no se puede eliminar si es el único que queda, para evitar crear ejercicios sin ninguna serie.

## Paso 4: probar agrupación mensual

Crea sesiones con fechas de meses distintos, por ejemplo:

```text
2026-09-01
2026-09-15
2026-10-02
```

Resumen debería mostrar:

```text
Octubre de 2026
  1 sesión

Septiembre de 2026
  2 sesiones
```

## Paso 5: comprobar que ya no aparece volumen

No debería aparecer:

- Tarjeta de volumen.
- Columna VOL.
- Volumen por set.
- Volumen en Progreso.

El cálculo interno de volumen también se ha eliminado del código de esta versión.

## Paso 6: probar notas

1. Crea un ejercicio.
2. Escribe una nota:

```text
La última serie costó bastante; mantener el peso.
```

3. Guarda la sesión.
4. Comprueba que aparece debajo del ejercicio.

## Paso 7: probar Progreso

Progreso mostrará:

- Peso máximo por ejercicio.
- Número de sesiones.
- Número de sets.
- Comparación con un peso anterior cuando exista.
- Sesiones totales.
- Minutos totales.
- Número de tipos de entrenamiento utilizados.

---

# Parte 8 — Subir cambios a GitHub

## Paso 1: revisar cambios

En GitHub Desktop deberían aparecer:

```text
index.html
styles.css
app.js
service-worker.js
```

## Paso 2: crear commit

En **Summary**, escribe:

```text
Mejorar experiencia móvil y progreso
```

Pulsa:

```text
Commit to main
```

## Paso 3: subir

Pulsa:

```text
Push origin
```

GitHub Desktop enviará los cambios al repositorio remoto. [web:431]

## Paso 4: esperar GitHub Pages

GitHub Pages actualizará la versión publicada automáticamente después del push. Puede tardar unos minutos.

---

# Parte 9 — Actualizar la versión instalada en el iPhone

Cuando tengas el móvil:

1. Abre Pulse con conexión a Internet.
2. Espera unos segundos.
3. Cierra completamente la aplicación.
4. Vuelve a abrirla.
5. Comprueba la nueva versión.

Si sigue apareciendo la versión antigua:

1. Abre la aplicación una vez con Internet.
2. Cierra y vuelve a abrirla.
3. Si sigue igual, elimina temporalmente la PWA **solo después de exportar una copia**.
4. Vuelve a añadirla a pantalla de inicio.
5. Importa la copia si fuera necesario.

No elimines la PWA como primera medida: el cambio de `CACHE_NAME` a `v2` debería actualizar el contenido sin borrar `localStorage`.

---

# Resumen de cambios

| Solicitud | Solución |
|---|---|
| Pantalla se amplía | Inputs con `font-size: 16px` |
| Eliminar sets | Botón `×` y renumeración automática |
| Quitar tarjeta verde | Resumen rediseñado sin hero card |
| Agrupar por meses | Secciones mensuales automáticas |
| Quitar volumen | Eliminado de Resumen, sets y Progreso |
| Mejorar Progreso | Peso máximo, sesiones, sets y mejora |
| Notas por ejercicio | Campo `textarea` y visualización en historial |
| Conservar datos | Misma clave `pulse_workouts_v1` y normalización |

# Siguiente paso

Después de validar esta versión, la mejora técnica recomendada será migrar de `localStorage` a IndexedDB. No es necesario hacerlo antes de probar estos cambios.
