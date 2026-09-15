import { getDemoData } from "../services/dataService.js";
import { $, escapeHtml, tags } from "../utils/dom.js";
import { getLanguage } from "../services/languageService.js";

export function renderContacts() {
  const data = getDemoData();
  const vi = getLanguage() === "vi";
  const types = [...new Set((data.contacts || []).map((contact) => contact.type))];
  const sectors = [...new Set((data.contacts || []).map((contact) => contact.sector))];

  return `
    <section class="card card-pad">
      <div class="section-header" style="margin-top: 0;">
        <div>
          <p class="eyebrow">${vi ? "Khám phá hệ sinh thái" : "Explore ecosystem"}</p>
          <h2>${vi ? "Khám phá hệ sinh thái đổi mới sáng tạo" : "Explore the innovation ecosystem"}</h2>
        </div>
        <p>${vi ? "Đi từ nhu cầu startup đến năng lực, chuyên gia, chương trình và cơ hội hợp tác có thể kích hoạt." : "Move from startup needs to capabilities, experts, programs, and actionable partnerships."}</p>
      </div>
      <div class="grid grid-3" style="margin-top: 18px;">
        ${ecosystemCategory(vi ? "Tổ chức" : "Organizations", "organizations", vi ? "Đối tác, trường, viện và mạng lưới hỗ trợ" : "Partners, universities, institutes, and support networks")}
        ${ecosystemCategory(vi ? "Chuyên gia & mentor" : "Experts & mentors", "contacts", vi ? "Năng lực có thể kết nối cho startup" : "Expertise available for startup matching")}
        ${ecosystemCategory(vi ? "Năng lực / cơ sở vật chất" : "Capabilities / facilities", "capabilities", vi ? "Chuyên môn, phòng lab, thiết bị và dịch vụ" : "Expertise, labs, equipment, and services")}
        ${ecosystemCategory(vi ? "Nhu cầu startup" : "Startup needs", "needs", vi ? "Bài toán cần được kết nối và theo dõi" : "Problems to match and track")}
        ${ecosystemCategory(vi ? "Chương trình & nguồn vốn" : "Programs & funding", "programs", vi ? "Cơ hội hỗ trợ, tài trợ và tăng tốc" : "Support, funding, and acceleration opportunities")}
        ${ecosystemCategory(vi ? "Công nghệ / nghiên cứu / IP" : "Technology / research / IP", "technology", vi ? "Nguồn tri thức và tài sản có thể chuyển giao" : "Knowledge and transferable assets")}
        ${ecosystemCategory(vi ? "Sự kiện" : "Events", "events", vi ? "Không gian gặp gỡ, học hỏi và kết nối" : "Spaces for learning and connection")}
        ${ecosystemCategory(vi ? "Cơ hội hợp tác" : "Partnership opportunities", "opportunities", vi ? "Các match cần được kích hoạt" : "Matches ready to activate")}
      </div>
      <div class="toolbar">
        <input class="input" id="contact-search" placeholder="Tìm tổ chức, chuyên gia, năng lực hoặc startup phù hợp" />
        <select class="select" id="contact-type">
          <option value="">Tất cả loại năng lực</option>
          ${types.map((type) => `<option>${escapeHtml(type)}</option>`).join("")}
        </select>
        <select class="select" id="contact-sector">
          <option value="">Tất cả lĩnh vực</option>
          ${sectors.map((sector) => `<option>${escapeHtml(sector)}</option>`).join("")}
        </select>
      </div>
    </section>

    <section class="card card-pad" style="margin-top: 16px;">
      <div class="section-header" style="margin-top: 0;">
        <div><p class="eyebrow">${vi ? "Tín hiệu mới" : "Latest signals"}</p><h2>${vi ? "Tín hiệu cần khám phá" : "Signals to explore"}</h2></div>
        <p>${vi ? "Các tín hiệu được suy ra từ dữ liệu startup, năng lực và tài liệu hiện có." : "Signals inferred from current startup, capability, and knowledge records."}</p>
      </div>
      <div class="grid grid-3" id="ecosystem-signals">${renderSignals(data)}</div>
    </section>

    <section class="card card-pad" style="margin-top: 16px;">
      <div class="section-header" style="margin-top: 0;">
        <div><p class="eyebrow">Matching</p><h2>Startup need ↔ capability ↔ expert ↔ program ↔ partner</h2></div>
        <p>${vi ? "Ưu tiên match có thể chuyển thành một next action rõ ràng." : "Prioritize matches that can become a clear next action."}</p>
      </div>
      <div class="grid grid-2" id="ecosystem-matching">${renderMatching(data)}</div>
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
        <div class="detail-stat"><span>Relevant startups</span><strong>${escapeHtml((contact.matchFor || []).join(", ") || "To be matched")}</strong></div>
      </div>
      <div class="tag-row">${tags(contact.expertise || [])}</div>
      <div class="muted-text" style="margin-top: 12px;"><strong>Source:</strong> ${escapeHtml(contact.source || "Internal directory")} · <strong>Owner:</strong> ${escapeHtml(contact.owner || "USI program team")} · <strong>Last verified:</strong> ${escapeHtml(contact.lastVerified || "Demo record")}</div>
      <p class="muted-text" style="margin-top: 6px;"><strong>Next action:</strong> ${escapeHtml(contact.nextAction || "Review fit and assign an owner.")}</p>
      <button class="button secondary" type="button" style="margin-top: 12px;" data-intelligence-prompt="Assess ${escapeHtml(contact.name)} as a support match for ${escapeHtml((contact.matchFor || []).join(", "))}.">Review match</button>
    </article>
  `).join("") || `
    <article class="card card-pad">
      <p class="muted-text">No contacts match the current filters.</p>
    </article>
  `;
}

