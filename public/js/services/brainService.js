import { getDemoData, getAtRiskStartups, getStartupById } from "./dataService.js";
import {
  getLinkedDocuments,
  parseFounderNeeds,
  getStartupStats,
} from "../utils/startupLookup.js";
import {
  buildRiskSpecificEvidence,
  buildMentorMatchEvidence,
  buildGrowthSupportEvidence,
  assessDataConfidence,
  buildRiskComparativeEvidence,
  buildGapEvidence,
  buildFounderNeedEvidence,
  generateStartupSummary,
} from "../utils/evidenceBuilder.js";
import {
  assessHealthScore,
  assessRiskLevel,
  buildRubricExplanation,
  healthScoreRubric,
  riskLevelRubric,
} from "../utils/startupScoringRubric.js";

const intentKeywords = {
  help: ["how to use", "use usi brain", "help", "guide", "huong dan", "cach dung"],
  risk: ["risk", "at risk", "risky", "high-risk", "nguy co", "rui ro", "problem", "blocker"],
  mentor: ["mentor", "advisor", "trainer", "co van", "support", "need"],
  growth: ["grow", "growth", "scale", "customer", "khach hang", "gtm", "go-to-market"],
  brief: ["brief", "meeting", "summary", "tom tat", "niion brief", "generate"],
  missing: ["missing", "thieu", "data", "evidence", "gap"],
  documents: ["document", "source", "file", "knowledge", "tai lieu"]
};

export async function generateBrainResponse(prompt) {
  const data = getDemoData();
  const normalized = prompt.toLowerCase();
  const startup = findStartup(normalized, data.startups);
  const intent = detectIntent(normalized);

  if (intent === "help") return buildUsageAnswer(data);
  if (intent === "risk" && !startup) return buildRiskAnswer(data);
  if (intent === "mentor" && !startup) return buildMentorPortfolioAnswer(data);
  if (intent === "missing" && !startup) return buildPortfolioMissingDataAnswer(data);
  if (intent === "mentor" && startup) return buildMentorAnswer(startup);
  if (intent === "growth" && startup) return buildGrowthAnswer(startup);
  if (intent === "brief" && startup) return buildBriefAnswer(startup);
  if (intent === "missing" && startup) return buildMissingDataAnswer(startup);
  if (intent === "documents" && startup) return buildDocumentAnswer(startup);
  if (startup) return buildStartupOverviewAnswer(startup);

  return buildGeneralAnswer(data, prompt);
}

export function buildAiProposalFromResponse(response, prompt) {
  return response.proposedUpdate || buildProposal({
    type: "Knowledge follow-up",
    startupName: "Program",
    proposedChange: `Create a reviewed knowledge note from the prompt: "${prompt}".`,
    rationale: "USI Brain found a useful question but needs SGA review before updating official records."
  });
}

