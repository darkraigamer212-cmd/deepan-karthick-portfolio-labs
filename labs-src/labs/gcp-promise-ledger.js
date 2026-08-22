export const PROMISE_OPTIONS = Object.freeze({
  sensitivity: {
    low: "Low — public or non-sensitive",
    internal: "Internal business data",
    high: "High — personal or regulated",
    restricted: "Restricted — tightly controlled"
  },
  downtime: {
    flexible: "Flexible maintenance window",
    scheduled: "Short scheduled interruption",
    "near-zero": "Near-zero interruption"
  },
  dependencies: {
    low: "Low — isolated workload",
    medium: "Medium — known integrations",
    high: "High — tightly coupled systems",
    unknown: "Unknown — not mapped"
  },
  skill: {
    none: "No hands-on cloud experience",
    basic: "Basic cloud experience",
    experienced: "Experienced delivery team"
  },
  modernization: {
    preserve: "Preserve current architecture",
    managed: "Adopt managed components selectively",
    redesign: "Redesign toward cloud-native patterns"
  }
});

export const PROMISE_EXAMPLE = Object.freeze({
  promiseStatement: "Moving our customer portal to Google Cloud will reduce monthly release downtime without weakening customer-data controls.",
  metricName: "Release downtime in minutes",
  baseline: "45",
  target: "15",
  workloadCount: "12",
  sensitivity: "high",
  downtime: "scheduled",
  dependencies: "medium",
  skill: "basic",
  modernization: "managed"
});

export const PROMISE_RESET = Object.freeze({
  promiseStatement: "",
  metricName: "",
  baseline: "",
  target: "",
  workloadCount: "",
  sensitivity: "",
  downtime: "",
  dependencies: "",
  skill: "",
  modernization: ""
});

export const GCP_EVIDENCE_REFERENCES = Object.freeze([
  {
    title: "Migrate to Google Cloud: Get started",
    url: "https://docs.cloud.google.com/architecture/migration-to-gcp-getting-started",
    purpose: "Official assess, plan, deploy, and optimize migration journey guidance."
  },
  {
    title: "Migration Center: Discovery and assessment overview",
    url: "https://docs.cloud.google.com/migration-center/docs/discovery-and-assessment-overview",
    purpose: "Official guidance for inventory, dependency discovery, and assessment evidence."
  }
]);

const LIMITS = Object.freeze({ statement: 280, metric: 80, workloads: 500 });

