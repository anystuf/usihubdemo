/**
 * Evidence synthesis utilities for USI Brain
 * Builds rich, contextualized evidence from demo data for AI answers
 */

import {
  findStartupsByRisk,
  findStartupsByStage,
  getLinkedDocuments,
  identifyGrowthBlockers,
  parseFounderNeeds,
  getMentorNeeds,
  getStartupStats,
  isCriticalStage,
} from "./startupLookup.js";

/**
 * Build comparative evidence for risk analysis
 * Compare startup to cohort peers
 * @param {Object} startup - Target startup
 * @param {Array} startups - All startups in cohort
 * @returns {Array} Array of evidence statements
 */
export function buildRiskComparativeEvidence(startup, startups) {
  const evidence = [];

  // Cohort comparison
  const stats = getStartupStats(startups);
  if (startup.health < stats.avgHealth) {
    evidence.push(
      `Health score ${startup.health}/100 is below cohort average (${stats.avgHealth}/100)`
    );
  }

  // Peer comparison
  if (startup.risk === "High") {
    const peersAtRisk = findStartupsByRisk("High", startups);
    if (peersAtRisk.length > 1) {
      evidence.push(
        `${startup.name} is one of ${peersAtRisk.length} high-risk startups requiring focused validation`
      );
    }
  }

  // Stage context
  if (isCriticalStage(startup.stage)) {
    evidence.push(
      `Early-stage position (${startup.stage}) means validation is still critical`
    );
  }

  return evidence;
}

/**
 * Build evidence from missing data and gaps
 * @param {Object} startup - Target startup
 * @returns {Array} Array of evidence statements
 */
export function buildGapEvidence(startup) {
  const evidence = [];

  if (startup.missingData && startup.missingData.length > 0) {
    evidence.push(`Missing data points: ${startup.missingData.join(", ")}`);

    if (startup.missingData.length >= 3) {
      evidence.push(
        "Multiple critical data gaps limit confidence in risk assessment"
      );
    }
  }

  return evidence;
}

/**
 * Build evidence from linked documents
 * @param {Object} startup - Target startup
 * @param {Array} documents - All documents from demoData
 * @returns {Array} Array of evidence statements with source references
 */
export function buildDocumentEvidence(startup, documents) {
  const evidence = [];
  const linked = getLinkedDocuments(startup.id || startup.name, documents);

  if (linked.length === 0) {
    evidence.push("No indexed documents found in Knowledge Base");
    return evidence;
  }

  // Categorize documents by type
  const roadmaps = linked.filter((d) => d.type === "Roadmap");
  const pitches = linked.filter((d) => d.type === "Pitch deck");
  const other = linked.filter((d) => !["Roadmap", "Pitch deck"].includes(d.type));

  if (roadmaps.length > 0) {
    evidence.push(
      `Growth roadmap available: ${roadmaps.map((d) => d.title).join(", ")}`
    );
  }

  if (pitches.length > 0) {
    evidence.push(
      `Pitch material available: ${pitches.map((d) => d.title).join(", ")}`
    );
  }

  if (other.length > 0) {
    evidence.push(
      `Additional sources: ${other.slice(0, 2).map((d) => d.type).join(", ")}`
    );
  }

  return evidence;
}

/**
 * Build evidence from founder needs and traction
 * @param {Object} startup - Target startup
 * @returns {Array} Array of evidence statements
 */
export function buildFounderNeedEvidence(startup) {
  const evidence = [];

  if (startup.founderNeed) {
    const needs = parseFounderNeeds(startup.founderNeed);
    evidence.push(
      `Founder support needs: ${needs.slice(0, 3).join(", ")}`
    );
  }

  if (startup.traction) {
    evidence.push(`Traction status: ${startup.traction}`);
  }

  if (startup.nextAction) {
    evidence.push(`Recommended action: ${startup.nextAction}`);
  }

  return evidence;
}

/**
 * Build risk-specific evidence explaining why a startup is flagged
 * @param {Object} startup - Target startup
 * @param {Array} documents - All documents from demoData
 * @returns {Object} Evidence object with risk reason and supporting details
 */
