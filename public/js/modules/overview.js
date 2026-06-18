import { getDemoData } from "../services/dataService.js";
import { escapeHtml, statusClass } from "../utils/dom.js";

export function renderOverview() {
  const data = getDemoData();
  const highRisk = data.startups.filter((startup) => startup.risk === "High");
  const avgHealth = Math.round(data.startups.reduce((sum, startup) => sum + startup.health, 0) / data.startups.length);
  const dashboard = data.dashboard;
  const supportNeeds = buildSupportNeeds(data.startups);
  const healthBands = {
    "Needs review": data.startups.filter((startup) => startup.health < 65).length,
    "Stable": data.startups.filter((startup) => startup.health >= 65 && startup.health < 75).length,
    "Growth-ready": data.startups.filter((startup) => startup.health >= 75).length
  };
  const documentReadiness = {
    "RAG-ready metadata": data.documents.filter((doc) => doc.indexed === "Ready").length,
    "Partial metadata": data.documents.filter((doc) => doc.indexed === "Partial").length,
    "Queued extraction": data.documents.filter((doc) => doc.indexed === "Queued").length
  };

  return `
    <div class="hero">
      <p class="eyebrow">First static prototype</p>
      <h2>Incubation management, evidence, and founder support in one operating system.</h2>
      <p>USI Hub V2 is a Firebase-ready static prototype for managing startup data, documents, progress, mentoring, workshops, reporting, risk signals, and future AI-supported recommendations. AI proposes. Humans decide.</p>
    </div>

    <div class="grid grid-3" style="margin-top: 16px;">
      ${data.metrics.map((metric) => `
        <article class="card metric-card">
          <span>${escapeHtml(metric.label)}</span>
          <strong>${escapeHtml(metric.value)}</strong>
          <p>${escapeHtml(metric.note)}</p>
        </article>
      `).join("")}
    </div>

    <section class="section-header">
      <div>
        <p class="eyebrow">Executive analytics</p>
        <h2>Visual cohort report</h2>
      </div>
      <p>Charts are generated from the same demo dataset used by Startup OS, Knowledge Base, and USI Intelligence.</p>
    </section>

    <div class="grid grid-4">
      ${renderDonutCard("Risk mix", dashboard.riskDistribution, { High: "#dc2626", Medium: "#d97706", Low: "#059669" })}
      ${renderBarCard("Stage distribution", dashboard.stageDistribution)}
      ${renderDonutCard("Document status", dashboard.documentStatus, { Ready: "#059669", Partial: "#d97706", Queued: "#2563eb" })}
      ${renderBarCard("Task status", dashboard.taskStatus)}
    </div>

    <div class="grid grid-3" style="margin-top: 16px;">
      ${renderStackedCard("Cohort health bands", healthBands, { "Needs review": "#dc2626", Stable: "#d97706", "Growth-ready": "#059669" })}
      ${renderHorizontalCard("Top support needs", supportNeeds)}
      ${renderStackedCard("Document indexing pipeline", documentReadiness, { "RAG-ready metadata": "#059669", "Partial metadata": "#d97706", "Queued extraction": "#2563eb" })}
    </div>

    <section class="card card-pad" style="margin-top: 16px;">
      <div class="section-header" style="margin-top: 0;">
        <div>
          <p class="eyebrow">Health ranking</p>
          <h2>Startups needing support first</h2>
        </div>
        <span class="pill">Average health ${avgHealth}/100</span>
      </div>
      <div class="chart-list">
        ${dashboard.healthRanking.map((item) => `
          <div class="chart-row">
            <span>${escapeHtml(item.label)}</span>
            <div class="chart-track"><div class="chart-fill ${statusClass(item.risk)}" style="width: ${item.value}%;"></div></div>
            <strong>${item.value}</strong>
          </div>
        `).join("")}
      </div>
    </section>

    <div class="overview-split" style="margin-top: 16px;">
      <section class="card card-pad">
        <div class="section-header" style="margin-top: 0;">
          <div>
            <p class="eyebrow">Risk and progress</p>
            <h2>Cohort health snapshot</h2>
          </div>
          <span class="pill">Average health ${avgHealth}</span>
        </div>
        <div class="insight-list">
          ${data.startups.map((startup) => `
            <div class="insight-item">
              <div class="startup-card-header">
                <strong>${escapeHtml(startup.name)}</strong>
                <span class="status ${statusClass(startup.risk)}">${escapeHtml(startup.risk)} risk</span>
              </div>
              <p class="muted-text" style="margin: 8px 0;">${escapeHtml(startup.sector)} - ${escapeHtml(startup.stage)}</p>
              <div class="progress-track" aria-label="${escapeHtml(startup.name)} health score">
                <div class="progress-fill" style="width: ${startup.health}%;"></div>
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <aside class="card card-pad">
        <div class="section-header" style="margin-top: 0;">
          <div>
            <p class="eyebrow">USI Intelligence preview</p>
            <h2>Demo insights</h2>
          </div>
        </div>
        <div class="insight-list">
          ${data.aiInsights.map((insight) => `
            <article class="insight-item">
              <strong>${escapeHtml(insight.title)}</strong>
              <p class="muted-text" style="margin-top: 8px;">${escapeHtml(insight.body)}</p>
              <p class="muted-text" style="margin-top: 8px;"><b>Next:</b> ${escapeHtml(insight.action)}</p>
            </article>
          `).join("")}
        </div>
        <div class="insight-item" style="margin-top: 10px;">
          <strong>${highRisk.length} startups need review</strong>
          <p class="muted-text" style="margin-top: 8px;">Risk scoring is a triage signal. It must never be used as a final decision about support, funding, or status.</p>
        </div>
      </aside>
    </div>
  `;
}

function renderDonutCard(title, values, colors = {}) {
  const entries = Object.entries(values);
  const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;
  let cursor = 0;
  const segments = entries.map(([label, value], index) => {
    const start = cursor;
    const end = cursor + (value / total) * 100;
    cursor = end;
    return `${colors[label] || defaultColors[index % defaultColors.length]} ${start}% ${end}%`;
  }).join(", ");

  return `
    <article class="card card-pad chart-card">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <div class="donut" style="background: conic-gradient(${segments});"><span>${total}</span></div>
      <div class="legend-list">
        ${entries.map(([label, value], index) => `
          <div><i style="background:${colors[label] || defaultColors[index % defaultColors.length]}"></i>${escapeHtml(label)} <strong>${value}</strong></div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderBarCard(title, values) {
  const entries = Object.entries(values);
  const max = Math.max(...entries.map(([, value]) => value), 1);
  return `
    <article class="card card-pad chart-card">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <div class="mini-bars">
        ${entries.map(([label, value], index) => `
          <div class="mini-bar-row">
            <span>${escapeHtml(label)}</span>
            <div class="chart-track"><div class="chart-fill info" style="width:${Math.round((value / max) * 100)}%; background:${defaultColors[index % defaultColors.length]};"></div></div>
            <strong>${value}</strong>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderStackedCard(title, values, colors = {}) {
  const entries = Object.entries(values);
  const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;
  let cursor = 0;

  return `
    <article class="card card-pad report-card">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <div class="stacked-bar" aria-label="${escapeHtml(title)}">
        ${entries.map(([label, value], index) => {
          const width = Math.round((value / total) * 100);
          cursor += width;
          return `<span style="width:${width}%; background:${colors[label] || defaultColors[index % defaultColors.length]};" title="${escapeHtml(label)} ${value}"></span>`;
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
  const entries = Object.entries(values).sort(([, a], [, b]) => b - a).slice(0, 6);
  const max = Math.max(...entries.map(([, value]) => value), 1);

  return `
    <article class="card card-pad report-card">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <div class="support-chart">
        ${entries.map(([label, value], index) => `
          <div>
            <span>${escapeHtml(label)}</span>
            <div class="chart-track"><div class="chart-fill" style="width:${Math.round((value / max) * 100)}%; background:${defaultColors[index % defaultColors.length]};"></div></div>
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
      : String(startup.founderNeed || "").split(",").map((item) => item.trim()).filter(Boolean);
    needs.slice(0, 3).forEach((need) => {
      counts[need] = (counts[need] || 0) + 1;
    });
    return counts;
  }, {});
}

const defaultColors = ["#0b2559", "#f06b1f", "#2563eb", "#059669", "#d97706", "#7c3aed"];
