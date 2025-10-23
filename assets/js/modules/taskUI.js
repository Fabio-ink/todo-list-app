import { getTasks, updateTasks } from './storage.js';
import { applyFilters } from './filterSort.js';
import { formatDate } from './utils.js';
import { tableBody, taskRowTemplate } from './dom.js';

export function renderTasks(tasks) {
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

export function enterEditMode(row) {
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

  titleCell.innerHTML = `<input type=\"text\" value=\"${task.title}\">`;
  startDateCell.innerHTML = `<input type=\"date\" value=\"${task.startDate}\">`;
  endDateCell.innerHTML = `<input type=\"date\" value=\"${task.endDate}\">`;
  descCell.innerHTML = `<input type=\"text\" value=\"${task.description}\">`;
  etapaCell.innerHTML = `<input type=\"text\" value=\"${task.etapa}\">`;
  priorityCell.innerHTML = `
    <select class=\"edit-priority\">
      <option value=\"baixa\" ${task.priority === 'baixa' ? 'selected' : ''}>Baixa</option>
      <option value=\"media\" ${task.priority === 'media' ? 'selected' : ''}>Média</option>
      <option value=\"alta\" ${task.priority === 'alta' ? 'selected' : ''}>Alta</option>
    </select>
  `;

  const actionsCell = row.querySelector(".actionsCell");
  actionsCell.innerHTML = `<button class=\"saveBtn btn\">Salvar</button>`;
}

export function saveEditMode(row) {
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

export function openSettingsMenu(icon) {
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

export function toggleDetails(row) {
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
