import { stages } from '../services/mvpService.js';
const f = (key, en, vi, type = 'text', options = null, optional = false) => ({ key, en, vi, type, options, optional });
export { f };
export const startup = f('startupId', 'Startup', 'Startup', 'startup');
export const title = f('title', 'Title', 'Tiêu đề');
export const owner = f('owner', 'Owner', 'Người phụ trách');
export const due = f('due', 'Due date', 'Hạn hoàn thành', 'date');
const source = f('source', 'Evidence / source', 'Bằng chứng / nguồn');
const notes = f('notes', 'Notes and decisions', 'Ghi chú và quyết định', 'textarea');
const description = f('description', 'Description', 'Mô tả', 'textarea');
export const definitions = {
  dashboard: { en: 'Program dashboard', vi: 'Điều hành chương trình', phase: 1, feature: 'F05 / F08 / F09' },
  profiles: { en: 'Startup profiles', vi: 'Hồ sơ startup', phase: 1, feature: 'F01', fields: [f('name', 'Startup name', 'Tên startup'), f('cohort', 'Cohort', 'Khóa ươm tạo'), f('sector', 'Sector', 'Lĩnh vực'), f('stage', 'Lifecycle stage', 'Giai đoạn', 'select', stages), owner, f('summary', 'Product and team summary', 'Tóm tắt sản phẩm và đội ngũ', 'textarea'), source] },
  applications: { en: 'Applications', vi: 'Hồ sơ ứng tuyển', phase: 1, feature: 'F02', fields: [f('name', 'Startup name', 'Tên startup'), f('cohort', 'Cohort', 'Khóa ứng tuyển'), f('summary', 'Problem, solution and team', 'Vấn đề, giải pháp và đội ngũ', 'textarea'), source] },
  reviews: { en: 'Evaluation', vi: 'Đánh giá hồ sơ', phase: 1, feature: 'F02', fields: [f('applicationId', 'Submitted application', 'Hồ sơ đã nộp', 'application'), f('reviewer', 'Reviewer name', 'Tên người đánh giá'), f('problem', 'Problem evidence (0–5)', 'Bằng chứng vấn đề (0–5)', 'score'), f('solution', 'Solution evidence (0–5)', 'Bằng chứng giải pháp (0–5)', 'score'), f('team', 'Team capability (0–5)', 'Năng lực đội ngũ (0–5)', 'score'), notes] },
  milestones: { en: 'Roadmap', vi: 'Lộ trình', phase: 1, feature: 'F04', fields: [startup, title, owner, due, f('criteria', 'Completion criteria', 'Tiêu chí hoàn thành', 'textarea')] },
  sessions: { en: 'Growth sessions', vi: 'Phiên hỗ trợ', phase: 1, feature: 'F04', fields: [startup, title, f('date', 'Session date', 'Ngày trao đổi', 'date'), owner, f('milestoneId', 'Linked milestone (optional)', 'Mốc liên quan (nếu có)', 'milestone', null, true), notes, source] },
  metrics: { en: 'Business metrics', vi: 'Chỉ số kinh doanh', phase: 2, feature: 'F07', fields: [startup, title, f('period', 'Reporting month', 'Tháng báo cáo', 'month'), f('unit', 'Unit / definition', 'Đơn vị / định nghĩa'), f('dataStatus', 'Data status', 'Trạng thái dữ liệu', 'select', ['Recorded', 'Not recorded', 'Not applicable', 'Not yet occurred']), f('value', 'Value (recorded only)', 'Giá trị (khi đã ghi nhận)', 'number', null, true), source] },
  people: { en: 'People & organisations', vi: 'Cá nhân và tổ chức', phase: 2, feature: 'F06', fields: [f('name', 'Name', 'Họ tên'), f('organisation', 'Organisation', 'Tổ chức'), f('expertise', 'Expertise / support areas', 'Chuyên môn / lĩnh vực hỗ trợ'), owner, f('interaction', 'Latest interaction and next step', 'Tương tác gần nhất và bước tiếp theo', 'textarea', null, true)] },
  resources: { en: 'Knowledge resources', vi: 'Tài nguyên tri thức', phase: 3, feature: 'F10', fields: [title, f('category', 'Category', 'Phân loại', 'select', ['Guide', 'Template', 'FAQ', 'IP glossary', 'Research']), f('url', 'Source URL', 'Đường dẫn nguồn', 'url'), owner, description] },
  sops: { en: 'SOP & checklists', vi: 'SOP và checklist', phase: 3, feature: 'F11', fields: [title, owner, f('steps', 'Steps (one per line)', 'Các bước (mỗi dòng một bước)', 'textarea')] },
  intelligence: { en: 'AI & screening', vi: 'AI và sàng lọc', phase: 3, feature: 'F12 / F13' },
  slots: { en: 'Mentor office hours', vi: 'Lịch tư vấn', phase: 4, feature: 'F14', fields: [f('mentor', 'Mentor name', 'Tên cố vấn'), f('topic', 'Topic', 'Chủ đề'), f('start', 'Start (your local time)', 'Bắt đầu (giờ trên máy)', 'datetime-local'), f('end', 'End (your local time)', 'Kết thúc (giờ trên máy)', 'datetime-local')] },
  requests: { en: 'Shared services', vi: 'Dịch vụ hỗ trợ', phase: 4, feature: 'F15', fields: [startup, title, f('service', 'Service', 'Loại dịch vụ', 'select', ['Legal', 'Design', 'Marketing', 'Finance', 'Other']), owner, due, description] },
  audit: { en: 'Activity history', vi: 'Lịch sử thao tác', feature: 'Audit' }
};
