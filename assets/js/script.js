// --- ELEMENTOS GLOBAIS ---
console.log("Script iniciado.");
const form = document.getElementById("taskForm");
const tableBody = document.getElementById("taskTableBody");
const taskRowTemplate = document.getElementById("taskRowTemplate");

// --- FUNÇÕES AUXILIARES ---
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

// --- EVENT LISTENERS PRINCIPAIS ---

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM completamente carregado. Iniciando funções.");
  applyFilters(); // Carga inicial de tarefas já com filtro
  setupResizableFeatures();
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


// --- FUNÇÕES DE RENDERIZAÇÃO E UI ---

function renderTasks(tasks) {
  console.log("Renderizando tarefas na tabela:", tasks.length);
  tableBody.innerHTML = ""; // Limpa a tabela antes de desenhar
  tasks.forEach(task => {
    const row = document.importNode(taskRowTemplate.content, true).querySelector('tr');
    
    row.dataset.id = task.id;
    row.querySelector(".checkTask").checked = task.completed;
    row.querySelector(".priority .priority-indicator").className = `priority-indicator priority-${task.priority}`;
    row.querySelector(".title").textContent = task.title;
    row.querySelector(".startDate").textContent = formatDate(task.startDate);
    row.querySelector(".endDate").textContent = formatDate(task.endDate);
    row.querySelector(".description").textContent = task.description;
    row.querySelector(".etapa").textContent = task.etapa;

    if (task.completed) {
      row.classList.add("completed");
    }

    tableBody.appendChild(row);
  });
}

function enterEditMode(row) {
  const id = Number(row.dataset.id);
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) return;

  const titleCell = row.querySelector(".title");
  const startDateCell = row.querySelector(".startDate");
  const endDateCell = row.querySelector(".endDate");
  const descCell = row.querySelector(".description");
  const etapaCell = row.querySelector(".etapa");
  const priorityCell = row.querySelector(".priority");

  titleCell.innerHTML = `<input type="text" value="${task.title}">`;
  startDateCell.innerHTML = `<input type="date" value="${task.startDate}">`;
  endDateCell.innerHTML = `<input type="date" value="${task.endDate}">`;
  descCell.innerHTML = `<input type="text" value="${task.description}">`;
  etapaCell.innerHTML = `<input type="text" value="${task.etapa}">`;
  priorityCell.innerHTML = `
    <select class="edit-priority">
      <option value="baixa" ${task.priority === 'baixa' ? 'selected' : ''}>Baixa</option>
      <option value="media" ${task.priority === 'media' ? 'selected' : ''}>Média</option>
      <option value="alta" ${task.priority === 'alta' ? 'selected' : ''}>Alta</option>
    </select>
  `;

  const actionsCell = row.querySelector(".actionsCell");
  actionsCell.innerHTML = `<button class="saveBtn btn">Salvar</button>`;
}

function saveEditMode(row) {
  const id = Number(row.dataset.id);

  const updatedTask = {
      title: row.querySelector(".title input").value,
      startDate: row.querySelector(".startDate input").value,
      endDate: row.querySelector(".endDate input").value,
      description: row.querySelector(".description input").value,
      etapa: row.querySelector(".etapa input").value,
      priority: row.querySelector(".edit-priority").value,
  };

  let tasks = getTasks();
  tasks = tasks.map(task =>
    task.id === id ? { ...task, ...updatedTask } : task
  );
  updateTasks(tasks);

  applyFilters(); // Re-renderiza a tabela para mostrar os dados atualizados
}

