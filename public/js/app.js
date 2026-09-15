import { $ , $$ } from "./utils/dom.js";
import { bindOverview, renderOverview } from "./modules/overview.js";
import { bindStartupDetailPage, bindStartupOs, renderStartupDetailPage, renderStartupOs } from "./modules/startupOs.js";
import { bindFloatingIntelligence, bindUsiBrain, renderFloatingIntelligence, renderUsiBrain } from "./modules/usiBrain.js";
import { bindProjectBoard, bindTaskDetailPage, renderProjectBoard, renderTaskDetailPage } from "./modules/projectBoard.js";
import { bindKnowledgeBase, renderKnowledgeBase } from "./modules/knowledgeBase.js";
import { bindContacts, renderContacts } from "./modules/contacts.js";
import { bindCohort22026, renderCohort22026 } from "./modules/cohort2_2026.js";
import { initAnalytics } from "./services/firebaseService.js";
import { getDataSource, loadPlatformData } from "./services/dataService.js";
import { getCurrentRole, setCurrentRole, ROLES, getRoleGreeting } from "./services/roleService.js";
import { getLanguage, initLanguage, localizePage, setLanguage, translate } from "./services/languageService.js";

const routes = {
  "overview": { title: "Overview Dashboard", render: renderOverview, bind: bindOverview },
  "startup-os": { title: "Startup List", render: renderStartupOs, bind: bindStartupOs },
  "cohort-2-2026": { title: "Cohort 2 2026", render: renderCohort22026, bind: bindCohort22026 },
  "startup-detail": { title: "Startup Detail", render: renderStartupDetailPage, bind: bindStartupDetailPage },
  "contacts": { title: "Khám phá hệ sinh thái", render: renderContacts, bind: bindContacts },
  "usi-intelligence": { title: "USI Intelligence", render: renderUsiBrain, bind: bindUsiBrain },
  "project-board": { title: "Incubation Worklist", render: renderProjectBoard, bind: bindProjectBoard },
  "task-detail": { title: "Task Detail", render: renderTaskDetailPage, bind: bindTaskDetailPage },
  "knowledge-base": { title: "Knowledge Base", render: renderKnowledgeBase, bind: bindKnowledgeBase }
};

function getRoute() {
  const hash = window.location.hash.replace("#", "");
  return routes[hash] ? hash : "overview";
}

function renderRoute() {
  const routeKey = getRoute();
  const route = routes[routeKey];

  $("#page-title").textContent = translate(route.title);
  try {
    $("#app-root").innerHTML = route.render();
  } catch (error) {
    $("#app-root").innerHTML = `
      <div class="card card-pad">
        <p class="eyebrow">Module error</p>
        <h2 style="margin-top: 6px;">${route.title} could not render</h2>
        <p class="muted-text" style="margin-top: 8px;">${error.message}</p>
      </div>
    `;
  }

  $$(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === routeKey);
  });

  route.bind?.();
  localizePage(document);
  $(".sidebar")?.classList.remove("open");
  document.documentElement.dataset.dataSource = getDataSource();
  updateDataSourcePill();
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("languageChanged", () => {
  renderRoute();
  applyLanguageChrome();
  applyTheme();
});
$("#mobile-menu-button")?.addEventListener("click", () => $(".sidebar")?.classList.toggle("open"));
$$(".nav-link").forEach((link) => link.addEventListener("click", () => $(".sidebar")?.classList.remove("open")));

