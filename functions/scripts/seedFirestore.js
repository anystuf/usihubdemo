const path = require("node:path");
const fs = require("node:fs");
const admin = require("firebase-admin");

const SCHEMA_VERSION = 2;
const PROGRAM_ID = "usi-ip-2025";
const COHORT_ID = "ip-2025";
const VISIBILITY_PUBLIC = "public-demo";

const COLLECTIONS = {
  platformConfig: "platformConfig",
  programs: "programs",
  cohorts: "cohorts",
  startups: "startups",
  documents: "documents",
  projectTasks: "projectTasks",
  contacts: "contacts",
  supportNotes: "supportNotes",
  mentorSessions: "mentorSessions",
  workshops: "workshops",
  aiInsights: "aiInsights",
  aiProposals: "aiProposals",
  sourceFiles: "sourceFiles"
};

async function main() {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "YOUR_FIREBASE_PROJECT_ID"
    });
  }

  const db = admin.firestore();
  const demoData = await loadDemoData();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();
  const counts = {};

  writeDoc(batch, db, COLLECTIONS.platformConfig, "app", {
    name: "USI Hub / UEH Innovation Platform",
    version: "v2-demo",
    environment: "prototype",
    defaultProgramId: PROGRAM_ID,
    publicReadCollections: [
      "platformConfig",
      "programs",
      "cohorts",
      "startups",
      "documents",
      "projectTasks",
      "contacts",
      "supportNotes",
      "aiInsights",
      "sourceFiles",
      "workshops"
    ]
  }, now);

  writeDoc(batch, db, COLLECTIONS.platformConfig, "taxonomy", buildTaxonomy(), now);
  writeDoc(batch, db, COLLECTIONS.platformConfig, "demoSeed", {
    version: "v2-demo",
    source: "functions/scripts/seedFirestore.js",
    collections: Object.values(COLLECTIONS)
  }, now);

  writeDoc(batch, db, COLLECTIONS.programs, PROGRAM_ID, {
    name: "USI Innovation Program 2025",
    code: "IP 2025",
    year: 2025,
    status: "demo",
    ownerTeam: "USI / UEH Innovation Platform",
    description: "Demo incubation program for startup operating system, knowledge base, and USI Intelligence prototype."
  }, now, counts);

  writeDoc(batch, db, COLLECTIONS.cohorts, COHORT_ID, {
    programId: PROGRAM_ID,
    name: "Incubation Program 2025",
    year: 2025,
    status: "demo",
    startDate: "2025-08-01",
    endDate: "2026-01-31",
    startupCount: demoData.startups.length
  }, now, counts);

  const startupIdByName = Object.fromEntries(demoData.startups.map((startup) => [startup.name, startup.id]));

  demoData.startups.forEach((startup) => {
    writeDoc(batch, db, COLLECTIONS.startups, startup.id, normalizeStartup(startup), now, counts);
  });

  demoData.documents.forEach((document) => {
    const startupId = startupIdByName[document.startup] || slug(document.startup);
    writeDoc(batch, db, COLLECTIONS.documents, slug(document.title), normalizeDocument(document, startupId), now, counts);
  });

  demoData.projectTasks.forEach((task) => {
    writeDoc(batch, db, COLLECTIONS.projectTasks, slug(task.title), normalizeTask(task), now, counts);
  });

  (demoData.contacts || []).forEach((contact) => {
    writeDoc(batch, db, COLLECTIONS.contacts, slug(contact.name), normalizeContact(contact), now, counts);
  });

  (demoData.questions || []).forEach((question, index) => {
    const startupId = startupIdByName[question.startup] || slug(question.startup);
    writeDoc(batch, db, COLLECTIONS.supportNotes, `${startupId}-${index + 1}`, normalizeSupportNote(question, startupId), now, counts);
  });

  demoData.aiInsights.forEach((insight) => {
    writeDoc(batch, db, COLLECTIONS.aiInsights, slug(insight.title), normalizeInsight(insight), now, counts);
  });

  demoData.sourceSummary.forEach((source) => {
    writeDoc(batch, db, COLLECTIONS.sourceFiles, slug(source.file), normalizeSourceFile(source), now, counts);
  });

  buildMentorSessions().forEach((session) => {
    writeDoc(batch, db, COLLECTIONS.mentorSessions, session.id, session, now, counts);
  });

  buildWorkshops().forEach((workshop) => {
    writeDoc(batch, db, COLLECTIONS.workshops, workshop.id, workshop, now, counts);
  });

  buildAiProposals().forEach((proposal) => {
    writeDoc(batch, db, COLLECTIONS.aiProposals, proposal.id, proposal, now, counts);
  });

  await batch.commit();

  console.log("Seeded organized Firestore demo data:");
  Object.entries(counts).forEach(([collection, count]) => {
    console.log(`- ${collection}: ${count}`);
  });
}

