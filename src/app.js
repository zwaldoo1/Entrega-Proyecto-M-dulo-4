import { Task } from "./models/task.js";
import { TaskManager } from "./models/TaskManager.js";
import { fetchDemoTasks, createRemoteTask } from "./services/api.js";
import { saveTasks, loadTasks, clearTasks } from "./services/storage.js";
import { $, renderTasks, toastShow, formatCountdown } from "./ui/dom.js";


// ==========================
// Estado principal
// ==========================
const manager = new TaskManager();
const elProgressText = document.querySelector("#progressText");
const elProgressBar = document.querySelector("#progressBar");


const elForm = $("#taskForm");
const elList = $("#taskList");
const elStats = $("#stats");
const elToast = $("#toast");

const elTitle = $("#title");
const elDescription = $("#description");
const elDueDate = $("#dueDate");
const elStatus = $("#status");

const elSearch = $("#search");
const elFilterStatus = $("#filterStatus");
const elLiveHint = $("#liveHint");

const elBtnLoadApi = $("#btnLoadApi");
const elBtnClearAll = $("#btnClearAll");

// ==========================
// Bootstrap: cargar desde localStorage
// ==========================
manager.hydrate(loadTasks());
render();

// ==========================
// Eventos DOM
// ==========================

// keyup (requisito: interactividad con keyup)
elSearch.addEventListener("keyup", () => render());
elTitle.addEventListener("keyup", () => {
  elLiveHint.textContent = `${elTitle.value.length}/80 caracteres`;
});

// cambio de filtro
elFilterStatus.addEventListener("change", () => render());

// submit: agregar (con async)
elForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = elTitle.value.trim();
  if (!title) return;

  const description = elDescription.value.trim();

  // destructuring (ES6)
  const { value: status } = elStatus;

  const dueAt = elDueDate.value ? new Date(elDueDate.value).toISOString() : null;

  await addTaskAsync({ title, description, status, dueAt });

  elForm.reset();
  elLiveHint.textContent = `0/80 caracteres`;
  render();

  // notificación tras 2 segundos (requisito async)
  setTimeout(() => toastShow(elToast, "✅ Tarea agregada correctamente (notificación async)"), 2000);
});

// Delegación de eventos: click en botones dentro de la lista
elList.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const li = e.target.closest("li[data-id]");
  if (!li) return;

  const id = li.dataset.id;
  const action = btn.dataset.action;

  if (action === "toggle") {
    manager.toggle(id);
    persist();
    render();
  }

  if (action === "delete") {
    manager.remove(id);
    persist();
    render();
    toastShow(elToast, "🗑️ Tarea eliminada");
  }

  if (action === "edit") {
    const task = manager.findById(id);
    if (!task) return;

    const newTitle = prompt("Nuevo título:", task.title);
    if (newTitle == null) return;

    const newDesc = prompt("Nueva descripción:", task.description);
    if (newDesc == null) return;

    manager.update(id, { title: newTitle, description: newDesc });
    persist();
    render();
    toastShow(elToast, "✏️ Tarea actualizada");
  }

  if (action === "due") {
    const task = manager.findById(id);
    if (!task) return;

    const raw = prompt(
      "Fecha límite (ISO o vacío para quitar):\nEj: 2026-02-10T18:30:00.000Z",
      task.dueAt ?? ""
    );

    if (raw == null) return;

    manager.update(id, { dueAt: raw.trim() ? raw.trim() : null });
    persist();
    render();
    toastShow(elToast, "📅 Fecha límite actualizada");
  }

  // ejemplo: guardar una tarea a la API (funcionalidad extra)
  if (action === "toggle") {
    const task = manager.findById(id);
    if (!task) return;

    try {
      await createRemoteTask({
        title: task.title,
        completed: task.status === "done",
      });
      // no lo spameamos siempre: solo mostramos un aviso suave
      // (try/catch requerido por la ficha)
    } catch (err) {
      console.error(err);
    }
  }
});

// mouseover (requisito: interactividad con mouseover)
elList.addEventListener("mouseover", (e) => {
  const li = e.target.closest("li.item");
  if (!li) return;
  li.classList.add("hovered");
});
elList.addEventListener("mouseout", (e) => {
  const li = e.target.closest("li.item");
  if (!li) return;
  li.classList.remove("hovered");
});

// Cargar tareas desde API (fetch)
elBtnLoadApi.addEventListener("click", async () => {
  try {
    toastShow(elToast, "⏳ Cargando desde API...");
    const apiTodos = await fetchDemoTasks(6);

    const tasks = apiTodos.map((t) => {
      return new Task({
        id: crypto.randomUUID(),
        title: t.title,
        description: "Importada desde JSONPlaceholder",
        status: t.completed ? "done" : "pending",
        createdAt: new Date().toISOString(),
        dueAt: null,
      });
    });

    manager.addMany(tasks);
    persist();
    render();
    toastShow(elToast, "✅ Tareas importadas desde API");
  } catch (err) {
    console.error(err);
    toastShow(elToast, "❌ Error cargando desde API (revisa consola)");
  }
});

// Borrar todo
elBtnClearAll.addEventListener("click", () => {
  if (!confirm("¿Seguro que quieres borrar todas las tareas?")) return;
  manager.hydrate([]);
  clearTasks();
  render();
  toastShow(elToast, "🧹 Todo borrado");
});

// ==========================
// Async + contador regresivo (setInterval)
// ==========================
async function addTaskAsync({ title, description, status, dueAt }) {
  // simular retardo al agregar (requisito async)
  await new Promise((resolve) => setTimeout(resolve, 700));

  const task = new Task({
    id: crypto.randomUUID(),
    title,
    description,
    status,
    createdAt: new Date().toISOString(),
    dueAt,
  });

  manager.add(task);
  persist();
}

// contador regresivo global: actualiza los <span data-countdown>
setInterval(() => {
  const now = new Date();
  document.querySelectorAll("li[data-id]").forEach((li) => {
    const id = li.dataset.id;
    const task = manager.findById(id);
    if (!task || !task.dueAt) return;

    const ms = task.timeLeftMs(now);
    const span = li.querySelector("[data-countdown]");
    if (span) span.textContent = formatCountdown(ms);
  });
}, 1000);

// ==========================
// Render + Persistencia
// ==========================
function persist() {
  saveTasks(manager.serialize());
}

function render() {
  const query = elSearch.value;
  const status = elFilterStatus.value;

  const visible = manager.list({ query, status });

  renderTasks(elList, visible);

  const { total, done, pending } = manager.getStats();
  elStats.textContent = `${total} totales · ${pending} pendientes · ${done} finalizadas`;
}
const { total, done } = manager.getStats();
const pct = total === 0 ? 0 : Math.round((done / total) * 100);
if (elProgressText) elProgressText.textContent = `${pct}%`;
if (elProgressBar) elProgressBar.style.width = `${pct}%`;