function openSettingsMenu(icon) {
  document.querySelectorAll(".floatingMenu").forEach(m => m.remove());
  const row = icon.closest("tr");
  const menu = document.createElement("div");
  menu.classList.add("floatingMenu");
  menu.innerHTML = `
    <button class="menuEditBtn btn">Editar</button>
    <button class="menuDeleteBtn btn">Excluir</button>
    <button class="menuDetailsBtn btn">Detalhes</button>
  `;
  document.body.appendChild(menu);

  const rect = icon.getBoundingClientRect();
  menu.style.position = "absolute";
  menu.style.top = `${rect.bottom + window.scrollY}px`;
  menu.style.left = `${rect.left + window.scrollX}px`;
  menu.style.zIndex = 1000;
  menu.style.backgroundColor = "#f4f4f4";
  menu.style.border = "1px solid #ccc";
  menu.style.borderRadius = "8px";
  menu.style.padding = "5px";
  menu.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";

  menu.querySelector(".menuEditBtn").addEventListener("click", () => {
    enterEditMode(row);
    menu.remove();
  });
  menu.querySelector(".menuDeleteBtn").addEventListener("click", () => {
    const id = Number(row.dataset.id);
    let tasks = getTasks();
    tasks = tasks.filter(task => task.id !== id);
    updateTasks(tasks);
    applyFilters(); // Re-renderiza a tabela sem a tarefa excluída
    menu.remove();
  });
  menu.querySelector(".menuDetailsBtn").addEventListener("click", () => {
    toggleDetails(row);
    menu.remove();
  });

  setTimeout(() => {
    document.addEventListener("click", function closeMenu(ev) {
      if (!menu.contains(ev.target) && ev.target !== icon) {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    });
  }, 0);
}

function toggleDetails(row) {
  let nextRow = row.nextElementSibling;
  if (nextRow && nextRow.classList.contains("detailsRow")) {
    nextRow.remove();
    return;
  }
  const id = Number(row.dataset.id);
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) return;

  const detailsRow = document.createElement("tr");
  detailsRow.classList.add("detailsRow");

  detailsRow.innerHTML = `
    <td colspan="7">
      <div class="details-wrapper">
        <dl>
          <div class="detail-pair">
            <dt>Título</dt>
            <dd>${task.title}</dd>
          </div>
          <div class="detail-pair">
            <dt>Data de Início</dt>
            <dd>${formatDate(task.startDate)}</dd>
          </div>
          <div class="detail-pair">
            <dt>Data Final</dt>
            <dd>${formatDate(task.endDate)}</dd>
          </div>
          <div class="detail-pair description-pair">
            <dt>Descrição</dt>
            <dd>${task.description || 'N/A'}</dd>
          </div>
        </dl>
      </div>
    </td>`;

  row.after(detailsRow);
}

// --- FUNÇÕES DE PERSISTÊNCIA (LocalStorage) ---

function getTasks() {
  const tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks) : [];
}

function updateTasks(tasks) {
  console.log("Atualizando tarefas no localStorage...");
  localStorage.setItem("tasks", JSON.stringify(tasks));
  console.log("Tarefas atualizadas. Conteúdo:", localStorage.getItem("tasks"));
}

// --- FUNCIONALIDADES DE REDIMENSIONAMENTO ---

function setupResizableFeatures() {
  console.log("Configurando funcionalidades de redimensionamento.");
  const table = document.querySelector("table");
  const savedTableWidth = localStorage.getItem("tableWidth");
  if (savedTableWidth) {
    table.style.width = savedTableWidth;
  }
  let debounceTimer;
  const tableResizeObserver = new ResizeObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const currentWidth = window.getComputedStyle(table).width;
      localStorage.setItem("tableWidth", currentWidth);
    }, 500);
  });
  tableResizeObserver.observe(table);

  const headers = table.querySelectorAll("th");
  headers.forEach(header => {
    const resizer = document.createElement("div");
    resizer.classList.add("resizer");
    header.appendChild(resizer);
    resizer.addEventListener("mousedown", initColumnResize);
  });

  function initColumnResize(e) {
    e.stopPropagation();
    e.preventDefault();
    const header = e.target.parentElement;
    const startX = e.pageX;
    const startWidth = header.offsetWidth;
    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
    function doDrag(e) {
      const newWidth = startWidth + (e.pageX - startX);
      if (newWidth > 40) {
        header.style.width = `${newWidth}px`;
      }
    }
    function stopDrag() {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    }
  }
}

