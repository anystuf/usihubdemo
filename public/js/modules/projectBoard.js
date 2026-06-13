import { getDemoData } from "../services/dataService.js";
import {
  PLATFORM_ACTION_EVENT,
  getProjectTasksWithLocal,
  resetProjectTasks,
  saveProjectTasks
} from "../services/platformActionService.js";
import { $, escapeHtml, statusClass } from "../utils/dom.js";

const columns = ["Planned", "Next", "In progress", "Done"];

let boardTasks = [];
let actionListenerBound = false;

export function renderProjectBoard() {
  boardTasks = loadTasks();
  return `
    <section class="grid grid-4" id="project-metrics"></section>

    <section class="card card-pad" style="margin-top: 16px;">
      <div class="section-header" style="margin-top: 0;">
        <div>
          <p class="eyebrow">Project board</p>
          <h2>Interactive execution board</h2>
        </div>
        <div class="board-toolbar">
          <span class="pill" id="board-save-state">Saved locally</span>
          <button class="button secondary" id="reset-board" type="button">Reset demo</button>
        </div>
      </div>
      <form class="chat-composer" id="task-form" style="border-top: 0; padding: 0;">
        <input class="input" id="task-title" placeholder="Add task, e.g. Review NIION risk proposal" />
        <button class="button orange" type="submit">Add task</button>
      </form>
    </section>

    <div class="board-columns" id="board-columns" style="margin-top: 16px;"></div>
  `;
}

export function bindProjectBoard() {
  $("#reset-board")?.addEventListener("click", () => {
    resetProjectTasks();
    boardTasks = loadTasks();
    renderBoard();
    setSaveState("Demo board reset");
  });

  $("#task-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#task-title");
    const title = input.value.trim();
    if (!title) return;
    boardTasks.push({
      id: `task-${Date.now()}`,
      title,
      assignee: "SGA",
      due: "2026-06-30",
      status: "Next",
      progress: 10,
      priority: "Medium",
      workstream: "Operations",
      notes: "Added during demo."
    });
    input.value = "";
    saveTasks();
    setSaveState("Task added locally");
    renderBoard();
  });

  renderBoard();

  if (!actionListenerBound) {
    window.addEventListener(PLATFORM_ACTION_EVENT, () => {
      if (!$("#board-columns")) return;
      boardTasks = loadTasks();
      renderBoard();
      setSaveState("Updated by approved USI Brain action");
    });
    actionListenerBound = true;
  }
}

function renderBoard() {
  const metricsRoot = $("#project-metrics");
  const boardRoot = $("#board-columns");
  if (!metricsRoot || !boardRoot) return;

  const done = boardTasks.filter((task) => task.status === "Done").length;
  const progress = Math.round((boardTasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / Math.max(boardTasks.length, 1)));
  const overdue = boardTasks.filter((task) => task.status !== "Done" && task.due < "2026-06-13").length;
  const highPriority = boardTasks.filter((task) => task.priority === "High" && task.status !== "Done").length;

  metricsRoot.innerHTML = [
    ["Overall progress", `${progress}%`, "Average task completion"],
    ["Open tasks", String(boardTasks.length - done), "Tasks not done"],
    ["High priority", String(highPriority), "Open execution risk"],
    ["Overdue", String(overdue), "Needs owner follow-up"]
  ].map(([label, value, note]) => `
    <article class="card metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(note)}</p>
    </article>
  `).join("");

  const grouped = Object.fromEntries(columns.map((column) => [column, boardTasks.filter((task) => task.status === column)]));
  boardRoot.innerHTML = columns.map((column) => `
    <div class="board-column" data-column="${escapeHtml(column)}">
      <h3>${escapeHtml(column)} <span class="pill muted">${grouped[column].length}</span></h3>
      <p class="board-drop-hint">Drop tasks here</p>
      ${grouped[column].map(renderTask).join("")}
    </div>
  `).join("");

  // Setup drag and drop
  setupDragAndDrop();

  boardRoot.querySelectorAll("[data-task-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = boardTasks.find((item) => item.id === button.dataset.taskId);
      if (!task) return;
      if (button.dataset.taskAction === "advance") task.status = nextStatus(task.status);
      if (button.dataset.taskAction === "progress") task.progress = Math.min(100, Number(task.progress || 0) + 20);
      if (task.progress >= 100) task.status = "Done";
      saveTasks();
      setSaveState("Saved locally");
      renderBoard();
    });
  });

  boardRoot.querySelectorAll("[data-task-status]").forEach((select) => {
    select.addEventListener("change", () => {
      const task = boardTasks.find((item) => item.id === select.dataset.taskId);
      if (!task) return;
      task.status = select.value;
      if (task.status === "Done") task.progress = 100;
      saveTasks();
      setSaveState("Status saved");
      renderBoard();
    });
  });

  boardRoot.querySelectorAll("[data-task-progress]").forEach((range) => {
    range.addEventListener("input", () => {
      const task = boardTasks.find((item) => item.id === range.dataset.taskId);
      const label = boardRoot.querySelector(`[data-task-progress-label="${range.dataset.taskId}"]`);
      if (!task) return;
      task.progress = Number(range.value);
      if (label) label.textContent = `${task.progress}%`;
    });

    range.addEventListener("change", () => {
      const task = boardTasks.find((item) => item.id === range.dataset.taskId);
      if (!task) return;
      if (task.progress >= 100) task.status = "Done";
      saveTasks();
      setSaveState("Progress saved");
      renderBoard();
    });
  });
}

