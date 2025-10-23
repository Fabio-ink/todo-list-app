import { getTasks } from './storage.js';
import { renderTasks } from './taskUI.js';
import { filterInput, filterStatus, filterPriority } from './dom.js';

let currentSort = { column: 'startDate', direction: 'asc' };

export function applyFilters() {
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

export function updateSort(column) {
    const direction = (currentSort.column === column && currentSort.direction === 'asc') ? 'desc' : 'asc';
    currentSort = { column, direction };
    applyFilters();
    updateSortIcons();
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
