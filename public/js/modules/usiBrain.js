import { askUsiBrain } from "../services/usiBrainApiService.js";
import { applyPlatformAction } from "../services/platformActionService.js";
import { $, escapeHtml } from "../utils/dom.js";

const suggestedPrompts = [
  "Which startup is at risk?",
  "What mentor does Skyholic need?",
  "How can Ecombox grow?",
  "Generate NIION brief",
  "What data is missing for Onto?",
  "Create a founder Q&A draft for Ecombox growth"
];

let messages = [
  {
    role: "ai",
    text: "Ask about cohort risk, mentor needs, growth options, missing data, or a meeting brief. I will answer with evidence and propose platform actions for human approval only."
  }
];
let isThinking = false;

export function renderUsiBrain() {
  return `
    <div class="brain-layout">
      <section class="card chat-shell">
        <div class="chat-messages" id="chat-messages"></div>
        <form class="chat-composer" id="chat-form">
          <input class="input" id="brain-input" placeholder="Ask USI Brain..." autocomplete="off" />
          <button class="button orange" type="submit">Send</button>
        </form>
      </section>

      <aside class="card card-pad">
        <p class="eyebrow">Suggested prompts</p>
        <div class="suggestion-list" style="margin-top: 12px;">
          ${suggestedPrompts.map((prompt) => `<button type="button" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}
        </div>
        <div class="insight-item" style="margin-top: 16px;">
          <strong>Brain tool mode</strong>
          <p class="muted-text" style="margin-top: 8px;">Approved proposals can create Project Board tasks, Knowledge Base notes, and Founder Q&A drafts in this demo.</p>
        </div>
        <div class="insight-item">
          <strong>Guardrails</strong>
          <p class="muted-text" style="margin-top: 8px;">USI Brain proposes. Humans approve. Production Firebase writes should store proposed updates first, not silently mutate startup records.</p>
        </div>
        <div class="insight-item">
          <strong>Gemini via backend</strong>
          <p class="muted-text" style="margin-top: 8px;">On Spark plan, use the local proxy with .env.local. On Blaze, deploy the Firebase Function with a secret.</p>
        </div>
      </aside>
    </div>
  `;
}

export function bindUsiBrain() {
  renderMessages();

  $("#chat-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (isThinking) return;
    const input = $("#brain-input");
    const prompt = input.value.trim();
    if (!prompt) return;
    input.value = "";
    askBrain(prompt);
  });

  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!isThinking) askBrain(button.dataset.prompt);
    });
  });
}

async function askBrain(prompt) {
  isThinking = true;
  messages.push({ role: "user", text: prompt });
  const loadingId = `loading-${Date.now()}`;
  messages.push({ role: "loading", id: loadingId, text: "USI Brain is checking sources" });
  renderMessages();

  try {
    const response = await askUsiBrain(prompt);
    const proposalId = `proposal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    messages = messages.filter((message) => message.id !== loadingId);
    messages.push({ role: "ai-card", data: response, proposalId });
  } catch (error) {
    messages = messages.filter((message) => message.id !== loadingId);
    messages.push({ role: "ai", text: `USI Brain could not answer cleanly: ${error.message}` });
  } finally {
    isThinking = false;
    renderMessages();
  }
}

function renderMessages() {
  const root = $("#chat-messages");
  if (!root) return;
  root.innerHTML = messages.map((message) => {
    if (message.role === "ai-card") return renderAiCard(message.data, message.proposalId);
    if (message.role === "loading") return `<div class="message typing-bubble">${escapeHtml(message.text)}<span></span><span></span><span></span></div>`;
    return `<div class="message ${message.role === "user" ? "user" : ""}">${escapeHtml(message.text)}</div>`;
  }).join("");
  root.scrollTop = root.scrollHeight;

  root.querySelectorAll("[data-proposal-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = root.querySelector(`[data-proposal-status="${button.dataset.proposalId}"]`);
      const feedback = root.querySelector(`[data-proposal-feedback="${button.dataset.proposalId}"]`);
      if (!target) return;

      let feedbackText = "No platform changes applied.";
      if (button.dataset.proposalAction === "approve") {
        const message = messages.find((item) => item.proposalId === button.dataset.proposalId);
        const result = applyPlatformAction(message?.data?.proposedUpdate);
        feedbackText = result.message;
      }

      target.textContent = button.dataset.proposalAction === "approve" ? "Approved and applied (demo)" : "Rejected by human reviewer (demo)";
      target.className = `status ${button.dataset.proposalAction === "approve" ? "good" : "bad"}`;
      if (feedback) feedback.textContent = feedbackText;
    });
  });

  const sendButton = $("#chat-form button[type='submit']");
  const input = $("#brain-input");
  if (sendButton) sendButton.disabled = isThinking;
  if (input) input.disabled = isThinking;
}

