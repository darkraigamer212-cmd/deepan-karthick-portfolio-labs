export const PROMPT_FIELDS = Object.freeze(["role", "task", "context", "constraints", "example", "outputFormat"]);

export const PROMPT_RESET_INPUT = Object.freeze({
  role: "",
  task: "",
  context: "",
  constraints: "",
  example: "",
  outputFormat: ""
});

export const PROMPT_EXAMPLE_INPUT = Object.freeze({
  role: "You are a careful junior software-engineering mentor.",
  task: "Review the supplied JavaScript function and identify the three highest-impact improvements.",
  context: "The audience is a first-year computer-science student preparing an internship portfolio.",
  constraints: "Do not rewrite the whole function.\nExplain each recommendation in plain language.\nDo not invent missing requirements.",
  example: "Finding: Unvalidated numeric input. Improvement: Reject non-finite values before calculation.",
  outputFormat: "Return a numbered list with: finding, why it matters, and a concise suggested change."
});

const MAX_LENGTHS = Object.freeze({
  role: 300,
  task: 800,
  context: 1200,
  constraints: 1200,
  example: 1200,
  outputFormat: 600
});

export function validatePromptInput(input) {
  const errors = [];
  for (const field of PROMPT_FIELDS) {
    const value = String(input?.[field] ?? "").trim();
    if (!value) errors.push(`${field === "outputFormat" ? "Output format" : field[0].toUpperCase() + field.slice(1)} is required.`);
    else if (value.length > MAX_LENGTHS[field]) errors.push(`${field === "outputFormat" ? "Output format" : field[0].toUpperCase() + field.slice(1)} must be ${MAX_LENGTHS[field]} characters or fewer.`);
  }
  return errors;
}

function constraintLines(value) {
  return String(value)
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*•]\s*/, ""))
    .filter(Boolean);
}

export function assemblePrompt(input) {
  const errors = validatePromptInput(input);
  if (errors.length) return { valid: false, errors, prompt: "" };
  const constraints = constraintLines(input.constraints).map((line) => `- ${line}`).join("\n");
  const prompt = [
    "## Role",
    String(input.role).trim(),
    "",
    "## Task",
    String(input.task).trim(),
    "",
    "## Context",
    String(input.context).trim(),
    "",
    "## Constraints",
    constraints,
    "",
    "## Reference example",
    String(input.example).trim(),
    "",
    "## Output format",
    String(input.outputFormat).trim()
  ].join("\n");
  return { valid: true, errors: [], prompt };
}

export function analyzePrompt(input) {
  const assembly = assemblePrompt(input);
  const checks = [
    { id: "role-specific", label: "Role is specific", pass: String(input?.role ?? "").trim().length >= 25, points: 15, suggestion: "Describe the role's expertise, audience, or decision standard." },
    { id: "task-actionable", label: "Task is actionable", pass: String(input?.task ?? "").trim().length >= 40 && /\b(create|write|review|analy[sz]e|compare|identify|design|explain|summari[sz]e|classify|calculate|build|return)\b/i.test(String(input?.task ?? "")), points: 20, suggestion: "Start with a clear action verb and define the concrete outcome." },
    { id: "context-supplied", label: "Context is sufficient", pass: String(input?.context ?? "").trim().length >= 50, points: 15, suggestion: "Add the audience, situation, and information the response may rely on." },
    { id: "constraints-clear", label: "Constraints are separated", pass: constraintLines(input?.constraints).length >= 2, points: 15, suggestion: "Put at least two explicit boundaries on separate lines." },
    { id: "example-present", label: "Reference example is useful", pass: String(input?.example ?? "").trim().length >= 35, points: 15, suggestion: "Provide a short example that demonstrates the desired specificity or style." },
    { id: "format-explicit", label: "Output format is explicit", pass: String(input?.outputFormat ?? "").trim().length >= 30 && /\b(list|table|json|markdown|paragraph|section|field|column|bullet|numbered)\b/i.test(String(input?.outputFormat ?? "")), points: 20, suggestion: "Name the exact structure, fields, or sections required in the answer." }
  ];
  const score = checks.reduce((total, check) => total + (check.pass ? check.points : 0), 0);
  const suggestions = checks.filter((check) => !check.pass).map((check) => check.suggestion);
  return {
    ...assembly,
    score,
    band: score >= 85 ? "Strong" : score >= 65 ? "Good foundation" : score >= 40 ? "Needs detail" : "Incomplete",
    checks,
    suggestions
  };
}