function buildRiskAnswer(data) {
  const atRisk = getAtRiskStartups();

  if (!atRisk || atRisk.length === 0) {
    return {
      answer: "No high-risk startups are identified in the current demo data. Continue monitoring for changes.",
      evidence: [
        "All startups currently at Low or Medium risk based on scoring rubric",
        `Rubric sources: Product validation maturity, traction evidence, team capability, market fit clarity`,
        "Regular health checks ensure early detection if signals shift"
      ],
      sources: ["Startup Scoring Rubric - Risk Assessment Framework"],
      confidence: "High",
      missingData: [],
      nextActions: [
        "Continue bi-weekly health monitoring",
        "Schedule next cohort review in 2 weeks"
      ],
      proposedUpdate: buildProposal({
        type: "Risk monitor",
        startupName: "Cohort",
        proposedChange: "Maintain current risk labels and continue bi-weekly monitoring.",
        rationale: "No high-risk profiles present. Risk framework shows cohort is stable but requires ongoing validation tracking."
      })
    };
  }

  // Build detailed risk evidence with rubric
  const riskDetails = atRisk.map((startup) => {
    const riskAssessment = assessRiskLevel(startup);
    const healthAssessment = assessHealthScore(startup);
    return {
      startup,
      riskAssessment,
      healthAssessment,
      baseEvidence: buildRiskSpecificEvidence(startup, data.documents)
    };
  });

  // Build rich answer with specific recommendations
  const answerLines = [
    `${atRisk.length} startup(s) show high-risk signals: ${atRisk.map((s) => `${s.name} (Health: ${s.health}/100)`).join(", ")}.`,
    "",
    "Key risk drivers:"
  ];

  const allEvidence = [];
  const allMissingData = new Set();

  riskDetails.forEach(({ startup, riskAssessment, baseEvidence }) => {
    // Add rubric-based evidence
    answerLines.push(`• ${startup.name}: ${riskAssessment.signals.slice(0, 2).map((s) => s.signal).join("; ")}`);

    // Collect evidence with source attribution
    allEvidence.push(`${startup.name} Risk Assessment: ${riskAssessment.level} (${riskAssessment.signals.length} risk signals identified)`);
    baseEvidence.signals?.forEach((signal) => {
      allEvidence.push(`  — ${signal}`);
    });

    startup.missingData?.forEach((item) => allMissingData.add(item));
  });

  const confidence = assessDataConfidence(atRisk[0]);

  return {
    answer: answerLines.join("\n"),
    evidence: [
      "Risk assessment based on: Product validation maturity, team capability, market competition, GTM clarity, Vietnam context fit, and data completeness",
      ...allEvidence.slice(0, 8)
    ],
    sources: unique(
      atRisk.flatMap((s) => s.sources || []).concat("Startup Scoring Rubric - Risk Level Framework")
    ),
    confidence: confidence.confidence,
    missingData: Array.from(allMissingData).slice(0, 6),
    nextActions: [
      "Schedule individual founder validation reviews for each high-risk startup",
      "Collect specific missing data before next mentor session",
      "Create focused mentoring sprint on validation and team building"
    ],
    proposedUpdate: buildProposal({
      type: "High-risk cohort review",
      startupName: atRisk.map((s) => s.name).join(", "),
      proposedChange: `Create focused SGA review tasks for ${atRisk.map((s) => s.name).join(", ")} and assign validation mentors`,
      rationale: `These startups show multiple risk signals per scoring rubric. Intensive mentor support and validation tracking needed before next milestone.`
    })
  };
}

function buildMentorAnswer(startup) {
  const data = getDemoData();
  const mentorEvidence = buildMentorMatchEvidence(startup, data.documents);
  const riskAssessment = assessRiskLevel(startup);
  const healthAssessment = assessHealthScore(startup);
  const primaryNeed = mentorEvidence.primaryNeed;
  const secondaryNeeds = mentorEvidence.mentorNeeds.slice(1, 3);

  return {
    answer: `${startup.name} needs primary mentor support in **${primaryNeed}**${secondaryNeeds.length ? ` plus ${secondaryNeeds.join(", ")}` : ""}.\n\nContext: Health ${startup.health}/100, ${riskAssessment.level} risk. ${riskAssessment.signals?.[0]?.signal || "Standard support track."}`,
    evidence: [
      `Health Assessment: ${healthAssessment.score}/100 - ${healthAssessment.factors.map((f) => `${f.factor} (${f.level})`).join(", ")}`,
      `Risk Signals: ${riskAssessment.signals.slice(0, 3).map((s) => s.signal).join("; ")}`,
      `Primary Need: ${primaryNeed} (from founder profile and traction stage)`,
      ...mentorEvidence.evidence.slice(0, 3)
    ],
    sources: unique([...( startup.sources || []), "Startup Scoring Rubric - Health & Risk Assessment"]),
    confidence: assessDataConfidence(startup).confidence,
    missingData: startup.missingData || [],
    nextActions: [
      `1. Match mentor experienced in: ${primaryNeed}`,
      `2. Prepare one-pager on ${startup.name}'s stage, validation needs, and health signals`,
      `3. Schedule 2-week check-in to assess mentor fit and ${primaryNeed} progress`,
      ...(secondaryNeeds.length ? [`4. Plan secondary mentoring path after ${primaryNeed} stabilizes`] : [])
    ],
    proposedUpdate: buildProposal({
      type: "Mentor match",
      startupName: startup.name,
      proposedChange: `Set primary mentor need to "${primaryNeed}" and queue for mentor matching based on: Health ${healthAssessment.score}/100, ${riskAssessment.level} risk, stage ${startup.stage}`,
      rationale: `${startup.name} shows clear need for ${primaryNeed} support. Rubric assessment indicates this will unlock growth and reduce risk signals.`
    })
  };
}

