import { demoData } from "../../assets/demo-data/demo-data.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getFirebaseServices } from "./firebaseService.js";

const startupProfiles = {
  "venture-alpha": {
    lastCheckIn: "2026-06-09",
    riskReason: "UAV pilots depend on permission, safety framing, and a credible partner; business development capacity is thinner than technical capacity.",
    mentorNeed: ["UAV regulation", "B2B/government sales", "Pilot partnership", "AI dashboard validation"],
    kpis: [
      { label: "Pilot scenarios", value: "10 target" },
      { label: "Regulatory readiness", value: "Low" },
      { label: "Business capacity", value: "Needs mentor" }
    ],
    stageMetrics: [
      { label: "Prototype maturity", value: "Technical roadmap available", source: "Growth roadmap", status: "Recorded" },
      { label: "User testing", value: "Not recorded", source: "No validated user-test log", status: "Data gap" },
      { label: "Feedback loop", value: "Permissioned pilot required", source: "Risk assessment", status: "Action needed" },
      { label: "Validation blocker", value: "Pilot permission and partner", source: "Risk assessment", status: "Action needed" }
    ],
    recommendedSupport: ["Create permission-ready pilot brief", "Match with regulated-tech mentor", "Find university or enterprise pilot partner"]
  },
  "venture-beta": {
    lastCheckIn: "2026-06-08",
    riskReason: "R&D direction is broad; product line, buyer segment, and unit economics need narrowing before GTM support.",
    mentorNeed: ["Product focus", "Unit economics", "Vietnam agriculture supply chain", "Brand positioning"],
    kpis: [
      { label: "Product focus", value: "Unclear" },
      { label: "Buyer interviews", value: "Needed" },
      { label: "Margin model", value: "Missing" }
    ],
    stageMetrics: [
      { label: "Repeat usage", value: "Not recorded", source: "No retention data", status: "Data gap" },
      { label: "Retention signal", value: "Not recorded", source: "No retention data", status: "Data gap" },
      { label: "Revenue traction", value: "Margin model missing", source: "Current KPI record", status: "Action needed" },
      { label: "Segment clarity", value: "Needs narrowing", source: "Risk assessment", status: "Action needed" }
    ],
    recommendedSupport: ["Choose one hero product", "Run 10 buyer interviews", "Build margin and supply stability model"]
  },
  "venture-gamma": {
    lastCheckIn: "2026-06-07",
    riskReason: "Marketplace risk is high because venue supply must be secured before user-side demand can be validated.",
    mentorNeed: ["Marketplace design", "Venue onboarding", "UI/UX", "Sports community activation"],
    kpis: [
      { label: "Venue target", value: "10-15" },
      { label: "MAU", value: "Missing" },
      { label: "Repeat use", value: "Missing" }
    ],
    stageMetrics: [
      { label: "Prototype maturity", value: "One tournament workflow to test", source: "Recommended support", status: "Action needed" },
      { label: "User testing", value: "MAU missing", source: "Current KPI record", status: "Data gap" },
      { label: "Feedback loop", value: "Repeat use missing", source: "Current KPI record", status: "Data gap" },
      { label: "Validation blocker", value: "Venue supply and LOIs", source: "Risk assessment", status: "Action needed" }
    ],
    recommendedSupport: ["Secure venue LOIs", "Define activation metric", "Test one tournament workflow"]
  },
  "venture-epsilon": {
    lastCheckIn: "2026-06-10",
    riskReason: "Lower risk because the problem and GTM path are clearer; scaling risk shifts to onboarding and customer success capacity.",
    mentorNeed: ["B2B SaaS growth", "Customer success", "Partner channel", "Pricing"],
    kpis: [
      { label: "Growth target", value: "200 customers" },
      { label: "Onboarding", value: "Needs productization" },
      { label: "Support capacity", value: "Monitor" }
    ],
    stageMetrics: [
      { label: "Acquisition channel", value: "Partner-led acquisition", source: "Recommended support", status: "Recorded" },
      { label: "Conversion signal", value: "Not recorded", source: "No conversion data", status: "Data gap" },
      { label: "Sales motion", value: "B2B SaaS growth", source: "Mentor need", status: "Recorded" },
      { label: "Unit economics", value: "Not recorded", source: "No unit economics data", status: "Data gap" }
    ],
    recommendedSupport: ["Build onboarding kit", "Create referral channel", "Segment sellers by order volume"]
  },
  "venture-zeta": {
    lastCheckIn: "2026-06-06",
    riskReason: "HealthTech validation requires expert review, target buyer clarity, and careful legal/IP framing.",
    mentorNeed: ["Medical validation", "B2B buyer discovery", "Legal/IP", "Hardware testing"],
    kpis: [
      { label: "Prototype", value: "PoC" },
      { label: "Medical experts", value: "Needed" },
      { label: "Buyer segment", value: "Unclear" }
    ],
    stageMetrics: [
      { label: "Prototype maturity", value: "PoC", source: "Current KPI record", status: "Recorded" },
      { label: "User testing", value: "Medical trainers to interview", source: "Recommended support", status: "Action needed" },
      { label: "Feedback loop", value: "Medical expert review needed", source: "Risk assessment", status: "Action needed" },
      { label: "Validation blocker", value: "Buyer segment and medical claims", source: "Missing data", status: "Action needed" }
    ],
    recommendedSupport: ["Interview CPR trainers", "Clarify buyer segment", "Review IP and medical claims"]
  }
};

