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

let workouts = loadWorkouts();

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

function today() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
    const stats = {
        sessions: workouts.length,
        minutes: 0,
        sets: 0,
        volume: 0
    };

    workouts.forEach((workout) => {
        stats.minutes += Number(workout.duration);

        workout.exercises.forEach((exercise) => {
            exercise.sets.forEach((set) => {
                stats.sets += 1;
                stats.volume += Number(set.reps) * Number(set.weight);
            });
        });
    });

    stats.volume = Math.round(stats.volume * 100) / 100;
    return stats;
}

function calculateExerciseSummary() {
    const summary = {};

    workouts.forEach((workout) => {
        workout.exercises.forEach((exercise) => {
            const name = exercise.name.trim();

            if (!summary[name]) {
                summary[name] = {
                    name,
                    sessions: 0,
                    sets: 0,
                    maxWeight: 0,
                    volume: 0
                };
            }

            summary[name].sessions += 1;

            exercise.sets.forEach((set) => {
                const weight = Number(set.weight);
                const reps = Number(set.reps);

                summary[name].sets += 1;
                summary[name].maxWeight = Math.max(
                    summary[name].maxWeight,
                    weight
                );
                summary[name].volume += reps * weight;
            });
        });
    });

    return Object.values(summary).sort((a, b) => b.volume - a.volume);
}

function render() {
    const stats = calculateStats();

    document.querySelector("#total-sessions").textContent = stats.sessions;
    document.querySelector("#total-minutes").textContent = stats.minutes;
    document.querySelector("#total-sets").textContent = stats.sets;
    document.querySelector("#total-volume").textContent = stats.volume;

    renderWorkouts();
    renderExerciseSummary();
}

function renderWorkouts() {
    const container = document.querySelector("#workout-list");
    container.innerHTML = "";

    if (!workouts.length) {
        container.innerHTML = `
            <div class="empty-state">
                Todavía no hay entrenamientos registrados.
            </div>
        `;
        return;
    }

    workouts
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .forEach((workout) => {
            const card = document.createElement("article");
            card.className = "workout-card";

            const exercisesHtml = workout.exercises.map((exercise) => {
                const setsHtml = exercise.sets.map((set) => {
                    const volume = Number(set.reps) * Number(set.weight);

                    return `
                        <div class="set-card">
                            <div class="set-card-main">
                                <span class="set-badge">Set ${set.number}</span>
                                <div><small>REPS</small><strong>${set.reps}</strong></div>
                                <div><small>PESO</small><strong>${set.weight} kg</strong></div>
                                <div><small>VOL.</small><strong>${volume} kg</strong></div>
                            </div>
                        </div>
                    `;
                }).join("");

                return `
                    <div class="exercise-block">
                        <div class="exercise-title">
                            <span>${escapeHtml(exercise.name)}</span>
                            <span class="set-count">${exercise.sets.length} sets</span>
                        </div>
                        <div class="sets-table">${setsHtml}</div>
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

            container.appendChild(card);
        });
}

function renderExerciseSummary() {
    const container = document.querySelector("#exercise-summary");
    const summary = calculateExerciseSummary();

    if (!summary.length) {
        container.innerHTML = `<p class="muted">Todavía no hay ejercicios.</p>`;
        return;
    }

    container.innerHTML = summary.map((exercise) => `
        <div class="exercise-summary-row">
            <div>
                <strong>${escapeHtml(exercise.name)}</strong>
                <span>${exercise.sessions} sesiones · ${exercise.sets} sets</span>
            </div>
            <div class="exercise-summary-value">
                <strong>${exercise.maxWeight} kg</strong>
                <span>máximo</span>
            </div>
        </div>
    `).join("");
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

    addSetButton.addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "set-inputs";
        row.innerHTML = `
            <label>Set<input class="set-number-input" type="number" min="1" required></label>
            <label>Reps<input class="reps-input" type="number" min="1" required></label>
            <label>Peso kg<input class="weight-input" type="number" min="0" step="0.5" required></label>
        `;

        const firstRow = card.querySelector(".set-inputs");
        firstRow.parentElement.insertBefore(row, addSetButton);
        renumberSets(card);
    });

    exerciseList.appendChild(fragment);
    renumberSets(card);
}

function readExercises() {
    return Array.from(document.querySelectorAll(".exercise-form-card")).map((card) => ({
        name: card.querySelector(".exercise-name").value.trim(),
        sets: Array.from(card.querySelectorAll(".set-inputs")).map((row) => ({
            number: Number(row.querySelector(".set-number-input").value),
            reps: Number(row.querySelector(".reps-input").value),
            weight: Number(row.querySelector(".weight-input").value)
        }))
    }));
}

function exportBackup() {
    const file = new Blob(
        [JSON.stringify(workouts, null, 2)],
        { type: "application/json" }
    );
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
            const imported = JSON.parse(reader.result);

            if (!Array.isArray(imported)) {
                throw new Error("Formato incorrecto");
            }

            workouts = imported;
            saveWorkouts();
            render();
            alert("Copia importada correctamente");
        } catch {
            alert("No se ha podido importar el archivo");
        }
    };

    reader.readAsText(file);
}

navButtons.forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
});

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
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js");
    });
}

createExercise();
render();