/**
 * Startup Scoring Rubric
 * Defines how health scores and risk levels are calculated from startup data
 * Used by USI Intelligence to justify risk/health assessments with clear rubrics
 */

/**
 * Health Score Rubric (0-100)
 * Measures startup readiness and operational capability
 */
export const healthScoreRubric = {
  name: "Startup Health Score",
  description: "Measures operational readiness, team capability, and market validation progress",
  components: [
    {
      factor: "Product Maturity",
      weight: 20,
      levels: {
        high: { score: 18, indicator: "MVP launched, user feedback collected, roadmap clear" },
        medium: { score: 10, indicator: "MVP in development, initial customer discovery ongoing" },
        low: { score: 4, indicator: "Concept stage, no user validation yet" }
      }
    },
    {
      factor: "Traction & Validation",
      weight: 25,
      levels: {
        high: { score: 24, indicator: "10+ paying customers / clear usage metrics / revenue" },
        medium: { score: 13, indicator: "3-10 customers or strong engagement signals" },
        low: { score: 5, indicator: "Early users, limited validation data" }
      }
    },
    {
      factor: "Team Capability",
      weight: 20,
      levels: {
        high: { score: 18, indicator: "Technical + business skills present, execution track record" },
        medium: { score: 10, indicator: "Team can execute but may need specialist support" },
        low: { score: 4, indicator: "Team gaps in technical or business expertise" }
      }
    },
    {
      factor: "Go-to-Market Readiness",
      weight: 18,
      levels: {
        high: { score: 17, indicator: "Clear customer acquisition path, channel identified" },
        medium: { score: 9, indicator: "GTM being tested, early channel validation" },
        low: { score: 4, indicator: "No clear GTM or channel identified" }
      }
    },
    {
      factor: "Vietnam Market Fit & Ecosystem",
      weight: 12,
      levels: {
        high: { score: 11, indicator: "Local competitor analysis done, regulatory path clear, local partnerships emerging" },
        medium: { score: 6, indicator: "Aware of local context, some ecosystem exploration" },
        low: { score: 3, indicator: "Limited Vietnam market research or regulatory awareness" }
      }
    },
    {
      factor: "Business Model Clarity",
      weight: 5,
      levels: {
        high: { score: 5, indicator: "Clear revenue model, unit economics understood" },
        medium: { score: 3, indicator: "Revenue model identified but not validated" },
        low: { score: 1, indicator: "Business model unclear or not articulated" }
      }
    }
  ],
  total_weight: 100,
  interpretation: {
    80: "Exceptional - Ready for scale, strong execution signals",
    60: "Strong - Well-positioned for growth, some support needed",
    40: "Developing - Making progress, material support needed",
    20: "Early - Early validation phase, significant support needed"
  }
};

/**
 * Risk Level Rubric (High / Medium / Low)
 * Identifies obstacles and uncertainties that could prevent success
 */
