import { getTasks, updateTasks } from './storage.js';
import { applyFilters } from './filterSort.js';

// Simple CSV parser that handles quoted fields
function parseCSV(content) {
    const rows = [];
    let fields = [];
    let field = '';
    let inQuotes = false;

    // Normalize line endings
    content = content.replace(/\r\n/g, '\n');

    for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < content.length && content[i + 1] === '"') {
                    field += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ';') {
                fields.push(field);
                field = '';
            } else if (char === '\n') {
                fields.push(field);
                rows.push(fields);
                fields = [];
                field = '';
            } else {
                field += char;
            }
        }
    }

    // Add the last field if it exists
    if (field) {
        fields.push(field);
    }
    // Add the last row if it's not empty
    if (fields.length > 0) {
        rows.push(fields);
    }
    
    // Remove last empty row if file ends with a newline
    if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
        rows.pop();
    }

    return rows;
}


export function importTasksFromCSV(file) {
    if (!file) {
        alert('Por favor, selecione um arquivo CSV.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const content = e.target.result;
        // Remove BOM
        const cleanContent = content.startsWith('﻿') ? content.substring(1) : content;

        try {
            const rows = parseCSV(cleanContent);
            const headers = rows.shift().map(h => h.trim());

            const expectedHeaders = ['ID', 'Concluída', 'Prioridade', 'Título', 'Data de Início', 'Data Final', 'Descrição', 'Etapa'];
            const headerMap = {};
            expectedHeaders.forEach(h => {
                const index = headers.indexOf(h);
                if (index === -1) {
                    throw new Error(`Cabeçalho esperado "${h}" não encontrado no arquivo CSV.`);
                }
                headerMap[h] = index;
            });


            const tasks = getTasks();
            const existingIds = new Set(tasks.map(t => t.id));

            rows.forEach((row, index) => {
                if (row.every(field => field.trim() === '')) return; // Skip empty rows

                let id;
                const importedId = Number(row[headerMap['ID']]);

                // If ID from CSV is a number and doesn't exist, use it.
                if (importedId && !existingIds.has(importedId)) {
                    id = importedId;
                } else {
                    // Otherwise, generate a new one.
                    // Using Date.now() + index should be unique enough for a single import.
                    id = Date.now() + index;
                    // In the very rare case it's not unique, add a random number.
                    while(existingIds.has(id)) {
                        id = Date.now() + index + Math.floor(Math.random() * 1000);
                    }
                }
                
                // Add the new/validated ID to the set to avoid duplicates from the same CSV file
                existingIds.add(id);

                const completed = row[headerMap['Concluída']].toLowerCase() === 'true';
                const priority = row[headerMap['Prioridade']];
                const title = row[headerMap['Título']];
                const startDate = row[headerMap['Data de Início']];
                const endDate = row[headerMap['Data Final']];
                const description = row[headerMap['Descrição']];
                const etapa = row[headerMap['Etapa']];

                if (!title || !priority || !startDate || !endDate) {
                   console.error(`Linha ${index + 2}: Dados da tarefa inválidos. Pulando.`);
                   return;
                }

                const newTask = {
                    id: id,
                    title,
                    priority,
                    startDate,
                    endDate,
                    description,
                    completed,
                    etapa
                };

                tasks.push(newTask);
            });

            updateTasks(tasks);
            applyFilters(); // Re-render once after all tasks are added
            alert('Tarefas importadas com sucesso!');

        } catch (error) {
            console.error('Erro ao importar o arquivo CSV:', error);
            alert(`Erro ao importar arquivo: ${error.message}`);
        }
    };

    reader.onerror = function () {
        alert('Falha ao ler o arquivo.');
    };

    reader.readAsText(file, 'UTF-8');
}
