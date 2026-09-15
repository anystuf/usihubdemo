import { getDemoData } from "../services/dataService.js";
import { $, emptyState, escapeHtml, statusClass, tags } from "../utils/dom.js";
import { getDefaultRecommendation, getLifecycleStage, getLifecycleSteps, getStageMetrics } from "../utils/startupLifecycle.js";

const selectedKey = "usiHubSelectedStartupId";

export function renderStartupOs() {
  const data = getDemoData();
  return `
    <section class="card card-pad">
      <div class="section-header" style="margin-top: 0;">
        <div>
          <p class="eyebrow">Startup directory</p>
          <h2>Startup list</h2>
        </div>
        <p>Search, filter, and sort startups before opening a detailed operating profile.</p>
      </div>
      <div class="toolbar">
        <input class="input" id="startup-search" placeholder="Search by name, sector, cohort, support need" />
        <select class="select" id="cohort-filter">
          <option value="">All cohorts</option>
          ${[...new Set(data.startups.map((startup) => startup.cohort))].map((cohort) => `<option>${escapeHtml(cohort)}</option>`).join("")}
        </select>
        <select class="select" id="sector-filter">
          <option value="">All sectors</option>
          ${[...new Set(data.startups.map((startup) => startup.sector))].map((sector) => `<option>${escapeHtml(sector)}</option>`).join("")}
        </select>
        <select class="select" id="startup-sort">
          <option value="risk">Sort by risk</option>
          <option value="health-low">Lowest health first</option>
          <option value="health-high">Highest health first</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>
    </section>

    <section class="card card-pad" style="margin-top: 16px;">
      <div class="table-like" id="startup-table"></div>
    </section>
  `;
}

export function bindStartupOs() {
  ["startup-search", "cohort-filter", "sector-filter", "startup-sort"].forEach((id) => {
    $(`#${id}`)?.addEventListener("input", renderStartupTable);
  });
  renderStartupTable();
}

export function renderStartupDetailPage() {
  const startup = getSelectedStartup();
  if (!startup) {
    return `
      <section class="card card-pad">
        ${emptyState("No startup selected. Open the Startup List and choose a startup first.")}
      </section>
    `;
  }

  const contacts = getMatchedContacts(startup);
  const lifecycle = getLifecycleStage(startup.stage);
  const lifecycleSteps = getLifecycleSteps(startup.stage);
  const stageMetrics = getStageMetrics(startup);
  const defaultRecommendation = getDefaultRecommendation(startup);
  return `
    <section class="card card-pad">
      <div class="detail-title">
        <div>
          <p class="eyebrow">Startup profile</p>
          <h2>${escapeHtml(startup.name)}</h2>
        </div>
        <span class="status ${statusClass(startup.risk)}">${escapeHtml(startup.risk)} risk</span>
      </div>
      <p class="muted-text" style="margin-top: 10px;">${escapeHtml(startup.summary)}</p>

      <div class="detail-grid">
        <div class="detail-stat"><span>Cohort</span><strong>${escapeHtml(startup.cohort)}</strong></div>
        <div class="detail-stat"><span>Stage</span><strong>${escapeHtml(startup.stage)}</strong></div>
        <div class="detail-stat"><span>Sector</span><strong>${escapeHtml(startup.sector)}</strong></div>
        <div class="detail-stat"><span>Health</span><strong>${startup.health}/100</strong></div>
        <div class="detail-stat"><span>Last check-in</span><strong>${escapeHtml(startup.lastCheckIn)}</strong></div>
        <div class="detail-stat"><span>Sources</span><strong>${escapeHtml(String(startup.sources.length))}</strong></div>
      </div>
    </section>

    <section class="card card-pad startup-lifecycle-card" style="margin-top: 16px;">
      <div class="section-header" style="margin-top: 0;">
        <div><p class="eyebrow">Lifecycle progress</p><h3>Current stage: ${escapeHtml(lifecycle.label)}</h3></div>
        <span class="pill">Evidence-led view</span>
      </div>
      <ol class="startup-lifecycle" aria-label="Startup lifecycle">
        ${lifecycleSteps.map((step, index) => `<li class="startup-lifecycle-step ${step.state}"><span class="startup-lifecycle-marker">${step.state === "complete" ? "✓" : index + 1}</span><span>${escapeHtml(step.label)}</span></li>`).join("")}
      </ol>
      <p class="muted-text startup-lifecycle-note">Stage is taken from the current startup record. “Not recorded” metrics are data gaps, not estimates.</p>
    </section>

    <div class="grid grid-2" style="margin-top: 16px;">
      <section class="card card-pad">
        <p class="eyebrow">Roadblocks & needs</p>
        <h3>What is blocking progress?</h3>
        <div class="insight-list" style="margin-top: 12px;">
          <article class="insight-item">
            <strong>Risk reason</strong>
            <p class="muted-text" style="margin-top: 8px;">${escapeHtml(startup.riskReason)}</p>
          </article>
          <article class="insight-item">
            <strong>Missing data</strong>
            <div class="tag-row">${tags(startup.missingData || [])}</div>
          </article>
          <article class="insight-item">
            <strong>Support needs</strong>
            <div class="tag-row">${tags(startup.mentorNeed || [])}</div>
          </article>
        </div>
      </section>

      <section class="card card-pad">
        <p class="eyebrow">Business metrics</p>
        <h3>Stage-specific operating snapshot</h3>
        <div class="detail-grid" style="margin-top: 12px;">
          ${stageMetrics.map((kpi) => `
            <div class="detail-stat"><span>${escapeHtml(kpi.label)}</span><strong>${escapeHtml(kpi.value)}</strong></div>
          `).join("")}
        </div>
        <article class="insight-item" style="margin-top: 12px;">
          <strong>Traction/context</strong>
          <p class="muted-text" style="margin-top: 8px;">${escapeHtml(startup.traction)}</p>
        </article>
      </section>
    </div>

    <div class="grid grid-2" style="margin-top: 16px;">
      <section class="card card-pad">
        <p class="eyebrow">AI recommendation</p>
        <h3>Suggested support path</h3>
        <p class="muted-text" style="margin-top: 8px;">${escapeHtml(defaultRecommendation)}</p>
        <p class="muted-text startup-ai-boundary">AI proposes based on available records; an SGA or program lead must approve any change.</p>
        <div class="tag-row">${tags((contacts || []).map((contact) => `${contact.type}: ${contact.name}`))}</div>
        <button class="button orange" type="button" style="margin-top: 12px;" data-intelligence-prompt="Review ${escapeHtml(startup.name)} and recommend the next support action with evidence.">Ask USI Intelligence</button>
      </section>

      <section class="card card-pad">
        <p class="eyebrow">On-going supports</p>
        <h3>Current incubation actions</h3>
        <ul class="muted-text" style="margin-top: 10px;">
          ${(startup.recommendedSupport || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    </div>

    <section class="card card-pad" style="margin-top: 16px;">
      <p class="eyebrow">Linked documents</p>
      <div class="grid grid-3" style="margin-top: 12px;">
        ${(startup.linkedDocuments || []).map((doc) => `
          <article class="insight-item">
            <strong>${escapeHtml(doc.title)}</strong>
            <p class="muted-text">${escapeHtml(doc.type)} - ${escapeHtml(doc.indexed)}</p>
          </article>
        `).join("") || `<p class="muted-text">No linked document metadata yet.</p>`}
      </div>
    </section>
  `;
}

