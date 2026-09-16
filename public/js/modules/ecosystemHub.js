import { escapeHtml } from "../utils/dom.js";
import { getLanguage } from "../services/languageService.js";

const services = [
  { icon: "◈", key: "organizations", title: "Organizations", titleVi: "Tổ chức", detail: "Universities, incubators, companies, and ecosystem partners.", detailVi: "Trường đại học, vườn ươm, doanh nghiệp và đối tác hệ sinh thái.", count: "18" },
  { icon: "⌁", key: "capabilities", title: "Capabilities", titleVi: "Năng lực", detail: "Labs, technology, facilities, and specialist support available to startups.", detailVi: "Phòng lab, công nghệ, cơ sở vật chất và hỗ trợ chuyên môn dành cho startup.", count: "42" },
  { icon: "?", key: "needs", title: "Startup needs", titleVi: "Nhu cầu startup", detail: "Open problems where a mentor, partner, or pilot can create value.", detailVi: "Bài toán mở cần cố vấn, đối tác hoặc chương trình thử nghiệm.", count: "27" },
  { icon: "§", key: "policies", title: "Policies & funding", titleVi: "Chính sách & vốn", detail: "Programs, grants, and rules that shape innovation activity.", detailVi: "Chương trình, nguồn vốn và quy định hỗ trợ hoạt động đổi mới sáng tạo.", count: "12" },
  { icon: "◷", key: "events", title: "Events", titleVi: "Sự kiện", detail: "Workshops, mentor sessions, demo days, and founder meetups.", detailVi: "Workshop, phiên cố vấn, demo day và hoạt động kết nối nhà sáng lập.", count: "9" },
  { icon: "✦", key: "experts", title: "Experts", titleVi: "Chuyên gia", detail: "Find the right mentor by sector, stage, and support need.", detailVi: "Tìm cố vấn phù hợp theo lĩnh vực, giai đoạn và nhu cầu hỗ trợ.", count: "31" }
];

const signals = [
  { type: "Need", typeVi: "Nhu cầu", title: "Controlled pilot partner for UAV validation", titleVi: "Đối tác thử nghiệm có kiểm soát cho UAV", meta: "Venture Alpha · AI / UAV", metaVi: "Venture Alpha · AI / UAV" },
  { type: "Event", typeVi: "Sự kiện", title: "Vietnam Market Validation Sprint", titleVi: "Workshop kiểm chứng thị trường Việt Nam", meta: "22 Jun 2026 · USI Program Team", metaVi: "22/06/2026 · Đội ngũ USI" },
  { type: "Capability", typeVi: "Năng lực", title: "Medical validation advisory", titleVi: "Tư vấn kiểm chứng y tế", meta: "HealthTech · Expert network", metaVi: "HealthTech · Mạng lưới chuyên gia" },
  { type: "Policy", typeVi: "Chính sách", title: "Startup documentation and RAG readiness", titleVi: "Chuẩn hóa tài liệu startup và RAG", meta: "Data governance · USI Hub", metaVi: "Quản trị dữ liệu · USI Hub" }
];

export function renderEcosystemHub() {
  const vi = getLanguage() === "vi";
  const text = vi ? {
    eyebrow: "Hệ sinh thái đổi mới sáng tạo", title: "Kết nối đúng năng lực với đúng bài toán", intro: "Một lớp khám phá công khai giúp startup, mentor, chuyên gia và đối tác tìm thấy nhau theo nhu cầu thực tế.", search: "Tìm tổ chức, năng lực, nhu cầu, sự kiện...", explore: "Khám phá", signals: "Tín hiệu mới", all: "Xem tất cả", verified: "Nguồn đã xác minh", records: "bản ghi đang theo dõi", cta: "Mở Startup OS"
  } : {
    eyebrow: "Innovation ecosystem", title: "Connect the right capability to the right problem", intro: "A discovery layer for startups, mentors, experts, and partners to find each other around real operating needs.", search: "Search organizations, capabilities, needs, events...", explore: "Explore services", signals: "Latest signals", all: "View all", verified: "Verified sources", records: "records tracked", cta: "Open Startup OS"
  };
  return `
    <section class="ecosystem-hero"><div><p class="eyebrow">${text.eyebrow}</p><h2>${text.title}</h2><p>${text.intro}</p></div><a class="button orange" href="#startup-os">${text.cta} <span aria-hidden="true">→</span></a></section>
    <section class="ecosystem-search card card-pad"><div class="ecosystem-search-title"><span class="ecosystem-search-icon">⌕</span><input class="input" id="ecosystem-search" placeholder="${text.search}" aria-label="${text.search}" /></div><span class="pill">${text.verified}</span></section>
    <section class="ecosystem-services"><div class="section-header" style="margin-top: 26px;"><div><p class="eyebrow">${text.explore}</p><h3>${vi ? "Dịch vụ hệ sinh thái" : "Ecosystem services"}</h3></div></div><div class="ecosystem-service-grid" id="ecosystem-services-grid">${services.map((service) => renderService(service, vi)).join("")}</div></section>
    <section class="ecosystem-signals card card-pad"><div class="overview-section-head"><div><p class="eyebrow">${text.signals}</p><h3>${vi ? "Từ nhu cầu đến hành động" : "From needs to action"}</h3></div><span class="pill">${services.reduce((sum, item) => sum + Number(item.count), 0)} ${text.records}</span></div><div class="ecosystem-signal-list">${signals.map((signal) => renderSignal(signal, vi)).join("")}</div><a class="text-link" href="#startup-os">${text.all} <span aria-hidden="true">→</span></a></section>
  `;
}

export function bindEcosystemHub() {
  document.querySelector("#ecosystem-search")?.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase().trim();
    document.querySelectorAll("[data-ecosystem-service]").forEach((card) => card.hidden = query && !card.dataset.ecosystemService.includes(query));
  });
}

function renderService(service, vi) {
  return `<article class="ecosystem-service card" data-ecosystem-service="${escapeHtml(`${service.title} ${service.titleVi} ${service.detail} ${service.detailVi}`.toLowerCase())}"><span class="ecosystem-service-icon" aria-hidden="true">${service.icon}</span><div><div class="ecosystem-service-head"><h4>${escapeHtml(vi ? service.titleVi : service.title)}</h4><strong>${service.count}</strong></div><p>${escapeHtml(vi ? service.detailVi : service.detail)}</p><a href="#startup-os">${vi ? "Khám phá" : "Explore"} <span aria-hidden="true">→</span></a></div></article>`;
}

function renderSignal(signal, vi) {
  return `<article class="ecosystem-signal"><span class="status info">${escapeHtml(vi ? signal.typeVi : signal.type)}</span><div><strong>${escapeHtml(vi ? signal.titleVi : signal.title)}</strong><small>${escapeHtml(vi ? signal.metaVi : signal.meta)}</small></div><span aria-hidden="true">→</span></article>`;
}