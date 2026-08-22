export const OPPORTUNITY_FACTORS = Object.freeze({
  frequency: Object.freeze({ label: "Task frequency", weight: 20, direction: "positive" }),
  repetition: Object.freeze({ label: "Process repetition", weight: 20, direction: "positive" }),
  dataAvailability: Object.freeze({ label: "Data availability", weight: 20, direction: "positive" }),
  errorCost: Object.freeze({ label: "Value of reducing errors", weight: 10, direction: "positive" }),
  privacy: Object.freeze({ label: "Privacy and sensitivity", weight: 15, direction: "inverse" }),
  humanJudgment: Object.freeze({ label: "Human judgment required", weight: 15, direction: "inverse" })
});

export const OPPORTUNITY_RESET_INPUT = Object.freeze({
  taskName: "",
  frequency: 3,
  repetition: 3,
  dataAvailability: 3,
  errorCost: 3,
  privacy: 3,
  humanJudgment: 3
});

export const OPPORTUNITY_EXAMPLE_INPUT = Object.freeze({
  taskName: "Classify incoming customer-support tickets",
  frequency: 5,
  repetition: 5,
  dataAvailability: 4,
  errorCost: 3,
  privacy: 2,
  humanJudgment: 2
});

export function validateOpportunityInput(input) {
  const errors = [];
  const taskName = String(input?.taskName ?? "").trim();
  if (!taskName) errors.push("Task name is required.");
  else if (taskName.length > 120) errors.push("Task name must be 120 characters or fewer.");

  for (const [key, factor] of Object.entries(OPPORTUNITY_FACTORS)) {
    const rawValue = input?.[key];
    const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
    if (rawValue === "" || !Number.isFinite(value)) errors.push(`${factor.label} must be a valid number.`);
    else if (!Number.isInteger(value) || value < 1 || value > 5) errors.push(`${factor.label} must be a whole number from 1 to 5.`);
  }
  return errors;
}

function scoreFactor(value, factor) {
  const normalized = factor.direction === "inverse" ? (5 - value) / 4 : (value - 1) / 4;
  return Math.round(normalized * factor.weight * 100) / 100;
}

function getBand(score) {
  if (score >= 75) return {
    id: "strong",
    label: "Strong automation opportunity",
    recommendation: "Build a measured pilot with clear success metrics and human review for exceptions."
  };
  if (score >= 55) return {
    id: "pilot",
    label: "Promising pilot opportunity",
    recommendation: "Test a narrow workflow first and compare its quality, time saved, and failure rate."
  };
  if (score >= 35) return {
    id: "assistive",
    label: "Use AI as an assistant",
    recommendation: "Keep people in control and use AI for drafts, triage, or decision support only."
  };
  return {
    id: "low",
    label: "Low automation fit",
    recommendation: "Improve the process or data before investing in an AI implementation."
  };
}

function getGuardrails(input) {
  const guardrails = [];
  if (Number(input.privacy) >= 4) guardrails.push("Complete a privacy review and minimize sensitive data before any pilot.");
  if (Number(input.humanJudgment) >= 4) guardrails.push("Require human approval for consequential decisions and ambiguous cases.");
  if (Number(input.errorCost) >= 4) guardrails.push("Use staged rollout, audit logs, and a tested fallback because errors are costly.");
  if (Number(input.dataAvailability) <= 2) guardrails.push("Improve data quality, coverage, and permissions before model selection.");
  if (Number(input.repetition) <= 2) guardrails.push("Document and standardize the workflow before attempting automation.");
  if (!guardrails.length) guardrails.push("Monitor quality and route low-confidence cases to a person.");
  return guardrails;
}

export function scoreAiOpportunity(input) {
  const errors = validateOpportunityInput(input);
  if (errors.length) return { valid: false, errors, score: null, band: null, breakdown: [], guardrails: [] };

  const breakdown = Object.entries(OPPORTUNITY_FACTORS).map(([key, factor]) => {
    const value = Number(input[key]);
    return {
      key,
      label: factor.label,
      value,
      weight: factor.weight,
      direction: factor.direction,
      points: scoreFactor(value, factor)
    };
  });
  const score = Math.round(breakdown.reduce((total, item) => total + item.points, 0));
  return {
    valid: true,
    errors: [],
    taskName: String(input.taskName).trim(),
    score,
    band: getBand(score),
    breakdown,
    guardrails: getGuardrails(input),
    formula: "Positive factors use (rating − 1) ÷ 4 × weight. Risk factors use (5 − rating) ÷ 4 × weight."
  };
}

