export function getTasks() {
  const tasksJSON = localStorage.getItem("tasks");
  if (!tasksJSON) return [];
  const tasks = JSON.parse(tasksJSON);
  // Ensure all task IDs are numbers for consistency
  return tasks.map(task => ({ ...task, id: Number(task.id) }));
}

export function updateTasks(tasks) {
  console.log("Atualizando tarefas no localStorage...");
  localStorage.setItem("tasks", JSON.stringify(tasks));
  console.log("Tarefas atualizadas. Conteúdo:", localStorage.getItem("tasks"));
}
