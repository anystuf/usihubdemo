import { callFunction } from "./firebaseService.js";
import { generateBrainResponse } from "./brainService.js";
import { getDemoData } from "./dataService.js";

export async function askUsiBrain(prompt, conversation = []) {
  const context = buildDemoContext();
  const demoFirst = shouldUseDemoEvidenceEngine(prompt, context);

  if (demoFirst) {
    const localEvidence = await generateBrainResponse(prompt);
    return normalizeBrainResponse({
      ...localEvidence,
      systemNote: localEvidence.noSystemNote
        ? ""
        : "Answered by the local demo evidence engine so the MVP stays deterministic. Gemini/Firebase RAG can augment this later."
    }, "Local evidence engine");
  }

  try {
    const response = await callLocalProxy(prompt, context, conversation);
    const modelInfo = response.modelUsed || "Gemini 3.5 Flash";
    return normalizeBrainResponse(response, `${modelInfo} via local proxy`);
  } catch (error) {
    // Continue to Firebase Function if the local proxy is not running.
  }

  try {
    const response = await callFunction("askUsiBrain", { prompt, context, conversation });
    return normalizeBrainResponse(response, "Gemini 3.5 Flash via Firebase Function");
  } catch (error) {
    const fallback = await generateBrainResponse(prompt);
    return normalizeBrainResponse({
      ...fallback,
      systemNote: "Firebase Function is not available yet, so this answer used local demo fallback data."
    }, "Local demo fallback");
  }
}

function shouldUseDemoEvidenceEngine(prompt, context) {
  const normalized = prompt.toLowerCase();
  const cleaned = normalized.replace(/[^a-z0-9\s]/g, "").trim();
  if (["hi", "hello", "hey", "yo", "xin chao", "chao", "chao ban"].includes(cleaned)) return true;

  const demoTerms = [
    "risk", "at risk", "mentor", "grow", "growth", "brief", "missing", "data",
    "document", "source", "how to use", "venture-alpha", "venture-beta", "venture-gamma", "venture-epsilon",
    "venture-zeta", "air mattress", "study cake", "venture-iota", "venture-delta"
  ];
  return demoTerms.some((term) => normalized.includes(term)) ||
    context.startups.some((startup) => normalized.includes(startup.name.toLowerCase()));
}

function buildDemoContext() {
  const data = getDemoData();
  return {
    startups: data.startups.map((startup) => ({
      name: startup.name,
      cohort: startup.cohort,
      stage: startup.stage,
      sector: startup.sector,
      risk: startup.risk,
      health: startup.health,
      summary: startup.summary,
      founderNeed: startup.founderNeed,
      mentorNeed: startup.mentorNeed,
      riskReason: startup.riskReason,
      traction: startup.traction,
      nextAction: startup.nextAction,
      recommendedSupport: startup.recommendedSupport,
      sources: startup.sources,
      missingData: startup.missingData,
      linkedDocuments: startup.linkedDocuments,
      lastCheckIn: startup.lastCheckIn
    })),
    documents: data.documents.map((doc) => ({
      title: doc.title,
      type: doc.type,
      startup: doc.startup,
      tags: doc.tags,
      indexed: doc.indexed,
      source: doc.source
    })),
    guardrails: [
      "AI must not make final decisions about startups.",
      "AI must not directly update dashboard or startup data.",
      "AI can only propose updates that require human approval.",
      "Vietnam-context startup evaluation should consider local market, regulation, customer behavior, mentors, investors, grants, and ecosystem context."
    ]
  };
}

async function callLocalProxy(prompt, context, conversation) {
  const response = await fetch("/api/usi-brain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt, context, conversation })
  });

  if (!response.ok) {
    throw new Error(`Local proxy unavailable: ${response.status}`);
  }

  return response.json();
}

function normalizeBrainResponse(response, provider) {
  return {
    provider,
    answer: asText(response.answer),
    evidence: asList(response.evidence),
    sources: asList(response.sources),
    confidence: asText(response.confidence || "Unknown"),
    missingData: asList(response.missingData),
    nextActions: asList(response.nextActions || response.suggestedNextActions),
    proposedUpdate: response.proposedUpdate || null,
    systemNote: response.systemNote || "",
    parseError: response.parseError === true
  };
}

function asText(value) {
  if (typeof value === "string" && value.trim()) return value;
  return "No answer was returned.";
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) return [value];
  return ["Not provided."];
}
