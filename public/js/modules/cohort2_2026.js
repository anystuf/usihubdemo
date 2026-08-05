import { escapeHtml, statusClass, tags } from "../utils/dom.js";

const cohort = {
  name: "Cohort 2 2026",
  status: "Template ready",
  sourceStatus: "Google Sheet access required",
  sourceUrl: "https://docs.google.com/spreadsheets/d/1elHfwgjZP92goAp0Wc-TswHEFMQIX0zxiZWHcrxClu0/edit?gid=2025639659#gid=2025639659"
};

const startupRecords = [];

const templateChecklist = [
  {
    title: "Create cohort page",
    owner: "Operation team",
    status: "Done",
    detail: "Add a dedicated Cohort 2 2026 page under Startup Management."
  },
  {
    title: "Copy startup page template",
    owner: "Operation team",
    status: "Ready",
    detail: "Use the same startup profile structure as Cohort 1 2026 for every startup."
  },
  {
    title: "Populate startup overview",
    owner: "SGA + Operation",
    status: "Waiting for data",
    detail: "Fill establishment date, location, stage, sector, contact, description, SGA owner, and links."
  },
  {
    title: "Configure operating widgets",
    owner: "Operation team",
    status: "Waiting for data",
    detail: "Set Quick Access links, Growth Progress filter, Achievement view, and To-do plan per startup."
  },
  {
    title: "Review and publish",
    owner: "Operation team",
    status: "Next",
    detail: "Check all cards, filters, links, and startup names before republishing."
  }
];

const requiredFields = [
  "Startup name",
  "Description",
  "Sector",
  "Stage",
  "Operating area",
  "Founder name",
  "Founder email",
  "Founder phone",
  "Founder role",
  "Team size",
  "Pitch deck",
  "Product video",
  "Website",
  "SGA owner",
  "Internal documents",
  "External documents"
];

const operatingSections = [
  {
    title: "Overview & Contact",
    detail: "Basic startup information, founder contact, stage, sector, location, short description, and Learn more link."
  },
  {
    title: "SGA",
    detail: "SGA name, email, and contact details for the person directly supporting the startup."
  },
  {
    title: "Quick Access",
    detail: "Internal Documents and External Documents links for team-only and startup-shared materials."
  },
  {
    title: "Growth Progress",
    detail: "Meeting notes and progress updates filtered by the startup name within 24 hours after each Growth Session."
  },
  {
    title: "Achievement",
    detail: "Startup milestones, outcomes, and progress tracker view filtered to the correct startup."
  },
  {
    title: "To-do Lists",
    detail: "Startup-specific tasks grouped by workstream, owner, due date, and execution status."
  }
];

export function renderCohort22026() {
  return `
    <section class="card card-pad cohort-hero">
      <div>
        <p class="eyebrow">Startup Management</p>
        <h2>${escapeHtml(cohort.name)}</h2>
        <p class="muted-text">Template mirrors Cohort 1 2026 and follows the SGA plus Operation guidelines for startup profile setup, document links, progress tracking, achievements, and task management.</p>
      </div>
      <div class="cohort-status-panel">
        <span class="status ${statusClass(cohort.status)}">${escapeHtml(cohort.status)}</span>
        <strong>${escapeHtml(String(startupRecords.length))}</strong>
        <span>Startups loaded</span>
      </div>
    </section>

    <div class="grid grid-3" style="margin-top: 16px;">
      ${renderMetric("Source", cohort.sourceStatus, "Private sheet must be exported or connected before records can be populated.")}
      ${renderMetric("Template", "Cohort 1 2026", "Same operating structure and startup-card flow.")}
      ${renderMetric("Guidelines", "SGA + Operator", "Weekly updates, 24h Growth Progress notes, correct Drive links, and publish review.")}
    </div>

    <section class="card card-pad" style="margin-top: 16px;">
      <div class="section-header" style="margin-top: 0;">
        <div>
          <p class="eyebrow">Startup list</p>
          <h3>Cohort 2 2026 startups</h3>
        </div>
        <span class="pill muted" title="The source sheet is intentionally not linked in the public demo.">Private source not linked</span>
      </div>
      ${renderStartupList()}
    </section>

    <div class="grid grid-2" style="margin-top: 16px;">
      <section class="card card-pad">
        <p class="eyebrow">Page template</p>
        <h3>Required startup sections</h3>
        <div class="insight-list" style="margin-top: 12px;">
          ${operatingSections.map((section) => `
            <article class="insight-item">
              <strong>${escapeHtml(section.title)}</strong>
              <p class="muted-text" style="margin-top: 8px;">${escapeHtml(section.detail)}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="card card-pad">
        <p class="eyebrow">Operator checklist</p>
        <h3>Setup steps</h3>
        <div class="insight-list" style="margin-top: 12px;">
          ${templateChecklist.map((item) => `
            <article class="insight-item">
              <div class="task-meta">
                <strong>${escapeHtml(item.title)}</strong>
                <span class="status ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
              </div>
              <p class="muted-text" style="margin-top: 8px;">${escapeHtml(item.detail)}</p>
              <div class="tag-row">${tags([item.owner])}</div>
            </article>
          `).join("")}
        </div>
      </section>
    </div>

    <section class="card card-pad" style="margin-top: 16px;">
      <p class="eyebrow">Data readiness</p>
      <h3>Fields needed from Cohort 2 source</h3>
      <div class="tag-row">${tags(requiredFields)}</div>
    </section>
  `;
}

export function bindCohort22026() {}

function renderMetric(label, value, note) {
  return `
    <article class="card card-pad report-card">
      <p class="eyebrow">${escapeHtml(label)}</p>
      <h3 style="margin-top: 8px;">${escapeHtml(value)}</h3>
      <p class="muted-text" style="margin-top: 10px;">${escapeHtml(note)}</p>
    </article>
  `;
}

function renderStartupList() {
  if (!startupRecords.length) {
    return `
      <div class="empty-panel">
        <strong>No Cohort 2 startup records loaded yet.</strong>
        <p class="muted-text">The provided Google Sheet is private from this environment. Export the sheet as CSV/XLSX or connect an accessible Sheets session, then each startup can be populated into this exact template.</p>
      </div>
    `;
  }

  return `
    <div class="table-like">
      <div class="table-row table-head">
        <span>Startup</span>
        <span>Sector / stage</span>
        <span>Founder</span>
        <span>SGA</span>
        <span>Status</span>
      </div>
      ${startupRecords.map((startup) => `
        <div class="table-row">
          <span><strong>${escapeHtml(startup.name)}</strong><small>${escapeHtml(startup.description)}</small></span>
          <span>${escapeHtml(startup.sector)}<small>${escapeHtml(startup.stage)}</small></span>
          <span>${escapeHtml(startup.founder)}<small>${escapeHtml(startup.email)}</small></span>
          <span>${escapeHtml(startup.sga || "Not assigned")}</span>
          <span><span class="status ${statusClass(startup.status)}">${escapeHtml(startup.status)}</span></span>
        </div>
      `).join("")}
    </div>
  `;
}