function buildMentorPortfolioAnswer(data) {
  const priority = [...data.startups]
    .sort((a, b) => {
      const riskScore = { High: 0, Medium: 1, Low: 2 };
      return riskScore[a.risk] - riskScore[b.risk] || a.health - b.health;
    })
    .slice(0, 5);

  return {
    answer: `Mentor priority should start with ${priority.map((startup) => startup.name).join(", ")}. Highest urgency: NIION for product focus/unit economics, Onto for venue marketplace validation, and EmerGeniZ for medical validation plus legal/IP framing.`,
    evidence: priority.map((startup) => `${startup.name}: ${startup.risk} risk, health ${startup.health}/100, needs ${(startup.mentorNeed || parseFounderNeeds(startup.founderNeed)).slice(0, 2).join(", ")}.`),
    sources: unique(priority.flatMap((startup) => startup.sources || [])),
    confidence: "Medium-high",
    missingData: unique(priority.flatMap((startup) => startup.missingData || [])).slice(0, 7),
    nextActions: [
      "Assign one mentor owner to each high-risk startup.",
      "Ask mentors to log first-session notes in Knowledge Base.",
      "Review mentor fit again after missing data is collected."
    ],
    proposedUpdate: buildProposal({
      type: "Mentor allocation",
      startupName: "Cohort",
      proposedChange: "Prioritize mentor matching for NIION, Onto, and EmerGeniZ before lower-risk startups.",
      rationale: "They carry the strongest combination of high risk, missing data, and validation-stage uncertainty."
    })
  };
}

function buildGrowthAnswer(startup) {
  const data = getDemoData();
  const growthEvidence = buildGrowthSupportEvidence(startup, data.documents);
  const healthAssessment = assessHealthScore(startup);
  const riskAssessment = assessRiskLevel(startup);
  const primaryBlocker = growthEvidence.blockers[0] || startup.recommendedSupport?.[0] || "a narrower validation milestone";
  const secondaryBlockers = growthEvidence.blockers.slice(1, 2);

  return {
    answer: `${startup.name}'s growth path should focus on **${primaryBlocker.toLowerCase()}**${secondaryBlockers.length ? ` and ${secondaryBlockers[0].toLowerCase()}` : ""}.\n\n${growthEvidence.healthContext}`,
    evidence: [
      `Health Score: ${healthAssessment.score}/100 - Growth readiness assessment complete`,
      `Current Risk Profile: ${riskAssessment.level} - ${riskAssessment.signals.slice(0, 2).map((s) => s.signal).join("; ")}`,
      `Growth Blocker: ${primaryBlocker}`,
      ...growthEvidence.evidence.slice(0, 3)
    ],
    sources: unique([...(startup.sources || []), "Startup Scoring Rubric - Health Factor Analysis"]),
    confidence: assessDataConfidence(startup).confidence,
    missingData: startup.missingData || [],
    nextActions: [
      `IMMEDIATE: ${primaryBlocker}`,
      ...secondaryBlockers.map((blocker) => `THEN: ${blocker}`),
      ...((startup.recommendedSupport || []).slice(0, 1).map((support) => `SUPPORT: ${support}`)),
      "MEASURE: Define success metrics before executing sprint"
    ].slice(0, 5),
    proposedUpdate: buildProposal({
      type: "Growth support plan",
      startupName: startup.name,
      proposedChange: `Activate growth support sprint: Focus on ${primaryBlocker.toLowerCase()}. Health-based priority: ${healthAssessment.score < 50 ? "FUNDAMENTALS" : "SCALING"}.`,
      rationale: `${startup.name}'s scoring rubric shows ${primaryBlocker} is the highest-impact next step given health score ${healthAssessment.score}/100 and current risk level ${riskAssessment.level}.`
    })
  };
}

