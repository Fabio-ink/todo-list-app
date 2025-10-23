import { getTasks } from './storage.js';

export function exportTasksToCSV() {
  const tasks = getTasks();

  if (tasks.length === 0) {
    alert("Não há tarefas para exportar.");
    return;
  }

  const columns = [
    { key: 'id',          displayName: 'ID' },
    { key: 'completed',   displayName: 'Concluída' },
    { key: 'priority',    displayName: 'Prioridade' },
    { key: 'title',       displayName: 'Título' },
    { key: 'startDate',   displayName: 'Data de Início' },
    { key: 'endDate',     displayName: 'Data Final' },
    { key: 'description', displayName: 'Descrição' },
    { key: 'etapa',       displayName: 'Etapa' }
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
