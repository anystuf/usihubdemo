import { getDemoData } from "../services/dataService.js";
import {
  PLATFORM_ACTION_EVENT,
  addFounderQuestion,
  getFounderQuestionsWithLocal
} from "../services/platformActionService.js";
import { $, escapeHtml, tags } from "../utils/dom.js";

const qaStateKey = "usiHubFounderQaState";
let actionListenerBound = false;

export function renderFounderQa() {
  const data = getDemoData();
  return `
    <div class="qa-layout quora-layout">
      <aside class="card card-pad qa-left-rail">
        <p class="eyebrow">UII Startup Q&A</p>
        <h2>Founder knowledge network</h2>
        <div class="qa-topic-list" id="qa-topic-list"></div>
        <div class="insight-item" style="margin-top: 14px;">
          <strong>Community rule</strong>
          <p class="muted-text" style="margin-top: 8px;">Founder support answers are not formal evaluation. High-quality answers can be proposed into Knowledge Base after review.</p>
        </div>
      </aside>

      <main>
        <section class="card qa-ask-box">
          <div>
            <p class="eyebrow">Ask the UII startup network</p>
            <h2>What does your startup need help with?</h2>
          </div>
          <form id="question-form" class="qa-question-form">
            <select class="select" id="question-startup">
              ${data.startups.map((startup) => `<option value="${escapeHtml(startup.name)}">${escapeHtml(startup.name)}</option>`).join("")}
              <option value="Demo founder">General founder question</option>
            </select>
            <textarea class="textarea" id="question-input" placeholder="Ask about customers, regulation, pricing, pitching, hiring, mentors, Vietnam GTM..."></textarea>
            <div class="qa-form-footer">
              <span class="muted-text">Questions are saved locally in this MVP. Production should route sensitive posts through role rules.</span>
              <button class="button orange" type="submit">Ask question</button>
            </div>
          </form>
        </section>

        <section class="qa-feed-tools">
          <input class="input" id="qa-search" placeholder="Search questions, answers, startup, or topic" />
          <select class="select" id="qa-topic-filter">
            <option value="">All topics</option>
          </select>
          <select class="select" id="qa-sort">
            <option value="recommended">Recommended</option>
            <option value="votes">Most upvoted</option>
            <option value="answers">Most answered</option>
            <option value="newest">Newest</option>
          </select>
        </section>

        <div class="qa-feed" id="qa-list"></div>
      </main>

      <aside class="card card-pad qa-right-rail">
        <p class="eyebrow">Network pulse</p>
        <div class="qa-stats" id="qa-stats"></div>
        <div class="insight-list" style="margin-top: 14px;">
          <div class="insight-item"><strong>Mentor signal</strong><p class="muted-text" style="margin-top: 8px;">Answers with evidence, Vietnam context, and next steps should rise first.</p></div>
          <div class="insight-item"><strong>USI Brain action</strong><p class="muted-text" style="margin-top: 8px;">Approved Brain proposals can draft founder-facing answers here, then humans refine them.</p></div>
        </div>
      </aside>
    </div>
  `;
}

export function bindFounderQa() {
  $("#question-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#question-input");
    const startup = $("#question-startup")?.value || "Demo founder";
    const value = input.value.trim();
    if (!value) return;
    addFounderQuestion({
      startup,
      question: value,
      answer: "This question is open for mentors, alumni, SGAs, and USI Brain drafts. A reviewed answer can later become a Knowledge Base note.",
      tags: inferTags(value)
    });
    input.value = "";
    renderQuestions();
  });

  ["qa-search", "qa-topic-filter", "qa-sort"].forEach((id) => {
    $(`#${id}`)?.addEventListener("input", renderQuestions);
  });

  renderQuestions();

  if (!actionListenerBound) {
    window.addEventListener(PLATFORM_ACTION_EVENT, () => {
      if ($("#qa-list")) renderQuestions();
    });
    actionListenerBound = true;
  }
}

function renderQuestions() {
  const questions = buildQuestionModels();
  const topics = getTopics(questions);
  renderTopicControls(topics);
  renderStats(questions);

  const search = ($("#qa-search")?.value || "").toLowerCase();
  const topic = $("#qa-topic-filter")?.value || "";
  const sort = $("#qa-sort")?.value || "recommended";
  const filtered = questions
    .filter((item) => {
      const haystack = [
        item.question,
        item.startup,
        item.bestAnswer,
        item.author,
        ...item.tags
      ].join(" ").toLowerCase();
      return (!search || haystack.includes(search)) && (!topic || item.tags.includes(topic));
    })
    .sort(sortQuestions(sort));

  $("#qa-list").innerHTML = filtered.length
    ? filtered.map(renderQuestionCard).join("")
    : `<div class="card card-pad"><p class="muted-text">No questions match this filter.</p></div>`;

  bindQuestionActions();
}