function buildBriefAnswer(startup) {
  const data = getDemoData();
  const mentorEvidence = buildMentorMatchEvidence(startup, data.documents);
  const healthAssessment = assessHealthScore(startup);
  const riskAssessment = assessRiskLevel(startup);
  const confidence = assessDataConfidence(startup);

  return {
    answer: `**${startup.name} Meeting Brief**\n\nStage: ${startup.stage} | Sector: ${startup.sector} | Health: ${startup.health}/100 | Risk: ${riskAssessment.level}\n\n**Primary focus**: ${mentorEvidence.primaryNeed}\n**Opening**: ${startup.nextAction || "Roadmap alignment and validation progress"}`,
    evidence: [
      `Health Score: ${healthAssessment.score}/100 (${healthAssessment.factors.map((f) => f.factor).join(", ")})`,
      `Risk Assessment: ${riskAssessment.level} - ${riskAssessment.signals.slice(0, 2).map((s) => s.signal).join("; ")}`,
      generateStartupSummary(startup),
      `Traction: ${startup.traction || "Early validation phase"}`,
      ...mentorEvidence.evidence.slice(0, 2),
      confidence.dataCompleteness
    ],
    sources: unique([...(startup.sources || []), "Startup Scoring Rubric"]),
    confidence: confidence.confidence,
    missingData: (startup.missingData || []).slice(0, 4),
    nextActions: [
      `OPEN: ${startup.nextAction || "Program context and roadmap alignment"}`,
      `REQUEST: ${(startup.missingData || []).slice(0, 1).join(", ") || "key validation assumptions"}`,
      `ASSIGN: One mentor match (${mentorEvidence.primaryNeed}) and one measurable milestone`,
      "CLOSE: Agreement on next validation checkpoint"
    ],
    proposedUpdate: buildProposal({
      type: "Meeting brief",
      startupName: startup.name,
      proposedChange: `Create and review meeting brief for ${startup.name}: Stage ${startup.stage}, Health ${healthAssessment.score}/100, Risk ${riskAssessment.level}, Focus ${mentorEvidence.primaryNeed}`,
      rationale: "The brief supports SGA/mentor preparation and ensures aligned focus. Scorecard-based assessment ensures consistent evaluation."
    })
  };
}

function buildMissingDataAnswer(startup) {
  if (!startup.missingData || startup.missingData.length === 0) {
    return {
      answer: `${startup.name} appears to have complete data coverage in the current Knowledge Base. Continue monitoring.`,
      evidence: [
        "No critical data gaps identified in current profile per scoring rubric",
        `All key rubric factors covered: Health, Risk, Traction, Team, Market Fit`
      ],
      sources: startup.sources || [],
      confidence: "High",
      missingData: [],
      nextActions: ["Continue to collect mentor notes and traction updates.", "Schedule next assessment in 2 weeks."],
      proposedUpdate: buildProposal({
        type: "Data status",
        startupName: startup.name,
        proposedChange: "Maintain data completeness status; no urgent data collection needed.",
        rationale: "Current profile is complete per scoring rubric. Continue monitoring for emerging gaps."
      })
    };
  }

  const confidence = assessDataConfidence(startup);
  const healthAssessment = assessHealthScore(startup);

  return {
    answer: `${startup.name} is missing **${startup.missingData.length}** critical data point(s): ${startup.missingData.slice(0, 3).join(", ")}.${startup.missingData.length > 3 ? ` and ${startup.missingData.length - 3} more.` : ""}\n\nThis limits confidence in support decisions to ${confidence.confidence.toLowerCase()}.`,
    evidence: [
      `Data Completeness: ${startup.missingData.length} gaps (rubric expects 0-2)`,
      `Health Score: ${healthAssessment.score}/100 - Limited by incomplete data factors`,
      `Current sources: ${startup.sources ? startup.sources.join("; ") : "Profile data only"}`,
      `Confidence impact: Each missing data point reduces decision confidence by ~${Math.round(100 / (startup.missingData.length || 1))}%`,
      ...buildGapEvidence(startup)
    ],
    sources: unique([...(startup.sources || []), "Startup Scoring Rubric - Data Completeness Framework"]),
    confidence: confidence.confidence,
    missingData: startup.missingData,
    nextActions: [
      ...startup.missingData.slice(0, 3).map((item) => `REQUEST FROM FOUNDER: ${item}`),
      "TIMELINE: Complete by next mentor session (2 weeks)",
      "Then: Re-run USI Brain for updated risk/health assessment"
    ],
    proposedUpdate: buildProposal({
      type: "Data collection sprint",
      startupName: startup.name,
      proposedChange: `Request missing data: ${startup.missingData.slice(0, 3).join(", ")}.`,
      rationale: `Per scoring rubric, these gaps limit confidence in mentor matching and risk assessment. Collecting data will improve decision quality.`
    })
  };
}

