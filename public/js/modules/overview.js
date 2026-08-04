import { getDemoData } from "../services/dataService.js";
import { escapeHtml, statusClass } from "../utils/dom.js";

export function renderOverview() {
  const data = getDemoData();
  const startups = data.startups || [];
  const documents = data.documents || [];
  const tasks = data.projectTasks || [];
  const proposals = data.aiProposals || [];
  const insights = data.aiInsights || [];
  const dashboard = data.dashboard || {};

  const highRisk = startups.filter((startup) => startup.risk === "High");
  const avgHealth = startups.length
    ? Math.round(startups.reduce((sum, startup) => sum + Number(startup.health || 0), 0) / startups.length)
    : 0;

  const openTasks = tasks.filter((task) => task.status !== "Done");
  const incompleteDocuments = documents.filter((doc) => doc.indexed !== "Ready");
  const pendingProposals = proposals.filter((proposal) => proposal.approvalStatus === "pending");

  const healthBands = {
    "Needs review": startups.filter((startup) => startup.health < 65).length,
    "Stable": startups.filter((startup) => startup.health >= 65 && startup.health < 75).length,
    "Growth-ready": startups.filter((startup) => startup.health >= 75).length
  };

  const documentReadiness = {
    "RAG-ready metadata": documents.filter((doc) => doc.indexed === "Ready").length,
    "Partial metadata": documents.filter((doc) => doc.indexed === "Partial").length,
    "Queued extraction": documents.filter((doc) => doc.indexed === "Queued").length
  };

  const metricLinks = {
    "Total startups": "#startup-os",
    "At-risk startups": "#startup-os",
    "Pending actions": "#project-board",
    "Open support tasks": "#project-board",
    "Documents indexed": "#knowledge-base",
    "AI proposals": "#usi-intelligence"
  };

  const supportNeeds = buildSupportNeeds(startups);
  const recentTasks = openTasks.slice(0, 5);
  const rankedStartups = [...startups].sort((a, b) => Number(a.health || 0) - Number(b.health || 0));

  return `
    <section class="overview-header">
      <div>
        <p class="eyebrow">USI Hub dashboard</p>
        <h2>Overview</h2>
        <p class="overview-subtitle">
          Real-time insights into startup progress, risk, support tasks,
          documents, and human-reviewed AI recommendations.
        </p>
      </div>

      <div class="overview-filters" aria-label="Overview filters">
        <label>
          <span class="sr-only">Reporting period</span>
          <select class="select compact" aria-label="Reporting period">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </label>

        <label>
          <span class="sr-only">Cohort</span>
          <select class="select compact" aria-label="Cohort">
            <option>All cohorts</option>
            <option>Current cohort</option>
          </select>
        </label>
      </div>
    </section>

    <div class="overview-metrics">
      ${(data.metrics || []).map((metric) => `
        <a
          class="card overview-metric-link"
          href="${metricLinks[metric.label] || "#overview"}"
          aria-label="${escapeHtml(metric.label)}: ${escapeHtml(metric.value)}"
        >
          <div class="metric-kicker">
            <span>${escapeHtml(metric.label)}</span>
            <span aria-hidden="true">↗</span>
          </div>
          <strong class="metric-value">${escapeHtml(metric.value)}</strong>
          <p class="metric-note">${escapeHtml(metric.note)}</p>
          <span class="metric-action">View details →</span>
        </a>
      `).join("")}
    </div>

    <div class="overview-main-grid">
      <section class="card card-pad">
        <div class="overview-section-head">
          <div>
            <p class="eyebrow">Executive analytics</p>
            <h2>Key metrics at a glance</h2>
          </div>
          <a class="overview-text-link" href="#startup-os">View full analytics →</a>
        </div>

        <div class="overview-analytics-grid">
          ${renderDonutCard(
            "Risk distribution",
            dashboard.riskDistribution || {},
            { High: "#dc2626", Medium: "#d97706", Low: "#059669" }
          )}
          ${renderBarCard("Stage distribution", dashboard.stageDistribution || {})}
          ${renderStackedCard(
            "Cohort health bands",
            healthBands,
            { "Needs review": "#dc2626", Stable: "#d97706", "Growth-ready": "#059669" }
          )}
          ${renderHorizontalCard("Top support needs", supportNeeds)}
          ${renderDonutCard(
            "Document status",
            dashboard.documentStatus || {},
            { Ready: "#059669", Partial: "#d97706", Queued: "#2563eb" }
          )}
          ${renderStackedCard(
            "Document indexing pipeline",
            documentReadiness,
            { "RAG-ready metadata": "#059669", "Partial metadata": "#d97706", "Queued extraction": "#2563eb" }
          )}
        </div>
      </section>

      <aside class="overview-side-column">
        <section class="card card-pad">
          <div class="overview-section-head">
            <div>
              <p class="eyebrow">Action required</p>
              <h2>Top priorities</h2>
            </div>
            <a class="overview-text-link" href="#project-board">View all →</a>
          </div>

          <div class="priority-list">
            ${renderPriority(
              `${highRisk.length} at-risk startups need review`,
              "Require immediate SGA or Leader attention",
              highRisk.length,
              "bad",
              "#startup-os"
            )}
            ${renderPriority(
              `${openTasks.length} support tasks remain open`,
              "Review overdue and high-priority work first",
              openTasks.length,
              "warn",
              "#project-board"
            )}
            ${renderPriority(
              `${incompleteDocuments.length} documents need completion`,
              "Metadata or extraction is incomplete",
              incompleteDocuments.length,
              "info",
              "#knowledge-base"
            )}
            ${renderPriority(
              `${pendingProposals.length} AI proposals await review`,
              "Human approval is required before updates",
              pendingProposals.length,
              "ai",
              "#usi-intelligence"
            )}
          </div>
        </section>

        <section class="card card-pad">
          <div class="overview-section-head">
            <div>
              <p class="eyebrow">USI Intelligence</p>
              <h2>Decision-support insights</h2>
            </div>
            <a class="overview-text-link" href="#usi-intelligence">View all →</a>
          </div>

          ${insights.slice(0, 3).map((insight) => `
            <article class="overview-insight">
              <strong>${escapeHtml(insight.title)}</strong>
              <p>${escapeHtml(insight.body)}</p>
              <p><b>Recommended next step:</b> ${escapeHtml(insight.action)}</p>
            </article>
          `).join("")}

          <div class="overview-note">
            Risk scoring is a triage signal, not a final decision about support,
            funding, or startup status.
          </div>
        </section>
      </aside>
    </div>

    <div class="overview-bottom-grid">
      <section class="card card-pad">
        <div class="overview-section-head">
          <div>
            <p class="eyebrow">Health ranking</p>
            <h2>Startups needing support first</h2>
          </div>
          <span class="pill">Average health ${avgHealth}/100</span>
        </div>

        <div class="health-table">
          <div class="health-table-row head" aria-hidden="true">
            <span>Startup</span>
            <span>Health score</span>
            <span>Risk</span>
            <span>Stage</span>
          </div>

          ${rankedStartups.map((startup) => `
            <div class="health-table-row">
              <a class="health-name" href="#startup-detail" aria-label="Open ${escapeHtml(startup.name)} details">
                ${escapeHtml(startup.name)}
              </a>

              <div class="health-score-wrap">
                <div class="progress-track" aria-label="${escapeHtml(startup.name)} health score ${startup.health} out of 100">
                  <div
                    class="progress-fill ${statusClass(startup.risk)}"
                    style="width:${Math.max(0, Math.min(100, Number(startup.health || 0)))}%;"
                  ></div>
                </div>
                <strong>${escapeHtml(startup.health)}/100</strong>
              </div>

              <span class="status ${statusClass(startup.risk)}">
                ${escapeHtml(startup.risk)} risk
              </span>

              <span class="muted-text">${escapeHtml(startup.stage || "Unknown")}</span>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="card card-pad">
        <div class="overview-section-head">
          <div>
            <p class="eyebrow">Current work</p>
            <h2>Recent support tasks</h2>
          </div>
          <a class="overview-text-link" href="#project-board">Open worklist →</a>
        </div>

        <div class="activity-list">
          ${recentTasks.length
            ? recentTasks.map((task) => `
              <article class="activity-item">
                <div>
                  <strong>${escapeHtml(task.title || "Untitled task")}</strong>
                  <p>
                    ${escapeHtml(task.startup || task.owner || "Program")}
                    · ${escapeHtml(task.due || "No due date")}
                  </p>
                </div>
                <span class="status ${task.priority === "High" ? "bad" : task.priority === "Medium" ? "warn" : "info"}">
                  ${escapeHtml(task.priority || task.status || "Open")}
                </span>
              </article>
            `).join("")
            : `<p class="muted-text">No open support tasks.</p>`
          }
        </div>
      </section>
    </div>
  `;
}

function renderPriority(title, description, count, tone, href) {
  return `
    <a class="priority-item" href="${href}">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(description)}</p>
      </div>
      <span class="priority-count ${tone}">${count}</span>
    </a>
  `;
}

function renderDonutCard(title, values, colors = {}) {
  const entries = Object.entries(values);
  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0) || 1;
  let cursor = 0;

  const segments = entries.map(([label, value], index) => {
    const start = cursor;
    const end = cursor + (Number(value || 0) / total) * 100;
    cursor = end;
    return `${colors[label] || defaultColors[index % defaultColors.length]} ${start}% ${end}%`;
  }).join(", ");

  return `
    <article class="card card-pad chart-card">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <div
        class="donut"
        role="img"
        aria-label="${escapeHtml(title)}, total ${total}"
        style="background:conic-gradient(${segments || "#e5e7eb 0 100%"});"
      >
        <span>${total}</span>
      </div>
      <div class="legend-list">
        ${entries.map(([label, value], index) => `
          <div>
            <i style="background:${colors[label] || defaultColors[index % defaultColors.length]}"></i>
            ${escapeHtml(label)}
            <strong>${value}</strong>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderBarCard(title, values) {
  const entries = Object.entries(values);
  const max = Math.max(...entries.map(([, value]) => Number(value || 0)), 1);

  return `
    <article class="card card-pad chart-card">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <div class="mini-bars">
        ${entries.map(([label, value], index) => `
          <div class="mini-bar-row">
            <span>${escapeHtml(label)}</span>
            <div class="chart-track">
              <div
                class="chart-fill info"
                style="width:${Math.round((Number(value || 0) / max) * 100)}%; background:${defaultColors[index % defaultColors.length]};"
              ></div>
            </div>
            <strong>${value}</strong>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderStackedCard(title, values, colors = {}) {
  const entries = Object.entries(values);
  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0) || 1;

  return `
    <article class="card card-pad report-card">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <div class="stacked-bar" aria-label="${escapeHtml(title)}">
        ${entries.map(([label, value], index) => {
          const width = Math.round((Number(value || 0) / total) * 100);
          return `
            <span
              style="width:${width}%; background:${colors[label] || defaultColors[index % defaultColors.length]};"
              title="${escapeHtml(label)} ${value}"
            ></span>
          `;
        }).join("")}
      </div>

      <div class="report-stat-row">
        ${entries.map(([label, value], index) => `
          <div>
            <i style="background:${colors[label] || defaultColors[index % defaultColors.length]}"></i>
            <span>${escapeHtml(label)}</span>
            <strong>${value}</strong>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderHorizontalCard(title, values) {
  const entries = Object.entries(values)
    .sort(([, a], [, b]) => Number(b || 0) - Number(a || 0))
    .slice(0, 6);

  const max = Math.max(...entries.map(([, value]) => Number(value || 0)), 1);

  return `
    <article class="card card-pad report-card">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <div class="support-chart">
        ${entries.map(([label, value], index) => `
          <div>
            <span>${escapeHtml(label)}</span>
            <div class="chart-track">
              <div
                class="chart-fill"
                style="width:${Math.round((Number(value || 0) / max) * 100)}%; background:${defaultColors[index % defaultColors.length]};"
              ></div>
            </div>
            <strong>${value}</strong>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function buildSupportNeeds(startups) {
  return startups.reduce((counts, startup) => {
    const needs = startup.mentorNeed?.length
      ? startup.mentorNeed
      : String(startup.founderNeed || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    needs.slice(0, 3).forEach((need) => {
      counts[need] = (counts[need] || 0) + 1;
    });

    return counts;
  }, {});
}

const defaultColors = [
  "#0b2559",
  "#f06b1f",
  "#2563eb",
  "#059669",
  "#d97706",
  "#7c3aed"
];