export function buildRiskSpecificEvidence(startup, documents) {
  const riskSignals = [];

  // Health-based risk signals
  if (startup.health < 55) {
    riskSignals.push(
      `Low health score (${startup.health}/100) indicates foundation concerns`
    );
  } else if (startup.health < 65) {
    riskSignals.push(
      `Medium health score (${startup.health}/100) requires validation support`
    );
  }

  // Stage-based risk signals
  if (isCriticalStage(startup.stage)) {
    riskSignals.push(
      `${startup.stage} stage with incomplete validation data`
    );
  }

  // Data gap-based risk signals
  if (startup.missingData && startup.missingData.length > 0) {
    const criticalGaps = startup.missingData.slice(0, 2);
    riskSignals.push(
      `Critical gaps in: ${criticalGaps.join(", ")}`
    );
  }

  // Sector-specific risk context
  if (["HealthTech", "MedTech"].some((s) => startup.sector.includes(s))) {
    riskSignals.push("HealthTech requires expert medical validation");
  }

  if (startup.sector.includes("Marketplace")) {
    riskSignals.push("Marketplace model has two-sided supply/demand risk");
  }

  return {
    signals: riskSignals,
    evidence: [
      `Stage: ${startup.stage}`,
      `Sector: ${startup.sector}`,
      `Risk classification: ${startup.risk}`,
      `Health score: ${startup.health}/100`,
      ...buildGapEvidence(startup),
      ...buildDocumentEvidence(startup, documents),
    ],
  };
}

/**
 * Build mentor matching evidence
 * @param {Object} startup - Target startup
 * @param {Array} documents - All documents from demoData
 * @returns {Object} Evidence with mentor needs and supporting details
 */
export function buildMentorMatchEvidence(startup, documents) {
  const mentorNeeds = getMentorNeeds(startup);
  const evidence = [];

  // Evidence from founder needs
  evidence.push(...buildFounderNeedEvidence(startup));

  // Evidence from documents showing mentor-relevant material
  const mentorDocs = getLinkedDocuments(startup.id || startup.name, documents).filter(
    (d) => d.type === "Roadmap" || d.tags?.includes("mentor")
  );

  if (mentorDocs.length > 0) {
    evidence.push(`Mentor materials available: ${mentorDocs.length} document(s)`);
  }

  // Health and stage context
  if (startup.health < 60) {
    evidence.push(
      "Foundation health suggests need for generalist mentor or SGA support"
    );
  }

  if (startup.stage.includes("PoC") || startup.stage.includes("MVP")) {
    evidence.push("Early stage requires product-validation mentor focus");
  }

  return {
    mentorNeeds,
    evidence,
    primaryNeed: mentorNeeds[0] || "Program context and goal alignment",
  };
}

/**
 * Build growth support evidence
 * @param {Object} startup - Target startup
 * @param {Array} documents - All documents from demoData
 * @returns {Object} Evidence with growth blockers and next steps
 */
export function buildGrowthSupportEvidence(startup, documents) {
  const blockers = identifyGrowthBlockers(startup);
  const evidence = [];

  // Evidence from documents
  const roadmap = getLinkedDocuments(startup.id || startup.name, documents).find(
    (d) => d.type === "Roadmap"
  );

  if (roadmap) {
    evidence.push(`Growth roadmap available for strategy refinement`);
  }

  // Traction evidence
  evidence.push(...buildFounderNeedEvidence(startup));

  // Sector-specific growth context
  if (startup.sector.includes("SaaS")) {
    evidence.push(
      "SaaS growth typically requires focus on customer success and retention"
    );
  }

  if (startup.sector.includes("Consumer")) {
    evidence.push("Consumer growth requires distribution and unit economics clarity");
  }

  return {
    blockers,
    evidence,
    healthContext: startup.health > 75 ? "Strong health supports growth acceleration" : "Foundation concerns may slow scaling",
  };
}

/**
 * Summarize data completeness and confidence level
 * @param {Object} startup - Target startup
 * @returns {Object} Confidence assessment with reasoning
 */
export function assessDataConfidence(startup) {
  let confidence = "Medium";
  let reasoning = [];

  const dataPoints = [
    startup.founderNeed ? 1 : 0,
    startup.traction ? 1 : 0,
    startup.missingData && startup.missingData.length > 0 ? 1 : 0,
    startup.sources && startup.sources.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (dataPoints >= 3 && startup.health >= 65) {
    confidence = "Medium-high";
    reasoning.push("Multiple data sources available");
  } else if (startup.missingData && startup.missingData.length > 2) {
    confidence = "Low-medium";
    reasoning.push("Significant data gaps limit assessment");
  }

  return {
    confidence,
    reasoning,
    dataCompleteness: `${dataPoints}/4 major data categories available`,
  };
}

/**
 * Generate a brief HTML-friendly summary of a startup for quick context
 * @param {Object} startup - Target startup
 * @returns {string} One-paragraph summary
 */
export function generateStartupSummary(startup) {
  if (!startup) return "";

  return (
    `${startup.name} is at ${startup.stage} in ${startup.sector} ` +
    `with ${startup.risk} risk (health: ${startup.health}/100). ` +
    `Key needs: ${startup.founderNeed ? startup.founderNeed.split(",")[0] : "Program context"}. ` +
    `Traction: ${startup.traction || "Early validation phase"}.`
  );
}
