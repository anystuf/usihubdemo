import { getDemoData } from "../services/dataService.js";
import {
  PLATFORM_ACTION_EVENT,
  getProjectTasksWithLocal,
  resetProjectTasks,
  saveProjectTasks
} from "../services/platformActionService.js";
import { $, escapeHtml, statusClass } from "../utils/dom.js";
import { translate } from "../services/languageService.js";

const taskKey = "usiHubSelectedTaskId";
const statuses = ["Planned", "Next", "In progress", "Done"];

let tasks = [];
let actionListenerBound = false;

export function renderProjectBoard() {
  tasks = loadTasks();
  const startups = ["", ...new Set(tasks.map((task) => task.startup || "Cohort"))];
  const startupOptions = getDemoData().startups.map((startup) => startup.name);
  return `
    <section class="grid grid-4" id="project-metrics"></section>

    <section class="card card-pad" style="margin-top: 16px;">
      <div class="section-header" style="margin-top: 0;">
        <div>
          <p class="eyebrow">Incubation worklist</p>
          <h2>Startup support tasks</h2>
        </div>
        <div class="board-toolbar">
          <span class="pill" id="board-save-state">Saved locally</span>
          <button class="button secondary" id="reset-board" type="button">Reset demo</button>
        </div>
      </div>
      <p class="muted-text">Track work that the incubator and startup execute together: workshops, investor connections, expert support, partner outreach, and data governance.</p>

      <div class="toolbar" style="margin-top: 14px;">
        <input class="input" id="task-search" placeholder="Search task, startup, workstream, owner" />
        <select class="select" id="task-startup">
          <option value="">All startups</option>
          ${startups.filter(Boolean).map((startup) => `<option>${escapeHtml(startup)}</option>`).join("")}
        </select>
        <select class="select" id="task-status">
          <option value="">All statuses</option>
          ${statuses.map((status) => `<option>${escapeHtml(status)}</option>`).join("")}
        </select>
      </div>

      <form class="chat-composer" id="task-form" style="border-top: 0; padding: 14px 0 0;">
        <select class="select" id="task-new-startup" aria-label="Startup for new task">
          <option value="Cohort">Cohort / program</option>
          ${startupOptions.map((startup) => `<option>${escapeHtml(startup)}</option>`).join("")}
        </select>
        <input class="input" id="task-title" placeholder="Add incubation task, e.g. Investor intro for Venture Epsilon" />
        <button class="button orange" type="submit">Add task</button>
      </form>
    </section>

    <section class="card card-pad" style="margin-top: 16px;">
      <div class="table-like" id="task-table"></div>
    </section>
  `;
}

export function bindProjectBoard() {
  $("#reset-board")?.addEventListener("click", () => {
    resetProjectTasks();
    tasks = loadTasks();
    renderTaskTable();
    setSaveState("Demo tasks reset");
  });

  $("#task-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#task-title");
    const title = input.value.trim();
    if (!title) return;
    tasks.unshift({
      id: `task-${Date.now()}`,
      title,
      startup: $("#task-new-startup")?.value || "Cohort",
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
    renderTaskTable();
  });

  ["task-search", "task-startup", "task-status"].forEach((id) => {
    $(`#${id}`)?.addEventListener("input", renderTaskTable);
  });

  renderTaskTable();

  if (!actionListenerBound) {
    window.addEventListener(PLATFORM_ACTION_EVENT, () => {
      if (!$("#task-table")) return;
      tasks = loadTasks();
      renderTaskTable();
      setSaveState("Updated by approved USI Intelligence action");
    });
    actionListenerBound = true;
  }
}

