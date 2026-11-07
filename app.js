
// ======================================
// 1. RÉCUPÉRER LES ÉLÉMENTS HTML
// ======================================

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

const totalCount = document.getElementById("total-count");
const allCount = document.getElementById("all-count");
const activeCount = document.getElementById("active-count");
const completedCount = document.getElementById("completed-count");

const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-bar-container");
const progressText = document.getElementById("progress-text");

const emptyMessage = document.getElementById("empty-message");
const clearCompletedButton = document.getElementById("clear-completed");
const themeToggle = document.getElementById("theme-toggle");


// ======================================
// 2. CONFIGURATION REDUX TOOLKIT
// ======================================

const { createSlice, configureStore } = RTK;

// Récupérer les anciennes tâches sauvegardées
const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Créer le Slice
const tasksSlice = createSlice({
    name: "tasks",

    initialState: savedTasks,

    reducers: {

        // Ajouter une tâche
        addTask: function (state, action) {
            state.push(action.payload);
        },

        // Modifier une tâche
        editTask: function (state, action) {
            const task = state.find(
                task => task.id === action.payload.id
            );

            if (task) {
                task.description = action.payload.description;
            }
        },

        // Cocher ou décocher une tâche
        toggleTask: function (state, action) {
            const task = state.find(
                task => task.id === action.payload
            );

            if (task) {
                task.isDone = !task.isDone;
            }
        },

        // Supprimer une tâche
        deleteTask: function (state, action) {
            return state.filter(
                task => task.id !== action.payload
            );
        },

        // Effacer toutes les tâches terminées
        clearCompleted: function (state) {
            return state.filter(task => !task.isDone);
        }

    }
});


// ======================================
// 3. CRÉER LE STORE REDUX
// ======================================

const store = configureStore({
    reducer: {
        tasks: tasksSlice.reducer
    }
});

// Récupérer les actions
const {
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    clearCompleted
} = tasksSlice.actions;


// ======================================
// 4. SAUVEGARDER LES TÂCHES
// ======================================

function saveTasks() {
    localStorage.setItem(
        "tasks",
        JSON.stringify(store.getState().tasks)
    );
}


// ======================================
// 5. FILTRAGE DES TÂCHES
// ======================================

let currentFilter = "all";


// ======================================
// 6. CHANGER LE THÈME
// ======================================

themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark-theme");

    const isDark = document.body.classList.contains("dark-theme");

    themeToggle.textContent = isDark ? "☀️" : "🌙";

    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Activer le thème clair" : "Activer le thème sombre"
    );

});


// ======================================
// 7. AFFICHER LES TÂCHES
// ======================================

function renderTasks() {

    const tasks = store.getState().tasks;

    taskList.replaceChildren();

    // Appliquer le filtre
    const filteredTasks = tasks.filter(function (task) {

        if (currentFilter === "active") {
            return !task.isDone;
        }

        if (currentFilter === "completed") {
            return task.isDone;
        }

        return true;

    });

    filteredTasks.forEach(function (task) {

        const li = document.createElement("li");
        li.className = "task-item";

        if (task.isDone) {
            li.classList.add("completed");
        }

        // Case à cocher
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.isDone;
        checkbox.setAttribute("aria-label", "Terminer " + task.description);

        // Description
        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.description;

        // Bouton modifier
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-outline-primary btn-sm";
        editButton.textContent = "Modifier";

        // Bouton supprimer
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-outline-danger btn-sm";
        deleteButton.textContent = "Supprimer";

        // Modifier une tâche
        editButton.addEventListener("click", function () {

            const newDescription = prompt(
                "Modifier la tâche :",
                task.description
            );

            if (newDescription && newDescription.trim() !== "") {

                store.dispatch(editTask({
                    id: task.id,
                    description: newDescription.trim()
                }));

            }

        });

        // Cocher une tâche
        checkbox.addEventListener("change", function () {

            store.dispatch(toggleTask(task.id));

        });

        // Supprimer une tâche
        deleteButton.addEventListener("click", function () {

            store.dispatch(deleteTask(task.id));

        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editButton);
        li.appendChild(deleteButton);

        taskList.appendChild(li);

    });

    updateProgress();

}


// ======================================
// 8. CALCULER LA PROGRESSION
// ======================================

function updateProgress() {

    const tasks = store.getState().tasks;

    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.isDone === true;
    }).length;

    const active = total - completed;

    let percentage = 0;

    if (total > 0) {
        percentage = Math.round((completed / total) * 100);
    }

    totalCount.textContent = total + (total > 1 ? " tâches" : " tâche");

    allCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;

    progressBar.style.width = percentage + "%";

    progressText.textContent = percentage + "%";

    progressContainer.setAttribute("aria-valuenow", percentage);

    emptyMessage.hidden = total > 0;

    clearCompletedButton.disabled = completed === 0;

    clearCompletedButton.textContent =
        "Effacer les terminées (" + completed + ")";

}


// ======================================
// 9. AJOUTER UNE NOUVELLE TÂCHE
// ======================================

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const description = taskInput.value.trim();

    if (description === "") {
        return;
    }

    const newTask = {
        id: Date.now(),
        description: description,
        isDone: false
    };

    // Envoyer la nouvelle tâche à Redux
    store.dispatch(addTask(newTask));

    taskInput.value = "";
    taskInput.focus();

});


// ======================================
// 10. GÉRER LES FILTRES
// ======================================

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(function (btn) {
            btn.classList.remove("btn-warning");
            btn.classList.add("btn-outline-secondary");
        });

        button.classList.remove("btn-outline-secondary");
        button.classList.add("btn-warning");

        renderTasks();

    });

});


// ======================================
// 11. EFFACER LES TÂCHES TERMINÉES
// ======================================

clearCompletedButton.addEventListener("click", function () {

    store.dispatch(clearCompleted());

});


// ======================================
// 12. ÉCOUTER LES CHANGEMENTS REDUX
// ======================================

store.subscribe(function () {

    saveTasks();
    renderTasks();

});


// ======================================
// 13. AFFICHER LES TÂCHES AU DÉMARRAGE
// ======================================

renderTasks();