function setupDragAndDrop() {
  const boardRoot = $("#board-columns");
  if (!boardRoot) return;

  // Setup draggable tasks
  boardRoot.querySelectorAll(".task-card").forEach((card) => {
    card.draggable = true;
    card.style.cursor = "grab";

    card.addEventListener("dragstart", (e) => {
      const taskId = card.dataset.taskId;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("taskId", taskId);
      card.classList.add("dragging");
      card.style.opacity = "0.5";
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      card.style.opacity = "1";
    });
  });

  // Setup drop zones (columns)
  boardRoot.querySelectorAll(".board-column").forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", (e) => {
      if (e.target === column) column.classList.remove("drag-over");
    });

    column.addEventListener("drop", (e) => {
      e.preventDefault();
      column.classList.remove("drag-over");
      
      const taskId = e.dataTransfer.getData("taskId");
      const columnName = column.dataset.column;
      const task = boardTasks.find((item) => item.id === taskId);
      
      if (task && columnName) {
        task.status = columnName;
        if (columnName === "Done") task.progress = 100;
        saveTasks();
        setSaveState(`Moved to ${columnName}`);
        renderBoard();
      }
    });
  });
}

function renderTask(task) {
  return `
    <article class="task-card" data-task-id="${escapeHtml(task.id)}" style="cursor: grab; user-select: none;">
      <div class="task-meta">
        <strong><span class="drag-handle">::</span>${escapeHtml(task.title)}</strong>
        <span class="status ${statusClass(task.status)}">${escapeHtml(task.status)}</span>
      </div>
      <p class="muted-text" style="margin-top: 8px;">${escapeHtml(task.workstream || "Operations")} - ${escapeHtml(task.priority || "Medium")} priority</p>
      <p class="muted-text">Assignee: ${escapeHtml(task.assignee)} - Due: ${escapeHtml(task.due)}</p>
      <p class="muted-text">${escapeHtml(task.notes || "")}</p>
      <div class="progress-track" style="margin-top: 10px;">
        <div class="progress-fill" style="width: ${Number(task.progress || 0)}%;"></div>
      </div>
      <div class="task-controls">
        <label>
          <span>Status</span>
          <select class="select compact" data-task-id="${escapeHtml(task.id)}" data-task-status>
            ${columns.map((column) => `<option value="${escapeHtml(column)}" ${task.status === column ? "selected" : ""}>${escapeHtml(column)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Progress <b data-task-progress-label="${escapeHtml(task.id)}">${Number(task.progress || 0)}%</b></span>
          <input class="range" type="range" min="0" max="100" step="10" value="${Number(task.progress || 0)}" data-task-id="${escapeHtml(task.id)}" data-task-progress />
        </label>
      </div>
      <div class="task-meta" style="margin-top: 10px;">
        <button class="button secondary" type="button" data-task-id="${escapeHtml(task.id)}" data-task-action="progress">+20%</button>
        <button class="button orange" type="button" data-task-id="${escapeHtml(task.id)}" data-task-action="advance">Move</button>
      </div>
    </article>
  `;
}

function loadTasks() {
  return getProjectTasksWithLocal(getDemoData().projectTasks).map((task, index) => ({
    id: task.id || `task-${index}`,
    ...task
  }));
}

function saveTasks() {
  saveProjectTasks(boardTasks);
}

function nextStatus(status) {
  if (status === "Planned") return "Next";
  if (status === "Next") return "In progress";
  if (status === "In progress") return "Done";
  return "Done";
}

function setSaveState(text) {
  const target = $("#board-save-state");
  if (!target) return;
  target.textContent = text;
}
