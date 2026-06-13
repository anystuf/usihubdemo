import { getDemoData } from "../services/dataService.js";
import { PLATFORM_ACTION_EVENT, getDocumentsWithLocal } from "../services/platformActionService.js";
import { $, escapeHtml, statusClass, tags } from "../utils/dom.js";

let actionListenerBound = false;

export function renderKnowledgeBase() {
  const data = getDemoData();
  const documents = getDocumentsWithLocal(data.documents);
  const readyCount = documents.filter((doc) => doc.indexed === "Ready").length;
  const startupLinkedCount = documents.filter((doc) => !["Platform", "Cohort"].includes(doc.startup)).length;
  return `
    <section class="grid grid-3" style="margin-bottom: 16px;">
      <article class="card metric-card"><span>Total sources</span><strong>${documents.length}</strong><p>Tracked source metadata for USI Brain</p></article>
      <article class="card metric-card"><span>Ready metadata</span><strong>${readyCount}</strong><p>Can be cited in demo answers</p></article>
      <article class="card metric-card"><span>Startup-linked</span><strong>${startupLinkedCount}</strong><p>Roadmaps and pitch evidence</p></article>
    </section>

    <div class="kb-layout">
      <section>
        <div class="toolbar">
          <input class="input" id="doc-search" placeholder="Search documents, startup, type, or tag" />
          <select class="select" id="doc-type-filter">
            <option value="">All types</option>
            ${[...new Set(documents.map((doc) => doc.type))].map((type) => `<option>${escapeHtml(type)}</option>`).join("")}
          </select>
          <select class="select" id="doc-status-filter">
            <option value="">All index status</option>
            ${[...new Set(documents.map((doc) => doc.indexed))].map((status) => `<option>${escapeHtml(status)}</option>`).join("")}
          </select>
          <select class="select" id="doc-startup-filter">
            <option value="">All startups</option>
            ${[...new Set(documents.map((doc) => doc.startup))].map((startup) => `<option>${escapeHtml(startup)}</option>`).join("")}
          </select>
        </div>
        <div class="document-list" id="document-list"></div>
      </section>

      <aside class="card card-pad">
        <p class="eyebrow">Upload placeholder</p>
        <div class="upload-placeholder" style="margin-top: 12px;">
          <strong>Document upload disabled</strong>
          <p class="muted-text" style="margin-top: 8px;">Later this will upload to Firebase Storage, create a Firestore document record, and queue indexing through Cloud Functions.</p>
        </div>
        <div class="insight-item" style="margin-top: 14px;">
          <strong>Indexing rule</strong>
          <p class="muted-text" style="margin-top: 8px;">Every source should store type, owner, linked startup, tags, permission level, indexed status, and extraction quality.</p>
        </div>
        <div class="insight-item">
          <strong>Evidence standard</strong>
          <p class="muted-text" style="margin-top: 8px;">USI Brain should cite document title, startup, confidence, missing data, and whether full text has been extracted.</p>
        </div>
        <div class="insight-item">
          <strong>USI Brain tool action</strong>
          <p class="muted-text" style="margin-top: 8px;">Approved Brain proposals can add reviewed AI notes here. Production version should write proposed documents to Firestore, not directly index them.</p>
        </div>
        <div class="insight-item">
          <strong>Firestore demo seed</strong>
          <p class="muted-text" style="margin-top: 8px;">Run this from local server mode to create demo collections in Firestore.</p>
          <button class="button orange" type="button" id="seed-firestore-button" style="margin-top: 10px;">Seed Firestore</button>
          <p class="muted-text" id="seed-firestore-status" style="margin-top: 8px;"></p>
        </div>
      </aside>
    </div>
  `;
}

export function bindKnowledgeBase() {
  ["doc-search", "doc-type-filter", "doc-status-filter", "doc-startup-filter"].forEach((id) => {
    $(`#${id}`)?.addEventListener("input", renderDocuments);
  });
  $("#seed-firestore-button")?.addEventListener("click", seedFirestore);
  renderDocuments();

  if (!actionListenerBound) {
    window.addEventListener(PLATFORM_ACTION_EVENT, () => {
      if ($("#document-list")) renderDocuments();
    });
    actionListenerBound = true;
  }
}

