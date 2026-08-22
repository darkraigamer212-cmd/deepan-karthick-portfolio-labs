const TASK_LABELS = {
  classify: "Classify or route items",
  summarize: "Summarize information",
  extract: "Extract structured facts",
  draft: "Draft new content",
  recommend: "Recommend a next action"
};

const REVIEW_LABELS = {
  low: "Spot-check a sample",
  medium: "Review every output",
  high: "Expert approval before use"
};

export const AI_WORKFLOW_EXAMPLE = {
  goal: "Turn weekly support tickets into a concise product-trend briefing for the product team.",
  dataSource: "An exported CSV of anonymized customer support tickets with issue, product area, and resolution fields.",
  aiTask: "summarize",
  reviewLevel: "high"
};

export function validateWorkflowInput(input = {}) {
  const errors = {};
  const goal = String(input.goal ?? "").trim();
  const dataSource = String(input.dataSource ?? "").trim();

  if (goal.length < 12) errors.goal = "Describe the outcome in at least 12 characters.";
  if (dataSource.length < 12) errors.dataSource = "Describe the data and where it comes from.";
  if (!Object.hasOwn(TASK_LABELS, input.aiTask)) errors.aiTask = "Choose an AI task.";
  if (!Object.hasOwn(REVIEW_LABELS, input.reviewLevel)) errors.reviewLevel = "Choose a human review level.";

  return errors;
}

function containsSensitiveData(text) {
  return /customer|personal|private|confidential|patient|employee|email|phone|financial/i.test(text);
}

export function buildAIWorkflow(input) {
  const errors = validateWorkflowInput(input);
  if (Object.keys(errors).length) return { errors, steps: [], risks: [], checklist: [] };

  const goal = input.goal.trim();
  const dataSource = input.dataSource.trim();
  const taskLabel = TASK_LABELS[input.aiTask];
  const reviewLabel = REVIEW_LABELS[input.reviewLevel];
  const steps = [
    { title: "Define success", detail: `Confirm that the intended outcome is: ${goal}` },
    { title: "Inspect the source", detail: `Check freshness, ownership, missing fields, and permission for: ${dataSource}` },
    { title: "Prepare the input", detail: "Remove irrelevant records, mask sensitive fields, and keep a clean source copy." },
    { title: "Run the AI task", detail: `${taskLabel}. Require the output to reference only the supplied data.` },
    { title: "Check the result", detail: "Compare claims with source records and flag unsupported or uncertain statements." },
    { title: "Apply human review", detail: `${reviewLabel}. Record corrections and the final reviewer decision.` },
    { title: "Release and learn", detail: "Share the approved result, retain an audit note, and use corrections to improve the next run." }
  ];

  const risks = [
    { level: "High", title: "Unsupported output", mitigation: "Require source-grounded claims and reject invented details." },
    { level: input.reviewLevel === "low" ? "High" : "Medium", title: "Automation bias", mitigation: "Show source evidence beside the output and make review responsibility explicit." },
    { level: "Medium", title: "Weak or stale input", mitigation: "Check coverage, dates, missing values, and duplicates before the AI step." }
  ];

  if (containsSensitiveData(dataSource)) {
    risks.unshift({
      level: "High",
      title: "Sensitive data exposure",
      mitigation: "Remove direct identifiers and confirm permission before processing."
    });
  }

  if (input.aiTask === "recommend") {
    risks.push({
      level: "High",
      title: "Decision overreach",
      mitigation: "Treat recommendations as decision support; a responsible person owns the final action."
    });
  }

  const checklist = [
    "Success criteria and the intended audience are written down.",
    "The source is permitted, current, and sufficiently complete.",
    "Sensitive fields are removed or protected.",
    "Every important claim can be traced to source evidence.",
    `${reviewLabel} is assigned to a named person or role.`,
    "Corrections and the final decision are recorded."
  ];

  return {
    errors: {},
    summary: `${taskLabel} for “${goal}” using ${reviewLabel.toLowerCase()}.`,
    steps,
    risks,
    checklist
  };
}

export { REVIEW_LABELS, TASK_LABELS };
