function requiresHumanApproval(changeType) {
  const sensitiveChangeTypes = [
    "startupRiskLevel",
    "healthScore",
    "mentorRecommendation",
    "fundingRecommendation",
    "programStatus",
    "dashboardMetric"
  ];

  return sensitiveChangeTypes.includes(changeType);
}

module.exports = { requiresHumanApproval };
