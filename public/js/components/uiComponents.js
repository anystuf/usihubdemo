import { escapeHtml, statusClass } from "../utils/dom.js";

export function statusBadge(value) {
  return `<span class="status ${statusClass(value)}">${escapeHtml(value)}</span>`;
}

export function metricCard(label, value, note) {
  return `
    <article class="card metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(note)}</p>
    </article>
  `;
}