export function renderTaskDetailPage() {
  const task = getSelectedTask();
  if (!task) {
    return `<section class="card card-pad"><p class="muted-text">No task selected. Open the Incubation Worklist and choose a task.</p></section>`;
  }

  return `
    <section class="card card-pad">
      <div class="detail-title">
        <div>
          <p class="eyebrow">Task detail</p>
          <h2>${escapeHtml(task.title)}</h2>
        </div>
        <span class="status ${statusClass(task.status)}">${escapeHtml(task.status)}</span>
      </div>
      <p class="muted-text" style="margin-top: 10px;">${escapeHtml(translate(task.notes || "No notes yet."))}</p>
      <div class="detail-grid">
        <div class="detail-stat"><span>Startup</span><strong>${escapeHtml(task.startup || "Cohort")}</strong></div>
        <div class="detail-stat"><span>Owner</span><strong>${escapeHtml(task.assignee || "SGA")}</strong></div>
        <div class="detail-stat"><span>Due date</span><strong>${escapeHtml(task.due)}</strong></div>
        <div class="detail-stat"><span>Priority</span><strong>${escapeHtml(translate(task.priority || "Medium"))}</strong></div>
        <div class="detail-stat"><span>Workstream</span><strong>${escapeHtml(translate(task.workstream || "Operations"))}</strong></div>
        <div class="detail-stat"><span>Progress</span><strong>${Number(task.progress || 0)}%</strong></div>
      </div>
    </section>

    <section class="card card-pad" style="margin-top: 16px;">
      <p class="eyebrow">Update task</p>
      <div class="task-controls" style="margin-top: 12px;">
        <label>
          <span>Owner</span>
          <input class="input" id="detail-assignee" value="${escapeHtml(translate(task.assignee || "SGA"))}" />
        </label>
        <label>
          <span>Due date</span>
          <input class="input" id="detail-due" type="date" value="${escapeHtml(task.due)}" />
        </label>
        <label>
          <span>Status</span>
          <select class="select compact" id="detail-status">
            ${statuses.map((status) => `<option value="${escapeHtml(status)}" ${task.status === status ? "selected" : ""}>${escapeHtml(translate(status))}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Progress <b id="detail-progress-label">${Number(task.progress || 0)}%</b></span>
          <input class="range" id="detail-progress" type="range" min="0" max="100" step="10" value="${Number(task.progress || 0)}" />
        </label>
      </div>
      <label style="display: grid; gap: 7px; margin-top: 12px;">
        <span>Notes</span>
        <textarea class="input" id="detail-notes" rows="4">${escapeHtml(translate(task.notes || ""))}</textarea>
      </label>
      <div class="task-meta" style="margin-top: 12px;">
        <button class="button secondary" type="button" id="back-to-task-list">Back to worklist</button>
        <button class="button secondary" type="button" data-intelligence-prompt="Review the task '${escapeHtml(task.title)}' for ${escapeHtml(task.startup || "Cohort")} and suggest the next action.">Ask USI Intelligence</button>
        <button class="button orange" type="button" id="save-task-detail">Save changes</button>
      </div>
    </section>
  `;
}

export function bindTaskDetailPage() {
  $("#back-to-task-list")?.addEventListener("click", () => {
    window.location.hash = "project-board";
  });
  $("#detail-progress")?.addEventListener("input", (event) => {
    $("#detail-progress-label").textContent = `${event.target.value}%`;
  });
  $("#save-task-detail")?.addEventListener("click", () => {
    const task = getSelectedTask();
    if (!task) return;
    task.assignee = $("#detail-assignee")?.value.trim() || task.assignee;
    task.due = $("#detail-due")?.value || task.due;
    task.status = $("#detail-status")?.value || task.status;
    task.progress = Number($("#detail-progress")?.value || task.progress || 0);
    task.notes = $("#detail-notes")?.value.trim() || task.notes;
    if (task.status === "Done") task.progress = 100;
    saveTasks();
    window.location.hash = "project-board";
  });
}

function renderTaskTable() {
  const metricsRoot = $("#project-metrics");
  const tableRoot = $("#task-table");
  if (!metricsRoot || !tableRoot) return;

  const filtered = getFilteredTasks();
  const done = tasks.filter((task) => task.status === "Done").length;
  const progress = Math.round(tasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / Math.max(tasks.length, 1));
  const highPriority = tasks.filter((task) => task.priority === "High" && task.status !== "Done").length;

  metricsRoot.innerHTML = [
    ["Overall progress", `${progress}%`, "Average task completion"],
    ["Open tasks", String(tasks.length - done), "Tasks not done"],
    ["High priority", String(highPriority), "Needs owner attention"],
    ["Startups covered", String(new Set(tasks.map((task) => task.startup)).size), "Support coverage"]
  ].map(([label, value, note]) => `
    <article class="card metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(note)}</p>
    </article>
  `).join("");

  tableRoot.innerHTML = `
    <div class="table-row table-head">
      <span>Task</span>
      <span>Startup</span>
      <span>Owner / due</span>
      <span>Status</span>
      <span>Progress</span>
      <span></span>
    </div>
    ${filtered.map((task) => `
      <div class="table-row">
        <span><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.workstream || "Operations")}</small></span>
        <span>${escapeHtml(task.startup || "Cohort")}</span>
        <span>${escapeHtml(task.assignee || "SGA")}<small>${escapeHtml(task.due)}</small></span>
        <span><span class="status ${statusClass(task.status)}">${escapeHtml(task.status)}</span></span>
        <span><strong>${Number(task.progress || 0)}%</strong></span>
        <span><button class="button secondary" type="button" data-open-task="${escapeHtml(task.id)}">Open</button></span>
      </div>
    `).join("")}
  `;

  tableRoot.querySelectorAll("[data-open-task]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem(taskKey, button.dataset.openTask);
      window.location.hash = "task-detail";
    });
  });
}

function getFilteredTasks() {
  const search = ($("#task-search")?.value || "").toLowerCase();
  const startup = $("#task-startup")?.value || "";
  const status = $("#task-status")?.value || "";
  return tasks.filter((task) => {
    const haystack = [task.title, task.startup, task.assignee, task.workstream, task.notes, task.priority].join(" ").toLowerCase();
    return (!search || haystack.includes(search))
      && (!startup || task.startup === startup)
      && (!status || task.status === status);
  });
}

function getSelectedTask() {
  tasks = loadTasks();
  const id = localStorage.getItem(taskKey) || tasks[0]?.id;
  return tasks.find((task) => task.id === id) || tasks[0];
}

function loadTasks() {
  return getProjectTasksWithLocal(getDemoData().projectTasks).map((task, index) => ({
    id: task.id || `task-${index}`,
    startup: task.startup || "Cohort",
    ...task
  }));
}

function saveTasks() {
  saveProjectTasks(tasks);
}

function setSaveState(text) {
  const target = $("#board-save-state");
  if (target) target.textContent = text;
}
