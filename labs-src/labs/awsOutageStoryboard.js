export const AWS_RESILIENCE_SOURCES = Object.freeze([
  Object.freeze({ label: "AWS Well-Architected: Conduct game days regularly", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_testing_resiliency_game_days_resiliency.html" }),
  Object.freeze({ label: "AWS Reliability Pillar: Failure management", url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/failure-management.html" }),
  Object.freeze({ label: "AWS Reliability Pillar: Fault isolation", url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/use-fault-isolation-to-protect-your-workload.html" })
]);

export const AWS_DEPENDENCY_CATEGORIES = Object.freeze({
  edge: "DNS and content delivery",
  compute: "Web and API compute",
  data: "Primary data store",
  async: "Queues and background jobs",
  external: "External identity or payment service"
});

export const AWS_STORYBOARD_RESET_INPUT = Object.freeze({
  journeySteps: "",
  dependencies: Object.freeze(["edge", "compute", "data"]),
  recoveryPriority: "restore-core-journey",
  trafficShape: "steady",
  dataCriticality: "medium"
});

export const AWS_STORYBOARD_EXAMPLE_INPUT = Object.freeze({
  journeySteps: "Open product page\nSign in\nAdd item to cart\nPay for order\nSee order confirmation",
  dependencies: Object.freeze(["edge", "compute", "data", "async", "external"]),
  recoveryPriority: "protect-data",
  trafficShape: "launch-spike",
  dataCriticality: "high"
});

const allowedPriorities = new Set(["restore-core-journey", "protect-data", "communicate-first"]);
const allowedTraffic = new Set(["steady", "variable", "launch-spike"]);
const allowedCriticality = new Set(["low", "medium", "high"]);

function cleanLines(value) {
  return String(value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
export function validateOutageStoryboardInput(input) {
  const errors = [];
  const steps = cleanLines(input?.journeySteps);
  if (steps.length < 2) errors.push("Enter at least two customer journey steps, one per line.");
  else if (steps.length > 8) errors.push("Use eight customer journey steps or fewer for a focused rehearsal.");
  if (steps.some((step) => step.length > 100)) errors.push("Each customer journey step must be 100 characters or fewer.");

  const dependencies = Array.isArray(input?.dependencies) ? input.dependencies : [];
  if (!dependencies.length) errors.push("Select at least one architecture dependency category.");
  else if (dependencies.some((item) => !Object.hasOwn(AWS_DEPENDENCY_CATEGORIES, item))) errors.push("Choose only supported architecture dependency categories.");
  if (!allowedPriorities.has(input?.recoveryPriority)) errors.push("Choose a supported recovery priority.");
  if (!allowedTraffic.has(input?.trafficShape)) errors.push("Choose a supported traffic shape.");
  if (!allowedCriticality.has(input?.dataCriticality)) errors.push("Choose a supported data criticality.");
  return errors;
}

const categoryTemplates = Object.freeze({
  edge: Object.freeze({
    title: "Customers cannot reach the experience",
    symptom: (step) => `The customer cannot complete “${step}”; the page may fail to load or serve stale content.`,
    evidence: ["Synthetic journey check fails before the application is reached.", "Amazon CloudWatch request/error signals diverge from the normal baseline."],
    containment: "Freeze unrelated changes, confirm the fault boundary, and direct traffic only to a known-healthy path.",
    fallback: "Publish a tested static status or maintenance path with a clear retry message.",
    proof: (step) => [`Run “${step}” from an external test location.`, "Confirm healthy and unhealthy paths are distinguishable in monitoring."],
    awsConcept: "Amazon CloudWatch evidence plus fault-isolation boundaries"
  }),
  compute: Object.freeze({
    title: "The API path becomes unavailable",
    symptom: (step) => `The customer reaches “${step}” but receives an error, timeout, or repeated retry.`,
    evidence: ["Amazon CloudWatch latency and error signals rise together.", "AWS X-Ray traces, if already instrumented, identify the failing request segment."],
    containment: "Stop the suspected rollout or isolate the unhealthy compute path using the rehearsed runbook.",
    fallback: "Degrade to read-only or queue non-critical actions instead of returning an ambiguous success.",
    proof: (step) => [`Complete “${step}” repeatedly with a known test account.`, "Verify errors return to the agreed baseline and no hidden backlog remains."],
    awsConcept: "Amazon CloudWatch, AWS X-Ray, and an operator runbook"
  }),
  data: Object.freeze({
    title: "The source of truth is unavailable or inconsistent",
    symptom: (step) => `At “${step}”, the customer sees missing, stale, duplicated, or unconfirmed information.`,
    evidence: ["Application data-error signals and failed consistency checks appear together.", "A controlled read verifies whether the issue is availability, latency, or incorrect state."],
    containment: "Pause destructive writes and preserve evidence before attempting repair or failover.",
    fallback: "Use a clearly labelled read-only mode or capture intent in a durable, reconciled queue.",
    proof: (step, input) => [`Reconcile a known transaction through “${step}” end to end.`, input.dataCriticality === "high" ? "Prove backup/restore or failover results and account for every test transaction." : "Confirm reads and writes agree after recovery."],
    awsConcept: "Defined recovery objectives, tested restoration, and data reconciliation"
  }),
  async: Object.freeze({
    title: "Background work silently stops",
    symptom: (step) => `The customer completes “${step}” but a receipt, update, or follow-up action never arrives.`,
    evidence: ["Queue age, failed-job, or dead-letter evidence grows while front-end requests still succeed.", "A correlation identifier traces one customer action into its background work."],
    containment: "Stop repeated side effects, preserve the backlog, and isolate poison messages.",
    fallback: "Tell customers the action is pending and provide a safe status check instead of asking them to repeat it.",
    proof: (step) => [`Replay one controlled item created at “${step}”.`, "Verify backlog drains without duplicate customer-visible actions."],
    awsConcept: "Amazon CloudWatch queue/job evidence and idempotent recovery"
  }),
  external: Object.freeze({
    title: "A third-party dependency degrades",
    symptom: (step) => `The customer is blocked at “${step}” even though the startup's own application is reachable.`,
    evidence: ["Dependency timeout/error evidence changes while internal health checks remain normal.", "A trace or correlation ID separates the external wait from internal processing."],
    containment: "Open the circuit, cap retries, and prevent one dependency from exhausting the whole request path.",
    fallback: "Capture customer intent safely and provide an honest pending or alternate path.",
    proof: (step) => [`Complete “${step}” through both normal and fallback paths.`, "Confirm retries cannot duplicate payment, identity, or notification effects."],
    awsConcept: "AWS X-Ray evidence and a tested dependency-isolation pattern"
  })
});

const supplementalTemplates = Object.freeze({
  traffic: Object.freeze({
    title: "Launch traffic exceeds a hidden limit",
    symptom: (step) => `During “${step}”, customers experience rising latency before outright failures begin.`,
    evidence: ["Amazon CloudWatch throughput, throttling, latency, and saturation evidence move together.", "A pre-agreed customer-journey threshold triggers the rehearsal."],
    containment: "Protect the core journey, shed optional work, and stop promotional traffic if the stop condition is reached.",
    fallback: "Serve a reduced experience and queue work that does not need an immediate answer.",
    proof: (step) => [`Run “${step}” at the agreed rehearsal load.`, "Confirm scaling down does not discard queued or in-flight work."],
    awsConcept: "Capacity monitoring and tested scaling procedures"
  }),
  change: Object.freeze({
    title: "A routine change breaks the customer journey",
    symptom: (step) => `Immediately after a change, “${step}” behaves differently for customers.`,
    evidence: ["Deployment/change timestamps align with the first failed synthetic journey.", "Logs identify the version handling the failed request."],
    containment: "Stop the rollout and use the pre-tested rollback or forward-fix decision rule.",
    fallback: "Route customers to the last known-good behavior while evidence is preserved.",
    proof: (step) => [`Repeat “${step}” against the recovered version.`, "Confirm configuration and infrastructure state match the intended version."],
    awsConcept: "Runbook-driven recovery and configuration-drift checks"
  })
});

export function generateOutageStoryboard(input) {
  const errors = validateOutageStoryboardInput(input);
  if (errors.length) return { valid: false, errors, cards: [], checklist: [], sources: AWS_RESILIENCE_SOURCES };

  const steps = cleanLines(input.journeySteps);
  const requested = [...new Set(input.dependencies)];
  const candidateKeys = [...requested, "traffic", "change"];
  const cardCount = Math.min(5, Math.max(3, requested.length));
  const cards = candidateKeys.slice(0, cardCount).map((key, index) => {
    const template = categoryTemplates[key] ?? supplementalTemplates[key];
    const journeyIndex = Math.min(steps.length - 1, Math.round(index * (steps.length - 1) / Math.max(1, cardCount - 1)));
    const journeyStep = steps[journeyIndex];
    const proof = template.proof(journeyStep, input);
    return {
      id: `story-${index + 1}-${key}`,
      sequence: index + 1,
      dependency: Object.hasOwn(AWS_DEPENDENCY_CATEGORIES, key) ? AWS_DEPENDENCY_CATEGORIES[key] : key === "traffic" ? "Traffic and capacity" : "Deployment and configuration",
      title: template.title,
      journeyStep,
      customerSymptom: template.symptom(journeyStep),
      detectionEvidence: template.evidence,
      containment: template.containment,
      fallback: template.fallback,
      recoveryProof: proof,
      awsConcept: template.awsConcept,
      rule: `Selected because ${Object.hasOwn(AWS_DEPENDENCY_CATEGORIES, key) ? `${key} is a declared dependency` : `${key} completes the minimum three-scenario rehearsal`}.`
    };
  });

  const priorityInstruction = input.recoveryPriority === "protect-data"
    ? "Treat evidence preservation and data reconciliation as stop conditions before reopening writes."
    : input.recoveryPriority === "communicate-first"
      ? "Assign one person to customer communication before the first scenario begins."
      : "Define the smallest customer journey that must recover first.";
  const trafficInstruction = input.trafficShape === "launch-spike"
    ? "Rehearse with controlled launch-like load in a non-production or approved test environment."
    : "Record the normal traffic baseline used to judge recovery.";

  return {
    valid: true,
    errors: [],
    cards,
    sources: AWS_RESILIENCE_SOURCES,
    checklist: [
      "Name a facilitator, incident lead, customer observer, and note taker.",
      "Use a non-production replica or obtain explicit approval and define a safe fault boundary.",
      "Write measurable stop conditions and an immediate rollback action.",
      priorityInstruction,
      trafficInstruction,
      "Capture timestamps, correlation IDs, screenshots, and monitoring links for each symptom.",
      "Do not reveal a scenario to responders until the facilitator starts that card.",
      "Prove recovery from the customer's first step through the final confirmation.",
      "Record gaps without blame and assign an owner plus due date to every follow-up.",
      "Remove injected faults and verify the environment returned to its starting state."
    ],
    limitation: "This local storyboard does not inspect an AWS account, inject faults, or approve a production GameDay. A qualified owner must review the architecture, safety boundary, and rollback plan."
  };
}
