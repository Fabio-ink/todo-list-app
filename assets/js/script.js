import {
    form,
    tableBody,
    searchBtn,
    clearBtn,
    exportCsvBtn,
    importCsvBtn,
    csvFileInput
} from './modules/dom.js';
import { getTasks, updateTasks } from './modules/storage.js';
import { applyFilters, updateSort } from './modules/filterSort.js';
import { saveEditMode, openSettingsMenu } from './modules/taskUI.js';
import { exportTasksToCSV } from './modules/export.js';
import { importTasksFromCSV } from './modules/import.js';
import { setupResizableFeatures } from './modules/resizable.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM completamente carregado. Iniciando funções.");
    applyFilters(); // Carga inicial de tarefas já com filtro
    setupResizableFeatures();
    updateSort('startDate'); // Força a ordenação inicial e a exibição do ícone
});

form.addEventListener("submit", function (e) {
    console.log("Formulário enviado.");
    e.preventDefault();

    const task = {
        id: Date.now(),
        title: document.getElementById("title").value,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        description: document.getElementById("description").value,
        etapa: document.getElementById("etapa").value,
        priority: document.getElementById("priority").value,
        completed: false
    };
    console.log("Objeto da tarefa criado:", task);

    const tasks = getTasks();
    tasks.push(task);
    updateTasks(tasks);

    applyFilters(); // Re-renderiza a tabela com a nova tarefa
    form.reset();
});

tableBody.addEventListener("change", function(e) {
    if (e.target.classList.contains("checkTask")) {
        const row = e.target.closest("tr");
        const id = Number(row.dataset.id);
        let tasks = getTasks();
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: e.target.checked } : task
        );
        updateTasks(tasks);
        applyFilters(); // Re-renderiza para refletir a mudança de status no filtro
    }
});

tableBody.addEventListener("click", function (e) {
    const target = e.target;
    const row = target.closest("tr");

    if (target.classList.contains("saveBtn")) {
        saveEditMode(row);
    }

    if (target.classList.contains("settingsIcon")) {
        openSettingsMenu(target);
    }
});

searchBtn.addEventListener('click', applyFilters);

clearBtn.addEventListener('click', () => {
    document.getElementById('filterInput').value = '';
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterPriority').value = 'all';
    applyFilters();
});

document.querySelectorAll(".sortable").forEach(header => {
    header.addEventListener("click", () => {
        const column = header.dataset.sort;
        updateSort(column);
    });
});

exportCsvBtn.addEventListener('click', exportTasksToCSV);

importCsvBtn.addEventListener('click', () => {
    console.log("Import button clicked.");
    console.log("csvFileInput element:", csvFileInput);
    csvFileInput.click(); // Trigger the hidden file input
});

csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        importTasksFromCSV(file);
    }
    // Reset the input value to allow re-importing the same file
    e.target.value = null;
});