function renderTopicControls(topics) {
  const topicList = $("#qa-topic-list");
  const topicFilter = $("#qa-topic-filter");
  if (!topicList || !topicFilter) return;

  const current = topicFilter.value;
  topicList.innerHTML = topics.slice(0, 8).map(([topic, count]) => `
    <button class="qa-topic-button" type="button" data-topic="${escapeHtml(topic)}">
      <span>${escapeHtml(topic)}</span>
      <strong>${count}</strong>
    </button>
  `).join("");

  topicFilter.innerHTML = `<option value="">All topics</option>${topics.map(([topic]) => `
    <option value="${escapeHtml(topic)}" ${current === topic ? "selected" : ""}>${escapeHtml(topic)}</option>
  `).join("")}`;

  topicList.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      topicFilter.value = button.dataset.topic;
      renderQuestions();
    });
  });
}

function renderStats(questions) {
  const root = $("#qa-stats");
  if (!root) return;
  const answers = questions.reduce((sum, item) => sum + item.answerCount, 0);
  const votes = questions.reduce((sum, item) => sum + item.votes, 0);
  const mentors = new Set(questions.map((item) => item.author)).size;
  root.innerHTML = [
    ["Questions", questions.length],
    ["Answers", answers],
    ["Upvotes", votes],
    ["Contributors", mentors]
  ].map(([label, value]) => `
    <div class="qa-stat">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderQuestionCard(item) {
  return `
    <article class="qa-thread" data-question-id="${escapeHtml(item.id)}">
      <div class="qa-thread-main">
        <div class="qa-vote-rail">
          <button class="qa-icon-button ${item.userVote ? "active" : ""}" type="button" data-qa-action="vote" data-question-id="${escapeHtml(item.id)}">▲</button>
          <strong>${item.votes}</strong>
          <span>votes</span>
        </div>

        <div class="qa-thread-body">
          <div class="qa-thread-meta">
            <span class="pill">${escapeHtml(item.startup)}</span>
            <span>${escapeHtml(item.views)} views</span>
            <span>${escapeHtml(item.answerCount)} answers</span>
          </div>
          <h2>${escapeHtml(item.question)}</h2>
          <div class="tag-row">${tags(item.tags)}</div>

          <section class="qa-answer-preview">
            <div class="qa-author-row">
              <div class="qa-avatar">${escapeHtml(item.authorInitials)}</div>
              <div>
                <strong>${escapeHtml(item.author)}</strong>
                <p>${escapeHtml(item.role)} · ${escapeHtml(item.updatedAt)}</p>
              </div>
              ${item.accepted ? `<span class="status good">accepted</span>` : `<span class="status info">mentor answer</span>`}
            </div>
            <p>${escapeHtml(item.bestAnswer)}</p>
          </section>

          ${renderUserAnswers(item)}

          <form class="qa-answer-form" data-answer-form="${escapeHtml(item.id)}">
            <textarea class="textarea" placeholder="Write an answer with evidence, Vietnam context, and next steps..."></textarea>
            <div class="qa-form-footer">
              <span class="muted-text">Drafts stay local until reviewed.</span>
              <button class="button secondary" type="submit">Add answer</button>
            </div>
          </form>

          <div class="qa-actions">
            <button class="button secondary" type="button" data-qa-action="toggle-answer" data-question-id="${escapeHtml(item.id)}">Answer</button>
            <button class="button secondary ${item.saved ? "active-action" : ""}" type="button" data-qa-action="save" data-question-id="${escapeHtml(item.id)}">${item.saved ? "Saved" : "Save"}</button>
            <button class="button orange" type="button" data-qa-action="ask-brain" data-question-id="${escapeHtml(item.id)}">Ask USI Brain</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderUserAnswers(item) {
  if (!item.userAnswers.length) return "";
  return `
    <div class="qa-user-answers">
      ${item.userAnswers.map((answer) => `
        <div class="qa-user-answer">
          <strong>${escapeHtml(answer.author)}</strong>
          <p>${escapeHtml(answer.text)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function bindQuestionActions() {
  document.querySelectorAll("[data-qa-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.questionId;
      const state = readQaState();
      if (button.dataset.qaAction === "vote") {
        state.votes[id] = !state.votes[id];
      }
      if (button.dataset.qaAction === "save") {
        state.saved[id] = !state.saved[id];
      }
      if (button.dataset.qaAction === "toggle-answer") {
        const form = document.querySelector(`[data-answer-form="${id}"]`);
        form?.classList.toggle("open");
        form?.querySelector("textarea")?.focus();
        return;
      }
      if (button.dataset.qaAction === "ask-brain") {
        window.location.hash = "usi-brain";
        setTimeout(() => {
          const input = $("#brain-input");
          if (input) input.value = `Draft a founder-friendly answer for: ${button.closest(".qa-thread")?.querySelector("h2")?.textContent || ""}`;
        }, 120);
        return;
      }
      writeQaState(state);
      renderQuestions();
    });
  });

  document.querySelectorAll("[data-answer-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const id = form.dataset.answerForm;
      const textarea = form.querySelector("textarea");
      const value = textarea.value.trim();
      if (!value) return;
      const state = readQaState();
      state.answers[id] = state.answers[id] || [];
      state.answers[id].unshift({
        author: "You · UII community",
        text: value,
        createdAt: new Date().toISOString()
      });
      writeQaState(state);
      textarea.value = "";
      renderQuestions();
    });
  });
}