export const riskLevelRubric = {
  name: "Startup Risk Assessment",
  description: "Identifies execution, market, and validation risks; guides mentor allocation and monitoring",
  components: [
    {
      factor: "Product & Validation Risk",
      highRiskSignals: [
        "No user testing or feedback collected",
        "Unclear product-market fit evidence",
        "Major technical unknowns not addressed",
        "Dependency on unproven technology"
      ],
      mediumRiskSignals: [
        "MVP tested with limited users",
        "Product-market fit hypothesis but not validated",
        "Some technical risks identified but mitigation underway"
      ],
      lowRiskSignals: [
        "Multiple iterations with real users",
        "Clear product-market fit signals",
        "Technical risks understood and mitigated"
      ]
    },
    {
      factor: "Team & Execution Risk",
      highRiskSignals: [
        "Key skills missing (technical, business, domain)",
        "No founder execution history",
        "Team friction or unclear roles",
        "Founder distracted or unclear commitment"
      ],
      mediumRiskSignals: [
        "1-2 key skills to develop",
        "First-time founder but strong learner",
        "Team forming, roles clarifying"
      ],
      lowRiskSignals: [
        "Complete team with relevant experience",
        "Founder has execution track record",
        "Strong team collaboration and clarity"
      ]
    },
    {
      factor: "Market & Competitive Risk",
      highRiskSignals: [
        "Large, well-funded competitors already present",
        "No clear competitive advantage identified",
        "Market size or adoption uncertain",
        "Vietnam regulatory barriers not addressed"
      ],
      mediumRiskSignals: [
        "Competitors exist but differentiation identified",
        "Market size reasonable but not fully validated",
        "Some regulatory awareness but path not clear"
      ],
      lowRiskSignals: [
        "Clear competitive advantage and moat",
        "Large addressable market with growth signals",
        "Regulatory path clear or low-barrier vertical"
      ]
    },
    {
      factor: "Go-to-Market & Capital Risk",
      highRiskSignals: [
        "No customer acquisition strategy or cost to acquire very high",
        "Burn rate unsustainable, funding runway unclear",
        "Distribution channel not identified",
        "High customer acquisition cost vs. LTV"
      ],
      mediumRiskSignals: [
        "GTM strategy identified but not yet validated",
        "Runway 6-12 months with clear next funding step",
        "Multiple channels being tested"
      ],
      lowRiskSignals: [
        "Proven customer acquisition channels",
        "Unit economics work or path clear",
        "18+ month runway or clear funding path"
      ]
    },
    {
      factor: "Vietnam Context & Ecosystem Risk",
      highRiskSignals: [
        "No understanding of Vietnam market dynamics",
        "Regulatory uncertainty or blockers for model",
        "No local partnerships or ecosystem awareness",
        "Payment/logistics infrastructure not addressed"
      ],
      mediumRiskSignals: [
        "Basic Vietnam market research done",
        "Some regulatory awareness but gaps remain",
        "Early ecosystem exploration underway"
      ],
      lowRiskSignals: [
        "Deep Vietnam market knowledge demonstrated",
        "Clear regulatory path and compliance plan",
        "Local partnerships and ecosystem integration"
      ]
    },
    {
      factor: "Data Completeness",
      highRiskSignals: [
        "5+ critical data gaps (missing founder feedback, traction, roadmap, mentor notes, KPIs)",
        "Health score cannot be assessed reliably",
        "Risk judgment relies heavily on assumption"
      ],
      mediumRiskSignals: [
        "2-4 data gaps but key info present",
        "Health/risk score has some foundation",
        "Can make directional judgment with caveats"
      ],
      lowRiskSignals: [
        "All critical fields populated",
        "Health/risk score well-supported by data",
        "Judgment can be made with high confidence"
      ]
    }
  ],
  scoring_logic: "HIGH RISK if any high-risk signal is strong (e.g., no user validation) OR multiple medium signals. MEDIUM RISK if 1-2 medium signals and low-risk signals elsewhere. LOW RISK if primarily low-risk signals and clear validation evidence."
};

/**
 * Calculate health score explanation from startup profile
 * @param {Object} startup - Startup profile object
 * @returns {Object} { score, explanation, factors }
 */
export function assessHealthScore(startup) {
  const score = startup.healthScore || startup.health || 50;
  const factors = [];

  // Infer factors from profile
  if (startup.traction?.includes("10+") || startup.traction?.includes("customers")) {
    factors.push({ factor: "Traction & Validation", level: "high" });
  } else if (startup.traction?.includes("early")) {
    factors.push({ factor: "Traction & Validation", level: "low" });
  } else {
    factors.push({ factor: "Traction & Validation", level: "medium" });
  }

  if (startup.stage === "MVP" || startup.stage === "Launch") {
    factors.push({ factor: "Product Maturity", level: "medium" });
  } else if (startup.stage === "Concept") {
    factors.push({ factor: "Product Maturity", level: "low" });
  } else {
    factors.push({ factor: "Product Maturity", level: "high" });
  }

  if (startup.missingData?.length > 5) {
    factors.push({ factor: "Data Completeness", level: "low" });
  } else if (startup.missingData?.length > 2) {
    factors.push({ factor: "Data Completeness", level: "medium" });
  } else {
    factors.push({ factor: "Data Completeness", level: "high" });
  }

  const explanation = `
Health Score: ${score}/100

Factors:
${factors.map((f) => `• ${f.factor}: ${f.level.charAt(0).toUpperCase() + f.level.slice(1)}`).join("\n")}

Assessment: ${getHealthInterpretation(score)}
  `.trim();

  return { score, explanation, factors };
}