function buildPortfolioMissingDataAnswer(data) {
  const gaps = data.startups
    .map((startup) => ({ startup, count: startup.missingData?.length || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    answer: `The largest missing-data gaps are concentrated in ${gaps.map(({ startup }) => startup.name).join(", ")}. Collect these before using risk scores for formal decisions.`,
    evidence: gaps.map(({ startup, count }) => `${startup.name}: ${count} missing fields - ${(startup.missingData || []).slice(0, 3).join(", ")}.`),
    sources: unique(gaps.flatMap(({ startup }) => startup.sources || [])),
    confidence: "Medium-high",
    missingData: unique(gaps.flatMap(({ startup }) => startup.missingData || [])).slice(0, 8),
    nextActions: [
      "Turn each top gap into a founder data request.",
      "Attach uploaded evidence to the linked startup profile.",
      "Re-run USI Brain after documents are indexed."
    ],
    proposedUpdate: buildProposal({
      type: "Data completeness sprint",
      startupName: "Cohort",
      proposedChange: "Open a one-week data completeness sprint for the five startups with the most missing fields.",
      rationale: "Better evidence improves mentor matching, risk review, and Vietnam-context support planning."
    })
  };
}

function buildDocumentAnswer(startup) {
  const data = getDemoData();
  const linked = getLinkedDocuments(startup.id || startup.name, data.documents);
  const documentCount = linked.length || (startup.sources?.length || 0);

  return {
    answer: `${startup.name} has ${documentCount || 0} relevant source reference(s) in the Knowledge Base.`,
    evidence: linked.length
      ? linked.map((doc) => `${doc.title}: ${doc.type}, ${doc.indexed} indexing`)
      : startup.sources
      ? startup.sources.map((source) => `${source}: startup reference`)
      : ["No indexed documents found"],
    sources: startup.sources || [],
    confidence: linked.length ? "Medium-high" : "Medium",
    missingData: linked.length ? ["Full text extraction for RAG is pending."] : ["Document metadata"],
    nextActions: [
      "Verify document permission levels.",
      "Queue sources for text extraction.",
      "Link extracted evidence to future AI answers."
    ],
    proposedUpdate: buildProposal({
      type: "Knowledge Base indexing",
      startupName: startup.name,
      proposedChange: `Queue ${startup.name} sources for full-text extraction and RAG evidence linking.`,
      rationale: "Current demo uses metadata and source names; full text extraction is needed before production RAG."
    })
  };
}

function buildStartupOverviewAnswer(startup) {
  const mentorEvidence = buildMentorMatchEvidence(startup, getDemoData().documents);
  const confidence = assessDataConfidence(startup);

  return {
    answer: `${startup.name} is at ${startup.stage} in ${startup.sector}. Current health is ${startup.health}/100 with ${startup.risk} risk. Nearest support need: ${mentorEvidence.primaryNeed}.`,
    evidence: [
      generateStartupSummary(startup),
      ...buildFounderNeedEvidence(startup).slice(0, 2),
      confidence.dataCompleteness
    ],
    sources: startup.sources || [],
    confidence: confidence.confidence,
    missingData: startup.missingData || [],
    nextActions: [
      `Primary need: ${mentorEvidence.primaryNeed}`,
      `Suggested action: ${startup.nextAction || "Review roadmap and define next milestone"}`
    ],
    proposedUpdate: buildProposal({
      type: "Startup OS note",
      startupName: startup.name,
      proposedChange: `Add next support note: ${startup.nextAction || mentorEvidence.primaryNeed}.`,
      rationale: `${startup.name}'s profile has enough evidence for a proposed SGA follow-up, not an automatic dashboard update.`
    })
  };
}

function buildUsageAnswer(data) {
  const stats = getStartupStats(data.startups);

  return {
    answer: `Use USI Brain like an SGA co-pilot: ask one concrete question about risk, mentor fit, growth, missing data, documents, or a meeting brief. It will answer from the demo Startup OS and Knowledge Base, then create a proposed update for human approval. Current demo covers ${stats.total} startups and flags ${stats.highRiskCount} high-risk profiles.`,
    evidence: [
      "Startup OS contains profile, risk, health, founder needs, missing data, and linked source references.",
      "Knowledge Base tracks roadmap, pitch deck, cohort, and platform documents.",
      "Guardrail: USI Brain can propose updates only; SGA/Leader approval is required before dashboard data changes."
    ],
    sources: ["Startup OS demo profiles", "Knowledge Base demo documents", "USI Brain guardrails"],
    confidence: "High",
    missingData: ["Live mentor notes", "Full document text extraction", "Production approval log"],
    nextActions: [
      "Try: Which startup is at risk?",
      "Try: What mentor does Skyholic need?",
      "Try: How can Ecombox grow?",
      "Try: Generate NIION brief"
    ],
    proposedUpdate: buildProposal({
      type: "Demo workflow note",
      startupName: "Program",
      proposedChange: "Add USI Brain usage guidance to onboarding for SGAs and mentors.",
      rationale: "Users need a clear workflow: ask, inspect evidence, review missing data, then approve or reject proposed updates."
    })
  };
}

function buildGeneralAnswer(data, prompt) {
  const stats = getStartupStats(data.startups);

  return {
    answer: `I can help with startup risk analysis, mentor matching, growth support, meeting briefs, data assessment, and source lookup. Current demo has ${stats.total} startups (${stats.highRiskCount} high-risk), average health ${stats.avgHealth}/100.`,
    evidence: [
      "Startup OS tracks health, risk, founder needs, missing data, and validation status.",
      "Knowledge Base contains roadmaps, pitch decks, and protocol references.",
      "Try prompts like: Which startup is at risk? What mentor does Skyholic need? How can Ecombox grow?"
    ],
    sources: ["Startup profiles", "Demo data", "AI analysis framework"],
    confidence: "Medium",
    missingData: ["Live KPI updates", "Mentor notes", "Full PDF extraction"],
    nextActions: [
      "Ask about a specific startup",
      "Try one of the suggested prompts",
      "Share feedback on answer quality"
    ],
    proposedUpdate: buildProposal({
      type: "Knowledge follow-up",
      startupName: "Program",
      proposedChange: `Create a reviewed knowledge note from the prompt: "${prompt}".`,
      rationale: "The prompt may be useful for the support playbook, but official knowledge updates require human review."
    })
  };
}

function detectIntent(normalizedPrompt) {
  return Object.entries(intentKeywords).find(([, keywords]) => keywords.some((keyword) => normalizedPrompt.includes(keyword)))?.[0] || "overview";
}

function findStartup(normalizedPrompt, startups) {
  return startups.find((startup) => {
    const aliases = [
      startup.id,
      startup.name,
      startup.name.replace(/\s+/g, ""),
      startup.name.split("/")[0]
    ].map((value) => String(value).toLowerCase());
    return aliases.some((alias) => alias && normalizedPrompt.includes(alias));
  }) || (normalizedPrompt.includes("emerg") ? getStartupById("emergeniz") : null);
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function buildProposal({ type, startupName, proposedChange, rationale }) {
  return {
    type,
    startupName,
    proposedChange,
    rationale,
    approvalStatus: "pending",
    platformAction: inferPlatformAction({ type, startupName, proposedChange, rationale })
  };
}

function inferPlatformAction({ type, startupName, proposedChange, rationale }) {
  const normalizedType = String(type || "").toLowerCase();
  const cleanStartup = startupName || "Program";
  const safeId = String(`${type}-${startupName}-${Date.now()}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalizedType.includes("meeting brief")) {
    return batch([
      knowledgeNote({
        title: `${cleanStartup} meeting brief`,
        startup: cleanStartup,
        tags: ["meeting-brief", "usi-brain", "approved"]
      }),
      projectTask({
        id: `${safeId}-prep`,
        title: `Prepare mentor/SGA meeting for ${cleanStartup}`,
        workstream: "Mentoring"
      })
    ]);
  }

  if (normalizedType.includes("growth")) {
    return batch([
      projectTask({
        id: `${safeId}-growth`,
        title: `Run growth support sprint for ${cleanStartup}`,
        workstream: "Growth support"
      }),
      founderQa({
        startup: cleanStartup,
        question: `How should ${cleanStartup} act on this growth recommendation?`,
        answer: proposedChange,
        tags: ["growth", "usi-brain", "approved-draft"]
      })
    ]);
  }

  if (normalizedType.includes("mentor")) {
    return projectTask({
      id: `${safeId}-mentor`,
      title: `Match mentor for ${cleanStartup}`,
      workstream: "Mentoring"
    });
  }

  if (normalizedType.includes("risk") || normalizedType.includes("data completeness")) {
    return batch([
      projectTask({
        id: `${safeId}-review`,
        title: `Review risk/data gaps: ${cleanStartup}`,
        workstream: "Governance"
      }),
      knowledgeNote({
        title: `${cleanStartup} risk/data review note`,
        startup: cleanStartup,
        tags: ["risk-review", "missing-data", "usi-brain"]
      })
    ]);
  }

  if (normalizedType.includes("data request")) {
    return batch([
      projectTask({
        id: `${safeId}-data`,
        title: `Request missing data from ${cleanStartup}`,
        workstream: "Founder follow-up"
      }),
      founderQa({
        startup: cleanStartup,
        question: `What data should ${cleanStartup} provide next?`,
        answer: proposedChange,
        tags: ["missing-data", "founder-request", "usi-brain"]
      })
    ]);
  }

  if (normalizedType.includes("knowledge") || normalizedType.includes("workflow")) {
    return knowledgeNote({
      title: `${cleanStartup} - ${type}`,
      startup: cleanStartup,
      tags: ["knowledge-base", "usi-brain", "approved-note"]
    });
  }

  return projectTask({
    id: `${safeId}-followup`,
    title: `Review USI Brain proposal for ${cleanStartup}`,
    workstream: "Operations"
  });

  function batch(actions) {
    return { type: "batch", actions };
  }

  function projectTask(overrides = {}) {
    return {
      type: "create_project_task",
      title: proposedChange,
      assignee: "SGA",
      due: "2026-06-30",
      status: "Next",
      progress: 10,
      priority: "High",
      notes: rationale,
      ...overrides
    };
  }

  function knowledgeNote(overrides = {}) {
    return {
      type: "create_knowledge_note",
      documentType: "AI note",
      title: `${cleanStartup} - approved USI Brain note`,
      startup: cleanStartup,
      tags: ["usi-brain", "approved-note"],
      evidenceUse: rationale,
      ...overrides
    };
  }

  function founderQa(overrides = {}) {
    return {
      type: "create_founder_qa",
      startup: cleanStartup,
      question: `What should ${cleanStartup} do next?`,
      answer: proposedChange,
      tags: ["usi-brain", "approved-answer"],
      ...overrides
    };
  }
}
