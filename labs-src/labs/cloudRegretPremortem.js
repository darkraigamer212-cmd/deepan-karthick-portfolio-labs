export const RISK_LEVELS = {
  low: { label: "Low", score: 1 },
  medium: { label: "Medium", score: 2 },
  high: { label: "High", score: 3 }
};

export const CLOUD_PREMORTEM_EXAMPLE = {
  migrationGoal: "Move the customer booking application and its database to managed cloud services.",
  currency: "INR",
  currentMonthlyCost: 85000,
  cloudMonthlyCost: 68000,
  migrationCost: 240000,
  horizonMonths: 24,
  portabilityRisk: "medium",
  lockInRisk: "medium",
  skillsRisk: "high",
  downtimeRisk: "medium",
  exportRisk: "low"
};

const COST_FIELDS = ["currentMonthlyCost", "cloudMonthlyCost", "migrationCost"];
const RISK_FIELDS = ["portabilityRisk", "lockInRisk", "skillsRisk", "downtimeRisk", "exportRisk"];
const CURRENCIES = new Set(["INR", "USD", "EUR", "GBP"]);

export function validateCloudPremortem(input = {}) {
  const errors = {};
  if (String(input.migrationGoal ?? "").trim().length < 20) {
    errors.migrationGoal = "Describe the workload and migration goal in at least 20 characters.";
  }
  if (!CURRENCIES.has(input.currency)) errors.currency = "Choose a supported currency.";
  for (const field of COST_FIELDS) {
    const value = Number(input[field]);
    if (input[field] === "" || !Number.isFinite(value) || value < 0 || value > 100000000) {
      errors[field] = "Enter a planning estimate from 0 to 100,000,000.";
    }
  }
  const months = Number(input.horizonMonths);
  if (!Number.isInteger(months) || months < 12 || months > 36) {
    errors.horizonMonths = "Choose a whole-number horizon from 12 to 36 months.";
  }
  for (const field of RISK_FIELDS) {
    if (!Object.hasOwn(RISK_LEVELS, input[field])) errors[field] = "Choose low, medium, or high.";
  }
  return errors;
}

function riskText(level) {
  return RISK_LEVELS[level].label;
}

