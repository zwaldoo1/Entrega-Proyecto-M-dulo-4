export class Task {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {string} params.title
   * @param {string} params.description
   * @param {"pending"|"done"} params.status
   * @param {string} params.createdAt ISO string
   * @param {string|null} params.dueAt ISO string | null
   */
  constructor({ id, title, description = "", status = "pending", createdAt, dueAt = null }) {
    this.id = id;
    this.title = title.trim();
    this.description = (description ?? "").trim();
    this.status = status;
    this.createdAt = createdAt;
    this.dueAt = dueAt;
  }

  toggleStatus() {
    this.status = this.status === "done" ? "pending" : "done";
  }

  update({ title, description, dueAt, status }) {
    if (typeof title === "string") this.title = title.trim();
    if (typeof description === "string") this.description = description.trim();
    if (typeof dueAt === "string" || dueAt === null) this.dueAt = dueAt;
    if (status === "pending" || status === "done") this.status = status;
  }

  removeDueDate() {
    this.dueAt = null;
  }

  isOverdue(now = new Date()) {
    if (!this.dueAt) return false;
    return new Date(this.dueAt).getTime() < now.getTime() && this.status !== "done";
  }

  timeLeftMs(now = new Date()) {
    if (!this.dueAt) return null;
    return new Date(this.dueAt).getTime() - now.getTime();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      dueAt: this.dueAt,
    };
  }

  static fromJSON(obj) {
    return new Task({
      id: obj.id,
      title: obj.title,
      description: obj.description,
      status: obj.status,
      createdAt: obj.createdAt,
      dueAt: obj.dueAt ?? null,
    });
  }
}