function finiteNumber(value) {
  if ((typeof value === "string" && !value.trim()) || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionExists(group, value) {
  return Object.hasOwn(PROMISE_OPTIONS[group], value);
}

export function validatePromiseInput(input) {
  const errors = {};
  const statement = String(input?.promiseStatement ?? "").trim();
  const metricName = String(input?.metricName ?? "").trim();
  const baseline = finiteNumber(input?.baseline);
  const target = finiteNumber(input?.target);
  const workloadCount = finiteNumber(input?.workloadCount);

  if (statement.length < 20) errors.promiseStatement = "Describe the executive promise in at least 20 characters.";
  else if (statement.length > LIMITS.statement) errors.promiseStatement = `Keep the promise under ${LIMITS.statement} characters.`;
  if (metricName.length < 3) errors.metricName = "Name the metric that would prove or disprove the promise.";
  else if (metricName.length > LIMITS.metric) errors.metricName = `Keep the metric name under ${LIMITS.metric} characters.`;
  if (baseline === null) errors.baseline = "Enter a finite current baseline.";
  if (target === null) errors.target = "Enter a finite claimed target.";
  if (baseline !== null && target !== null && baseline === target) errors.target = "The claimed target must differ from the baseline.";
  if (!Number.isInteger(workloadCount) || workloadCount < 1 || workloadCount > LIMITS.workloads) {
    errors.workloadCount = `Enter a whole workload count from 1 to ${LIMITS.workloads}.`;
  }

  for (const group of ["sensitivity", "downtime", "dependencies", "skill", "modernization"]) {
    if (!optionExists(group, input?.[group])) errors[group] = "Choose one option.";
  }
  return errors;
}

function signedChange(baseline, target) {
  const delta = target - baseline;
  const direction = delta > 0 ? "increase" : "decrease";
  const magnitude = Math.abs(delta);
  const percent = baseline === 0 ? null : Math.abs(delta / baseline) * 100;
  return { delta, direction, magnitude, percent };
}

function pilotSize(input) {
  if (input.dependencies === "high" || input.dependencies === "unknown" || input.sensitivity === "restricted") return 1;
  return Math.min(3, Math.max(1, Math.ceil(input.workloadCount * 0.1)));
}

function buildAssumptions(input) {
  const assumptions = [
    {
      assumption: `The baseline for “${input.metricName}” is measured consistently and is not a one-off value.`,
      evidence: "Baseline definition, data source, owner, and at least three comparable observations.",
      owner: "Metric owner"
    },
    {
      assumption: "The pilot workload represents the dependencies and operating conditions of the wider estate.",
      evidence: "Workload inventory, dependency map, traffic pattern, and reason for pilot selection.",
      owner: "Technical lead"
    },
    {
      assumption: `A rollback can stay within the ${PROMISE_OPTIONS.downtime[input.downtime].toLowerCase()} constraint.`,
      evidence: "Tested rollback steps, decision authority, recovery checkpoint, and measured rehearsal result.",
      owner: "Service owner"
    }
  ];

  if (["high", "restricted"].includes(input.sensitivity)) {
    assumptions.push({
      assumption: "Data classification, access, residency, retention, encryption, and audit controls remain acceptable in the pilot.",
      evidence: "Security and privacy review with named control owners and recorded exceptions.",
      owner: "Security and data owner"
    });
  }
  if (["high", "unknown"].includes(input.dependencies)) {
    assumptions.push({
      assumption: "No unmapped upstream or downstream dependency can invalidate the pilot or prevent rollback.",
      evidence: "Observed connection inventory, business-owner review, and failure-mode rehearsal.",
      owner: "Integration owner"
    });
  }
  if (input.skill !== "experienced") {
    assumptions.push({
      assumption: "The team can operate, secure, observe, and recover the pilot without relying on undocumented expertise.",
      evidence: "Capability matrix, paired rehearsal, runbook review, and support escalation path.",
      owner: "Delivery lead"
    });
  }
  if (input.modernization === "redesign") {
    assumptions.push({
      assumption: "Architecture redesign is necessary to test the promise and will not confound the migration evidence.",
      evidence: "Decision record separating migration effects from redesign effects and a comparable control measurement.",
      owner: "Architecture owner"
    });
  }
  return assumptions.map((item, index) => ({ id: `A${index + 1}`, status: "Unverified", ...item }));
}

function buildRisks(input) {
  const risks = [
    {
      risk: "A weak or selectively chosen baseline makes the claimed improvement look larger than it is.",
      owner: "Metric owner",
      response: "Freeze the metric definition and comparison window before pilot work begins."
    },
    {
      risk: "The pilot succeeds but is not representative enough to justify wider commitment.",
      owner: "Executive sponsor",
      response: "Require an explicit representativeness review before any scale decision."
    }
  ];
  if (["high", "restricted"].includes(input.sensitivity)) {
    risks.push({
      risk: "Sensitive data controls fail or cannot be evidenced during the pilot.",
      owner: "Security and data owner",
      response: "Use approved test data until controls are reviewed; stop on any critical control gap."
    });
  }
  if (input.downtime === "near-zero") {
    risks.push({
      risk: "Cutover or rollback interrupts a service whose tolerance is near zero.",
      owner: "Service owner",
      response: "Rehearse traffic switching and rollback with an explicit interruption threshold."
    });
  }
  if (["high", "unknown"].includes(input.dependencies)) {
    risks.push({
      risk: "An unmapped dependency creates silent data inconsistency or blocks rollback.",
      owner: "Integration owner",
      response: "Do not start the pilot until observed connections and business dependencies are reconciled."
    });
  }
  if (input.skill === "none") {
    risks.push({
      risk: "The pilot result reflects a capability gap rather than the transformation hypothesis.",
      owner: "Delivery lead",
      response: "Pair the team with reviewed expertise and prove operational tasks before measuring the pilot."
    });
  }
  return risks.map((risk, index) => ({ id: `R${index + 1}`, ...risk }));
}

function buildGates(input, hypothesis) {
  return [
    {
      horizon: "30-day evidence gate",
      purpose: "Make the promise testable before committing to a migration path.",
      evidence: [
        "Approved metric definition and reproducible baseline observations.",
        "Named workload, data, dependency, security, and service owners.",
        "Pilot selection rationale plus rollback and stop criteria.",
        ...(input.dependencies === "unknown" ? ["Observed dependency inventory reviewed by business and technical owners."] : [])
      ],
      decision: "Continue only if the baseline and pilot boundary are credible; otherwise revise the promise."
    },
    {
      horizon: "60-day evidence gate",
      purpose: "Run the smallest reversible pilot and collect comparable evidence.",
      evidence: [
        `Pilot observations for ${input.metricName}, captured with the same method as the baseline.`,
        "Rollback rehearsal result, operational runbook, and unresolved incident log.",
        "Security/control review and dependency behaviour observed during the pilot."
      ],
      decision: `Continue only if pilot evidence supports: ${hypothesis}`
    },
    {
      horizon: "90-day evidence gate",
      purpose: "Challenge repeatability and sponsor the next decision—not declare success by date.",
      evidence: [
        "Repeated observations across representative operating conditions.",
        "Assumption ledger with every item verified, rejected, or explicitly accepted as risk.",
        "Scale, revise, retain, or stop memo signed by accountable owners."
      ],
      decision: "Scale only with repeatable evidence and owned residual risks; otherwise revise or stop."
    }
  ];
}

function buildMemo(input, result) {
  const assumptionLines = result.assumptions.map((item) => `- ${item.id} [${item.status}] ${item.assumption} Owner: ${item.owner}.`);
  const riskLines = result.risks.map((item) => `- ${item.id} ${item.risk} Owner: ${item.owner}. Response: ${item.response}`);
  const gateLines = result.gates.map((gate) => `- ${gate.horizon}: ${gate.decision}`);
  return [
    "SPONSOR REVIEW — CLOUD PROMISE EVIDENCE MEMO",
    "",
    `Promise under review: ${input.promiseStatement}`,
    `Falsifiable hypothesis: ${result.hypothesis}`,
    `Smallest reversible pilot: ${result.pilot.summary}`,
    "",
    "Decision requested",
    "Approve evidence collection only. This memo does not approve production migration, budget, architecture, security posture, or a guaranteed delivery date.",
    "",
    "Assumptions",
    ...assumptionLines,
    "",
    "Evidence gates (review horizons, not deadlines)",
    ...gateLines,
    "",
    "Owned risks",
    ...riskLines,
    "",
    "Sponsor decision: [ ] Continue pilot  [ ] Revise hypothesis  [ ] Stop",
    "Named sponsor: ____________________  Review date: ____________________"
  ].join("\n");
}

export function buildPromiseLedger(rawInput) {
  const errors = validatePromiseInput(rawInput);
  if (Object.keys(errors).length) return { valid: false, errors };

  const input = {
    ...rawInput,
    promiseStatement: rawInput.promiseStatement.trim(),
    metricName: rawInput.metricName.trim(),
    baseline: Number(rawInput.baseline),
    target: Number(rawInput.target),
    workloadCount: Number(rawInput.workloadCount)
  };
  const change = signedChange(input.baseline, input.target);
  const changeDetail = change.percent === null
    ? `an absolute ${change.direction} of ${change.magnitude}`
    : `a ${change.direction} of ${change.percent.toFixed(1)}%`;
  const hypothesis = `For the reversible pilot, ${input.metricName} will move from ${input.baseline} to ${input.target} (${changeDetail}) when measured with the same definition and observation conditions, without breaching the agreed data, downtime, dependency, or rollback constraints.`;
  const size = pilotSize(input);
  const assumptions = buildAssumptions(input);
  const risks = buildRisks(input);
  const pilot = {
    workloadCount: size,
    summary: `Use ${size} representative workload${size === 1 ? "" : "s"} from the ${input.workloadCount}-workload estate. Keep the source path intact, use reversible traffic or data movement, collect the target metric beside the baseline method, and do not retire the source during this test.`,
    successEvidence: [
      `Comparable measurements show ${input.metricName} moving toward ${input.target}, not merely away from ${input.baseline}.`,
      "Rollback is rehearsed and completes inside the stated interruption constraint.",
      "No unowned critical data, security, dependency, or operational exception remains."
    ]
  };
  const gates = buildGates(input, hypothesis);
  const continueTriggers = [
    `Continue when repeated pilot observations meet or exceed the claimed target of ${input.target} using the frozen metric definition.`,
    "Continue when rollback, owner handoff, and operating runbooks are demonstrated rather than assumed.",
    "Continue when all critical assumptions are verified and residual risks have named owners."
  ];
  const stopTriggers = [
    `Stop or revise if the pilot cannot reproduce the baseline of ${input.baseline} before change.`,
    "Stop if a critical data/security control fails, an owner is missing, or rollback cannot be demonstrated.",
    "Stop if the pilot is judged unrepresentative of the workloads proposed for wider commitment.",
    ...(input.dependencies === "unknown" ? ["Stop until unknown dependencies are observed, mapped, and reviewed."] : [])
  ];
  const evidenceInventory = [
    "Workload owner, business criticality, users, peak periods, and support contact",
    "Runtime, operating system, database, storage, network, identity, and external integrations",
    "Data classification, location, retention, backup, recovery, and audit requirements",
    `Metric definition for ${input.metricName}, source system, baseline observations, and accountable owner`,
    "Dependency diagram, failure modes, rollback checkpoint, and acceptance criteria",
    "Current operating runbook, incident history, capacity pattern, and service-level obligations"
  ];
  const result = {
    valid: true,
    errors: {},
    input,
    change,
    hypothesis,
    assumptions,
    risks,
    pilot,
    gates,
    continueTriggers,
    stopTriggers,
    evidenceInventory,
    references: GCP_EVIDENCE_REFERENCES
  };
  result.memo = buildMemo(input, result);
  return result;
}

export const promiseLimits = LIMITS;
