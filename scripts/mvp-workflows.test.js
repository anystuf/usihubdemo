import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyWorkspace, readWorkspace, saveRecord, workflowAction, overlayWorkspace, MVP_KEY, safeUrl } from '../public/js/services/mvpService.js';

function fixture() {
  const values = new Map();
  return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) };
}
const profile = { name: 'Sample founder', cohort: 'Pilot', sector: 'SaaS', stage: 'Ideation', summary: 'Synthetic test record', owner: 'SGA', source: 'Sample source' };
const base = { startups: [{ id: 'alpha', ...profile }], projectTasks: [], contacts: [], documents: [] };
function save(storage, kind, input) { return saveRecord(kind, input, 'sga', ['alpha'], storage); }
function act(storage, kind, id, action, details = {}, actor = 'sga') { return workflowAction(kind, id, action, details, actor, ['alpha'], storage); }

test('new workspace does not invent operational records', () => {
  assert.deepEqual(readWorkspace(fixture()), emptyWorkspace());
});
test('acceptance requires a human review and creates one startup', () => {
  const storage = fixture();
  const a = save(storage, 'applications', { name: 'Pilot sample', cohort: 'Pilot', summary: 'Synthetic application', source: 'Sample' });
  act(storage, 'applications', a.id, 'submit');
  assert.throws(() => act(storage, 'applications', a.id, 'accept', { reason: 'Committee decision' }), /human review/);
  save(storage, 'reviews', { applicationId: a.id, reviewer: 'Reviewer 1', problem: '0', solution: '3', team: '4', notes: 'Synthetic review' });
  assert.throws(() => act(storage, 'applications', a.id, 'accept', { reason: 'Decision' }, 'founder'), /SGA or Leader/);
  act(storage, 'applications', a.id, 'accept', { reason: 'Committee decision' });
  assert.equal(overlayWorkspace(base, storage).startups.length, 2);
  assert.throws(() => act(storage, 'applications', a.id, 'accept', { reason: 'Repeat' }), /transition/);
  assert.equal(readWorkspace(storage).profiles.length, 1);
});
test('zero metric is preserved; not-applicable clears numeric value', () => {
  const storage = fixture();
  const m = save(storage, 'metrics', { startupId: 'alpha', title: 'Revenue', period: '2026-10', unit: 'VND', dataStatus: 'Recorded', value: '0', source: 'Sample ledger' });
  assert.equal(readWorkspace(storage).metrics[0].value, '0');
  assert.throws(() => save(storage, 'metrics', { ...m, id: undefined }), /exists/);
  save(storage, 'metrics', { ...m, dataStatus: 'Not applicable', value: '42' });
  assert.equal(readWorkspace(storage).metrics[0].value, '');
});
test('milestone must belong to session startup', () => {
  const storage = fixture();
  const m = save(storage, 'milestones', { startupId: 'alpha', title: 'Validate', owner: 'SGA', due: '2026-12-01', criteria: 'Interview evidence' });
  assert.throws(() => saveRecord('sessions', { startupId: 'beta', milestoneId: m.id, title: 'Check-in', date: '2026-10-13', owner: 'SGA', notes: 'Sample', source: 'Sample' }, 'sga', ['alpha', 'beta'], storage), /same startup/);
});
test('session follow-up is idempotent and saved task edits win', () => {
  const storage = fixture();
  const s = save(storage, 'sessions', { startupId: 'alpha', title: 'Check-in', date: '2026-10-13', owner: 'SGA', notes: 'Sample notes', source: 'Sample' });
  act(storage, 'sessions', s.id, 'task', { title: 'Validate interview', owner: 'SGA', due: '2026-11-01' });
  act(storage, 'sessions', s.id, 'task', { title: 'Validate interview', owner: 'SGA', due: '2026-11-01' });
  const tasks = overlayWorkspace(base, storage).projectTasks;
  assert.equal(tasks.length, 1);
  storage.setItem('usiHubProjectTasks', JSON.stringify([{ ...tasks[0], status: 'Done', progress: 100 }]));
  assert.equal(overlayWorkspace(base, storage).projectTasks[0].status, 'Done');
});
test('published SOP is immutable and checklist tasks are not duplicated', () => {
  const storage = fixture();
  const s = save(storage, 'sops', { title: 'Onboarding', owner: 'SGA', steps: 'Confirm profile\nAgree next steps' });
  act(storage, 'sops', s.id, 'publish');
  assert.throws(() => save(storage, 'sops', s), /read-only/);
  act(storage, 'sops', s.id, 'instantiate', { startupId: 'alpha', due: '2026-11-01' });
  act(storage, 'sops', s.id, 'instantiate', { startupId: 'alpha', due: '2026-11-01' });
  assert.equal(readWorkspace(storage).tasks.length, 2);
});
test('office hours reject overlaps and repeated bookings; cancellation frees slot', () => {
  const storage = fixture();
  const slot = save(storage, 'slots', { mentor: 'Sample mentor', topic: 'Product', start: '2099-11-01T10:00', end: '2099-11-01T11:00' });
  assert.throws(() => save(storage, 'slots', { ...slot, id: undefined, start: '2099-11-01T10:30' }), /overlapping/);
  act(storage, 'slots', slot.id, 'book', { startupId: 'alpha' });
  assert.throws(() => act(storage, 'slots', slot.id, 'book', { startupId: 'alpha' }), /transition/);
  act(storage, 'slots', slot.id, 'cancel');
  assert.equal(readWorkspace(storage).slots[0].status, 'Available');
});
test('shared service requires assignment, delivery, and confirmation in order', () => {
  const storage = fixture();
  const r = save(storage, 'requests', { startupId: 'alpha', title: 'Review template', service: 'Legal', owner: 'SGA', due: '2026-11-01', description: 'Synthetic request' });
  assert.throws(() => act(storage, 'requests', r.id, 'close', { reason: 'Done' }), /transition/);
  act(storage, 'requests', r.id, 'task', { title: 'Review template', owner: 'SGA', due: '2026-11-01' });
  act(storage, 'requests', r.id, 'deliver', { url: 'https://example.com/result' });
  act(storage, 'requests', r.id, 'close', { reason: 'Deliverable accepted' });
  assert.equal(readWorkspace(storage).requests[0].status, 'Closed');
});
test('invalid URL and corrupted workspace are not silently accepted', () => {
  assert.throws(() => safeUrl('javascript:alert(1)'), /HTTP/);
  const storage = fixture(); storage.setItem(MVP_KEY, '{bad');
  assert.throws(() => readWorkspace(storage));
});
test('people overlay uses arrays expected by existing contacts UI', () => {
  const storage = fixture();
  save(storage, 'people', { name: 'Sample expert', organisation: 'Sample organisation', expertise: 'SaaS, Product', owner: 'SGA' });
  assert.deepEqual(overlayWorkspace(base, storage).contacts[0].expertise, ['SaaS', 'Product']);
});
