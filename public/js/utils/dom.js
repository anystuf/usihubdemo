export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function statusClass(value) {
  const normalized = String(value).toLowerCase();
  if (["low", "done", "ready", "approved"].some((term) => normalized.includes(term))) return "good";
  if (["medium", "partial", "in progress", "queued", "next"].some((term) => normalized.includes(term))) return "warn";
  if (["high", "blocked", "risk"].some((term) => normalized.includes(term))) return "bad";
  return "info";
}

export function tags(items = []) {
  return items.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("");
}

export function emptyState(message) {
  return `<div class="card card-pad"><p class="muted-text">${escapeHtml(message)}</p></div>`;
}