let activeData = enrichPlatformData(demoData);
let dataSource = "local-demo";

const collectionMap = {
  startups: "startups",
  documents: "documents",
  projectTasks: "projectTasks",
  questions: "supportNotes",
  aiInsights: "aiInsights",
  sourceSummary: "sourceFiles",
  contacts: "contacts"
};

const orderFields = {
  startups: "name",
  documents: "title",
  projectTasks: "due",
  questions: "title",
  aiInsights: "title",
  sourceSummary: "file",
  contacts: "name"
};

export function getDemoData() {
  return activeData;
}

export function getDataSource() {
  return dataSource;
}

export async function loadPlatformData() {
  try {
    const firestoreData = await fetchFirestoreData();
    activeData = enrichPlatformData(mergeWithFallback(firestoreData));
    dataSource = firestoreData.startups.length ? "firestore" : "local-demo-empty-firestore";
  } catch (error) {
    activeData = enrichPlatformData(demoData);
    dataSource = "local-demo-firestore-unavailable";
  }

  return activeData;
}

export function getStartupById(id) {
  return activeData.startups.find((startup) => startup.id === id) || activeData.startups[0];
}

export function getAtRiskStartups() {
  return activeData.startups.filter((startup) => startup.risk === "High");
}

async function fetchFirestoreData() {
  const { db } = getFirebaseServices();
  const entries = await Promise.all(
    Object.entries(collectionMap).map(async ([key, collectionName]) => {
      try {
        const docs = await fetchCollection(db, collectionName, orderFields[key]);
        return [key, docs];
      } catch (error) {
        console.warn(`Firestore collection unavailable: ${collectionName}`, error);
        return [key, []];
      }
    })
  );

  return Object.fromEntries(entries);
}

async function fetchCollection(db, collectionName, orderField) {
  const ref = collection(db, collectionName);
  const snapshot = await getDocs(query(ref, orderBy(orderField)));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...stripFirestoreMeta(doc.data())
  }));
}

function stripFirestoreMeta(data) {
  const { createdAt, updatedAt, demoSeed, ...rest } = data;
  return rest;
}

function mergeWithFallback(remote) {
  return {
    ...demoData,
    startups: remote.startups.length ? remote.startups : demoData.startups,
    documents: mergeRecords(remote.documents, demoData.documents, (item) => item.title),
    projectTasks: remote.projectTasks.length ? remote.projectTasks : demoData.projectTasks,
    questions: remote.questions.length ? remote.questions : demoData.questions,
    aiInsights: remote.aiInsights.length ? remote.aiInsights : demoData.aiInsights,
    sourceSummary: remote.sourceSummary.length ? remote.sourceSummary : demoData.sourceSummary,
    contacts: mergeRecords(remote.contacts, demoData.contacts, (item) => item.id || item.name)
  };
}

