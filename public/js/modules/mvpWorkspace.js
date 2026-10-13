import { getDemoData } from '../services/dataService.js';
import { getCurrentRole } from '../services/roleService.js';
import { getLanguage } from '../services/languageService.js';
import { $, escapeHtml as esc } from '../utils/dom.js';
import { readWorkspace, saveRecord, workflowAction, reviewSummary } from '../services/mvpService.js';
import { definitions, f, startup, title, owner, due } from './mvpSchema.js';

const text = (en, vi) => getLanguage() === 'vi' ? vi : en;
let activeTab = 'dashboard', editing = null, message = '', filterStartup = '', filterCohort = '', search = '';
export function renderMvpWorkspace() {
  const state = readWorkspace(), data = getDemoData(), d = definitions[activeTab];
  return `<section class="mvp-workspace">
    <header class="card card-pad"><div class="section-header"><div><p class="eyebrow">MVP · ${esc(d.feature)}</p><h2>${text('Incubation operations', 'Vận hành ươm tạo')}</h2></div><button class="button secondary" id="mvp-export">${text('Export workspace', 'Xuất dữ liệu')}</button></div>
    <p class="muted-text">${text('Browser-local pilot. Use sample data. Shared accounts and server permissions are not connected.', 'Bản thử nghiệm lưu trên trình duyệt. Dùng dữ liệu mẫu. Chưa có tài khoản và phân quyền máy chủ.')}</p></header>
    <a class="button secondary" href="#startup-growth">${text('Open Startup Growth Workspace', 'Mở không gian phát triển startup')} ↗</a>
    <nav class="mvp-tabs" aria-label="MVP modules">${Object.entries(definitions).map(([key, item]) => `<button type="button" class="button ${key === activeTab ? 'orange' : 'secondary'}" data-mvp-tab="${key}" aria-current="${key === activeTab ? 'page' : 'false'}">${esc(text(item.en, item.vi))}</button>`).join('')}<a class="button secondary" href="#project-board">${text('Support worklist', 'Công việc hỗ trợ')} ↗</a></nav>
    <p id="mvp-feedback" role="status">${esc(message)}</p>
    <section class="card card-pad"><div class="section-header"><h3>${esc(text(d.en, d.vi))}</h3>${d.phase ? `<span class="pill">Phase ${d.phase}</span>` : ''}</div>
    ${d.fields ? `<div class="mvp-filters"><label>${text('Search', 'Tìm kiếm')}<input class="input" id="mvp-search" value="${esc(search)}"></label>${d.fields.some(item => item.key === 'startupId') ? `<label>Startup<select class="select" id="mvp-startup-filter"><option value="">${text('All startups', 'Tất cả startup')}</option>${startupOptions(data, filterStartup)}</select></label>` : ''}<button class="button orange" id="mvp-new">${text('New record', 'Thêm bản ghi')}</button></div><div id="mvp-list">${recordList(state, data)}</div>` : activeTab === 'dashboard' ? dashboard(state, data) : activeTab === 'audit' ? auditView(state) : intelligenceView(state)}
    </section>${editing ? editor(state, data) : ''}</section>`;
}
function startupOptions(data, selected = '') {
  return data.startups.map(s => `<option value="${esc(s.id)}"${s.id === selected ? ' selected' : ''}>${esc(s.name)}</option>`).join('');
}
function display(value) {
  const labels = { Recorded: 'Đã ghi nhận', 'Not recorded': 'Chưa ghi nhận', 'Not applicable': 'Không áp dụng', 'Not yet occurred': 'Chưa phát sinh', Draft: 'Bản nháp', Submitted: 'Đã nộp', Accepted: 'Tiếp nhận', Rejected: 'Từ chối', Planned: 'Đã lên kế hoạch', Completed: 'Hoàn thành', Published: 'Đã công bố', Available: 'Còn trống', Booked: 'Đã đặt', Requested: 'Đã yêu cầu', 'In progress': 'Đang xử lý', Delivered: 'Đã bàn giao', Closed: 'Đã đóng' };
  return esc(getLanguage() === 'vi' ? labels[value] || value : value);
}
function recordList(state, data) {
  let records = activeTab === 'profiles' ? data.startups : state[activeTab];
  records = records.filter(r => (!filterStartup || r.startupId === filterStartup) && (!search || JSON.stringify(r).toLocaleLowerCase().includes(search.toLocaleLowerCase())));
  if (!records.length) return `<div class="mvp-empty">${text('No records yet. Add the first record to start this workflow.', 'Chưa có bản ghi. Thêm bản ghi đầu tiên để bắt đầu quy trình.')}</div>`;
  return `<div class="mvp-records">${records.map(r => {
    const name = data.startups.find(s => s.id === r.startupId)?.name;
    const summary = activeTab === 'applications' ? reviewSummary(state.reviews.filter(v => v.applicationId === r.id)) : null;
    const finalized = ['Accepted', 'Rejected', 'Published', 'Booked', 'Closed', 'Completed', 'Delivered', 'Submitted'].includes(r.status);
    return `<article class="mvp-record"><header><h4>${esc(r.title || r.name || r.topic || state.applications.find(a => a.id === r.applicationId)?.name || r.id)}</h4><span class="pill">${display(r.status || 'Recorded')}</span></header>
      ${name ? `<p>${esc(name)}</p>` : ''}<dl>${definitions[activeTab].fields.filter(item => !['name', 'title', 'startupId', 'applicationId'].includes(item.key)).map(item => `<div><dt>${esc(text(item.en, item.vi))}</dt><dd>${esc(r[item.key] ?? '—')}</dd></div>`).join('')}</dl>
      ${summary ? `<p>${text('Human reviews', 'Phiếu đánh giá')}: ${summary.count} · ${text('Average', 'Trung bình')}: ${summary.average === null ? '—' : summary.average.toFixed(2) + '/5'} · Demo rubric v1</p>` : ''}
      ${r.decisionReason || r.outcome || r.confirmation ? `<p>${esc(r.decisionReason || r.outcome || r.confirmation)}</p>` : ''}
      ${r.deliverable ? `<a href="${esc(r.deliverable)}" target="_blank" rel="noopener noreferrer">${text('Open deliverable', 'Mở kết quả bàn giao')} ↗</a>` : ''}
      ${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${text('Open resource', 'Mở tài nguyên')} ↗</a>` : ''}
      <div class="mvp-actions">${!finalized ? `<button class="button secondary" data-mvp-edit="${esc(r.id)}">${text('Edit', 'Chỉnh sửa')}</button>` : ''}${actions(r)}${activeTab === 'profiles' ? `<button class="button secondary" data-mvp-open="${esc(r.id)}">${text('Open startup', 'Mở hồ sơ')}</button>` : ''}</div></article>`;
  }).join('')}</div>`;
}
function actionButton(r, action, en, vi) { return `<button class="button secondary" data-mvp-action="${action}" data-id="${esc(r.id)}">${text(en, vi)}</button>`; }
function actions(r) {
  if (activeTab === 'applications') return r.status === 'Draft' ? actionButton(r, 'submit', 'Submit', 'Nộp hồ sơ') : r.status === 'Submitted' ? actionButton(r, 'accept', 'Accept', 'Tiếp nhận') + actionButton(r, 'reject', 'Reject', 'Từ chối') : '';
  if (activeTab === 'sessions') return actionButton(r, 'task', 'Create follow-up task', 'Tạo công việc tiếp theo');
  if (activeTab === 'milestones' && r.status === 'Planned') return actionButton(r, 'complete', 'Record outcome', 'Ghi kết quả');
  if (activeTab === 'sops') return r.status === 'Draft' ? actionButton(r, 'publish', 'Publish version', 'Công bố phiên bản') : actionButton(r, 'instantiate', 'Create checklist tasks', 'Tạo công việc checklist');
  if (activeTab === 'slots') return r.status === 'Available' ? actionButton(r, 'book', 'Book slot', 'Đặt lịch') : actionButton(r, 'cancel', 'Cancel booking', 'Hủy lịch đặt');
  if (activeTab === 'requests') return ['Requested', 'In progress'].includes(r.status) ? actionButton(r, 'task', 'Assign task', 'Giao công việc') + (r.status === 'In progress' ? actionButton(r, 'deliver', 'Deliver', 'Bàn giao') : '') : r.status === 'Delivered' ? actionButton(r, 'close', 'Confirm completion', 'Xác nhận hoàn tất') : '';
  return '';
}
function editor(state, data) {
  const fields = editing.action ? ({ accept: [f('reason', 'Decision rationale', 'Lý do quyết định', 'textarea')], reject: [f('reason', 'Decision rationale', 'Lý do quyết định', 'textarea')], complete: [f('reason', 'Outcome and evidence', 'Kết quả và bằng chứng', 'textarea')], close: [f('reason', 'Confirmation / feedback', 'Xác nhận / phản hồi', 'textarea')], task: [title, owner, due], instantiate: [startup, due], book: [startup], deliver: [f('url', 'Deliverable URL', 'Link kết quả bàn giao', 'url')] }[editing.action] || []) : definitions[activeTab].fields;
  return `<section class="card card-pad mvp-editor" id="mvp-editor" tabindex="-1"><h3>${text('Record details', 'Chi tiết bản ghi')}</h3><p class="muted-text">${text('Required fields are marked *.', 'Trường bắt buộc có dấu *.')}</p>
    <form id="mvp-form"><div class="mvp-form-grid">${fields.map(item => input(item, editing.record || {}, state, data)).join('')}</div><p id="mvp-form-error" role="alert"></p><div class="mvp-actions"><button class="button orange" type="submit">${text('Save', 'Lưu')}</button><button class="button secondary" type="button" id="mvp-cancel">${text('Cancel', 'Hủy')}</button></div></form></section>`;
}
function input(item, record, state, data) {
  const value = record[item.key] ?? '', attrs = `id="mvp-${item.key}" name="${item.key}" ${item.optional ? '' : 'required'}`;
  let options;
  if (item.type === 'startup') options = data.startups.map(s => [s.id, s.name]);
  if (item.type === 'application') options = state.applications.filter(a => a.status === 'Submitted').map(a => [a.id, a.name]);
  if (item.type === 'milestone') options = state.milestones.map(m => [m.id, `${data.startups.find(s => s.id === m.startupId)?.name || ''} · ${m.title}`]);
  if (item.type === 'select') options = item.options.map(v => [v, v]);
  const control = options ? `<select class="select" ${attrs}><option value="">—</option>${options.map(([v, label]) => `<option value="${esc(v)}"${String(value) === v ? ' selected' : ''}>${display(label)}</option>`).join('')}</select>` : item.type === 'textarea' ? `<textarea class="input" rows="4" maxlength="8000" ${attrs}>${esc(value)}</textarea>` : `<input class="input" ${attrs} type="${item.type === 'score' ? 'number' : item.type}" ${item.type === 'score' ? 'min="0" max="5" step="0.5"' : item.type === 'number' ? 'step="any"' : ''} maxlength="2000" value="${esc(value)}">`;
  return `<label class="${item.type === 'textarea' ? 'mvp-wide' : ''}" for="mvp-${item.key}">${esc(text(item.en, item.vi))}${item.optional ? '' : ' *'}${control}</label>`;
}
function dashboard(state, data) {
  const cohorts = [...new Set(data.startups.map(s => s.cohort).filter(Boolean))];
  const selected = data.startups.filter(s => (!filterCohort || s.cohort === filterCohort) && (!filterStartup || s.id === filterStartup));
  const ids = new Set(selected.map(s => s.id)), names = new Set(selected.map(s => s.name));
  const tasks = data.projectTasks.filter(t => ids.has(t.startupId) || names.has(t.startup));
  const milestones = state.milestones.filter(m => ids.has(m.startupId));
  const open = tasks.filter(t => !['Done', 'Cancelled'].includes(t.status)), metrics = state.metrics.filter(m => ids.has(m.startupId));
  return `<div class="mvp-filters"><label>${text('Cohort', 'Khóa ươm tạo')}<select class="select" id="mvp-cohort"><option value="">${text('All cohorts', 'Tất cả khóa')}</option>${cohorts.map(c => `<option ${c === filterCohort ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label><label>Startup<select class="select" id="mvp-dashboard-startup"><option value="">${text('All startups', 'Tất cả startup')}</option>${startupOptions(data, filterStartup)}</select></label></div>
    <div class="mvp-stats">${[[text('Startups', 'Startup'), selected.length], [text('Open tasks', 'Việc đang mở'), open.length], [text('Sessions recorded', 'Phiên đã ghi nhận'), state.sessions.filter(s => ids.has(s.startupId)).length], [text('Milestones completed', 'Mốc hoàn thành'), `${milestones.filter(m => m.status === 'Completed').length}/${milestones.length}`]].map(([label, n]) => `<article><span>${label}</span><strong>${n}</strong></article>`).join('')}</div>
    <h4>${text('Next actions', 'Công việc tiếp theo')}</h4><div class="mvp-table-wrap"><table><thead><tr><th>Startup</th><th>${text('Task', 'Công việc')}</th><th>${text('Owner', 'Phụ trách')}</th><th>${text('Due', 'Hạn')}</th></tr></thead><tbody>${open.map(t => `<tr><td>${esc(t.startup)}</td><td><button class="text-link" data-mvp-task="${esc(t.id)}">${esc(t.title)}</button></td><td>${esc(t.assignee)}</td><td>${esc(t.due)}</td></tr>`).join('') || `<tr><td colspan="4">${text('No open tasks in this view.', 'Không có việc đang mở trong phạm vi này.')}</td></tr>`}</tbody></table></div>
    <h4>${text('Metric history — separate units and periods', 'Lịch sử chỉ số — tách đơn vị và kỳ')}</h4><div class="mvp-table-wrap"><table><thead><tr><th>Startup</th><th>${text('Metric', 'Chỉ số')}</th><th>${text('Period', 'Kỳ')}</th><th>${text('Value', 'Giá trị')}</th><th>${text('Source', 'Nguồn')}</th></tr></thead><tbody>${metrics.sort((a, b) => b.period.localeCompare(a.period)).map(m => `<tr><td>${esc(data.startups.find(s => s.id === m.startupId)?.name)}</td><td>${esc(m.title)}</td><td>${esc(m.period)}</td><td>${m.dataStatus === 'Recorded' ? esc(m.value) + ' ' + esc(m.unit) : display(m.dataStatus)}</td><td>${esc(m.source)}</td></tr>`).join('') || `<tr><td colspan="5">${text('No metric history recorded yet.', 'Chưa ghi nhận chỉ số theo kỳ.')}</td></tr>`}</tbody></table></div>`;
}
function auditView(state) {
  return `<p class="muted-text">${text('Local history; role labels are not verified identities.', 'Lịch sử trên trình duyệt; tên vai trò không phải danh tính đã xác thực.')}</p><div class="mvp-records">${state.audit.map(a => `<article class="mvp-record"><strong>${esc(a.action)}</strong><p>${esc(a.actor)} · ${esc(a.at)} · ${esc(a.recordId)}</p><details><summary>${text('Before / after', 'Trước / sau')}</summary><pre>${esc(JSON.stringify({ before: a.before, after: a.after }, null, 2))}</pre></details></article>`).join('') || text('No activity yet.', 'Chưa có thao tác.')}</div>`;
}
function intelligenceView(state) {
  return `<p>${text('Use the existing assistant for questions and reviewed proposals.', 'Dùng Trợ lý USI hiện có để hỏi đáp và xem xét đề xuất.')}</p><a class="button orange" href="#usi-intelligence">${text('Open USI Intelligence', 'Mở Trợ lý USI')} ↗</a>
    <h4>${text('Application completeness check', 'Kiểm tra hồ sơ')}</h4><p class="muted-text">${text('Rule-based checklist only. AI Screening (Phase 4) requires a deployed model and approved rubric; it is not active here.', 'Checklist theo quy tắc. AI Screening (Phase 4) cần mô hình được triển khai và rubric được duyệt; chưa hoạt động tại đây.')}</p>
    ${state.applications.map(a => `<article class="mvp-record"><strong>${esc(a.name)}</strong><p>${text('Source', 'Nguồn')}: ${esc(a.source)} · ${text('Human reviews', 'Đánh giá của người')}: ${reviewSummary(state.reviews.filter(r => r.applicationId === a.id)).count} · ${display(a.status)}</p></article>`).join('') || text('Add an application to start.', 'Thêm hồ sơ ứng tuyển để bắt đầu.')}`;
}
function refresh(focusEditor = false) {
  $('#app-root').innerHTML = renderMvpWorkspace(); bindMvpWorkspace();
  if (focusEditor) { $('#mvp-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); $('#mvp-editor')?.focus(); }
}
export function bindMvpWorkspace() {
  document.querySelectorAll('[data-mvp-tab]').forEach(b => b.addEventListener('click', () => { activeTab = b.dataset.mvpTab; editing = null; search = ''; filterStartup = ''; message = ''; refresh(); }));
  $('#mvp-new')?.addEventListener('click', () => { editing = { record: {} }; refresh(true); });
  $('#mvp-cancel')?.addEventListener('click', () => { editing = null; refresh(); });
  $('#mvp-search')?.addEventListener('input', e => { search = e.target.value; $('#mvp-list').innerHTML = recordList(readWorkspace(), getDemoData()); bindRecordActions(); });
  $('#mvp-startup-filter')?.addEventListener('change', e => { filterStartup = e.target.value; refresh(); });
  $('#mvp-cohort')?.addEventListener('change', e => { filterCohort = e.target.value; refresh(); });
  $('#mvp-dashboard-startup')?.addEventListener('change', e => { filterStartup = e.target.value; refresh(); });
  $('#mvp-export')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(readWorkspace(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = `usi-mvp-${new Date().toISOString().slice(0, 10)}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('#mvp-form')?.addEventListener('submit', e => {
    e.preventDefault();
    try {
      const values = Object.fromEntries(new FormData(e.target)), ids = getDemoData().startups.map(s => s.id);
      if (activeTab === 'profiles' && !editing.action && getDemoData().startups.some(s => s.id !== editing.record.id && s.name.toLocaleLowerCase() === values.name.trim().toLocaleLowerCase())) throw new Error(text('Startup already exists. Edit its profile.', 'Startup đã tồn tại. Hãy sửa hồ sơ hiện có.'));
      if (activeTab === 'applications' && editing.action === 'accept') {
        const application = readWorkspace().applications.find(a => a.id === editing.id);
        if (getDemoData().startups.some(s => s.name.toLocaleLowerCase() === application.name.toLocaleLowerCase())) throw new Error(text('A startup with this name already exists. Resolve the duplicate first.', 'Startup có tên này đã tồn tại. Cần xử lý trùng trước khi tiếp nhận.'));
      }
      if (editing.action) workflowAction(activeTab, editing.id, editing.action, values, getCurrentRole(), ids);
      else saveRecord(activeTab, { ...editing.record, ...values }, getCurrentRole(), ids);
      editing = null; message = text('Saved in this browser.', 'Đã lưu trên trình duyệt.'); refresh();
    } catch (error) { $('#mvp-form-error').textContent = error.message; }
  });
  bindRecordActions();
}
function bindRecordActions() {
  document.querySelectorAll('[data-mvp-edit]').forEach(b => b.addEventListener('click', () => { const records = activeTab === 'profiles' ? getDemoData().startups : readWorkspace()[activeTab]; editing = { record: { ...records.find(r => r.id === b.dataset.mvpEdit) } }; refresh(true); }));
  document.querySelectorAll('[data-mvp-action]').forEach(b => b.addEventListener('click', () => {
    editing = { id: b.dataset.id, action: b.dataset.mvpAction };
    if (['submit', 'publish', 'cancel'].includes(editing.action)) {
      try { workflowAction(activeTab, editing.id, editing.action, {}, getCurrentRole(), getDemoData().startups.map(s => s.id)); message = text('Status updated.', 'Đã cập nhật trạng thái.'); } catch (error) { message = error.message; }
      editing = null; refresh();
    } else refresh(true);
  }));
  document.querySelectorAll('[data-mvp-open]').forEach(b => b.addEventListener('click', () => { localStorage.setItem('usiHubSelectedStartupId', b.dataset.mvpOpen); window.location.hash = 'startup-detail'; }));
  document.querySelectorAll('[data-mvp-task]').forEach(b => b.addEventListener('click', () => { localStorage.setItem('usiHubSelectedTaskId', b.dataset.mvpTask); window.location.hash = 'task-detail'; }));
}
