export const LIFECYCLE_STAGES = [
  { key: "ideation", label: "Ideation", aliases: ["pitch", "concept", "idea", "roadmap"] },
  { key: "prototyping", label: "Prototyping / MVP", aliases: ["poc", "prototype", "mvp", "beta"] },
  { key: "pmf", label: "PMF", aliases: ["market validation", "product market fit", "pmf"] },
  { key: "channel-fit", label: "Product–Channel Fit", aliases: ["launch", "channel", "go-to-market", "gtm"] },
  { key: "growth", label: "Growth", aliases: ["growth", "scale"] }
];

const STAGE_METRIC_LABELS = {
  ideation: ["Problem clarity", "Customer evidence", "Solution hypothesis", "Next experiment"],
  prototyping: ["Prototype maturity", "User testing", "Feedback loop", "Validation blocker"],
  pmf: ["Repeat usage", "Retention signal", "Revenue traction", "Segment clarity"],
  "channel-fit": ["Acquisition channel", "Conversion signal", "Sales motion", "Unit economics"],
  growth: ["Growth signal", "Customer / revenue base", "Onboarding capacity", "Expansion readiness"]
};

export function getLifecycleStage(stage = "") {
  const normalized = String(stage).toLowerCase();
  if (normalized.includes("growth") || normalized.includes("scale")) return LIFECYCLE_STAGES[4];
  if (normalized.includes("launch") || normalized.includes("channel") || normalized.includes("go-to-market") || normalized.includes("gtm")) return LIFECYCLE_STAGES[3];
  if (normalized.includes("market validation") || normalized.includes("product market fit") || normalized.includes("pmf")) return LIFECYCLE_STAGES[2];
  if (normalized.includes("poc") || normalized.includes("prototype") || normalized.includes("mvp") || normalized.includes("beta")) return LIFECYCLE_STAGES[1];
  return LIFECYCLE_STAGES.find((item) => item.aliases.some((alias) => normalized.includes(alias))) || LIFECYCLE_STAGES[0];
}

export function getLifecycleSteps(stage) {
  const current = getLifecycleStage(stage);
  const index = LIFECYCLE_STAGES.findIndex((item) => item.key === current.key);
  return LIFECYCLE_STAGES.map((item, stepIndex) => ({
    ...item,
    state: stepIndex < index ? "complete" : stepIndex === index ? "current" : "upcoming"
  }));
}

export function getStageMetrics(startup) {
  const stage = getLifecycleStage(startup.stage);
  const labels = STAGE_METRIC_LABELS[stage.key];
  const explicit = new Map((startup.stageMetrics || []).map((item) => [item.label, item]));
  const existing = new Map((startup.kpis || []).map((item) => [String(item.label || "").toLowerCase(), item]));
  return labels.map((label) => {
    const item = explicit.get(label);
    const fallback = existing.get(label.toLowerCase());
    const derived = deriveMetric(label, startup, existing);
    return {
      label,
      value: item?.value || fallback?.value || derived.value,
      source: item?.source || (fallback ? `Existing KPI: ${fallback.label}` : derived.source),
      status: item?.status || (fallback?.value ? "Recorded" : derived.status)
    };
  });
}

