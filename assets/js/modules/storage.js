export function getTasks() {
  const tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks) : [];
}

export function updateTasks(tasks) {
  console.log("Atualizando tarefas no localStorage...");
  localStorage.setItem("tasks", JSON.stringify(tasks));
  console.log("Tarefas atualizadas. Conteúdo:", localStorage.getItem("tasks"));
}
