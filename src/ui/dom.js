/**
 * Helpers DOM + render.
 */

export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

export function formatCountdown(ms) {
  if (ms == null) return "";
  const totalSec = Math.floor(ms / 1000);

  const sign = totalSec < 0 ? "-" : "";
  const abs = Math.abs(totalSec);

  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;

  const pad = (n) => String(n).padStart(2, "0");
  return `${sign}${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function toastShow(elToast, message) {
  elToast.textContent = message;
  elToast.classList.add("show");
  setTimeout(() => elToast.classList.remove("show"), 2600);
}

/**
 * Renderiza una lista de tareas en el <ul>
 * @param {HTMLElement} listEl
 * @param {Array} tasks
 */
export function renderTasks(listEl, tasks) {
  listEl.innerHTML = "";

if (!tasks.length) {
  const li = document.createElement("li");
  li.className = "item empty";
  li.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📝</div>
      <div>
        <strong>No hay tareas todavía</strong>
        <div class="muted">Crea tu primera tarea usando el formulario.</div>
      </div>
    </div>
  `;
  listEl.appendChild(li);
  return;
}


  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "item";
    li.dataset.id = task.id;

    const isDone = task.status === "done";
    const overdue = task.isOverdue(new Date());
    const timeLeft = task.timeLeftMs(new Date());

    const badgeClass = isDone ? "ok" : overdue ? "danger" : task.dueAt ? "warn" : "";
    const badgeText = isDone ? "Finalizada" : overdue ? "Vencida" : "Pendiente";

    li.innerHTML = `
      <div class="item-top">
        <div>
          <h3>${escapeHtml(task.title)}</h3>
          <div class="muted">Creada: ${formatDateTime(task.createdAt)}</div>
          ${
            task.dueAt
              ? `<div class="muted">Límite: ${formatDateTime(task.dueAt)} · <strong class="muted">⏳ <span data-countdown>${formatCountdown(timeLeft)}</span></strong></div>`
              : `<div class="muted">Sin fecha límite</div>`
          }
          ${task.description ? `<div class="desc">${escapeHtml(task.description)}</div>` : ""}
        </div>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>

      <div class="item-actions">
        <button class="btn btn-secondary" data-action="toggle">${isDone ? "Marcar pendiente" : "Marcar finalizada"}</button>
        <button class="btn btn-secondary" data-action="edit">Editar</button>
        <button class="btn btn-secondary" data-action="due">Fecha límite</button>
        <button class="btn btn-danger" data-action="delete">Eliminar</button>
      </div>
    `;

    listEl.appendChild(li);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
