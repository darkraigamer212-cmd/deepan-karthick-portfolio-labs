const MAX_FIELDS = 20;
export const CLASSIFICATIONS = new Set(["public", "internal", "personal", "secret"]);
export const PURPOSES = new Set(["training", "retrieval", "evaluation"]);

export const DATA_FIREWALL_EXAMPLE = {
  targetTask: "Retrieve approved support guidance to help an agent draft a grounded response.",
  purpose: "retrieval",
  fieldRows: "ticket_id|internal|retrieval,evaluation|180\nissue_summary|internal|training,retrieval,evaluation|180\ncustomer_email|personal|retrieval|30\nresolution_text|internal|training,retrieval,evaluation|365\napi_token|secret|retrieval|1\ninternal_agent_note|internal|evaluation|30\npublic_product_name|public|training,retrieval,evaluation|730"
};

function safeFieldName(value) {
  return /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(value);
}

export function parseFieldContract(text) {
  const lines = String(text ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const errors = [];
  const fields = [];
  const names = new Set();
  if (!lines.length) errors.push("Add at least one field contract row.");
  if (lines.length > MAX_FIELDS) errors.push(`Use at most ${MAX_FIELDS} field rows.`);
  lines.slice(0, MAX_FIELDS).forEach((line, index) => {
    const [name, classification, allowedUseText, retentionText, ...extra] = line.split("|").map((part) => part.trim());
    if (!name || !classification || !allowedUseText || !retentionText || extra.length) {
      errors.push(`Row ${index + 1}: use field|classification|allowed use|retention days.`);
      return;
    }
    if (!safeFieldName(name)) errors.push(`Row ${index + 1}: field must start with a letter and use only letters, numbers, or underscores.`);
    const key = name.toLowerCase();
    if (names.has(key)) errors.push(`Row ${index + 1}: duplicate field “${name}”.`);
    names.add(key);
    if (!CLASSIFICATIONS.has(classification)) errors.push(`Row ${index + 1}: classification must be public, internal, personal, or secret.`);
    const allowedUses = [...new Set(allowedUseText.split(",").map((item) => item.trim()).filter(Boolean))];
    if (!allowedUses.length || allowedUses.some((purpose) => !PURPOSES.has(purpose))) {
      errors.push(`Row ${index + 1}: allowed use must contain only training, retrieval, or evaluation.`);
    }
    const retentionDays = Number(retentionText);
    if (!Number.isInteger(retentionDays) || retentionDays < 0 || retentionDays > 3650) {
      errors.push(`Row ${index + 1}: retention must be 0–3650 whole days.`);
    }
    if (safeFieldName(name) && CLASSIFICATIONS.has(classification) && allowedUses.length && allowedUses.every((purpose) => PURPOSES.has(purpose)) && Number.isInteger(retentionDays) && retentionDays >= 0 && retentionDays <= 3650) {
      fields.push({ name, classification, allowedUses, retentionDays });
    }
  });
  return { fields, errors };
}

export function validateDataFirewall(input = {}) {
  const errors = {};
  if (String(input.targetTask ?? "").trim().length < 20) errors.targetTask = "Describe the bounded LLM task in at least 20 characters.";
  if (!PURPOSES.has(input.purpose)) errors.purpose = "Choose training, retrieval, or evaluation.";
  const parsed = parseFieldContract(input.fieldRows);
  if (parsed.errors.length) errors.fieldRows = parsed.errors;
  return { errors, fields: parsed.fields };
}

export function decideField(field, purpose) {
  if (!field.allowedUses.includes(purpose)) {
    return { action: "exclude", reason: `Contract does not permit ${purpose} use.`, transform: "omit" };
  }
  if (field.classification === "secret") {
    return { action: "quarantine", reason: "Secrets must never enter the LLM dataset automatically.", transform: "manual security review" };
  }
  if (field.classification === "personal") {
    if (field.retentionDays > 90) return { action: "exclude", reason: "Personal data retention exceeds the 90-day firewall limit.", transform: "omit" };
    return { action: "redact", reason: "Replace direct personal values before the dataset boundary.", transform: "stable token or irreversible redaction" };
  }
  if (field.classification === "internal" && field.retentionDays > 365) {
    return { action: "exclude", reason: "Internal data retention exceeds the 365-day firewall limit.", transform: "omit" };
  }
  return { action: "allow", reason: "Purpose and retention comply with this deterministic contract.", transform: "pass after validation" };
}

export function buildDataFirewall(input) {
  const validated = validateDataFirewall(input);
  if (Object.keys(validated.errors).length) return { errors: validated.errors, decisions: [], stages: [], leakageTests: [], jsonlSchema: "", datasetCard: "" };
  const decisions = validated.fields.map((field) => ({ ...field, ...decideField(field, input.purpose) }));
  const stages = [
    "Validate field names, classification, permitted purpose, and retention before reading any record values.",
    `Select only fields explicitly permitted for ${input.purpose}; exclude every unlisted field by default.`,
    "Route secret fields to quarantine metadata only; never copy their values into staging, prompts, logs, or samples.",
    "Redact personal fields with a documented deterministic transform before the approved dataset boundary.",
    "Emit only allow/redact fields into a versioned schema and attach retention expiry metadata.",
    "Run leakage fixtures and contract checks before publishing; fail closed on any unexpected field."
  ];
  const leakageTests = [
    "A record containing an undeclared field is rejected rather than silently passed through.",
    "Canary email, phone, token, and credential patterns do not appear in emitted samples, logs, or errors.",
    "Quarantined field values never appear in training, retrieval chunks, or evaluation fixtures.",
    "Redaction remains stable where joins are required but cannot reconstruct the original personal value.",
    "Expired records and fields are removed from dataset, index, cache, backup, and derived artifacts.",
    "A purpose change fails until every field contract is reviewed and versioned again."
  ];
  return {
    errors: {},
    decisions,
    stages,
    leakageTests,
    jsonlSchema: formatJsonlSchema(input, decisions),
    datasetCard: formatDatasetCard(input, decisions, leakageTests)
  };
}

export function formatJsonlSchema(input, decisions) {
  const included = decisions.filter((field) => ["allow", "redact"].includes(field.action));
  const schema = {
    title: "LLM record contract",
    type: "object",
    purpose: input.purpose,
    additionalProperties: false,
    properties: Object.fromEntries(included.map((field) => [field.name, {
      type: "string",
      classification: field.classification,
      handling: field.action,
      maxRetentionDays: field.retentionDays
    }]))
  };
  return JSON.stringify(schema, null, 2);
}

export function formatDatasetCard(input, decisions, leakageTests) {
  const counts = decisions.reduce((totals, field) => ({ ...totals, [field.action]: (totals[field.action] ?? 0) + 1 }), {});
  return [
    "LLM DATASET CONTRACT CARD",
    `Task: ${input.targetTask.trim()}`,
    `Purpose: ${input.purpose}`,
    `Contract result: ${counts.allow ?? 0} allow, ${counts.redact ?? 0} redact, ${counts.quarantine ?? 0} quarantine, ${counts.exclude ?? 0} exclude`,
    "Data minimization: undeclared fields fail closed; only allow/redact fields may cross the dataset boundary.",
    "Actual records processed by this lab: none.",
    "Required leakage gates:",
    ...leakageTests.map((test) => `- ${test}`),
    "Owner approval: ____________________  Contract version/date: ____________________"
  ].join("\n");
}

export { MAX_FIELDS };
