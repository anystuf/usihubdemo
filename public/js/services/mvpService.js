// Browser-local MVP workspace. This is not an authorization or shared database layer.
export const MVP_KEY = 'usiHubMvpV1';
export const kinds = ['profiles', 'applications', 'reviews', 'milestones', 'sessions', 'metrics', 'people', 'resources', 'sops', 'slots', 'requests', 'tasks', 'outcomes'];
export const stages = ['Ideation', 'Prototyping / MVP', 'PMF', 'Product–Channel Fit', 'Growth'];
export function emptyWorkspace() {
  return { version: 1, ...Object.fromEntries(kinds.map(key => [key, []])), audit: [] };
}
export function readWorkspace(storage = globalThis.localStorage) {
  const raw = storage.getItem(MVP_KEY);
  if (!raw) return emptyWorkspace();
  const state = JSON.parse(raw);
  // Additive compatibility: existing v1 records are retained unchanged.
  if (state.version === 1 && state.outcomes === undefined) state.outcomes = [];
  if (state.version !== 1 || ![...kinds, 'audit'].every(key => Array.isArray(state[key]))) {
    throw new Error('Workspace data is invalid. Export or recover the stored data before continuing.');
  }
  return state;
}
export function safeUrl(value) {
  if (!value) return '';
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Use an HTTP or HTTPS source URL.');
  return url.href;
}
function required(record, keys) {
  for (const key of keys) if (record[key] === undefined || record[key] === null || String(record[key]).trim() === '') throw new Error(`Required: ${key}`);
}
function date(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) throw new Error('Use a valid date.');
}
export function reviewSummary(reviews) {
  const complete = reviews.filter(r => ['problem', 'solution', 'team'].every(k => r[k] !== '' && r[k] != null && Number.isFinite(Number(r[k]))));
  return { count: complete.length, average: complete.length ? complete.reduce((sum, r) => sum + (Number(r.problem) + Number(r.solution) + Number(r.team)) / 3, 0) / complete.length : null };
}
export function validateRecord(kind, record, state, startupIds = []) {
  if (!kinds.includes(kind) || kind === 'tasks') throw new Error('Unknown record type.');
  const fields = {
    profiles: ['name', 'cohort', 'sector', 'stage', 'summary', 'owner', 'source'],
    applications: ['name', 'cohort', 'summary', 'source'], reviews: ['applicationId', 'reviewer', 'problem', 'solution', 'team', 'notes'],
    milestones: ['startupId', 'title', 'owner', 'due', 'criteria'], sessions: ['startupId', 'title', 'date', 'owner', 'notes', 'source'],
    metrics: ['startupId', 'title', 'period', 'unit', 'dataStatus', 'source'], people: ['name', 'organisation', 'expertise', 'owner'],
    resources: ['title', 'category', 'url', 'owner', 'description'], sops: ['title', 'owner', 'steps'],
    slots: ['mentor', 'start', 'end', 'topic'], requests: ['startupId', 'title', 'service', 'owner', 'due', 'description']
  };
  required(record, fields[kind]);
  if (record.startupId && !startupIds.includes(record.startupId)) throw new Error('Choose an existing startup.');
  if (record.url) record.url = safeUrl(record.url);
  for (const key of ['due', 'date']) if (record[key]) date(record[key]);
  if (kind === 'profiles') {
    if (!stages.includes(record.stage)) throw new Error('Choose a lifecycle stage.');
    if (state.profiles.some(r => r.id !== record.id && r.name.toLowerCase() === record.name.toLowerCase())) throw new Error('This startup name already exists.');
  }
  if (kind === 'reviews') {
    if (!state.applications.some(a => a.id === record.applicationId && a.status === 'Submitted')) throw new Error('Only submitted applications can be reviewed.');
    if (state.reviews.some(r => r.id !== record.id && r.applicationId === record.applicationId && r.reviewer.toLowerCase() === record.reviewer.toLowerCase())) throw new Error('This reviewer already has a review. Edit that review instead.');
    for (const key of ['problem', 'solution', 'team']) if (!Number.isFinite(Number(record[key])) || Number(record[key]) < 0 || Number(record[key]) > 5) throw new Error('Scores must be between 0 and 5.');
  }
  if (kind === 'metrics') {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(record.period)) throw new Error('Choose a reporting month.');
    if (!['Recorded', 'Not recorded', 'Not applicable', 'Not yet occurred'].includes(record.dataStatus)) throw new Error('Choose a data status.');
    if (record.dataStatus === 'Recorded') {
      required(record, ['value']);
      if (!Number.isFinite(Number(record.value))) throw new Error('Metric value must be numeric.');
    } else record.value = '';
    if (state.metrics.some(r => r.id !== record.id && r.startupId === record.startupId && r.title.toLowerCase() === record.title.toLowerCase() && r.period === record.period)) throw new Error('A metric exists for this month. Edit that record.');
  }
  if (kind === 'sessions' && record.milestoneId && !state.milestones.some(m => m.id === record.milestoneId && m.startupId === record.startupId)) throw new Error('Milestone must belong to the same startup.');
  if (kind === 'slots') {
    const start = Date.parse(record.start), end = Date.parse(record.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('Slot end must be after start.');
    if (state.slots.some(s => s.id !== record.id && s.status !== 'Cancelled' && s.mentor.toLowerCase() === record.mentor.toLowerCase() && start < Date.parse(s.end) && end > Date.parse(s.start))) throw new Error('This mentor already has an overlapping slot.');
  }
}
export function saveRecord(kind, input, actor, startupIds, storage = globalThis.localStorage) {
  const state = readWorkspace(storage);
  const previous = state[kind]?.find(r => r.id === input.id);
  if (previous && (['Accepted', 'Rejected', 'Published', 'Booked', 'Closed', 'Completed', 'Delivered', 'Submitted'].includes(previous.status))) throw new Error('Finalized records are read-only. Create a new version when needed.');
  const record = { ...input, id: input.id || crypto.randomUUID(), updatedAt: new Date().toISOString(), createdAt: previous?.createdAt || new Date().toISOString() };
  record.status = previous?.status || ({ applications: 'Draft', sops: 'Draft', slots: 'Available', requests: 'Requested', milestones: 'Planned', sessions: 'Recorded' }[kind] || 'Recorded');
  if (kind === 'reviews') record.rubricVersion = 'demo-v1-equal-weights';
  validateRecord(kind, record, state, startupIds);
  state[kind] = [record, ...state[kind].filter(r => r.id !== record.id)];
  commit(state, actor, `${previous ? 'update' : 'create'}:${kind}`, record.id, storage, previous, record);
  return record;
}
function commit(state, actor, action, id, storage, before = null, after = null) {
  state.audit.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), actor, action, recordId: id, before, after });
  storage.setItem(MVP_KEY, JSON.stringify(state));
}

