import { getDemoData } from "../services/dataService.js";
import { $, escapeHtml, tags } from "../utils/dom.js";

export function renderContacts() {
  const data = getDemoData();
  const types = [...new Set((data.contacts || []).map((contact) => contact.type))];
  const sectors = [...new Set((data.contacts || []).map((contact) => contact.sector))];

  return `
    <section class="card card-pad">
      <div class="section-header" style="margin-top: 0;">
        <div>
          <p class="eyebrow">Support network</p>
          <h2>Contacts for mentor, expert, and trainer matching</h2>
        </div>
        <p>Internal directory used by SGA teams to plan support and by USI Intelligence to suggest matching.</p>
      </div>
      <div class="toolbar">
        <input class="input" id="contact-search" placeholder="Search contact, expertise, sector, or matched startup" />
        <select class="select" id="contact-type">
          <option value="">All contact types</option>
          ${types.map((type) => `<option>${escapeHtml(type)}</option>`).join("")}
        </select>
        <select class="select" id="contact-sector">
          <option value="">All sectors</option>
          ${sectors.map((sector) => `<option>${escapeHtml(sector)}</option>`).join("")}
        </select>
      </div>
    </section>

    <section class="grid grid-3" id="contacts-list" style="margin-top: 16px;"></section>
  `;
}

export function bindContacts() {
  ["contact-search", "contact-type", "contact-sector"].forEach((id) => {
    $(`#${id}`)?.addEventListener("input", renderContactsList);
  });
  renderContactsList();
}

function renderContactsList() {
  const root = $("#contacts-list");
  if (!root) return;

  const search = ($("#contact-search")?.value || "").toLowerCase();
  const type = $("#contact-type")?.value || "";
  const sector = $("#contact-sector")?.value || "";
  const contacts = (getDemoData().contacts || []).filter((contact) => {
    const haystack = [
      contact.name,
      contact.type,
      contact.contact,
      contact.sector,
      contact.availability,
      contact.notes,
      ...(contact.expertise || []),
      ...(contact.matchFor || [])
    ].join(" ").toLowerCase();

    return (!search || haystack.includes(search))
      && (!type || contact.type === type)
      && (!sector || contact.sector === sector);
  });

  root.innerHTML = contacts.map((contact) => `
    <article class="card card-pad">
      <div class="startup-card-header">
        <div>
          <p class="eyebrow">${escapeHtml(contact.type)}</p>
          <h3>${escapeHtml(contact.name)}</h3>
        </div>
        <span class="pill">${escapeHtml(contact.availability)}</span>
      </div>
      <p class="muted-text" style="margin-top: 10px;">${escapeHtml(contact.notes)}</p>
      <div class="detail-grid" style="margin-top: 12px;">
        <div class="detail-stat"><span>Contact</span><strong>${escapeHtml(contact.contact || "Internal directory")}</strong></div>
        <div class="detail-stat"><span>Sector</span><strong>${escapeHtml(contact.sector)}</strong></div>
        <div class="detail-stat"><span>Matched startups</span><strong>${escapeHtml((contact.matchFor || []).join(", "))}</strong></div>
      </div>
      <div class="tag-row">${tags(contact.expertise || [])}</div>
      <button class="button secondary" type="button" style="margin-top: 12px;" data-intelligence-prompt="Assess ${escapeHtml(contact.name)} as a support match for ${escapeHtml((contact.matchFor || []).join(", "))}.">Review match</button>
    </article>
  `).join("") || `
    <article class="card card-pad">
      <p class="muted-text">No contacts match the current filters.</p>
    </article>
  `;
}
