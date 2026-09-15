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
  const existing = startup.kpis || [];
  const values = existing.map((item) => String(item.value || "").trim()).filter(Boolean);
  const labels = STAGE_METRIC_LABELS[getLifecycleStage(startup.stage).key];
  return labels.map((label, index) => ({ label, value: values[index] || "Not recorded" }));
}

export function getDefaultRecommendation(startup) {
  const stage = getLifecycleStage(startup.stage);
  return startup.nextAction || (startup.recommendedSupport || [])[0] || `Define the next evidence milestone for ${stage.label}.`;
}