export function bindStartupDetailPage() {
  document.querySelectorAll("[data-select-startup]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem(selectedKey, button.dataset.selectStartup);
      window.location.hash = "startup-detail";
    });
  });
}

function renderStartupTable() {
  const root = $("#startup-table");
  if (!root) return;

  const startups = getFilteredStartups();
  if (!startups.length) {
    root.innerHTML = emptyState("No startups match the current filters.");
    return;
  }

  root.innerHTML = `
    <div class="table-row table-head">
      <span>Startup</span>
      <span>Sector / cohort</span>
      <span>Stage</span>
      <span>Risk</span>
      <span>Health</span>
      <span></span>
    </div>
    ${startups.map((startup) => `
      <div class="table-row">
        <span><strong>${escapeHtml(startup.name)}</strong><small>${escapeHtml((startup.mentorNeed || []).slice(0, 2).join(", "))}</small></span>
        <span>${escapeHtml(startup.sector)}<small>${escapeHtml(startup.cohort)}</small></span>
        <span>${escapeHtml(startup.stage)}</span>
        <span><span class="status ${statusClass(startup.risk)}">${escapeHtml(startup.risk)}</span></span>
        <span><strong>${startup.health}/100</strong></span>
        <span><button class="button secondary" type="button" data-select-startup="${escapeHtml(startup.id)}">Open</button></span>
      </div>
    `).join("")}
  `;

  bindStartupDetailPage();
}

function getFilteredStartups() {
  const data = getDemoData();
  const search = ($("#startup-search")?.value || "").toLowerCase();
  const cohort = $("#cohort-filter")?.value || "";
  const sector = $("#sector-filter")?.value || "";
  const sort = $("#startup-sort")?.value || "risk";
  const riskScore = { High: 0, Medium: 1, Low: 2 };

  return data.startups
    .filter((startup) => {
      const haystack = [startup.name, startup.sector, startup.cohort, startup.stage, startup.summary, startup.founderNeed, ...(startup.mentorNeed || [])].join(" ").toLowerCase();
      return (!search || haystack.includes(search))
        && (!cohort || startup.cohort === cohort)
        && (!sector || startup.sector === sector);
    })
    .sort((a, b) => {
      if (sort === "health-low") return a.health - b.health;
      if (sort === "health-high") return b.health - a.health;
      if (sort === "name") return a.name.localeCompare(b.name);
      return riskScore[a.risk] - riskScore[b.risk] || a.health - b.health;
    });
}

function getSelectedStartup() {
  const startups = getDemoData().startups;
  const id = localStorage.getItem(selectedKey) || startups[0]?.id;
  return startups.find((startup) => startup.id === id) || startups[0];
}

function getMatchedContacts(startup) {
  return (getDemoData().contacts || []).filter((contact) => (contact.matchFor || []).includes(startup.name));
}