function buildQuestionModels() {
  const state = readQaState();
  const baseQuestions = getFounderQuestionsWithLocal(getDemoData().questions);
  return baseQuestions.map((item, index) => {
    const id = stableId(item, index);
    const profile = getProfile(item, index);
    const userAnswers = state.answers[id] || [];
    const baseVotes = profile.votes;
    const voted = Boolean(state.votes[id]);
    return {
      id,
      startup: item.startup || "General",
      question: item.question,
      bestAnswer: item.answer,
      tags: item.tags || inferTags(`${item.question} ${item.answer}`),
      author: profile.author,
      authorInitials: profile.authorInitials,
      role: profile.role,
      votes: baseVotes + (voted ? 1 : 0),
      views: profile.views,
      answerCount: 1 + userAnswers.length,
      accepted: profile.accepted,
      updatedAt: profile.updatedAt,
      userVote: voted,
      saved: Boolean(state.saved[id]),
      userAnswers
    };
  });
}

function getProfile(item, index) {
  const profiles = {
    Skyholic: {
      author: "Mentor Linh Nguyen",
      authorInitials: "LN",
      role: "Regulated-tech mentor",
      votes: 24,
      views: 318,
      accepted: true,
      updatedAt: "Updated today"
    },
    Ecombox: {
      author: "Alumni Ops Circle",
      authorInitials: "AO",
      role: "Ecommerce SaaS operators",
      votes: 41,
      views: 506,
      accepted: true,
      updatedAt: "Updated yesterday"
    },
    NIION: {
      author: "USI Market Validation Team",
      authorInitials: "UV",
      role: "SGA + mentor review",
      votes: 33,
      views: 442,
      accepted: false,
      updatedAt: "Updated this week"
    }
  };

  return profiles[item.startup] || {
    author: "UII Startup Community",
    authorInitials: "UI",
    role: "Founder support",
    votes: 8 + index * 3,
    views: 120 + index * 64,
    accepted: false,
    updatedAt: "New question"
  };
}

function sortQuestions(sort) {
  const comparators = {
    votes: (a, b) => b.votes - a.votes,
    answers: (a, b) => b.answerCount - a.answerCount,
    newest: (a, b) => Number(b.id.includes("local")) - Number(a.id.includes("local")),
    recommended: (a, b) => Number(b.accepted) - Number(a.accepted) || b.votes - a.votes
  };
  return comparators[sort] || comparators.recommended;
}

function getTopics(questions) {
  const counts = questions.reduce((grouped, question) => {
    question.tags.forEach((tag) => {
      grouped[tag] = (grouped[tag] || 0) + 1;
    });
    return grouped;
  }, {});
  return Object.entries(counts).sort(([, a], [, b]) => b - a);
}

function stableId(item, index) {
  return `${item.startup || "general"}-${item.question || index}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `question-${index}`;
}

function inferTags(value) {
  const text = String(value).toLowerCase();
  const tags = [];
  if (text.includes("growth") || text.includes("grow") || text.includes("customer")) tags.push("growth");
  if (text.includes("mentor") || text.includes("support")) tags.push("mentor");
  if (text.includes("regulation") || text.includes("permission") || text.includes("legal")) tags.push("legal");
  if (text.includes("price") || text.includes("revenue") || text.includes("unit")) tags.push("pricing");
  if (text.includes("pitch") || text.includes("investor")) tags.push("pitch");
  if (text.includes("vietnam") || text.includes("gtm")) tags.push("vietnam-gtm");
  return tags.length ? tags : ["founder-support", "needs-review"];
}

function readQaState() {
  try {
    const state = JSON.parse(localStorage.getItem(qaStateKey) || "{}");
    return {
      votes: state.votes || {},
      saved: state.saved || {},
      answers: state.answers || {}
    };
  } catch (error) {
    return { votes: {}, saved: {}, answers: {} };
  }
}

function writeQaState(state) {
  localStorage.setItem(qaStateKey, JSON.stringify(state));
}