function renderAiCard(response, proposalId) {
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  const evidence = response.evidence?.length ? response.evidence : ["No evidence returned."];
  const sources = [...new Set(response.sources || [])];
  const missingData = response.missingData?.length ? response.missingData : ["No explicit missing data returned."];
  const nextActions = response.nextActions?.length ? response.nextActions : ["Ask SGA/Leader to review the answer before acting."];

  // Format answer with line breaks and bold support
  const formattedAnswer = (response.answer || "")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");

  return `
    <div class="message brain-response">
      <div class="brain-response-head">
        <span class="brain-avatar">USI</span>
        <div>
          <strong>USI Brain</strong>
          <p>${escapeHtml(response.provider || "Evidence-based assistant")}</p>
        </div>
        <span class="confidence-pill">${escapeHtml(response.confidence || "Unknown")} confidence</span>
      </div>

      <p class="brain-answer">${formattedAnswer}</p>

      <div class="brain-next-actions">
        <strong style="display: block; margin-bottom: 8px; color: var(--navy-900);">Recommended Next Steps:</strong>
        ${nextActions.slice(0, 4).map((action) => `<span>→ ${escapeHtml(action)}</span>`).join("")}
      </div>

      <div class="brain-evidence-grid">
        ${renderDetails("📋 Evidence & Framework", list(evidence), true)}
        ${renderDetails("📚 Sources", list(sources.length ? sources : ["No source returned."]))}
        ${renderDetails("❓ Data Gaps", list(missingData))}
      </div>

      ${response.proposedUpdate ? renderProposedUpdate(response.proposedUpdate, proposalId) : ""}
      ${response.systemNote ? `<p class="brain-system-note">${escapeHtml(response.systemNote)}</p>` : ""}
    </div>
  `;
}

function renderDetails(title, content, open = false) {
  return `
    <details class="brain-details" ${open ? "open" : ""}>
      <summary>${escapeHtml(title)}</summary>
      <div class="brain-details-body">${content}</div>
    </details>
  `;
}

function renderProposedUpdate(proposal, proposalId) {
  const statusClass = proposal.approvalStatus === "pending" ? "warn" : proposal.approvalStatus === "approved" ? "good" : "bad";
  const statusIcon = proposal.approvalStatus === "pending" ? "⏳" : proposal.approvalStatus === "approved" ? "✓" : "✗";
  
  return `
    <div class="ai-proposal-card">
      <div class="ai-proposal-top">
        <div>
          <p class="eyebrow">🤖 AI Proposed Update</p>
          <h3>${escapeHtml(proposal.type || "Proposal")} — ${escapeHtml(proposal.startupName || "Program")}</h3>
        </div>
        <span class="status ${statusClass}" data-proposal-status="${proposalId}">
          <span style="display: inline-block; margin-right: 4px;">${statusIcon}</span>
          ${escapeHtml(proposal.approvalStatus || "pending")}
        </span>
      </div>

      <div class="proposal-field-change">
        <span>Proposed Action</span>
        <strong>${escapeHtml(proposal.proposedChange || "No proposed change provided.")}</strong>
      </div>

      <div class="proposal-rationale" style="padding: 12px; background: rgba(42, 171, 238, 0.06); border-radius: 8px; border-left: 3px solid var(--blue-400);">
        <p class="muted-text" style="margin: 0;"><strong>Why this matters:</strong> ${escapeHtml(proposal.rationale || "Needs human review.")}</p>
      </div>

      <div class="proposal-tool-target">
        <span>Platform Action After Approval</span>
        <strong>${escapeHtml(summarizePlatformAction(proposal.platformAction))}</strong>
      </div>

      <div class="proposal-guardrail" style="padding: 10px; background: rgba(255, 193, 7, 0.08); border-radius: 8px; font-size: 12px; color: var(--ink-600); border-left: 3px solid #FFC107;">
        ⚠️ <strong>Human Approval Required:</strong> This update will NOT be applied until you review and approve. AI proposes, humans decide.
      </div>

      <div class="proposal-actions">
        <button class="button secondary" type="button" data-proposal-id="${proposalId}" data-proposal-action="reject" style="flex: 1;">Reject</button>
        <button class="button orange" type="button" data-proposal-id="${proposalId}" data-proposal-action="approve" style="flex: 1;">Approve & Apply</button>
      </div>

      <p class="muted-text" data-proposal-feedback="${proposalId}" style="margin: 0; font-size: 12px;"></p>
    </div>
  `;
}

function summarizePlatformAction(action) {
  if (!action) return "Approve note only; no platform tool action attached.";
  const actions = action.type === "batch" ? action.actions || [] : [action];
  const labels = {
    create_project_task: "create Project Board task",
    create_knowledge_note: "add Knowledge Base note",
    create_founder_qa: "draft Founder Q&A answer"
  };
  return actions.map((item) => labels[item.type] || item.type).join(" + ");
}
