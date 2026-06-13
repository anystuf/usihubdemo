import { getDemoData } from "../services/dataService.js";
import { $, emptyState, escapeHtml, statusClass, tags } from "../utils/dom.js";

let selectedStartupId = "skyholic";

export function renderStartupOs() {
  const data = getDemoData();
  return `
    <section class="card card-pad">
      <div class="section-header" style="margin-top: 0;">
        <div>
          <p class="eyebrow">Startup OS</p>
          <h2>Startup cards, filters, and detail panel</h2>
        </div>
        <p>Demo-only startup intelligence based on available roadmap, pitch deck, and cohort source references.</p>
      </div>
      <div class="toolbar">
        <input class="input" id="startup-search" placeholder="Search startup, sector, tag, or need" />
        <select class="select" id="cohort-filter">
          <option value="">All cohorts</option>
          ${[...new Set(data.startups.map((startup) => startup.cohort))].map((cohort) => `<option>${escapeHtml(cohort)}</option>`).join("")}
        </select>
        <select class="select" id="stage-filter">
          <option value="">All stages</option>
          ${[...new Set(data.startups.map((startup) => startup.stage))].map((stage) => `<option>${escapeHtml(stage)}</option>`).join("")}
        </select>
        <select class="select" id="risk-filter">
          <option value="">All risks</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
    </section>

    <div class="startup-layout" style="margin-top: 16px;">
      <section class="startup-list" id="startup-list"></section>
      <aside class="card detail-panel" id="startup-detail"></aside>
    </div>
  `;
}

export function bindStartupOs() {
  ["startup-search", "cohort-filter", "stage-filter", "risk-filter"].forEach((id) => {
    $(`#${id}`)?.addEventListener("input", renderStartupList);
  });
  renderStartupList();
}

function getFilteredStartups() {
  const data = getDemoData();
  const search = ($("#startup-search")?.value || "").toLowerCase();
  const cohort = $("#cohort-filter")?.value || "";
  const stage = $("#stage-filter")?.value || "";
  const risk = $("#risk-filter")?.value || "";

  return data.startups.filter((startup) => {
    const haystack = [startup.name, startup.sector, startup.founderNeed, startup.summary, startup.riskReason, ...startup.tags, ...(startup.mentorNeed || [])].join(" ").toLowerCase();
    return (!search || haystack.includes(search))
      && (!cohort || startup.cohort === cohort)
      && (!stage || startup.stage === stage)
      && (!risk || startup.risk === risk);
  });
}

function renderStartupList() {
  const list = $("#startup-list");
  const startups = getFilteredStartups();
  if (!list) return;

  if (!startups.length) {
    list.innerHTML = emptyState("No startups match the current filters.");
    $("#startup-detail").innerHTML = "";
    return;
  }

  if (!startups.some((startup) => startup.id === selectedStartupId)) {
    selectedStartupId = startups[0].id;
  }

  list.innerHTML = startups.map((startup) => `
    <button class="startup-card ${startup.id === selectedStartupId ? "active" : ""}" data-startup-id="${escapeHtml(startup.id)}">
      <div class="startup-card-header">
        <span class="startup-name">
          <strong>${escapeHtml(startup.name)}</strong>
          <span class="muted-text">${escapeHtml(startup.sector)} - ${escapeHtml(startup.stage)}</span>
        </span>
        <span class="status ${statusClass(startup.risk)}">${escapeHtml(startup.risk)}</span>
      </div>
      <p class="muted-text" style="margin-top: 10px;">${escapeHtml(startup.summary)}</p>
      <p class="muted-text" style="margin-top: 8px;"><b>Support:</b> ${escapeHtml((startup.mentorNeed || []).slice(0, 2).join(", "))}</p>
      <div class="progress-track" style="margin-top: 12px;">
        <div class="progress-fill" style="width: ${startup.health}%;"></div>
      </div>
      <div class="tag-row">${tags(startup.tags.slice(0, 4))}</div>
    </button>
  `).join("");

  list.querySelectorAll("[data-startup-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedStartupId = button.dataset.startupId;
      renderStartupList();
    });
  });

  const selected = startups.find((startup) => startup.id === selectedStartupId) || startups[0];
  renderStartupDetail(selected);
}

function renderStartupDetail(startup) {
  const detail = $("#startup-detail");
  if (!detail) return;

  detail.innerHTML = `
    <div class="detail-title">
      <div>
        <p class="eyebrow">Selected startup</p>
        <h2>${escapeHtml(startup.name)}</h2>
      </div>
      <span class="status ${statusClass(startup.risk)}">${escapeHtml(startup.risk)} risk</span>
    </div>
    <p class="muted-text" style="margin-top: 12px;">${escapeHtml(startup.summary)}</p>

    <div class="detail-grid">
      <div class="detail-stat"><span>Cohort</span><strong>${escapeHtml(startup.cohort)}</strong></div>
      <div class="detail-stat"><span>Stage</span><strong>${escapeHtml(startup.stage)}</strong></div>
      <div class="detail-stat"><span>Sector</span><strong>${escapeHtml(startup.sector)}</strong></div>
      <div class="detail-stat"><span>Health</span><strong>${startup.health}/100</strong></div>
      <div class="detail-stat"><span>Last check-in</span><strong>${escapeHtml(startup.lastCheckIn)}</strong></div>
      <div class="detail-stat"><span>Evidence</span><strong>${escapeHtml(startup.sources.length)} sources</strong></div>
    </div>

    <div class="insight-list">
      <article class="insight-item">
        <strong>Risk reason</strong>
        <p class="muted-text" style="margin-top: 8px;">${escapeHtml(startup.riskReason)}</p>
      </article>
      <article class="insight-item">
        <strong>Traction / context</strong>
        <p class="muted-text" style="margin-top: 8px;">${escapeHtml(startup.traction)}</p>
      </article>
      <article class="insight-item">
        <strong>Mentor need</strong>
        <div class="tag-row">${tags(startup.mentorNeed || [])}</div>
      </article>
      <article class="insight-item">
        <strong>Operating KPIs</strong>
        <div class="detail-grid" style="margin-bottom: 0;">
          ${(startup.kpis || []).map((kpi) => `
            <div class="detail-stat"><span>${escapeHtml(kpi.label)}</span><strong>${escapeHtml(kpi.value)}</strong></div>
          `).join("")}
        </div>
      </article>
      <article class="insight-item">
        <strong>Recommended next action</strong>
        <p class="muted-text" style="margin-top: 8px;">${escapeHtml(startup.nextAction)}</p>
      </article>
      <article class="insight-item">
        <strong>Recommended support plan</strong>
        <ul class="muted-text" style="margin-top: 8px;">
          ${(startup.recommendedSupport || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
      <article class="insight-item">
        <strong>Missing data</strong>
        <div class="tag-row">${tags(startup.missingData)}</div>
      </article>
      <article class="insight-item">
        <strong>Linked documents</strong>
        ${(startup.linkedDocuments || []).length ? `
          <ul class="muted-text" style="margin-top: 8px;">
            ${startup.linkedDocuments.map((doc) => `<li>${escapeHtml(doc.title)} - ${escapeHtml(doc.type)} (${escapeHtml(doc.indexed)})</li>`).join("")}
          </ul>
        ` : `<p class="muted-text" style="margin-top: 8px;">No document metadata linked yet.</p>`}
      </article>
      <article class="insight-item">
        <strong>Sources</strong>
        <ul class="muted-text" style="margin-top: 8px;">
          ${startup.sources.map((source) => `<li>${escapeHtml(source)}</li>`).join("")}
        </ul>
      </article>
    </div>
  `;
}
