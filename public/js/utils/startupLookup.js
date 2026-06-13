/**
 * Startup query and lookup utilities
 * Provides reusable functions for finding, filtering, and analyzing startups from demo data
 */

/**
 * Find a single startup by name or ID (with alias support)
 * @param {string} query - Startup name, ID, or partial match
 * @param {Array} startups - Array of startup objects from demoData
 * @returns {Object|null} The matching startup or null
 */
export function findStartupByNameOrId(query, startups) {
  if (!query || !startups) return null;

  const normalized = String(query).toLowerCase().trim();

  return (
    startups.find((startup) => {
      const aliases = [
        startup.id,
        startup.name,
        startup.name.replace(/\s+/g, ""),
        startup.name.split("/")[0],
      ].map((value) => String(value).toLowerCase());

      return aliases.some((alias) => alias && normalized.includes(alias));
    }) || (normalized.includes("emerg") ? startups.find((s) => s.id === "emergeniz") : null)
  );
}

/**
 * Find all startups with a specific risk level
 * @param {string} riskLevel - "High", "Medium", or "Low"
 * @param {Array} startups - Array of startup objects
 * @returns {Array} Matching startups, sorted by health (ascending)
 */
export function findStartupsByRisk(riskLevel, startups) {
  if (!startups) return [];
  return startups
    .filter((s) => s.risk === riskLevel)
    .sort((a, b) => a.health - b.health);
}

/**
 * Find all startups at a specific stage
 * @param {string} stage - Stage name (e.g., "PoC / MVP", "Beta launch")
 * @param {Array} startups - Array of startup objects
 * @returns {Array} Matching startups
 */
export function findStartupsByStage(stage, startups) {
  if (!startups || !stage) return [];
  return startups.filter((s) => s.stage.toLowerCase().includes(stage.toLowerCase()));
}

/**
 * Find all startups in a specific sector
 * @param {string} sector - Sector name (e.g., "AI / UAV", "EdTech")
 * @param {Array} startups - Array of startup objects
 * @returns {Array} Matching startups
 */
export function findStartupsBySector(sector, startups) {
  if (!startups || !sector) return [];
  return startups.filter((s) =>
    s.sector.toLowerCase().includes(sector.toLowerCase())
  );
}

/**
 * Get documents linked to a startup by ID or name
 * @param {string} startupIdOrName - Startup ID or name
 * @param {Array} documents - Array of document objects from demoData
 * @returns {Array} Linked documents
 */
export function getLinkedDocuments(startupIdOrName, documents) {
  if (!startupIdOrName || !documents) return [];

  const normalized = String(startupIdOrName).toLowerCase();

  return documents.filter((doc) => {
    if (!doc.startup) return false;
    return doc.startup.toLowerCase().includes(normalized);
  });
}

/**
 * Get all startups with health score above/below threshold
 * @param {number} threshold - Health score threshold (0-100)
 * @param {string} direction - "above" or "below"
 * @param {Array} startups - Array of startup objects
 * @returns {Array} Filtered startups
 */
export function findStartupsByHealth(threshold, direction, startups) {
  if (!startups || typeof threshold !== "number") return [];

  return startups.filter((s) => {
    if (direction === "above") return s.health >= threshold;
    if (direction === "below") return s.health <= threshold;
    return false;
  });
}

/**
 * Rank startups by a given metric
 * @param {string} metric - "health", "risk", "stage", "sector"
 * @param {Array} startups - Array of startup objects
 * @returns {Array} Startups sorted by metric
 */
export function rankStartups(metric, startups) {
  if (!startups) return [];

  const copy = [...startups];

  switch (metric) {
    case "health":
      return copy.sort((a, b) => b.health - a.health);
    case "risk":
      const riskOrder = { High: 0, Medium: 1, Low: 2 };
      return copy.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);
    default:
      return copy;
  }
}

/**
 * Get summary statistics for startups
 * @param {Array} startups - Array of startup objects
 * @returns {Object} Summary stats
 */
export function getStartupStats(startups) {
  if (!startups || startups.length === 0) {
    return {
      total: 0,
      avgHealth: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      healthDistribution: [],
    };
  }

  const highRisk = startups.filter((s) => s.risk === "High").length;
  const mediumRisk = startups.filter((s) => s.risk === "Medium").length;
  const lowRisk = startups.filter((s) => s.risk === "Low").length;
  const avgHealth = Math.round(
    startups.reduce((sum, s) => sum + s.health, 0) / startups.length
  );

  return {
    total: startups.length,
    avgHealth,
    highRiskCount: highRisk,
    mediumRiskCount: mediumRisk,
    lowRiskCount: lowRisk,
    healthDistribution: {
      "0-50": startups.filter((s) => s.health < 50).length,
      "50-70": startups.filter((s) => s.health >= 50 && s.health < 70).length,
      "70-100": startups.filter((s) => s.health >= 70).length,
    },
  };
}

/**
 * Check if startup has critical missing data
 * @param {Object} startup - Startup object
 * @returns {boolean} True if critical data is missing
 */
export function hasMissingCriticalData(startup) {
  if (!startup || !startup.missingData) return false;
  return startup.missingData.length >= 3;
}

/**
 * Check if startup is in a critical stage
 * @param {string} stage - Stage name
 * @returns {boolean} True if early validation stage
 */
export function isCriticalStage(stage) {
  const criticalStages = ["PoC / MVP", "Market validation", "Beta launch"];
  return criticalStages.some((s) =>
    stage.toLowerCase().includes(s.toLowerCase())
  );
}

/**
 * Parse founder needs from comma-separated string into array
 * @param {string} founderNeedString - String like "Regulatory guidance, pilot partner, B2B sales"
 * @returns {Array} Array of individual needs
 */
export function parseFounderNeeds(founderNeedString) {
  if (!founderNeedString) return [];
  return founderNeedString
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Get mentor needs for a startup
 * Infers from founder needs and risk factors
 * @param {Object} startup - Startup object
 * @returns {Array} Array of mentor need categories
 */
export function getMentorNeeds(startup) {
  if (!startup) return [];

  const needs = [];

  // Parse from founder need
  const founderNeeds = parseFounderNeeds(startup.founderNeed);
  needs.push(...founderNeeds);

  // Add risk-based needs
  if (startup.risk === "High") {
    needs.push("Validation focus");
  }

  if (startup.health < 60) {
    needs.push("Foundation review");
  }

  return [...new Set(needs)]; // Remove duplicates
}

/**
 * Identify growth blockers for a startup based on stage, health, and data
 * @param {Object} startup - Startup object
 * @returns {Array} Array of identified blockers
 */
export function identifyGrowthBlockers(startup) {
  if (!startup) return [];

  const blockers = [];

  // Stage-based blockers
  if (
    startup.stage.includes("PoC") ||
    startup.stage.includes("MVP")
  ) {
    blockers.push("Product-market fit validation");
  }

  if (startup.stage.includes("Beta")) {
    blockers.push("Marketplace supply/demand balance");
  }

  if (startup.stage.includes("Launch")) {
    blockers.push("Customer acquisition and retention");
  }

  // Health-based blockers
  if (startup.health < 55) {
    blockers.push("Foundation health concerns");
  }

  // Data-based blockers
  if (startup.missingData && startup.missingData.length > 0) {
    blockers.push(`Missing: ${startup.missingData.slice(0, 2).join(", ")}`);
  }

  return blockers;
}
