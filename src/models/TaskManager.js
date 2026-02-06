import { Task } from "./task.js";

export class TaskManager {
  constructor() {
    /** @type {Task[]} */
    this.tasks = [];
  }

  add(task) {
    this.tasks.unshift(task);
  }

  addMany(tasks) {
    // spread operator (ES6)
    this.tasks = [...tasks, ...this.tasks];
  }

  findById(id) {
    return this.tasks.find((t) => t.id === id) ?? null;
  }

  remove(id) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }

  update(id, patch) {
    const task = this.findById(id);
    if (!task) return null;
    task.update(patch);
    return task;
  }

  toggle(id) {
    const task = this.findById(id);
    if (!task) return null;
    task.toggleStatus();
    return task;
  }

  getStats() {
    const total = this.tasks.length;
    const done = this.tasks.filter((t) => t.status === "done").length;
    const pending = total - done;
    return { total, done, pending };
  }

  /**
   * @param {{query?: string, status?: "all"|"pending"|"done"}} filters
   */
  list({ query = "", status = "all" } = {}) {
    const q = query.trim().toLowerCase();

    return this.tasks
      .filter((t) => {
        const matchText =
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q);

        const matchStatus = status === "all" ? true : t.status === status;
        return matchText && matchStatus;
      });
  }

  serialize() {
    return this.tasks.map((t) => t.toJSON());
  }

  hydrate(rawList) {
    this.tasks = (rawList ?? []).map((o) => Task.fromJSON(o));
  }
}
