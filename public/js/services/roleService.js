/**
 * Role Management Service
 * Handles user role selection and context-specific view adjustments
 */

export const ROLES = {
  SGA: { id: "sga", label: "SGA", description: "Startup Growth Associate" },
  LEADER: { id: "leader", label: "Leader", description: "Program Leader" },
  MENTOR: { id: "mentor", label: "Mentor", description: "Mentor" },
  FOUNDER: { id: "founder", label: "Founder", description: "Founder" }
};

const ROLE_STORAGE_KEY = "usi-hub-user-role";
const DEFAULT_ROLE = "sga";

/**
 * Get current selected role
 */
export function getCurrentRole() {
  const stored = localStorage.getItem(ROLE_STORAGE_KEY);
  return stored || DEFAULT_ROLE;
}

/**
 * Set user role
 */
export function setCurrentRole(roleId) {
  if (Object.values(ROLES).some((r) => r.id === roleId)) {
    localStorage.setItem(ROLE_STORAGE_KEY, roleId);
    window.dispatchEvent(new CustomEvent("roleChanged", { detail: { role: roleId } }));
  }
}

/**
 * Get role-specific emphasis for each module
 */
export function getRoleModuleEmphasis(role) {
  const emphasis = {
    sga: {
      overview: "Health metrics, risk assessment, at-risk startups, action items",
      "startup-os": "Startup list, filtering, cohort view, quick triage",
      "startup-detail": "Full profile, risk scoring, missing data, mentor matches",
      contacts: "Mentors, experts, trainers, and support matching data",
      "usi-intelligence": "AI proposals, approval workflow, data collection",
      "project-board": "Startup support tasks, workstream view, priority tracking",
      "task-detail": "Task owners, progress updates, notes, and follow-up",
      "knowledge-base": "Full document metadata, indexing status, evidence use"
    },
    leader: {
      overview: "Cohort summary, risk distribution, program KPIs, mentoring load",
      "startup-os": "Portfolio list, cohort comparison, sector distribution",
      "startup-detail": "Health distribution, risk portfolio, team composition",
      contacts: "Support network coverage and mentor capacity",
      "usi-intelligence": "Cohort-level insights, allocation recommendations",
      "project-board": "Workstream summary, blockers, resource allocation",
      "task-detail": "Individual incubation task accountability",
      "knowledge-base": "Extraction priority, document impact, evidence standards"
    },
    mentor: {
      overview: "Assigned startups only, next milestones, check-in schedule",
      "startup-os": "Assigned startup list and quick context",
      "startup-detail": "Assigned startup details, validation needs, support gaps",
      contacts: "Relevant experts and trainers for handoff",
      "usi-intelligence": "Questions about mentee startups only",
      "project-board": "My assigned tasks, mentee milestones",
      "task-detail": "My task scope, due date, status, and notes",
      "knowledge-base": "Documents relevant to my mentees"
    },
    founder: {
      overview: "My startup health, milestone progress, mentor feedback",
      "startup-os": "My startup profile summary and next actions",
      "startup-detail": "My startup profile, roadblocks, metrics, and support plan",
      contacts: "Approved contacts assigned to my startup",
      "usi-intelligence": "Questions about my startup, growth insights",
      "project-board": "My milestones, my tasks",
      "task-detail": "My task details, milestones, and status",
      "knowledge-base": "Relevant to my startup, guides, templates"
    }
  };

  return emphasis[role] || emphasis.sga;
}

/**
 * Get role-specific action permissions
 */
export function getRolePermissions(role) {
  const permissions = {
    sga: {
      "approve-proposals": true,
      "update-startup-profile": true,
      "assign-mentors": true,
      "create-project-tasks": true,
      "add-knowledge-notes": true,
      "view-all-startups": true,
      "view-all-mentors": true
    },
    leader: {
      "approve-proposals": true,
      "update-startup-profile": false,
      "assign-mentors": true,
      "create-project-tasks": true,
      "add-knowledge-notes": true,
      "view-all-startups": true,
      "view-all-mentors": true
    },
    mentor: {
      "approve-proposals": false,
      "update-startup-profile": false,
      "assign-mentors": false,
      "create-project-tasks": false,
      "add-knowledge-notes": true,
      "view-all-startups": false,
      "view-all-mentors": false
    },
    founder: {
      "approve-proposals": false,
      "update-startup-profile": false,
      "assign-mentors": false,
      "create-project-tasks": false,
      "add-knowledge-notes": false,
      "view-all-startups": false,
      "view-all-mentors": false
    }
  };

  return permissions[role] || permissions.sga;
}

/**
 * Get role-specific dashboard cards
 */
export function getRoleDashboardCards(role) {
  const cards = {
    sga: ["health-distribution", "at-risk-startups", "pending-approvals", "mentor-load", "data-gaps", "recent-insights"],
    leader: ["cohort-summary", "risk-portfolio", "mentoring-coverage", "program-kpis", "resource-allocation", "team-feedback"],
    mentor: ["my-startups", "next-check-ins", "milestone-progress", "mentee-needs", "recent-qa"],
    founder: ["my-health", "my-milestones", "mentor-feedback", "next-actions", "my-documents"]
  };

  return cards[role] || cards.sga;
}

/**
 * Format message based on role context
 */
export function getRoleGreeting(role) {
  const greetings = {
    sga: "View startup risk, assign mentors, and approve platform actions.",
    leader: "Monitor cohort health, optimize resource allocation, and guide the program.",
    mentor: "Track your mentees' progress, provide feedback, and access session notes.",
    founder: "View your startup profile, milestones, and mentor feedback."
  };

  return greetings[role] || greetings.sga;
}