async function loadDemoData() {
  const demoPath = path.resolve(__dirname, "../../public/assets/demo-data/demo-data.js");
  const source = fs.readFileSync(demoPath, "utf8");
  const objectSource = source
    .replace(/^export\s+const\s+demoData\s*=\s*/, "")
    .replace(/;\s*$/, "");

  return Function(`"use strict"; return (${objectSource});`)();
}

function writeDoc(batch, db, collectionName, docId, data, now, counts) {
  batch.set(db.collection(collectionName).doc(docId), {
    schemaVersion: SCHEMA_VERSION,
    programId: data.programId || PROGRAM_ID,
    visibility: data.visibility || VISIBILITY_PUBLIC,
    demoSeed: true,
    ...data,
    updatedAt: now,
    createdAt: now
  }, { merge: true });

  if (counts) {
    counts[collectionName] = (counts[collectionName] || 0) + 1;
  }
}

function normalizeStartup(startup) {
  return {
    ...startup,
    slug: startup.id,
    programId: PROGRAM_ID,
    cohortId: COHORT_ID,
    riskLevel: startup.risk,
    healthScore: startup.health,
    sourceDocumentIds: startup.sources.map(slug),
    approvalStatus: "approved-demo",
    lastReviewStatus: startup.risk === "High" ? "needs-review" : "monitor",
    vietnamContextTags: inferVietnamContextTags(startup)
  };
}

function normalizeDocument(document, startupId) {
  return {
    ...document,
    programId: PROGRAM_ID,
    cohortId: COHORT_ID,
    startupId,
    indexedStatus: document.indexed,
    extractionStatus: document.indexed === "Ready" ? "metadata-ready" : "queued",
    permissionLevel: "program",
    storagePath: `programs/${PROGRAM_ID}/documents/${slug(document.source)}`
  };
}

function normalizeTask(task) {
  return {
    ...task,
    programId: PROGRAM_ID,
    priority: task.priority || (task.status === "Done" ? "normal" : "high"),
    workstream: task.workstream || inferWorkstream(task.title),
    summary: `${task.assignee} owns this ${task.status.toLowerCase()} task.`
  };
}

function normalizeContact(contact) {
  return {
    ...contact,
    programId: PROGRAM_ID,
    cohortId: COHORT_ID,
    availabilityStatus: contact.availability || "Demo availability",
    matchStartupIds: (contact.matchFor || []).map(slug)
  };
}

function normalizeSupportNote(question, startupId) {
  return {
    title: question.question,
    body: question.answer,
    startup: question.startup,
    tags: question.tags || [],
    programId: PROGRAM_ID,
    cohortId: COHORT_ID,
    startupId,
    ownerRole: "sga",
    status: "approved-demo",
    approvedKnowledgeBaseEntryId: null
  };
}

function normalizeInsight(insight) {
  return {
    ...insight,
    programId: PROGRAM_ID,
    severity: insight.title.toLowerCase().includes("risk") ? "high" : "medium",
    sourceDocumentIds: []
  };
}

function normalizeSourceFile(source) {
  return {
    ...source,
    programId: PROGRAM_ID,
    category: inferSourceCategory(source.file),
    linkedStartupId: inferStartupId(source.file)
  };
}

function buildTaxonomy() {
  return {
    riskLevels: ["Low", "Medium", "High"],
    stages: ["Pitch", "PoC / MVP", "Market validation", "Beta launch", "Launch / early growth", "Growth roadmap"],
    roles: ["admin", "leader", "sga", "program", "mentor", "trainer", "founder", "alumni"],
    documentTypes: ["Proposal", "Plan", "Cohort data", "CSV", "Roadmap", "Pitch deck", "Slides"],
    aiProposalStatuses: ["pending", "approved", "rejected", "needs-revision"],
    vietnamContextTags: ["regulation", "customer behavior", "local mentors", "local investors", "grants", "market validation", "ecosystem partners"]
  };
}

