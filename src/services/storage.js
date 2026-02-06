const STORAGE_KEY = "taskflow_tasks_v1";

export function saveTasks(rawTasksArray) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rawTasksArray));
}

export function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearTasks() {
  localStorage.removeItem(STORAGE_KEY);
}
