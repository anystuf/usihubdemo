import { getDemoData } from '../services/dataService.js';
import { readWorkspace, createGrowthSession, recordGrowthOutcome } from '../services/mvpService.js';
import { getCurrentRole } from '../services/roleService.js';
import { getLanguage } from '../services/languageService.js';
import { renderProjectBoard, bindProjectBoard } from './projectBoard.js';
import { $, escapeHtml as e } from '../utils/dom.js';

const t = (en, vi) => getLanguage() === 'vi' ? vi : en;
const views = { overview: ['Overview', 'Tổng quan'], worklist: ['Worklist & To-do', 'Công việc và việc cần làm'], sessions: ['Growth Sessions', 'Phiên hỗ trợ'], roadmap: ['Growth Roadmap', 'Lộ trình phát triển'], followups: ['Follow-up & Outcome', 'Theo dõi và kết quả'], features: ['Feature Breakdown', 'Chi tiết tính năng'] };
let view = 'overview', scope = '', draft = null, notice = '';
const closed = task => ['Done', 'Cancelled'].includes(task.status);
export function renderStartupGrowth() {
  const intent = sessionStorage.getItem('usiGrowthStartup');
  if (intent !== null) { scope = intent; sessionStorage.removeItem('usiGrowthStartup'); }
  const data = getDemoData(), state = readWorkspace();
  if (scope && !data.startups.some(s => s.id === scope)) scope = '';
  const sessions = state.sessions.filter(s => !scope || s.startupId === scope);
  const tasks = data.projectTasks.filter(task => !scope || task.startupId === scope);
  const milestones = state.milestones.filter(m => !scope || m.startupId === scope);
  return `<section class="growth-page"><header class="card card-pad"><p class="eyebrow">STARTUP GROWTH · PHASE 1</p><div class="section-header"><div><h2>${t('Startup Growth Workspace', 'Không gian phát triển startup')}</h2><p class="muted-text">${t('Goal → Meeting → Issue → Support need → Action → Owner → Follow-up → Outcome', 'Mục tiêu → Trao đổi → Vấn đề → Nhu cầu hỗ trợ → Hành động → Phụ trách → Theo dõi → Kết quả')}</p></div><div class="growth-actions"><button class="button orange" data-growth-new="session">${t('Log session', 'Ghi phiên hỗ trợ')}</button><a class="button secondary" href="#project-board">${t('Open worklist', 'Mở danh sách công việc')}</a></div></div>
  <div class="growth-scope"><label for="growth-startup">Startup</label><select class="select" id="growth-startup"><option value="">${t('All startup records', 'Tất cả hồ sơ startup')}</option>${data.startups.map(s => `<option value="${e(s.id)}"${scope === s.id ? ' selected' : ''}>${e(s.name)} · ${e(s.stage)}</option>`).join('')}</select><span class="pill">${t('Local demo · not shared accounts', 'Demo trên trình duyệt · chưa có tài khoản dùng chung')}</span></div></header>
  <nav class="growth-tabs" aria-label="Growth views">${Object.entries(views).map(([key, label]) => `<button class="button ${view === key ? 'orange' : 'secondary'}" data-growth-view="${key}" aria-current="${view === key ? 'page' : 'false'}">${t(...label)}</button>`).join('')}</nav><p role="status">${e(notice)}</p>
  ${view === 'overview' ? overview(sessions, tasks, state) : view === 'worklist' ? renderProjectBoard({ startupId: scope }) : view === 'sessions' ? sessionCards(sessions, data, state) : view === 'roadmap' ? roadmap(milestones, sessions, tasks, data, state) : view === 'followups' ? followups(sessions, tasks, state, data) : features()}
  ${draft ? editor(data, state) : ''}</section>`;
}
function overview(sessions, tasks, state) {
  const open = tasks.filter(task => !closed(task));
  // Completing a task never implies an outcome or closes the follow-up queue.
  const pending = sessions.filter(s => !state.outcomes.some(o => o.sessionId === s.id));
  const today = new Date().toLocaleDateString('en-CA');
  return `<div class="growth-metrics">${[[t('Open tasks', 'Việc đang mở'), open.length], [t('Overdue actions', 'Việc quá hạn'), open.filter(task => task.due && task.due < today).length], [t('Growth sessions', 'Phiên hỗ trợ'), sessions.length], [t('No outcome recorded', 'Chưa ghi kết quả'), pending.length]].map(([label, count]) => `<article class="card card-pad"><span class="muted-text">${label}</span><strong>${count}</strong></article>`).join('')}</div><section class="card card-pad"><h3>${t('Support workflow', 'Luồng hỗ trợ')}</h3><ol class="growth-workflow">${[t('Existing goal', 'Mục tiêu hiện có'), t('Structured meeting', 'Trao đổi có cấu trúc'), t('Owned action', 'Hành động có phụ trách'), t('Observed outcome', 'Kết quả được quan sát')].map((label, i) => `<li><span>${i + 1}</span>${label}</li>`).join('')}</ol><p class="muted-text">${t('Task completion and observed outcomes are separate records.', 'Hoàn thành công việc và kết quả quan sát là hai bản ghi riêng.')}</p></section>${taskTable(open.slice(0, 8))}`;
}
function taskTable(tasks) {
  return `<section class="card card-pad"><h3>${t('Next actions', 'Hành động tiếp theo')}</h3><div class="mvp-table-wrap"><table><thead><tr><th>${t('Action', 'Hành động')}</th><th>Startup</th><th>${t('Owner', 'Phụ trách')}</th><th>${t('Due / status', 'Hạn / trạng thái')}</th></tr></thead><tbody>${tasks.map(task => `<tr><td><button class="text-link" data-growth-task="${e(task.id)}">${e(task.title)}</button></td><td>${e(task.startup)}</td><td>${e(task.assignee)}</td><td>${e(task.due)} · ${e(task.status)}</td></tr>`).join('') || `<tr><td colspan="4">${t('No tasks in this view.', 'Chưa có công việc trong phạm vi này.')}</td></tr>`}</tbody></table></div></section>`;
}
function sessionCards(sessions, data, state) {
  return `<div class="growth-records">${sessions.map(s => `<article class="card card-pad"><span class="pill">${e(s.date)}</span><h3>${e(s.title)}</h3><p class="muted-text">${e(data.startups.find(x => x.id === s.startupId)?.name)} · ${e(s.owner)}</p><dl>${[[t('Goal', 'Mục tiêu'), state.milestones.find(m => m.id === s.milestoneId)?.title], [t('Issue', 'Vấn đề'), s.issue], [t('Support need', 'Nhu cầu hỗ trợ'), s.supportNeed], [t('Agreed action', 'Hành động thống nhất'), s.action], [t('Notes / source', 'Ghi chú / nguồn'), [s.notes, s.source].filter(Boolean).join(' · ')]].map(([label, value]) => `<dt>${label}</dt><dd>${e(value || '—')}</dd>`).join('')}</dl><div class="growth-actions"><button class="button secondary" data-growth-outcome="${e(s.id)}">${t('Record outcome', 'Ghi kết quả')}</button>${s.taskId ? `<button class="button secondary" data-growth-task="${e(s.taskId)}">${t('Linked task', 'Công việc liên quan')}</button>` : ''}</div></article>`).join('') || empty(t('No sessions recorded. Use Log session to start.', 'Chưa ghi phiên hỗ trợ. Chọn Ghi phiên hỗ trợ để bắt đầu.'))}</div>`;
}
function roadmap(milestones, sessions, tasks, data, state) {
  return `<p class="muted-text">${t('These are existing MVP milestones. No reference-prototype goals are imported.', 'Đây là milestone hiện có trong MVP. Không nhập mục tiêu mẫu từ prototype.')}</p><a class="button secondary" href="#mvp-operations">${t('Manage existing milestones', 'Quản lý milestone hiện có')} ↗</a><div class="growth-records">${milestones.map(m => {
    const linked = sessions.filter(s => s.milestoneId === m.id), ids = new Set(linked.map(s => s.id));
    const linkedTasks = tasks.filter(task => task.milestoneId === m.id || ids.has(task.sourceSessionId) || ids.has(task.sourceId));
    const outcomes = state.outcomes.filter(o => ids.has(o.sessionId));
    return `<article class="card card-pad"><span class="pill">${e(m.status)}</span><h3>${e(m.title)}</h3><p>${e(data.startups.find(s => s.id === m.startupId)?.name)} · ${e(m.due)}</p><p class="muted-text">${e(m.criteria)}</p><p>${linked.length} ${t('sessions', 'phiên')} · ${linkedTasks.length} ${t('tasks', 'công việc')} · ${outcomes.length} ${t('outcome records', 'bản ghi kết quả')}</p><details><summary>${t('Support history', 'Lịch sử hỗ trợ')}</summary>${linked.map(s => `<p>${e(s.date)} · ${e(s.title)} · ${e(s.issue || s.notes)}</p>`).join('')}${outcomes.map(o => `<p>${e(o.date)} · ${e(o.type)} · ${e(o.observation)}</p>`).join('') || ''}</details></article>`;
  }).join('') || empty(t('No existing milestones. Add them in MVP Operations.', 'Chưa có milestone. Thêm tại Vận hành MVP.'))}</div>`;
}
function followups(sessions, tasks, state, data) {
  return `<div class="growth-records">${sessions.map(s => {
    const outcomes = state.outcomes.filter(o => o.sessionId === s.id), linked = tasks.filter(task => task.sourceSessionId === s.id || task.sourceId === s.id);
    return `<article class="card card-pad"><span class="pill">${outcomes.length ? t('Outcome recorded', 'Đã ghi kết quả') : t('Outcome pending', 'Chưa ghi kết quả')}</span><h3>${e(s.title)}</h3><p>${e(data.startups.find(x => x.id === s.startupId)?.name)} · ${e(s.action || '')}</p>${linked.map(task => `<p>${e(task.assignee)} · ${e(task.status)} · <button class="text-link" data-growth-task="${e(task.id)}">${e(task.title)}</button></p>`).join('')}<ol class="growth-timeline">${outcomes.map(o => `<li><strong>${e(o.date)} · ${e(o.type)}</strong><p>${e(o.observation)}</p><small>${e(o.recordedBy)} · ${e(o.evidence || '')}</small></li>`).join('')}</ol><button class="button orange" data-growth-outcome="${e(s.id)}">${t('Add follow-up / outcome', 'Thêm theo dõi / kết quả')}</button></article>`;
  }).join('') || empty(t('Record a session before adding an outcome.', 'Ghi phiên hỗ trợ trước khi thêm kết quả.'))}</div>`;
}
function features() {
  const names = [['W01', 'Task creation / management', 'Tạo và quản lý công việc'], ['W02', 'Owner, deadline and status', 'Phụ trách, thời hạn và trạng thái'], ['W03', 'Startup worklist', 'Công việc theo startup'], ['W04', 'SGA work queue', 'Hàng đợi công việc SGA'], ['W05', 'Session / goal links', 'Liên kết phiên / mục tiêu'], ['W06', 'Task follow-up history', 'Lịch sử theo dõi công việc'], ['G01', 'Structured session log', 'Biên bản có cấu trúc'], ['G02', 'Existing milestone linking', 'Liên kết milestone hiện có'], ['G03', 'Issue / support need', 'Vấn đề / nhu cầu hỗ trợ'], ['G04', 'Action creates one task', 'Hành động tạo một công việc'], ['G05', 'Independent outcome', 'Kết quả độc lập'], ['G06', 'Support timeline', 'Timeline hỗ trợ']];
  return `<section class="card card-pad"><h3>${t('Proposed specifications — team review required', 'Đặc tả đề xuất — cần team rà soát')}</h3><p>Worklist: Nguyễn + Trường · Growth Session/Roadmap: Nguyễn + Danz</p><div class="growth-records">${names.map(([id, en, vi]) => `<div class="growth-feature"><strong>${id}</strong><span>${t(en, vi)}</span></div>`).join('')}</div><p class="muted-text">${t('Owner filtering is a demo queue, not verified access control. Shared persistence and server permissions are not connected.', 'Lọc người phụ trách là hàng đợi demo, chưa phải kiểm soát truy cập. Chưa kết nối lưu dùng chung và quyền máy chủ.')}</p></section>`;
}
function empty(message) { return `<div class="card card-pad muted-text">${message}</div>`; }
function editor(data, state) {
  const selected = draft.startupId || scope || data.startups[0]?.id || '';
  const session = state.sessions.find(s => s.id === draft.sessionId);
  const input = (name, label, type = 'text', required = true) => `<label>${label}<input class="input" name="${name}" type="${type}" ${required ? 'required' : ''} maxlength="2000"></label>`;
  const textarea = (name, label, required = true) => `<label class="mvp-wide">${label}<textarea class="input" name="${name}" rows="3" maxlength="8000" ${required ? 'required' : ''}></textarea></label>`;
  const fields = draft.kind === 'session' ? `<label>Startup<select class="select" name="startupId" id="growth-form-startup" required>${data.startups.map(s => `<option value="${e(s.id)}"${s.id === selected ? ' selected' : ''}>${e(s.name)}</option>`).join('')}</select></label><label>${t('Existing milestone (optional)', 'Milestone hiện có (nếu có)')}<select class="select" name="milestoneId" id="growth-form-goal">${goalOptions(state, selected)}</select></label>${input('title', t('Meeting title', 'Tên buổi trao đổi'))}${input('date', t('Meeting date', 'Ngày trao đổi'), 'date')}${input('owner', t('Facilitator / SGA', 'Người điều phối / SGA'))}${input('source', t('Source reference', 'Nguồn tham chiếu'))}${textarea('issue', t('Issue identified', 'Vấn đề xác định'))}${textarea('supportNeed', t('Support need', 'Nhu cầu hỗ trợ'))}${textarea('action', t('Agreed action', 'Hành động thống nhất'), false)}${input('assignee', t('Action owner', 'Phụ trách hành động'), 'text', false)}${input('due', t('Action due date', 'Hạn hành động'), 'date', false)}${textarea('notes', t('Meeting notes', 'Ghi chú trao đổi'), false)}<label class="mvp-wide growth-checkbox"><input name="createTask" type="checkbox">${t('Create linked task with this session', 'Tạo công việc liên quan cùng phiên hỗ trợ')}</label>` : `<p class="mvp-wide">${e(session?.title)}</p>${input('date', t('Follow-up date', 'Ngày theo dõi'), 'date')}<label>${t('Outcome type', 'Loại kết quả')}<select class="select" name="type"><option>Observed result</option><option>Partial result</option><option>Not yet achieved</option></select></label>${textarea('observation', t('What was observed?', 'Đã quan sát được gì?'))}${input('evidence', t('Evidence / reference (optional)', 'Bằng chứng / tham chiếu (nếu có)'), 'text', false)}`;
  return `<section class="card card-pad" id="growth-editor" tabindex="-1"><h3>${draft.kind === 'session' ? t('Log a growth session', 'Ghi phiên hỗ trợ') : t('Record outcome', 'Ghi kết quả')}</h3><form id="growth-form"><div class="mvp-form-grid">${fields}</div><p id="growth-error" role="alert"></p><div class="growth-actions"><button class="button orange" type="submit">${t('Save', 'Lưu')}</button><button class="button secondary" id="growth-cancel" type="button">${t('Cancel', 'Hủy')}</button></div></form></section>`;
}
function goalOptions(state, id) { return `<option value="">—</option>${state.milestones.filter(m => m.startupId === id).map(m => `<option value="${e(m.id)}">${e(m.title)}</option>`).join('')}`; }
function refresh(focus = false) { $('#app-root').innerHTML = renderStartupGrowth(); bindStartupGrowth(); if (focus) { $('#growth-editor')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); $('#growth-editor')?.focus(); } }
export function bindStartupGrowth() {
  if (view === 'worklist') bindProjectBoard();
  document.querySelectorAll('[data-growth-view]').forEach(b => b.addEventListener('click', () => { view = b.dataset.growthView; draft = null; refresh(); }));
  $('#growth-startup')?.addEventListener('change', ev => { scope = ev.target.value; draft = null; refresh(); });
  document.querySelectorAll('[data-growth-new]').forEach(b => b.addEventListener('click', () => { draft = { kind: 'session', id: crypto.randomUUID() }; refresh(true); }));
  document.querySelectorAll('[data-growth-outcome]').forEach(b => b.addEventListener('click', () => { draft = { kind: 'outcome', id: crypto.randomUUID(), sessionId: b.dataset.growthOutcome }; refresh(true); }));
  document.querySelectorAll('[data-growth-task]').forEach(b => b.addEventListener('click', () => { localStorage.setItem('usiHubSelectedTaskId', b.dataset.growthTask); window.location.hash = 'task-detail'; }));
  $('#growth-cancel')?.addEventListener('click', () => { draft = null; refresh(); });
  $('#growth-form-startup')?.addEventListener('change', ev => { $('#growth-form-goal').innerHTML = goalOptions(readWorkspace(), ev.target.value); });
  $('#growth-form')?.addEventListener('submit', ev => {
    ev.preventDefault();
    try {
      const values = Object.fromEntries(new FormData(ev.target)), data = getDemoData();
      if (draft.kind === 'session') createGrowthSession({ ...values, id: draft.id, createTask: values.createTask === 'on' }, getCurrentRole(), data.startups.map(s => s.id));
      else recordGrowthOutcome({ ...values, id: draft.id, sessionId: draft.sessionId }, getCurrentRole(), data.startups.map(s => s.id), data.projectTasks);
      view = draft.kind === 'session' ? 'sessions' : 'followups'; draft = null; notice = t('Saved in this browser.', 'Đã lưu trên trình duyệt này.'); refresh();
    } catch (error) { $('#growth-error').textContent = error.message; }
  });
}