const themeKey = "usiHubTheme";
function getTheme() {
  try { return localStorage.getItem(themeKey) === "dark" ? "dark" : "light"; } catch { return "light"; }
}
function applyTheme(theme = getTheme()) {
  document.documentElement.dataset.theme = theme;
  const button = $("#theme-switch");
  if (!button) return;
  const dark = theme === "dark";
  button.textContent = getLanguage() === "vi" ? (dark ? "Sáng" : "Tối") : (dark ? "Light" : "Dark");
  button.setAttribute("aria-label", getLanguage() === "vi" ? (dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối") : (dark ? "Switch to light mode" : "Switch to dark mode"));
  button.setAttribute("aria-pressed", String(dark));
}
function applyLanguageChrome() {
  const vi = getLanguage() === "vi";
  const labels = {
    overview: "Overview",
    "startup-os": "Startups",
    "cohort-2-2026": "Cohort 2 2026",
    "startup-detail": "Startup Detail",
    contacts: "Ecosystem Hub",
    "project-board": "Incubation Tasks",
    "task-detail": "Task Detail",
    "knowledge-base": "Knowledge Base",
    "usi-intelligence": "USI Intelligence"
  };
  document.querySelector("#platform-label").textContent = translate("UEH Innovation Platform");
  document.querySelector("#language-switch").textContent = vi ? "English" : "Tiếng Việt";
  document.querySelector("#language-switch").setAttribute("aria-label", vi ? "Switch to English" : "Chuyển sang tiếng Việt");
  document.querySelectorAll(".nav-link").forEach((link) => { link.textContent = translate(labels[link.dataset.route]); });
}
initLanguage();
$("#language-switch")?.addEventListener("click", () => setLanguage(getLanguage() === "vi" ? "en" : "vi"));
$("#theme-switch")?.addEventListener("click", () => {
  const nextTheme = getTheme() === "dark" ? "light" : "dark";
  try { localStorage.setItem(themeKey, nextTheme); } catch {}
  applyTheme(nextTheme);
});
applyTheme();
applyLanguageChrome();

// Role selector binding
$("#role-selector")?.addEventListener("change", (event) => {
  setCurrentRole(event.target.value);
  document.documentElement.dataset.userRole = event.target.value;
  updateRoleContext();
});

// Initialize role on page load
document.documentElement.dataset.userRole = getCurrentRole();
$("#role-selector").value = getCurrentRole();

// Listen for role changes from other tabs/windows
window.addEventListener("roleChanged", (event) => {
  document.documentElement.dataset.userRole = event.detail.role;
  $("#role-selector").value = event.detail.role;
  updateRoleContext();
});

$("#notifications-button")?.addEventListener("click", () => openUtilityModal("Notifications", "Operations inbox", renderNotifications()));
$("#approval-button")?.addEventListener("click", () => openUtilityModal("Approvals", "Human review queue", renderApprovals()));
$("#settings-button")?.addEventListener("click", () => openUtilityModal("Settings", "Platform configuration", renderSettings()));
$("#utility-modal-close")?.addEventListener("click", closeUtilityModal);
$("#utility-modal")?.addEventListener("click", (event) => {
  if (event.target === $("#utility-modal")) closeUtilityModal();
});

$("#app-root").innerHTML = `
  <div class="card card-pad">
    <p class="eyebrow">Loading</p>
    <p class="muted-text" style="margin-top: 8px;">Checking Firestore data, then falling back to local demo data if needed.</p>
  </div>
`;

await loadPlatformData();
renderRoute();
applyLanguageChrome();
document.body.insertAdjacentHTML("beforeend", renderFloatingIntelligence());
bindFloatingIntelligence();
initAnalytics();

function updateDataSourcePill() {
  const source = getDataSource();
  const pill = $("#data-source-pill");
  if (!pill) return;

  const labels = {
    firestore: "Firestore data",
    "local-demo": "Local demo data",
    "local-demo-empty-firestore": "Local demo data",
    "local-demo-firestore-unavailable": "Offline demo data"
  };

  pill.textContent = labels[source] || "Demo data";
  pill.classList.toggle("muted", source !== "firestore");
}

function openUtilityModal(title, kicker, body) {
  $("#utility-modal-title").textContent = title;
  $("#utility-modal-kicker").textContent = kicker;
  $("#utility-modal-body").innerHTML = body;
  $("#utility-modal").hidden = false;
}

function closeUtilityModal() {
  $("#utility-modal").hidden = true;
}

function updateRoleContext() {
  const currentRole = getCurrentRole();
  const greeting = getRoleGreeting(currentRole);
  
  // Update any role-specific UI elements
  const roleIndicators = document.querySelectorAll("[data-role-info]");
  roleIndicators.forEach((el) => {
    if (el.dataset.roleInfo === "greeting") {
      el.textContent = greeting;
    }
  });

  // Re-render the page if needed to show role-specific content
  const currentPath = window.location.hash;
  if (currentPath) {
    renderRoute();
  }
}

function renderNotifications() {
  return `
    <div class="utility-list">
      <article class="utility-item">
        <strong>Venture Beta risk review is waiting for SGA approval</strong>
        <p>USI Intelligence proposed a data completeness sprint. Review source evidence before adding official dashboard updates.</p>
      </article>
      <article class="utility-item">
        <strong>2 Knowledge Base sources need extraction</strong>
        <p>Queued pitch decks should be indexed before production RAG answers cite them as evidence.</p>
      </article>
      <article class="utility-item">
        <strong>Mentor matching follow-up due this week</strong>
        <p>Venture Alpha and Venture Zeta need specialist mentor routing for regulated pilots and validation.</p>
      </article>
    </div>
  `;
}

function renderApprovals() {
  return `
    <div class="utility-list">
      <article class="utility-item">
        <strong>AI Proposed Update policy</strong>
        <p>Approve actions only after checking evidence, sources, confidence, and missing data. AI must not make final startup decisions.</p>
      </article>
      <article class="utility-item">
        <strong>Pending: Incubation Worklist actions</strong>
        <p>Brain-approved actions can create tasks locally now. Later this should write to Firestore collection <b>aiProposals</b> first.</p>
      </article>
      <article class="utility-item">
        <strong>Pending: Knowledge Base notes</strong>
        <p>Approved notes should be marked as human-reviewed before they become retrievable production RAG context.</p>
      </article>
    </div>
  `;
}

function renderSettings() {
  const source = getDataSource();
  const currentRole = getCurrentRole();
  const roleLabel = ROLES[currentRole.toUpperCase()]?.label || "Unknown";
  
  return `
    <div class="utility-list">
      <article class="utility-item">
        <strong>Current Role</strong>
        <p>Viewing platform as <b>${roleLabel}</b>. Different roles see different dashboard emphasis, permissions, and action options.</p>
      </article>
      <article class="utility-item">
        <strong>Data source</strong>
        <p>Current mode: <b>${source}</b>. Firestore is preferred when seeded; local demo data remains the fallback.</p>
      </article>
      <article class="utility-item">
        <strong>AI action mode</strong>
        <p>Human approval required. Approved actions can update demo incubation tasks and Knowledge Base notes.</p>
      </article>
      <article class="utility-item">
        <strong>Role-based Permissions</strong>
        <p>Your role determines what you can approve, edit, and view. SGAs can approve all changes. Mentors can add notes only. Founders see their own startup.</p>
      </article>
      <article class="utility-item">
        <strong>Firebase readiness</strong>
        <p>Next production step: map local actions to Firestore collections, then protect writes with role-based rules.</p>
      </article>
    </div>
  `;
}