function deriveMetric(label, startup, existing) {
  const missing = (startup.missingData || []).map((item) => String(item).toLowerCase());
  const need = (startup.mentorNeed || []).map((item) => String(item).toLowerCase());
  const supports = (startup.recommendedSupport || []).map((item) => String(item).toLowerCase());
  const traction = String(startup.traction || "");
  const kpi = (terms) => [...existing.entries()].find(([key]) => terms.some((term) => key.includes(term)))?.[1];
  const missingFor = (terms) => missing.find((item) => terms.some((term) => item.includes(term)));
  const needFor = (terms) => need.find((item) => terms.some((term) => item.includes(term)));
  const supportFor = (terms) => supports.find((item) => terms.some((term) => item.includes(term)));
  const recorded = (value, source) => ({ value, source, status: "Recorded" });
  const gap = (source) => ({ value: "Not recorded", source, status: "Data gap" });
  if (label === "Problem clarity") return startup.summary ? recorded("Defined in startup summary", "Startup profile") : gap("No problem statement recorded");
  if (label === "Customer evidence") return gap(missingFor(["customer", "buyer", "user"]) ? "Missing-data register" : "No interview evidence linked");
  if (label === "Solution hypothesis") return startup.summary ? recorded("Described in startup summary", "Startup profile") : gap("No solution hypothesis recorded");
  if (label === "Next experiment") return startup.nextAction ? recorded(startup.nextAction, "Recommended next action") : gap("No next experiment recorded");
  if (label === "Prototype maturity") return startup.stage ? recorded(startup.stage, "Startup stage record") : gap("No stage recorded");
  if (label === "User testing") return needFor(["user", "customer", "buyer"]) || supportFor(["interview", "test", "validation"]) ? recorded("Planned / required", "Support and missing-data records") : gap("No user-test result linked");
  if (label === "Feedback loop") return traction.toLowerCase().includes("roadmap") ? recorded("Roadmap feedback available", "Traction/context") : gap("No feedback loop recorded");
  if (label === "Validation blocker") return missing[0] ? recorded(missing[0], "Missing-data register") : gap("No validation blocker recorded");
  if (label === "Repeat usage") return kpi(["repeat", "mau"])?.value ? recorded(kpi(["repeat", "mau"]).value, "Existing KPI") : gap("No repeat-use KPI");
  if (label === "Retention signal") return gap(missingFor(["retention", "repeat", "churn"]) ? "Missing-data register" : "No retention data linked");
  if (label === "Revenue traction") return kpi(["revenue", "sales", "customer", "growth target"])?.value ? recorded(kpi(["revenue", "sales", "customer", "growth target"]).value, "Existing KPI") : gap("No revenue KPI");
  if (label === "Segment clarity") return missingFor(["segment", "buyer", "customer", "target"]) ? gap("Missing-data register") : gap("No segment evidence linked");
  if (label === "Acquisition channel") return supportFor(["channel", "acquisition", "distribution", "partner"]) ? recorded(supportFor(["channel", "acquisition", "distribution", "partner"]), "Support plan") : gap("No channel evidence linked");
  if (label === "Conversion signal") return gap(missingFor(["conversion", "sales"]) ? "Missing-data register" : "No conversion KPI");
  if (label === "Sales motion") return needFor(["sales", "gtm", "market"]) ? recorded(needFor(["sales", "gtm", "market"]), "Mentor need") : gap("No sales-motion evidence linked");
  if (label === "Unit economics") return missingFor(["unit economics", "margin", "cogs"]) ? gap("Missing-data register") : gap("No unit-economics KPI");
  if (label === "Growth signal") return kpi(["growth", "customer", "mau", "sales"])?.value ? recorded(kpi(["growth", "customer", "mau", "sales"]).value, "Existing KPI") : gap("No growth KPI");
  if (label === "Customer / revenue base") return kpi(["customer", "revenue", "sales"])?.value ? recorded(kpi(["customer", "revenue", "sales"]).value, "Existing KPI") : gap("No customer/revenue base");
  if (label === "Onboarding capacity") return kpi(["onboarding", "support"])?.value ? recorded(kpi(["onboarding", "support"]).value, "Existing KPI") : gap("No onboarding capacity KPI");
  if (label === "Expansion readiness") return startup.nextAction ? recorded("Defined by next action", "Recommended next action") : gap("No expansion evidence linked");
  return gap("No source recorded");
}

export function getDefaultRecommendation(startup) {
  const stage = getLifecycleStage(startup.stage);
  return startup.nextAction || (startup.recommendedSupport || [])[0] || `Define the next evidence milestone for ${stage.label}.`;
}