function mergeRecords(remoteRecords, demoRecords, keyOf) {
  const merged = new Map();
  for (const record of demoRecords || []) {
    merged.set(keyOf(record), record);
  }
  for (const record of remoteRecords || []) {
    const key = keyOf(record);
    merged.set(key, { ...merged.get(key), ...record });
  }
  return [...merged.values()];
}

function enrichPlatformData(data) {
  const documentsByStartup = groupDocumentsByStartup(data.documents || []);
  const startups = (data.startups || []).map((startup) => enrichStartup(startup, documentsByStartup[startup.name] || []));
  const projectTasks = (data.projectTasks || []).map((task, index) => enrichTask(task, index));
  const documents = (data.documents || []).map((doc) => enrichDocument(doc));
  const aiProposals = data.aiProposals || buildDemoAiProposals(startups);
  const metrics = buildMetrics(startups, documents, projectTasks, aiProposals);

  return {
    ...data,
    metrics,
    startups,
    projectTasks,
    documents,
    aiProposals,
    dashboard: buildDashboard(startups, documents, projectTasks)
  };
}

function enrichStartup(startup, linkedDocuments) {
  const profile = startupProfiles[startup.id] || {};
  const riskReason = profile.riskReason || inferRiskReason(startup);
  const mentorNeed = profile.mentorNeed || splitNeed(startup.founderNeed);
  const kpis = profile.kpis || buildDefaultKpis(startup);
  const recommendedSupport = profile.recommendedSupport || buildRecommendedSupport(startup);
  const lastCheckIn = profile.lastCheckIn || "2026-06-10";

  return {
    ...startup,
    riskReason,
    mentorNeed,
    kpis,
    stageMetrics: profile.stageMetrics || [],
    recommendedSupport,
    lastCheckIn,
    linkedDocuments: linkedDocuments.map((doc) => ({
      title: doc.title,
      type: doc.type,
      source: doc.source,
      indexed: doc.indexed
    })),
    evidenceSummary: buildEvidenceSummary(startup, linkedDocuments),
    confidence: startup.risk === "High" ? "Medium" : "Medium-high",
    approvalStatus: "approved-demo"
  };
}

function enrichDocument(doc) {
  return {
    extractionQuality: doc.indexed === "Ready" ? "Good metadata; full text pending RAG pipeline" : "Queued for extraction",
    permissionLevel: doc.startup === "Platform" || doc.startup === "Cohort" ? "Program" : "Startup-linked",
    evidenceUse: inferEvidenceUse(doc),
    ...doc
  };
}

function enrichTask(task, index) {
  return {
    id: slug(task.title || `task-${index}`),
    priority: task.status === "Done" ? "Normal" : index % 2 === 0 ? "High" : "Medium",
    workstream: inferWorkstream(task.title),
    notes: task.notes || "Demo task can be moved between columns and progress can be adjusted locally.",
    ...task
  };
}

function buildMetrics(startups, documents, tasks, aiProposals) {
  const atRisk = startups.filter((startup) => startup.risk === "High").length;
  const openTasks = tasks.filter((task) => task.status !== "Done");
  const overdueTasks = openTasks.filter((task) => {
    const dueDate = new Date(`${task.due}T23:59:59`);
    return !Number.isNaN(dueDate.getTime()) && dueDate < new Date();
  }).length;
  const missingData = startups.reduce((sum, startup) => sum + (startup.missingData?.length || 0), 0);
  const staleCheckIns = startups.filter((startup) => {
    if (!startup.lastCheckIn) return true;
    const checkInDate = new Date(`${startup.lastCheckIn}T00:00:00`);
    return Number.isNaN(checkInDate.getTime()) || (Date.now() - checkInDate.getTime()) >= 14 * 24 * 60 * 60 * 1000;
  }).length;

  return [
    { label: "Total startups", value: String(startups.length), note: "Active startup profiles in demo OS" },
    { label: "Startups needing attention", value: String(atRisk), note: "Require SGA/Leader review" },
    { label: "Open support tasks", value: String(openTasks.length), note: "Incubation worklist items not done" },
    { label: "Overdue actions", value: String(overdueTasks), note: "Open tasks past their due date" },
    { label: "Startups overdue for check-in", value: String(staleCheckIns), note: "No update recorded in 14+ days" },
    { label: "Missing information", value: String(missingData), note: "Data items to add" },
    { label: "Profiles ready", value: `${documents.filter((doc) => doc.indexed === "Ready").length}/${documents.length}`, note: "Documents ready to reference" },
    { label: "AI proposals", value: String(aiProposals.filter((proposal) => proposal.approvalStatus === "pending").length), note: "Human approval required before updates" }
  ];
}