async function seedFirestore() {
  const status = $("#seed-firestore-status");
  const button = $("#seed-firestore-button");
  if (status) status.textContent = "Seeding Firestore demo collections...";
  if (button) button.disabled = true;

  try {
    const response = await fetch("/api/seed-firestore", { method: "POST" });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.stderr || result.message || "Seed failed");
    if (status) status.textContent = "Done. Refresh Firebase Console to see collections.";
  } catch (error) {
    if (status) status.textContent = `Seed failed: ${error.message}`;
  } finally {
    if (button) button.disabled = false;
  }
}

function renderDocuments() {
  const data = getDemoData();
  const documents = getDocumentsWithLocal(data.documents);
  const search = ($("#doc-search")?.value || "").toLowerCase();
  const type = $("#doc-type-filter")?.value || "";
  const status = $("#doc-status-filter")?.value || "";
  const startup = $("#doc-startup-filter")?.value || "";
  const docs = documents.filter((doc) => {
    const haystack = [doc.title, doc.type, doc.startup, doc.source, ...doc.tags].join(" ").toLowerCase();
    return (!search || haystack.includes(search))
      && (!type || doc.type === type)
      && (!status || doc.indexed === status)
      && (!startup || doc.startup === startup);
  });

  $("#document-list").innerHTML = docs.map((doc) => `
    <article class="document-row">
      <div class="doc-meta">
        <strong>${escapeHtml(doc.title)}</strong>
        <span class="status ${statusClass(doc.indexed)}">${escapeHtml(doc.indexed)}</span>
      </div>
      <p class="muted-text" style="margin-top: 8px;">${escapeHtml(doc.type)} - linked to ${escapeHtml(doc.startup)}</p>
      <p class="muted-text">Source: ${escapeHtml(doc.source)}</p>
      <p class="muted-text"><b>Evidence use:</b> ${escapeHtml(doc.evidenceUse)}</p>
      <p class="muted-text"><b>Extraction:</b> ${escapeHtml(doc.extractionQuality)}</p>
      <div class="tag-row">${tags(doc.tags)}</div>
      
      <div class="doc-actions" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="button secondary doc-action-btn" data-action="ask-brain" data-doc-title="${escapeHtml(doc.title)}" data-doc-startup="${escapeHtml(doc.startup)}" title="Ask USI Brain a question about this document">🤖 Ask USI Brain</button>
        <button class="button secondary doc-action-btn" data-action="summarize" data-doc-title="${escapeHtml(doc.title)}" title="Generate a summary">📝 Summarize</button>
        <button class="button secondary doc-action-btn" data-action="risk-signals" data-doc-title="${escapeHtml(doc.title)}" data-doc-startup="${escapeHtml(doc.startup)}" title="Extract risk signals">⚠️ Risk Signals</button>
      </div>
    </article>
  `).join("");

  // Bind action buttons
  document.querySelectorAll(".doc-action-btn").forEach((btn) => {
    btn.addEventListener("click", handleDocumentAction);
  });
}

function handleDocumentAction(event) {
  const action = event.target.dataset.action;
  const docTitle = event.target.dataset.docTitle;
  const docStartup = event.target.dataset.docStartup;

  let prompt = "";

  if (action === "ask-brain") {
    prompt = `Ask USI Brain about: ${docTitle}`;
  } else if (action === "summarize") {
    prompt = `Summarize this document: ${docTitle}`;
  } else if (action === "risk-signals") {
    prompt = `What risk signals does this document reveal? ${docTitle} (${docStartup})`;
  }

  if (prompt) {
    // Navigate to USI Brain and trigger the prompt
    window.location.hash = "#usi-brain";
    
    // Trigger the question after a brief delay to allow navigation
    setTimeout(() => {
      const input = document.querySelector("#brain-input");
      if (input) {
        input.value = prompt;
        input.focus();
        // Dispatch a change/input event to ensure form is aware of the value
        input.dispatchEvent(new Event("input", { bubbles: true }));
        // Auto-submit the form
        const form = document.querySelector("#chat-form");
        if (form) {
          form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        }
      }
    }, 100);
  }
}
