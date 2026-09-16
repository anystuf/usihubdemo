import { askUsiBrain } from "../services/usiBrainApiService.js";
import { applyPlatformAction } from "../services/platformActionService.js";
import { $, escapeHtml } from "../utils/dom.js";
import { translate } from "../services/languageService.js";

const suggestedPrompts = [
  "Which startup is at risk?",
  "What mentor does Venture Alpha need?",
  "How can Venture Epsilon grow?",
  "Generate Venture Beta brief",
  "What data is missing for Venture Gamma?",
  "Who should support Venture Zeta?"
];

let messages = [
  {
    role: "ai",
    text: "Ask about cohort risk, mentor needs, growth options, missing data, support matching, or a meeting brief. I will answer with evidence and propose actions for human approval only."
  }
];
let isThinking = false;

let floatingMessages = [
  { role: "ai", text: "USI Intelligence is available across the platform. Ask about a startup, support need, task, or source." }
];
let floatingThinking = false;
const aiVisualUrl = new URL("../../assets/visuals/data.svg", import.meta.url).href;

export function renderUsiBrain() {
  return `
    <section class="card card-pad brain-intro">
      <div class="brain-intro-copy"><div class="brain-intro-title"><span class="brain-avatar">USI</span><div><p class="eyebrow">AI decision support</p><h2>USI Intelligence</h2></div></div><p class="muted-text">Turn startup, cohort, task, and knowledge records into an evidence-led next action.</p><div class="brain-guardrails"><span>Evidence first</span><span>Sources shown</span><span>Human approval required</span></div></div>
      <img src="${aiVisualUrl}" alt="" class="brain-intro-art" />
    </section>
    <div class="brain-layout">
      <section class="card chat-shell">
        <div class="chat-messages" id="chat-messages"></div>
        <form class="chat-composer" id="chat-form">
          <input class="input" id="brain-input" placeholder="Ask USI Intelligence..." autocomplete="off" />
          <button class="button orange" type="submit">Send</button>
        </form>
      </section>

      <aside class="card card-pad">
        <p class="eyebrow">USI Intelligence prompts</p>
        <div class="suggestion-list" style="margin-top: 12px;">
          ${suggestedPrompts.map((prompt) => `<button type="button" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}
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
  const conversation = buildConversationHistory();
  messages.push({ role: "user", text: prompt });
  const loadingId = `loading-${Date.now()}`;
  messages.push({ role: "loading", id: loadingId, text: "USI Intelligence is checking sources" });
  renderMessages();

  try {
    const response = await askUsiBrain(prompt, conversation);
    const proposalId = `proposal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    messages = messages.filter((message) => message.id !== loadingId);
    messages.push({ role: "ai-card", data: response, proposalId });
  } catch (error) {
    messages = messages.filter((message) => message.id !== loadingId);
    messages.push({ role: "ai", text: `USI Intelligence could not answer cleanly: ${error.message}` });
  } finally {
    isThinking = false;
    renderMessages();
  }
}

function buildConversationHistory() {
  return messages
    .filter((message) => message.role === "user" || message.role === "ai-card")
    .map((message) => ({
      role: message.role === "user" ? "user" : "model",
      text: message.role === "user" ? message.text : message.data?.answer
    }))
    .filter((message) => typeof message.text === "string" && message.text.trim())
    .slice(-10);
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

  // Escape first, then allow the controlled markdown-like bold markers used by the demo engine.
  const formattedAnswer = escapeHtml(response.answer || "")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");

  return `
    <div class="message brain-response">
      <div class="brain-response-head">
        <span class="brain-avatar">USI</span>
        <div>
          <strong>USI Intelligence</strong>
          <p>${escapeHtml(response.provider || "Evidence-based assistant")}</p>
        </div>
        <span class="confidence-pill">${escapeHtml(response.confidence || "Unknown")} confidence</span>
      </div>

      <p class="brain-answer">${formattedAnswer}</p>

      <div class="brain-next-actions">
        <strong style="display: block; margin-bottom: 8px; color: var(--navy-900);">Recommended Next Steps:</strong>
        ${nextActions.slice(0, 4).map((action) => `<span>- ${escapeHtml(action)}</span>`).join("")}
      </div>

      <div class="brain-evidence-grid">
        ${renderDetails("Evidence & Framework", list(evidence), true)}
        ${renderDetails("Sources", list(sources.length ? sources : ["No source returned."]), true)}
        ${renderDetails("Data Gaps", list(missingData))}
      </div>

      ${response.proposedUpdate ? renderProposedUpdate(response.proposedUpdate, proposalId) : ""}
      ${response.parseError ? `<p class="brain-system-note">${escapeHtml("No proposal was created because the response was not structured for human review.")}</p>` : ""}
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
  const statusLabel = proposal.approvalStatus === "pending" ? "Pending" : proposal.approvalStatus === "approved" ? "Approved" : "Rejected";

  return `
    <div class="ai-proposal-card">
      <div class="ai-proposal-top">
        <div>
          <p class="eyebrow">AI Proposed Update</p>
          <h3>${escapeHtml(proposal.type || "Proposal")} - ${escapeHtml(proposal.startupName || "Program")}</h3>
        </div>
        <span class="status ${statusClass}" data-proposal-status="${proposalId}">${statusLabel}</span>
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
        <strong>Human Approval Required:</strong> This update will NOT be applied until you review and approve. AI proposes, humans decide.
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
    create_project_task: "create incubation task",
    create_knowledge_note: "add Knowledge Base note",
    create_internal_support_note: "draft internal support note"
  };
  return actions.map((item) => labels[item.type] || item.type).join(" + ");
}

export function renderFloatingIntelligence() {
  return `
    <aside class="floating-ai" id="floating-ai">
      <button class="floating-ai-button" id="floating-ai-toggle" type="button">USI</button>
      <section class="floating-ai-panel" id="floating-ai-panel" hidden>
        <div class="floating-ai-head">
          <div>
            <strong>${translate("USI Intelligence")}</strong>
            <p>${translate("Internal incubation assistant")}</p>
          </div>
          <button class="button secondary" id="floating-ai-close" type="button">${translate("Close")}</button>
        </div>
        <div class="floating-ai-messages" id="floating-ai-messages"></div>
        <form class="floating-ai-form" id="floating-ai-form">
          <input class="input" id="floating-ai-input" placeholder="${translate("Ask about this platform...")}" autocomplete="off" />
          <button class="button orange" type="submit">${translate("Send")}</button>
        </form>
      </section>
    </aside>
  `;
}

export function bindFloatingIntelligence() {
  $("#floating-ai-toggle")?.addEventListener("click", () => {
    $("#floating-ai-panel").hidden = false;
    renderFloatingMessages();
  });
  $("#floating-ai-close")?.addEventListener("click", () => {
    $("#floating-ai-panel").hidden = true;
  });
  $("#floating-ai-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (floatingThinking) return;
    const input = $("#floating-ai-input");
    const prompt = input.value.trim();
    if (!prompt) return;
    input.value = "";
    await askFloating(prompt);
  });
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-intelligence-prompt]");
    if (!trigger) return;
    const panel = $("#floating-ai-panel");
    const input = $("#floating-ai-input");
    if (panel) panel.hidden = false;
    renderFloatingMessages();
    if (input) {
      input.value = trigger.dataset.intelligencePrompt || "";
      input.focus();
    }
  });
  renderFloatingMessages();
}

async function askFloating(prompt) {
  floatingThinking = true;
  floatingMessages.push({ role: "user", text: prompt });
  floatingMessages.push({ role: "loading", text: translate("Checking sources...") });
  renderFloatingMessages();

  try {
    const response = await askUsiBrain(prompt);
    floatingMessages = floatingMessages.filter((message) => message.role !== "loading");
    floatingMessages.push({
      role: "ai",
      text: `${response.answer}\n\n${translate("Next:")} ${(response.nextActions || []).slice(0, 2).join(" | ")}`
    });
  } catch (error) {
    floatingMessages = floatingMessages.filter((message) => message.role !== "loading");
    floatingMessages.push({ role: "ai", text: `${translate("Could not answer:")} ${error.message}` });
  } finally {
    floatingThinking = false;
    renderFloatingMessages();
  }
}

function renderFloatingMessages() {
  const root = $("#floating-ai-messages");
  if (!root) return;
  root.innerHTML = floatingMessages.map((message) => `
    <div class="floating-message ${message.role === "user" ? "user" : ""}">
      ${escapeHtml(translate(message.text)).replace(/\n/g, "<br/>")}
    </div>
  `).join("");
  root.scrollTop = root.scrollHeight;
}