function buildDashboard(startups, documents, tasks) {
  return {
    riskDistribution: countBy(startups, "risk"),
    stageDistribution: countBy(startups, "stage"),
    sectorDistribution: countBy(startups, "sector"),
    documentStatus: countBy(documents, "indexed"),
    taskStatus: countBy(tasks, "status"),
    healthRanking: [...startups]
      .sort((a, b) => a.health - b.health)
      .map((startup) => ({ label: startup.name, value: startup.health, risk: startup.risk }))
  };
}

function buildDemoAiProposals(startups) {
  return startups
    .filter((startup) => startup.risk === "High")
    .slice(0, 3)
    .map((startup) => ({
      id: `proposal-${startup.id}-risk-review`,
      startupId: startup.id,
      startupName: startup.name,
      type: "Risk review",
      approvalStatus: "pending",
      proposedChange: `Mark ${startup.name} for SGA review and request missing validation data.`,
      evidence: [startup.riskReason, startup.evidenceSummary],
      sources: startup.sources,
      confidence: startup.confidence,
      nextActions: startup.recommendedSupport.slice(0, 3)
    }));
}

function groupDocumentsByStartup(documents) {
  return documents.reduce((grouped, doc) => {
    grouped[doc.startup] = grouped[doc.startup] || [];
    grouped[doc.startup].push(doc);
    return grouped;
  }, {});
}

function buildEvidenceSummary(startup, documents) {
  const sourceCount = new Set([...(startup.sources || []), ...documents.map((doc) => doc.source)]).size;
  return `${sourceCount} source reference(s): ${(startup.sources || []).slice(0, 2).join("; ") || "No named source"}.`;
}

function inferRiskReason(startup) {
  if (startup.risk === "Unassessed") {
    return "Public UII profile; assessment is required before risk decisions.";
  }
  if (startup.risk === "High") {
    return `${startup.name} is high risk because validation evidence is incomplete: ${(startup.missingData || []).slice(0, 3).join(", ")}.`;
  }
  if (startup.risk === "Medium") {
    return `${startup.name} has medium risk because the roadmap exists but key assumptions still need check-in.`;
  }
  return `${startup.name} is lower risk in this demo because it has clearer traction and support needs.`;
}

function splitNeed(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function buildDefaultKpis(startup) {
  return [
    { label: "Health", value: `${startup.health}/100` },
    { label: "Missing data", value: String(startup.missingData?.length || 0) },
    { label: "Evidence sources", value: String(startup.sources?.length || 0) }
  ];
}

function buildRecommendedSupport(startup) {
  return [
    startup.nextAction,
    `Assign mentor support for ${startup.founderNeed}.`,
    `Request evidence for: ${(startup.missingData || []).slice(0, 2).join(", ")}.`
  ];
}

function inferEvidenceUse(doc) {
  if (doc.type === "Roadmap") return "Startup progress, risks, milestones, and next-action reasoning.";
  if (doc.type === "Pitch deck") return "Market story, product assumptions, traction, and fundraising narrative.";
  if (doc.type === "Cohort data" || doc.type === "CSV") return "Cohort document tracking and data completeness.";
  if (doc.type === "Proposal" || doc.type === "Plan") return "Platform vision, operating model, and stakeholder reporting.";
  return "Knowledge Base reference for USI Intelligence evidence retrieval.";
}

function inferWorkstream(title = "") {
  const lower = title.toLowerCase();
  if (lower.includes("firebase") || lower.includes("rag") || lower.includes("ai")) return "Data / AI";
  if (lower.includes("prototype") || lower.includes("demo")) return "Product";
  if (lower.includes("feedback") || lower.includes("source")) return "Research";
  if (lower.includes("approval")) return "Governance";
  return "Operations";
}

function countBy(items, field) {
  return items.reduce((counts, item) => {
    const key = item[field] || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "item";
}