function buildMentorSessions() {
  return [
    {
      id: "venture-alpha-uav-regulatory-brief",
      programId: PROGRAM_ID,
      cohortId: COHORT_ID,
      startupId: "venture-alpha",
      mentorName: "Regulated Technology Mentor",
      mentorRole: "Legal / UAV advisor",
      sessionType: "mentor-review",
      date: "2026-06-18",
      status: "planned",
      brief: "Clarify Vietnam UAV pilot constraints and partner pathway.",
      notes: "",
      actionItems: ["Prepare pilot risk brief", "List possible university or enterprise partners"],
      sourceDocumentIds: ["venture-alpha-ip-2025-incubatee-growth-roadmap-pdf"]
    },
    {
      id: "venture-epsilon-growth-playbook",
      programId: PROGRAM_ID,
      cohortId: COHORT_ID,
      startupId: "venture-epsilon",
      mentorName: "B2B SaaS Growth Mentor",
      mentorRole: "Growth / customer success",
      sessionType: "mentor-review",
      date: "2026-06-20",
      status: "planned",
      brief: "Design partner-led onboarding and referral growth motion.",
      notes: "",
      actionItems: ["Segment stores by order volume", "Draft onboarding checklist"],
      sourceDocumentIds: ["venture-epsilon-incubatee-growth-roadmap-pdf"]
    }
  ];
}

function buildWorkshops() {
  return [
    {
      id: "vietnam-market-validation",
      programId: PROGRAM_ID,
      cohortId: COHORT_ID,
      title: "Vietnam Market Validation Sprint",
      topic: "Customer discovery and willingness-to-pay",
      trainerName: "USI Program Team",
      date: "2026-06-22",
      status: "planned",
      linkedDocumentIds: ["cohort-2025-orientation-slides"],
      feedbackSummary: "Demo workshop record for future attendance and feedback tracking."
    },
    {
      id: "rag-ready-document-practice",
      programId: PROGRAM_ID,
      cohortId: COHORT_ID,
      title: "RAG-ready Startup Documentation",
      topic: "How founders should submit evidence for USI Intelligence",
      trainerName: "Data / IT Team",
      date: "2026-06-25",
      status: "planned",
      linkedDocumentIds: ["innovation-platform-proposal"],
      feedbackSummary: "Prototype session to improve document quality before indexing."
    }
  ];
}

function buildAiProposals() {
  return [
    {
      id: "proposal-review-venture-beta-risk",
      programId: PROGRAM_ID,
      startupId: "venture-beta",
      type: "risk-review",
      prompt: "Which startup is at risk?",
      answer: "Venture Beta should be reviewed because product focus, unit economics, and buyer evidence are missing.",
      evidence: ["Venture Beta roadmap exists but product line and validation data need review."],
      sources: ["Redacted Venture Beta Roadmap.pdf"],
      confidence: "Medium",
      missingData: ["Unit economics", "Target buyer segment", "Supply stability"],
      nextActions: ["Schedule SGA review", "Ask founder for 30-day validation plan"],
      approvalStatus: "pending",
      createdBy: "seed-script"
    }
  ];
}

function inferWorkstream(title) {
  const lower = title.toLowerCase();
  if (lower.includes("firebase") || lower.includes("rag")) return "data-ai";
  if (lower.includes("demo") || lower.includes("prototype")) return "product";
  if (lower.includes("source") || lower.includes("feedback")) return "research";
  return "operations";
}

function inferSourceCategory(file) {
  const lower = file.toLowerCase();
  if (lower.includes("roadmap")) return "startup-roadmap";
  if (lower.includes("pitch")) return "pitch-deck";
  if (lower.includes("cohort")) return "cohort-data";
  if (lower.includes("proposal") || lower.includes("plan")) return "strategy";
  if (lower.includes("html")) return "prototype-reference";
  return "reference";
}

function inferStartupId(file) {
  const lower = file.toLowerCase();
  const names = ["venture-alpha", "venture-beta", "venture-gamma", "venture-delta", "venture-epsilon", "venture-zeta", "air", "study", "venture-iota"];
  const found = names.find((name) => lower.includes(name));
  if (!found) return null;
  if (found === "air") return "venture-eta";
  if (found === "study") return "venture-theta";
  return found;
}

function inferVietnamContextTags(startup) {
  const text = `${startup.sector} ${startup.summary} ${startup.founderNeed}`.toLowerCase();
  const tags = ["market validation"];
  if (text.includes("uav") || text.includes("medical") || text.includes("health")) tags.push("regulation");
  if (text.includes("ecommerce") || text.includes("consumer") || text.includes("edtech")) tags.push("customer behavior");
  if (text.includes("mentor")) tags.push("local mentors");
  if (text.includes("agri") || text.includes("biomass")) tags.push("ecosystem partners");
  return [...new Set(tags)];
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "item";
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
