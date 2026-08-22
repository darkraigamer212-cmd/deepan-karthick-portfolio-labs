export const DATA_READINESS = {
  none: { label: "No usable data yet", points: 0 },
  exploring: { label: "Sources identified, not assessed", points: 12 },
  partial: { label: "Sample data cleaned and permitted", points: 24 },
  ready: { label: "Representative, governed dataset ready", points: 35 }
};

export const RISK_IMPACT = {
  low: { label: "Low impact — informational", points: 18 },
  medium: { label: "Medium impact — influences people or work", points: 10 },
  high: { label: "High impact — rights, safety, money, or access", points: 0 }
};

export const DEPLOYMENT_CONTEXT = {
  internal: { label: "Internal assistant with human review", points: 17 },
  customer: { label: "Customer-facing experience", points: 9 },
  automated: { label: "Automated action or decision", points: 0 }
};

export const LIFECYCLE_EXAMPLE = {
  useCase: "Help support agents draft answers from an approved internal product knowledge base.",
  dataReadiness: "partial",
  riskImpact: "medium",
  deploymentContext: "internal"
};

export function validateLifecycleInput(input = {}) {
  const errors = {};
  if (String(input.useCase ?? "").trim().length < 20) errors.useCase = "Describe the use case and intended user in at least 20 characters.";
  if (!Object.hasOwn(DATA_READINESS, input.dataReadiness)) errors.dataReadiness = "Choose a data readiness level.";
  if (!Object.hasOwn(RISK_IMPACT, input.riskImpact)) errors.riskImpact = "Choose a risk and impact level.";
  if (!Object.hasOwn(DEPLOYMENT_CONTEXT, input.deploymentContext)) errors.deploymentContext = "Choose a deployment context.";
  return errors;
}

function unique(items) {
  return [...new Set(items)];
}

export function buildLifecyclePlan(input) {
  const errors = validateLifecycleInput(input);
  if (Object.keys(errors).length) return { errors, score: null, blockers: [], artifacts: [], stages: [] };

  const score = 30
    + DATA_READINESS[input.dataReadiness].points
    + RISK_IMPACT[input.riskImpact].points
    + DEPLOYMENT_CONTEXT[input.deploymentContext].points;
  const readiness = score >= 80 ? "Ready for a controlled prototype" : score >= 60 ? "Prepare key controls before prototyping" : "Resolve blockers before building";
  const blockers = [];
  const artifacts = ["Use-case charter", "Success and failure metrics", "Test set", "Risk register", "Deployment runbook", "Monitoring log"];

  if (input.dataReadiness === "none") blockers.push("No usable dataset: identify a lawful, relevant source before model work.");
  if (input.dataReadiness === "exploring") blockers.push("Data quality, permission, and representativeness have not been demonstrated.");
  if (input.riskImpact === "high") {
    blockers.push("High-impact use requires specialist review, an appeal path, and a non-AI fallback.");
    artifacts.push("Impact assessment", "Appeal and redress procedure");
  }
  if (input.deploymentContext === "customer") artifacts.push("User disclosure and feedback design", "Abuse test report");
  if (input.deploymentContext === "automated") {
    blockers.push("Automated action needs an accountable owner, stop control, and approval policy.");
    artifacts.push("Human-override procedure", "Rollback and kill-switch test");
  }

  const stages = [
    {
      name: "Scope",
      decision: `Define who benefits from “${input.useCase.trim()}” and what the system must never do.`,
      exitArtifact: "Approved use-case charter and measurable success criteria"
    },
    {
      name: "Data",
      decision: `Move from “${DATA_READINESS[input.dataReadiness].label}” to documented quality, permission, coverage, and retention.`,
      exitArtifact: "Data sheet with approved representative sample"
    },
    {
      name: "Evaluate",
      decision: "Test useful results, unsupported claims, harmful edge cases, and failure handling against a fixed evaluation set.",
      exitArtifact: "Evaluation report with launch thresholds"
    },
    {
      name: "Govern",
      decision: `Apply controls for ${RISK_IMPACT[input.riskImpact].label.toLowerCase()} and name the accountable approver.`,
      exitArtifact: "Risk acceptance, review policy, and escalation path"
    },
    {
      name: "Deploy",
      decision: `Release first as ${DEPLOYMENT_CONTEXT[input.deploymentContext].label.toLowerCase()} with logging, fallback, and rollback tested.`,
      exitArtifact: "Signed runbook and controlled launch record"
    },
    {
      name: "Monitor",
      decision: "Track quality, complaints, unsafe outputs, data drift, latency, and human overrides; define pause triggers.",
      exitArtifact: "Monitoring dashboard, incident log, and review schedule"
    }
  ];

  return { errors: {}, score, readiness, blockers, artifacts: unique(artifacts), stages };
}