function ecosystemCategory(label, key, detail) {
  return `<article class="card card-pad"><p class="eyebrow">${escapeHtml(label)}</p><strong>${escapeHtml(detail)}</strong><span class="muted-text" style="display:block;margin-top:8px;">${key === "contacts" ? "Đang có dữ liệu demo" : "Sẵn sàng mở rộng dữ liệu"}</span></article>`;
}

function renderSignals(data) {
  const startupsWithNeeds = (data.startups || []).filter((startup) => startup.missingData?.length).slice(0, 2);
  const availableExperts = (data.contacts || []).filter((contact) => contact.availability === "This week");
  const signals = [
    ...startupsWithNeeds.map((startup) => ({
      title: "Nhu cầu mới từ startup",
      detail: `${startup.name}: ${(startup.missingData || []).slice(0, 2).join(", ")}`,
      action: "Tạo yêu cầu hỗ trợ và tìm capability phù hợp."
    })),
    ...(availableExperts.length ? [{
      title: "Expert mới available",
      detail: `${availableExperts[0].name} · ${(availableExperts[0].expertise || []).slice(0, 2).join(", ")}`,
      action: "Xem match phù hợp trong danh sách chuyên gia."
    }] : [])
  ];
  return signals.map((signal) => `<article class="overview-insight"><strong>${escapeHtml(signal.title)}</strong><p>${escapeHtml(signal.detail)}</p><small>${escapeHtml(signal.action)}</small></article>`).join("") || `<p class="muted-text">Chưa có tín hiệu mới cần xử lý.</p>`;
}

function renderMatching(data) {
  return (data.contacts || []).slice(0, 4).map((contact) => `<article class="card card-pad"><p class="eyebrow">Match đề xuất</p><h3>${escapeHtml((contact.matchFor || ["Startup chưa xác định"])[0])}</h3><p style="margin-top:8px;">Need ↔ ${escapeHtml((contact.expertise || ["Capability chưa xác định"]).slice(0, 2).join(", "))} ↔ ${escapeHtml(contact.name)}</p><div class="muted-text" style="margin-top:12px;"><strong>Source:</strong> ${escapeHtml(contact.source || "Internal directory")} · <strong>Owner:</strong> ${escapeHtml(contact.owner || "USI program team")} · <strong>Last verified:</strong> ${escapeHtml(contact.lastVerified || "Demo record")}</div><p class="muted-text" style="margin-top:6px;"><strong>Next action:</strong> ${escapeHtml(contact.nextAction || "Review match and assign follow-up.")}</p></article>`).join("");
}
