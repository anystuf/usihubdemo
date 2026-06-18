import { getDemoData } from "./dataService.js";

export const PLATFORM_ACTION_EVENT = "usi-platform-action-applied";

const storageKeys = {
  projectTasks: "usiHubProjectTasks",
  knowledgeNotes: "usiHubKnowledgeNotes",
  supportNotes: "usiHubSupportNotes",
  auditLog: "usiHubBrainActionLog"
};

export function getProjectTasksWithLocal(baseTasks = []) {
  const saved = readList(storageKeys.projectTasks);
  return saved.length ? saved : baseTasks;
}

export function saveProjectTasks(tasks) {
  writeList(storageKeys.projectTasks, tasks);
  notify("projectTasks");
}

export function resetProjectTasks() {
  localStorage.removeItem(storageKeys.projectTasks);
  notify("projectTasks");
}

export function getDocumentsWithLocal(baseDocuments = []) {
  return [...readList(storageKeys.knowledgeNotes), ...baseDocuments];
}

export function getSupportNotesWithLocal(baseNotes = []) {
  return [...readList(storageKeys.supportNotes), ...baseNotes];
}

export function addSupportNote(note) {
  const notes = readList(storageKeys.supportNotes);
  notes.unshift({
    startup: note.startup || "Program",
    title: note.title || "Internal support note",
    body: note.body || "USI Intelligence drafted this note. Mentor/SGA review is still required.",
    tags: note.tags || ["intelligence-draft", "needs-review"],
    createdBy: "human-demo"
  });
  writeList(storageKeys.supportNotes, notes);
  notify("supportNotes");
}

export function applyPlatformAction(proposal) {
  const action = proposal?.platformAction;
  if (!action) {
    return {
      ok: true,
      message: "Proposal approved for demo review. No platform tool action was attached.",
      targets: []
    };
  }

  const actions = action.type === "batch" ? action.actions || [] : [action];
  const results = actions.map((item) => applySingleAction(item, proposal));
  const targets = results.flatMap((result) => result.targets || []);

  appendAuditLog({
    proposalType: proposal.type || "AI proposal",
    startupName: proposal.startupName || "Program",
    proposedChange: proposal.proposedChange || "",
    targets,
    approvedAt: new Date().toISOString()
  });

  notify("all", { targets });

  return {
    ok: true,
    message: `Applied ${results.length} approved action(s): ${targets.join(", ") || "approval log"}.`,
    targets
  };
}

function applySingleAction(action, proposal) {
  if (action.type === "create_project_task") {
    const savedTasks = readList(storageKeys.projectTasks);
    const tasks = [...(savedTasks.length ? savedTasks : getDemoData().projectTasks)];
    tasks.unshift({
      id: action.id || `brain-task-${Date.now()}`,
      title: action.title || proposal.proposedChange || "Review USI Intelligence proposal",
      assignee: action.assignee || "SGA",
      due: action.due || "2026-06-30",
      status: action.status || "Next",
      progress: Number(action.progress ?? 10),
      priority: action.priority || "High",
      workstream: action.workstream || "AI-assisted operations",
      notes: action.notes || proposal.rationale || "Created after human approval of a USI Intelligence proposal.",
      createdBy: "usi-intelligence-approved"
    });
    writeList(storageKeys.projectTasks, tasks);
    return { targets: ["Incubation Worklist"] };
  }

  if (action.type === "create_knowledge_note") {
    const notes = readList(storageKeys.knowledgeNotes);
    notes.unshift({
      title: action.title || `${proposal.startupName || "Program"} - USI Intelligence note`,
      type: action.documentType || "AI note",
      startup: action.startup || proposal.startupName || "Program",
      tags: action.tags || ["usi-intelligence", "approved-note"],
      indexed: action.indexed || "Partial",
      source: action.source || "USI Intelligence approved proposal",
      evidenceUse: action.evidenceUse || proposal.rationale || "Approved AI note for future Knowledge Base review.",
      extractionQuality: action.extractionQuality || "Human-approved metadata; full text extraction pending.",
      permissionLevel: action.permissionLevel || "Program",
      createdBy: "usi-intelligence-approved"
    });
    writeList(storageKeys.knowledgeNotes, notes);
    return { targets: ["Knowledge Base"] };
  }

  if (action.type === "create_internal_support_note") {
    addSupportNote({
      startup: action.startup || proposal.startupName || "Program",
      title: action.title || `${proposal.startupName || "Program"} support note`,
      body: action.body || proposal.proposedChange || "Review this guidance with a mentor before treating it as official.",
      tags: action.tags || ["usi-intelligence", "approved-note"]
    });
    return { targets: ["Support notes"] };
  }

  return { targets: ["Approval log"] };
}

function appendAuditLog(entry) {
  const log = readList(storageKeys.auditLog);
  log.unshift(entry);
  writeList(storageKeys.auditLog, log.slice(0, 50));
}

function readList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function notify(scope, detail = {}) {
  window.dispatchEvent(new CustomEvent(PLATFORM_ACTION_EVENT, {
    detail: { scope, ...detail }
  }));
}