export function createGrowthSession(input, actor, startupIds, storage = globalThis.localStorage) {
  const state = readWorkspace(storage);
  required(input, ['id', 'startupId', 'title', 'date', 'owner', 'issue', 'supportNeed', 'source']);
  const existing = state.sessions.find(s => s.id === input.id);
  if (existing) return existing;
  const now = new Date().toISOString();
  const session = { ...input, createdAt: now, updatedAt: now, createdBy: actor, status: 'Recorded', notes: input.notes || '', milestoneId: input.milestoneId || '' };
  // Existing session validator requires notes; structured issue/need provide the context.
  validateRecord('sessions', { ...session, notes: session.notes || `${session.issue}\n${session.supportNeed}` }, state, startupIds);
  if (input.createTask) {
    required(input, ['action', 'assignee', 'due']); date(input.due);
    const taskId = `growth-task-${session.id}`;
    state.tasks.unshift({ id: taskId, title: input.action.trim(), startupId: session.startupId, milestoneId: session.milestoneId, sourceSessionId: session.id, sourceId: session.id, assignee: input.assignee.trim(), due: input.due, notes: input.notes || '', status: 'Next', priority: 'Medium', progress: 0, workstream: 'Growth', createdAt: now, updatedAt: now, createdBy: actor });
    session.taskId = taskId;
  }
  state.sessions.unshift(session);
  // One storage write commits the session, task and audit together in demo mode.
  commit(state, actor, 'create:growth-session', session.id, storage, null, session);
  return session;
}

