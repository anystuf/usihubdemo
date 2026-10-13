import test from 'node:test';
import assert from 'node:assert/strict';
import { readWorkspace, saveRecord, createGrowthSession, recordGrowthOutcome, overlayWorkspace } from '../public/js/services/mvpService.js';
function storage() { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) }; }
const base = { startups: [{ id: 'alpha', name: 'Synthetic Alpha' }, { id: 'beta', name: 'Synthetic Beta' }], projectTasks: [], contacts: [], documents: [] };
const ids = ['alpha', 'beta'];
const input = { id: 'session-test-1', startupId: 'alpha', title: 'Synthetic session', date: '2026-10-13', owner: 'SGA sample', issue: 'No customer evidence', supportNeed: 'Interview guidance', action: 'Run interviews', assignee: 'SGA sample', due: '2026-11-01', source: 'Synthetic note', createTask: true };
test('session/action writes one linked task, with retry idempotency and same-startup milestone', () => {
  const db = storage();
  const milestone = saveRecord('milestones', { startupId: 'alpha', title: 'Evidence', owner: 'SGA sample', due: '2026-11-01', criteria: 'Interview results' }, 'sga', ids, db);
  const first = createGrowthSession({ ...input, milestoneId: milestone.id }, 'sga', ids, db);
  createGrowthSession({ ...input, milestoneId: milestone.id }, 'sga', ids, db);
  const state = readWorkspace(db), data = overlayWorkspace(base, db);
  assert.equal(state.sessions.length, 1); assert.equal(data.projectTasks.length, 1);
  assert.equal(data.projectTasks[0].sourceSessionId, first.id);
  assert.equal(data.projectTasks[0].milestoneId, milestone.id);
  assert.equal(data.projectTasks[0].startupId, 'alpha');
  assert.throws(() => createGrowthSession({ ...input, id: 'different', startupId: 'beta', milestoneId: milestone.id }, 'sga', ids, db), /same startup/);
  assert.equal(readWorkspace(db).sessions.length, 1);
});
test('invalid action leaves neither session nor task', () => {
  const db = storage();
  assert.throws(() => createGrowthSession({ ...input, assignee: '' }, 'sga', ids, db), /assignee/);
  assert.equal(readWorkspace(db).sessions.length, 0); assert.equal(readWorkspace(db).tasks.length, 0);
});
test('task Done does not imply outcome; outcome preserves status and survives storage reload', () => {
  const db = storage();
  createGrowthSession(input, 'sga', ids, db);
  const tasks = overlayWorkspace(base, db).projectTasks;
  db.setItem('usiHubProjectTasks', JSON.stringify(tasks.map(task => ({ ...task, status: 'Done', progress: 100 }))));
  assert.equal(readWorkspace(db).outcomes.length, 0);
  recordGrowthOutcome({ id: 'outcome-test', sessionId: input.id, taskId: tasks[0].id, date: '2026-10-14', type: 'Partial result', observation: 'Two interviews completed', evidence: 'Synthetic evidence' }, 'sga', ids, tasks, db);
  recordGrowthOutcome({ id: 'outcome-test', sessionId: input.id, date: '2026-10-14', type: 'Partial result', observation: 'Two interviews completed' }, 'sga', ids, tasks, db);
  assert.equal(readWorkspace(db).outcomes.length, 1);
  assert.equal(readWorkspace(db).outcomes[0].recordedBy, 'sga');
  assert.equal(overlayWorkspace(base, db).projectTasks[0].status, 'Done');
});
test('outcome rejects cross-startup task and missing session', () => {
  const db = storage(); createGrowthSession(input, 'sga', ids, db);
  const outcome = { id: 'outcome-test', sessionId: input.id, taskId: 'wrong', date: '2026-10-14', type: 'Observed result', observation: 'Sample' };
  assert.throws(() => recordGrowthOutcome(outcome, 'sga', ids, [{ id: 'wrong', startupId: 'beta', sourceSessionId: input.id }], db), /Task must belong/);
  assert.throws(() => recordGrowthOutcome({ ...outcome, sessionId: 'missing' }, 'sga', ids, [], db), /Choose a session/);
});
