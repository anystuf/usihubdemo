const languageKey = "usiHubLanguage";

const translations = {
  "Overview": "Tổng quan",
  "Overview Dashboard": "Bảng điều hành tổng quan",
  "Startups": "Startup",
  "Cohort 2 2026": "Khóa 2 năm 2026",
  "Startup Detail": "Chi tiết startup",
  "Khám phá hệ sinh thái": "Explore ecosystem",
  "Incubation Tasks": "Công việc ươm tạo",
  "Task Detail": "Chi tiết công việc",
  "Knowledge Base": "Kho tri thức",
  "USI Intelligence": "Trợ lý USI",
  "UEH Innovation Platform": "Nền tảng đổi mới sáng tạo UEH",
  "View as:": "Vai trò:",
  "Notifications": "Thông báo",
  "Approvals": "Phê duyệt",
  "Settings": "Cài đặt",
  "Menu": "Menu",
  "Close": "Đóng",
  "English": "English",
  "Tiếng Việt": "Tiếng Việt"
};

let language = "en";

export function initLanguage() {
  try {
    language = localStorage.getItem(languageKey) === "vi" ? "vi" : "en";
  } catch {
    language = "en";
  }
  document.documentElement.lang = language;
  return language;
}

export function getLanguage() {
  return language;
}

export function translate(value) {
  return language === "vi" ? (translations[value] || value) : value;
}

export function setLanguage(nextLanguage) {
  language = nextLanguage === "vi" ? "vi" : "en";
  try {
    localStorage.setItem(languageKey, language);
  } catch {}
  document.documentElement.lang = language;
  window.dispatchEvent(new CustomEvent("languageChanged"));
}