export function recordGrowthOutcome(input, actor, startupIds, tasks, storage = globalThis.localStorage) {
  const state = readWorkspace(storage);
  required(input, ['id', 'sessionId', 'date', 'type', 'observation']); date(input.date);
  const session = state.sessions.find(s => s.id === input.sessionId);
  if (!session || !startupIds.includes(session.startupId)) throw new Error('Choose a session from an existing startup.');
  if (!['Observed result', 'Partial result', 'Not yet achieved'].includes(input.type)) throw new Error('Choose an outcome type.');
  if (input.taskId && !tasks.some(t => t.id === input.taskId && t.startupId === session.startupId && (t.sourceSessionId === session.id || t.sourceId === session.id))) throw new Error('Task must belong to this startup and session.');
  const previous = state.outcomes.find(o => o.id === input.id);
  if (previous) return previous;
  const outcome = { ...input, startupId: session.startupId, createdAt: new Date().toISOString(), recordedBy: actor };
  state.outcomes.unshift(outcome);
  commit(state, actor, 'record:growth-outcome', outcome.id, storage, null, outcome);
  return outcome;
}
export function workflowAction(kind, id, action, details, actor, startupIds, storage = globalThis.localStorage) {
  const state = readWorkspace(storage);
  const record = state[kind]?.find(r => r.id === id);
  if (!record) throw new Error('Record no longer exists.');
  const before = structuredClone(record);
  const staff = ['sga', 'leader'].includes(actor);
  const needsStaff = ['accept', 'reject', 'publish', 'instantiate', 'task', 'complete', 'deliver', 'close'];
  if (needsStaff.includes(action) && !staff) throw new Error('Switch to SGA or Leader to demonstrate this review action.');
  let tasks = [];
  if (kind === 'applications' && action === 'submit' && record.status === 'Draft') record.status = 'Submitted';
  else if (kind === 'applications' && ['accept', 'reject'].includes(action) && record.status === 'Submitted') {
    required(details, ['reason']);
    if (!reviewSummary(state.reviews.filter(r => r.applicationId === id)).count) throw new Error('Record at least one complete human review before a decision.');
    record.status = action === 'accept' ? 'Accepted' : 'Rejected';
    record.decisionReason = details.reason;
    if (action === 'accept') {
      const profile = { id: `app-${id}`, name: record.name, cohort: record.cohort, sector: 'Not recorded', stage: 'Ideation', summary: record.summary, source: record.source, owner: actor, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      if (state.profiles.some(p => p.name.toLowerCase() === profile.name.toLowerCase())) throw new Error('A startup with this name exists. Resolve the duplicate before accepting.');
      state.profiles.unshift(profile);
      record.startupId = profile.id;
    }
  } else if (kind === 'sops' && action === 'publish' && record.status === 'Draft') {
    record.status = 'Published'; record.publishedBy = actor; record.version = record.createdAt;
  } else if (kind === 'sops' && action === 'instantiate' && record.status === 'Published') {
    required(details, ['startupId', 'due']); date(details.due);
    if (!startupIds.includes(details.startupId)) throw new Error('Choose a startup.');
    tasks = record.steps.split('\n').map(s => s.trim()).filter(Boolean).map((title, i) => ({ id: `sop-${id}-${details.startupId}-${i}`, title, startupId: details.startupId, owner: record.owner, due: details.due, sourceId: id }));
  } else if (['sessions', 'requests'].includes(kind) && action === 'task') {
    if (kind === 'requests' && ['Delivered', 'Closed'].includes(record.status)) throw new Error('This request has already been delivered.');
    required(details, ['title', 'owner', 'due']); date(details.due);
    tasks = [{ id: `followup-${kind}-${id}-${encodeURIComponent(details.title.trim().toLowerCase())}`, title: details.title, startupId: record.startupId, owner: details.owner, due: details.due, sourceId: id }];
    if (kind === 'requests') record.status = 'In progress';
  } else if (kind === 'milestones' && action === 'complete' && record.status === 'Planned') {
    required(details, ['reason']); record.status = 'Completed'; record.outcome = details.reason;
  } else if (kind === 'requests' && action === 'deliver' && record.status === 'In progress') {
    required(details, ['url']); record.deliverable = safeUrl(details.url); record.status = 'Delivered';
  } else if (kind === 'requests' && action === 'close' && record.status === 'Delivered') {
    required(details, ['reason']); record.confirmation = details.reason; record.status = 'Closed';
  } else if (kind === 'slots' && action === 'book' && record.status === 'Available') {
    if (!startupIds.includes(details.startupId)) throw new Error('Choose a startup.');
    if (Date.parse(record.start) <= Date.now()) throw new Error('Choose a future slot.');
    record.startupId = details.startupId; record.status = 'Booked';
  } else if (kind === 'slots' && action === 'cancel' && record.status === 'Booked') {
    record.startupId = ''; record.status = 'Available';
  } else throw new Error('This transition is not available. Refresh and check the record status.');
  for (const task of tasks) if (!state.tasks.some(t => t.id === task.id)) state.tasks.unshift({ ...task, assignee: task.owner, status: 'Next', progress: 0, priority: 'Medium', workstream: kind, notes: `Source: ${kind} / ${id}`, createdAt: new Date().toISOString() });
  record.updatedAt = new Date().toISOString();
  commit(state, actor, `${action}:${kind}`, id, storage, before, record);
}
export function mergeTasks(base, workspace, storage = globalThis.localStorage) {
  let saved;
  try { saved = JSON.parse(storage.getItem('usiHubProjectTasks') || 'null'); } catch { saved = null; }
  const existing = Array.isArray(saved) ? saved : base;
  return [...existing, ...workspace.tasks.filter(t => !existing.some(e => e.id === t.id))];
}
export function overlayWorkspace(data, storage = globalThis.localStorage) {
  const state = readWorkspace(storage);
  const startups = [...data.startups];
  for (const profile of state.profiles) {
    const index = startups.findIndex(s => s.id === profile.id);
    const defaults = { risk: 'Unassessed', health: null, missingData: [], sources: [], mentorNeed: [], kpis: [], stageMetrics: [], recommendedSupport: [], linkedDocuments: [], founderNeed: '', nextAction: '', lastCheckIn: '', riskReason: 'Not assessed' };
    const next = { ...defaults, ...(index >= 0 ? startups[index] : {}), ...profile, sources: [profile.source] };
    if (index >= 0) startups[index] = next; else startups.push(next);
  }
  for (let i = 0; i < startups.length; i++) {
    const latest = state.sessions.filter(s => s.startupId === startups[i].id).map(s => s.date).sort().at(-1);
    if (latest && latest > (startups[i].lastCheckIn || '')) startups[i] = { ...startups[i], lastCheckIn: latest };
  }
  const projectTasks = mergeTasks(data.projectTasks, state, storage).map(t => {
    const startupId = t.startupId || data.startups.find(s => s.name === t.startup)?.id;
    return { ...t, startupId, startup: startups.find(s => s.id === startupId)?.name || t.startup || 'Cohort' };
  });
  const documents = [...state.resources.map(r => ({ ...r, type: r.category, source: r.url, startup: 'Platform', tags: [r.category], indexed: 'Partial', evidenceUse: r.description, extractionQuality: 'Metadata only', permissionLevel: 'Program' })), ...data.documents];
  const contacts = [...state.people.map(p => ({ ...p, expertise: p.expertise.split(',').map(v => v.trim()).filter(Boolean), role: p.expertise, sector: 'Cross-sector', type: 'Expert', tags: p.expertise.split(','), focus: p.expertise, notes: p.interaction || '', matchFor: [], availability: 'Not confirmed', contact: '', lastVerified: p.updatedAt, source: 'MVP workspace' })), ...(data.contacts || [])];
  return { ...data, startups, projectTasks, documents, contacts };
}