export function formatMoney(value, currency) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function buildCloudPremortem(input) {
  const errors = validateCloudPremortem(input);
  if (Object.keys(errors).length) {
    return { errors, scenarios: [], pilot: null, decisionMemo: "" };
  }

  const months = Number(input.horizonMonths);
  const currentMonthly = Number(input.currentMonthlyCost);
  const cloudMonthly = Number(input.cloudMonthlyCost);
  const migrationCost = Number(input.migrationCost);
  const stayTco = currentMonthly * months;
  const migrateTco = cloudMonthly * months + migrationCost;
  const difference = stayTco - migrateTco;
  const highRiskCount = RISK_FIELDS.filter((field) => input[field] === "high").length;
  const riskScore = RISK_FIELDS.reduce((total, field) => total + RISK_LEVELS[input[field]].score, 0);

  const recommendation = difference > 0 && highRiskCount <= 1
    ? "Run a bounded, reversible pilot before committing the full workload."
    : "Pause the full migration and reduce cost or exit risk through a smaller proof first.";

  const scenarios = [
    {
      title: "The cloud bill erases the expected saving",
      exposure: cloudMonthly * 1.25 * months + migrationCost - stayTco,
      cause: "Usage, egress, support, or idle capacity is higher than the planning estimate.",
      warning: `Pilot run-rate exceeds ${formatMoney(cloudMonthly * 1.1, input.currency)} per month.`,
      reversal: "Stop expansion, remove pilot resources, export records, and return traffic to the current service."
    },
    {
      title: "The migration takes longer than the business can absorb",
      exposure: migrationCost * (input.skillsRisk === "high" ? 0.75 : 0.35),
      cause: `${riskText(input.skillsRisk)} skills risk creates rework, consulting dependency, or parallel-running cost.`,
      warning: "Two pilot milestones slip or the team cannot operate the recovery procedure unaided.",
      reversal: "Freeze scope, document gaps, and keep the existing platform authoritative while skills are built."
    },
    {
      title: "A cutover outage harms customers",
      exposure: currentMonthly * (input.downtimeRisk === "high" ? 1 : 0.35),
      cause: `${riskText(input.downtimeRisk)} downtime risk combines with untested dependencies or restore steps.`,
      warning: "Rehearsal exceeds the downtime window or integrity checks fail.",
      reversal: "Cancel cutover, restore the prior route and database authority, then reconcile pilot writes."
    },
    {
      title: "The business cannot leave on acceptable terms",
      exposure: migrationCost * ((RISK_LEVELS[input.lockInRisk].score + RISK_LEVELS[input.portabilityRisk].score) / 3),
      cause: `${riskText(input.lockInRisk)} lock-in and ${riskText(input.portabilityRisk).toLowerCase()} portability risk make replacement costly.`,
      warning: "The pilot depends on an undocumented proprietary feature or cannot run from exported configuration.",
      reversal: "Reject the dependency, choose a portable alternative, or record an explicit exception before continuing."
    },
    {
      title: "Data export works on paper but fails under pressure",
      exposure: migrationCost * (RISK_LEVELS[input.exportRisk].score / 3),
      cause: `${riskText(input.exportRisk)} export risk leaves formats, metadata, restore time, or ownership uncertain.`,
      warning: "A timed export-and-restore drill misses records, permissions, metadata, or the recovery target.",
      reversal: "Do not migrate the system of record until a complete export is restored to an independent target."
    }
  ];

  const pilot = {
    scope: "One non-critical workflow, representative data, and a fixed 30-day operating window.",
    continueTriggers: [
      `Measured run-rate stays at or below ${formatMoney(cloudMonthly * 1.1, input.currency)} per month.`,
      "A timed export restores successfully to an independent location.",
      "The team completes cutover and rollback rehearsals inside the agreed downtime window.",
      "Evaluation confirms required performance, security, and user outcomes."
    ],
    stopTriggers: [
      "Any critical data-integrity, access-control, or recovery check fails.",
      "Two milestones slip without a funded recovery plan.",
      "A required service has no tested replacement or usable export path.",
      "The accountable owner cannot explain or execute rollback."
    ],
    exitChecklist: [
      "Export application data, identities, permissions, logs, and configuration.",
      "Restore the export to a location not controlled by the pilot service.",
      "Compare record counts, checksums, permissions, and a user sample.",
      "Redirect traffic to the prior service and verify queued transactions.",
      "Remove pilot resources and confirm final billing and data deletion."
    ]
  };

  const summary = {
    stayTco,
    migrateTco,
    difference,
    riskScore,
    highRiskCount,
    recommendation
  };
  return {
    errors: {},
    summary,
    scenarios,
    pilot,
    decisionMemo: formatDecisionMemo(input, summary, scenarios, pilot)
  };
}

export function formatDecisionMemo(input, summary, scenarios, pilot) {
  const direction = summary.difference >= 0 ? "estimated saving" : "estimated premium";
  const lines = [
    "CLOUD MIGRATION REGRET PRE-MORTEM",
    `Decision: ${input.migrationGoal.trim()}`,
    `Planning horizon: ${input.horizonMonths} months`,
    "",
    "TRANSPARENT COST ASSUMPTIONS (NOT PROVIDER QUOTES)",
    `Stay as-is: ${formatMoney(summary.stayTco, input.currency)}`,
    `Migrate: ${formatMoney(summary.migrateTco, input.currency)} including ${formatMoney(Number(input.migrationCost), input.currency)} one-time migration cost`,
    `${direction}: ${formatMoney(Math.abs(summary.difference), input.currency)}`,
    `Risk score: ${summary.riskScore}/15; high-risk dimensions: ${summary.highRiskCount}`,
    `Recommendation: ${summary.recommendation}`,
    "",
    "FIVE WAYS WE COULD REGRET THIS"
  ];
  scenarios.forEach((scenario, index) => {
    lines.push(`${index + 1}. ${scenario.title}`);
    lines.push(`   Cause: ${scenario.cause}`);
    lines.push(`   Early warning: ${scenario.warning}`);
    lines.push(`   Reversible response: ${scenario.reversal}`);
  });
  lines.push("", "REVERSIBLE PILOT CONTRACT", `Scope: ${pilot.scope}`, "Continue only if:");
  pilot.continueTriggers.forEach((item) => lines.push(`- ${item}`));
  lines.push("Stop if:");
  pilot.stopTriggers.forEach((item) => lines.push(`- ${item}`));
  lines.push("Exit test:");
  pilot.exitChecklist.forEach((item) => lines.push(`- ${item}`));
  return lines.join("\n");
}