/**
 * Calculate risk level explanation from startup profile
 * @param {Object} startup - Startup profile object
 * @returns {Object} { level, explanation, signals }
 */
export function assessRiskLevel(startup) {
  const level = startup.riskLevel || startup.risk || "Medium";
  const signals = [];

  // Identify risk signals
  if (!startup.traction || startup.traction.includes("early") || startup.traction.includes("validation")) {
    signals.push({ type: "Product Validation Risk", signal: "Early validation phase" });
  }

  if (startup.missingData?.includes("team")) {
    signals.push({ type: "Team Risk", signal: "Team composition not fully documented" });
  }

  if ((startup.missingData?.length || 0) > 4) {
    signals.push({ type: "Data Completeness", signal: "Multiple critical data gaps" });
  }

  if (startup.stage === "Concept") {
    signals.push({ type: "Execution Risk", signal: "Very early stage, high execution uncertainty" });
  }

  const explanation = `
Risk Level: ${level}

Risk Signals:
${signals.slice(0, 5).map((s) => `• ${s.type}: ${s.signal}`).join("\n")}

Assessment: This startup requires ${getMonitoringFrequency(level)} monitoring and focused mentor support on validation and team building.
  `.trim();

  return { level, explanation, signals };
}

/**
 * Get health score interpretation
 */
function getHealthInterpretation(score) {
  if (score >= 80) return "Exceptional - Ready for scale";
  if (score >= 60) return "Strong - Well-positioned for growth";
  if (score >= 40) return "Developing - Making progress";
  if (score >= 20) return "Early - Early validation phase";
  return "Concept - Just starting";
}

/**
 * Get monitoring frequency based on risk
 */
function getMonitoringFrequency(level) {
  if (level === "High") return "weekly";
  if (level === "Medium") return "bi-weekly";
  return "monthly";
}

/**
 * Generate rich rubric-based explanation for a decision
 */
export function buildRubricExplanation(startup, decisionType) {
  const health = assessHealthScore(startup);
  const risk = assessRiskLevel(startup);

  if (decisionType === "risk") {
    return `
${startup.name} is ${risk.level} risk because:

${risk.explanation}

Mentor Priority: Focus on validation and team support.
    `.trim();
  }

  if (decisionType === "health") {
    return `
${startup.name} has health score ${health.score}/100:

${health.explanation}

Growth Path: Address weak factors before scaling.
    `.trim();
  }

  if (decisionType === "allocation") {
    return `
${startup.name} Assessment:

HEALTH: ${health.score}/100 - ${getHealthInterpretation(health.score)}
RISK: ${risk.level} - ${risk.explanation.split("\n")[0]}

RECOMMENDATION:
- Mentor focus: ${getHealthInterpretation(health.score).toLowerCase()}
- Monitoring: ${getMonitoringFrequency(risk.level)}
- Support type: ${recommendSupportType(health.score, risk.level)}
    `.trim();
  }

  return `${startup.name} profile assessment based on ${health.score}/100 health and ${risk.level} risk.`;
}

/**
 * Recommend support type based on health and risk
 */
function recommendSupportType(healthScore, riskLevel) {
  if (riskLevel === "High") return "Intensive validation + team support";
  if (healthScore < 40) return "Growth fundamentals + execution support";
  if (healthScore < 60) return "Scaling preparation + strategy support";
  return "Scaling execution + market expansion";
}