// --- FUNCIONALIDADE DE EXPORTAÇÃO ---

const exportCsvBtn = document.getElementById('exportCsvBtn');
exportCsvBtn.addEventListener('click', exportTasksToCSV);

function exportTasksToCSV() {
  const tasks = getTasks();

  if (tasks.length === 0) {
    alert("Não há tarefas para exportar.");
    return;
  }

  const columns = [
    { key: 'title',       displayName: 'titulo' },
    { key: 'startDate',   displayName: 'dia inicio' },
    { key: 'endDate',     displayName: 'dia final' },
    { key: 'description', displayName: 'descrição' },
    { key: 'etapa',       displayName: 'etapa' },
    { key: 'priority',    displayName: 'prioridade' }
  ];

  const formatCsvCell = (cellData) => {
    const stringData = String(cellData || '');
    if (stringData.includes(';') || stringData.includes('"') || stringData.includes('\n')) {
      return `"${stringData.replace(/"/g, '""')}"`;
    }
    return stringData;
  };

  const headerRow = columns.map(col => col.displayName).join(';');
  const dataRows = tasks.map(task =>
    columns.map(col => formatCsvCell(task[col.key])).join(';')
  );
  const csvString = [headerRow, ...dataRows].join('\n');
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tarefas-backup-${new Date().toISOString().slice(0, 10)}.csv`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- SISTEMA DE FILTRO (REATORADO) ---

const filterInput = document.getElementById('filterInput');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');

searchBtn.addEventListener('click', applyFilters);

clearBtn.addEventListener('click', () => {
  filterInput.value = '';
  filterStatus.value = 'all';
  filterPriority.value = 'all';
  applyFilters();
});

// --- SORTING ---
let currentSort = { column: 'startDate', direction: 'asc' };

document.querySelectorAll(".sortable").forEach(header => {
  header.addEventListener("click", () => {
    const column = header.dataset.sort;
    const direction = (currentSort.column === column && currentSort.direction === 'asc') ? 'desc' : 'asc';
    currentSort = { column, direction };
    applyFilters();
    updateSortIcons();
  });
});

function sortTasks(tasks) {
  const { column, direction } = currentSort;
  if (!column) return tasks;

  const priorityOrder = { 'baixa': 1, 'media': 2, 'alta': 3 };

  return tasks.sort((a, b) => {
    let valA, valB;

    if (column === 'priority') {
      valA = priorityOrder[a.priority];
      valB = priorityOrder[b.priority];
    } else if (column.includes('Date')) {
      valA = new Date(a[column]);
      valB = new Date(b[column]);
    } else {
      valA = a[column].toLowerCase();
      valB = b[column].toLowerCase();
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

function updateSortIcons() {
  document.querySelectorAll('.sort-icon').forEach(icon => {
    icon.classList.remove('asc', 'desc');
  });
  const activeIcon = document.querySelector(`.sortable[data-sort="${currentSort.column}"] .sort-icon`);
  if (activeIcon) {
    activeIcon.classList.add(currentSort.direction);
  }
}

function applyFilters() {
  let allTasks = getTasks();
  const filterText = filterInput.value.trim().toLowerCase();
  const statusValue = filterStatus.value;
  const priorityValue = filterPriority.value;

  let filteredTasks = allTasks.filter(task => {
    const textMatches = (filterText === '') ? true : 
      (task.title.toLowerCase().includes(filterText) || task.description.toLowerCase().includes(filterText));
    
    const statusMatches = (statusValue === 'all') || 
      (statusValue === 'completed' && task.completed) || 
      (statusValue === 'pending' && !task.completed);
      
    const priorityMatches = (priorityValue === 'all') || (priorityValue === task.priority);

    return textMatches && statusMatches && priorityMatches;
  });

  filteredTasks = sortTasks(filteredTasks);
  renderTasks(filteredTasks);
}
