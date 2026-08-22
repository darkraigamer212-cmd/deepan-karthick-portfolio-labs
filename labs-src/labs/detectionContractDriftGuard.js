export const DRIFT_GUARD_SOURCES = Object.freeze([
  Object.freeze({ label: "NIST SP 800-92: Computer security log management", url: "https://csrc.nist.gov/pubs/sp/800/92/final" }),
  Object.freeze({ label: "Python unittest documentation", url: "https://docs.python.org/3/library/unittest.html" }),
  Object.freeze({ label: "Python datetime documentation", url: "https://docs.python.org/3/library/datetime.html#datetime.datetime.fromisoformat" })
]);
export const DRIFT_GUARD_EXAMPLE = Object.freeze({
  detectionClaim: "Flag repeated failed sign-ins when one account exceeds the threshold within five minutes.",
  assumptionRows: "account_id|yes|string|identifier\noutcome|yes|string|none\nevent_time|yes|timestamp|utc-iso8601\nfailure_count|yes|number|count",
  oldSchemaRows: "account_id|string|identifier\noutcome|string|none\nevent_time|timestamp|utc-iso8601\nfailure_count|number|count",
  newSchemaRows: "account_id?|string|identifier\nresult|string|none\nevent_time|timestamp|milliseconds\nfailure_count|string|count\nregion|string|identifier"
});
export const DRIFT_GUARD_RESET = Object.freeze({ detectionClaim: "", assumptionRows: "", oldSchemaRows: "", newSchemaRows: "" });
const types = new Set(["string", "number", "boolean", "timestamp"]);
const units = new Set(["none", "count", "bytes", "milliseconds", "seconds", "percent", "identifier", "utc-iso8601"]);

function validateClaim(value, errors) {
  const claim = String(value ?? "").trim();
  if (!claim) errors.push("Detection claim is required.");
  else if (claim.length > 240) errors.push("Detection claim must be 240 characters or fewer.");
  else if (/https?:\/\/|\b(?:select\s+.+\s+from|curl\s|powershell\s)|-----BEGIN|\b(?:password|token|secret)\s*[:=]/i.test(claim)) errors.push("Detection claim must contain defensive metadata only, not URLs, queries, credentials, or executable steps.");
  return claim;
}

function parseRows(value, mode, errors) {
  const lines = String(value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean), rows = [], names = new Set();
  if (!lines.length) { errors.push(`${mode === "assumption" ? "Rule assumptions" : mode === "old" ? "Old schema" : "New schema"} needs at least one row.`); return []; }
  if (lines.length > 50) errors.push(`${mode === "assumption" ? "Rule assumptions" : "Schema"} must contain 50 rows or fewer.`);
  lines.forEach((line, index) => {
    const number = index + 1, expected = mode === "assumption" ? 4 : 3, parts = line.split("|").map((part) => part.trim());
    if (parts.length !== expected) { errors.push(`${mode} line ${number} must contain ${expected} pipe-separated fields.`); return; }
    let rawField = parts[0], optional = false;
    if (mode === "new" && rawField.endsWith("?")) { optional = true; rawField = rawField.slice(0, -1); }
    if (!/^[A-Za-z_][A-Za-z0-9_]{0,47}$/.test(rawField)) errors.push(`${mode} line ${number}: field must be a bounded Python-style identifier${mode === "new" ? " with an optional trailing ?" : ""}.`);
    else if (names.has(rawField)) errors.push(`${mode} line ${number}: field must be unique.`); else names.add(rawField);
    let required = null, type, unit;
    if (mode === "assumption") { required = parts[1].toLowerCase(); type = parts[2].toLowerCase(); unit = parts[3].toLowerCase(); if (!new Set(["yes", "no"]).has(required)) errors.push(`assumption line ${number}: required must be yes or no.`); }
    else { type = parts[1].toLowerCase(); unit = parts[2].toLowerCase(); }
    if (!types.has(type)) errors.push(`${mode} line ${number}: type must be string, number, boolean, or timestamp.`);
    if (!units.has(unit)) errors.push(`${mode} line ${number}: choose a supported unit category.`);
    rows.push({ field: rawField, required: required === null ? null : required === "yes", optional, type, unit });
  });
  return rows;
}

export function validateDriftGuardInput(input) {
  const errors = [], detectionClaim = validateClaim(input?.detectionClaim, errors);
  const assumptions = parseRows(input?.assumptionRows, "assumption", errors), oldSchema = parseRows(input?.oldSchemaRows, "old", errors), newSchema = parseRows(input?.newSchemaRows, "new", errors);
  return { valid: errors.length === 0, errors, detectionClaim, assumptions: errors.length ? [] : assumptions, oldSchema: errors.length ? [] : oldSchema, newSchema: errors.length ? [] : newSchema };
}

function sampleFor(type) {
  if (type === "string") return "sample";
  if (type === "number") return 1;
  if (type === "boolean") return true;
  return "2026-01-02T03:04:05+00:00";
}

function pythonValue(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (value === true) return "True";
  if (value === false) return "False";
  if (value === null) return "None";
  return String(value);
}

function pythonDict(record) {
  return `{${Object.entries(record).map(([key, value]) => `${JSON.stringify(key)}: ${pythonValue(value)}`).join(", ")}}`;
}

function generatePythonHarness(assumptions, vectors) {
  const contract = assumptions.map((item) => `    ${JSON.stringify(item.field)}: {"required": ${item.required ? "True" : "False"}, "type": ${JSON.stringify(item.type)}, "unit": ${JSON.stringify(item.unit)}},`).join("\n");
  const tests = vectors.map((vector, index) => `    def test_vector_${String(index + 1).padStart(2, "0")}_${vector.id.replaceAll("-", "_")}(self):\n        errors = validate_event(${pythonDict(vector.record)})\n        self.assertEqual(errors == [], ${vector.expectValid ? "True" : "False"}, ${JSON.stringify(vector.label)})`).join("\n\n");
  return `"""Generated metadata contract tests. Review before running; no log reader or SIEM connection."""
from datetime import datetime
import unittest

MAX_FIELDS = 64
CONTRACT = {
${contract}
}

def matches_type(value, expected):
    if expected == "string": return isinstance(value, str)
    if expected == "number": return isinstance(value, (int, float)) and not isinstance(value, bool)
    if expected == "boolean": return isinstance(value, bool)
    if expected == "timestamp":
        if not isinstance(value, str): return False
        try: datetime.fromisoformat(value.replace("Z", "+00:00")); return True
        except ValueError: return False
    return False

def validate_event(event):
    if not isinstance(event, dict): return ["event must be a mapping"]
    if len(event) > MAX_FIELDS: return ["event exceeds bounded field count"]
    errors = []
    for field, rule in CONTRACT.items():
        if field not in event:
            if rule["required"]: errors.append(f"missing required field: {field}")
            continue
        if not matches_type(event[field], rule["type"]): errors.append(f"wrong type: {field}")
    return errors

class DetectionSchemaContractTests(unittest.TestCase):
${tests}

if __name__ == "__main__":
    unittest.main()
`;
}

export function analyzeDetectionDrift(input) {
  const parsed = validateDriftGuardInput(input);
  if (!parsed.valid) return { ...parsed, impacts: [], repairContract: [], vectors: [], pythonHarness: "", sources: DRIFT_GUARD_SOURCES };
  const oldMap = new Map(parsed.oldSchema.map((item) => [item.field, item])), newMap = new Map(parsed.newSchema.map((item) => [item.field, item])), impacts = [];
  for (const assumption of parsed.assumptions) {
    const oldField = oldMap.get(assumption.field), next = newMap.get(assumption.field);
    if (!next) impacts.push({ id: `${assumption.field}-missing`, field: assumption.field, classification: assumption.required ? "invalid" : "silent", change: "missing", impact: assumption.required ? "Required detection input disappeared; the rule contract cannot be satisfied." : "Optional input disappeared and may silently remove context or a branch.", affectedClaim: parsed.detectionClaim });
    else {
      if (next.type !== assumption.type) impacts.push({ id: `${assumption.field}-type`, field: assumption.field, classification: "invalid", change: `type ${assumption.type} → ${next.type}`, impact: "The rule's comparison or parsing contract receives an incompatible type.", affectedClaim: parsed.detectionClaim });
      if (next.unit !== assumption.unit) impacts.push({ id: `${assumption.field}-unit`, field: assumption.field, classification: "silent", change: `unit ${assumption.unit} → ${next.unit}`, impact: "Values may remain parseable while their meaning changes, silently moving thresholds or time windows.", affectedClaim: parsed.detectionClaim });
      if (assumption.required && next.optional) impacts.push({ id: `${assumption.field}-optional`, field: assumption.field, classification: "widened", change: "required → newly optional", impact: "The producer now permits events that omit a field the detection requires.", affectedClaim: parsed.detectionClaim });
      if (oldField && (oldField.type !== next.type || oldField.unit !== next.unit) && next.type === assumption.type && next.unit === assumption.unit) impacts.push({ id: `${assumption.field}-producer-change`, field: assumption.field, classification: "widened", change: "producer metadata changed but still matches the detection contract", impact: "A producer change occurred; retain a regression vector even though the declared rule contract still matches.", affectedClaim: parsed.detectionClaim });
    }
  }
  for (const next of parsed.newSchema) if (!oldMap.has(next.field) && !parsed.assumptions.some((item) => item.field === next.field)) impacts.push({ id: `${next.field}-new`, field: next.field, classification: "widened", change: "new field", impact: "The schema surface widened. The detection should explicitly ignore or adopt this metadata field.", affectedClaim: parsed.detectionClaim });
  const validRecord = Object.fromEntries(parsed.assumptions.map((item) => [item.field, sampleFor(item.type)]));
  const vectors = [{ id: "valid-contract", label: "All declared fields match", record: validRecord, expectValid: true }];
  for (const item of parsed.assumptions.filter((entry) => entry.required)) { const record = { ...validRecord }; delete record[item.field]; vectors.push({ id: `missing-${item.field}`, label: `Missing required ${item.field}`, record, expectValid: false }); }
  for (const item of parsed.assumptions) vectors.push({ id: `wrong-type-${item.field}`, label: `Wrong type for ${item.field}`, record: { ...validRecord, [item.field]: item.type === "string" || item.type === "timestamp" ? 7 : "wrong" }, expectValid: false });
  const repairContract = impacts.map((item) => ({ field: item.field, classification: item.classification, action: item.change === "missing" ? `Restore ${item.field} or explicitly redesign and retest the affected detection claim.` : item.change.startsWith("type") ? `Normalize ${item.field} to the declared ${parsed.assumptions.find((entry) => entry.field === item.field)?.type ?? "reviewed"} type before rule evaluation.` : item.change.startsWith("unit") ? `Normalize and label ${item.field} using the declared ${parsed.assumptions.find((entry) => entry.field === item.field)?.unit ?? "reviewed"} unit; add a threshold regression.` : item.change.includes("optional") ? `Define explicit missing-field behavior for ${item.field} and add missing/present regression cases.` : `Record whether ${item.field} is ignored or intentionally incorporated.`, proof: `Run the generated schema-contract vector for ${item.field} and preserve the pass/fail result with the detection change review.` }));
  if (!repairContract.length) repairContract.push({ field: "all", classification: "none", action: "No declared drift found; keep the contract and vectors in the detection review.", proof: "Run the generated valid, missing-required, and wrong-type vectors after each producer change." });
  return { valid: true, errors: [], detectionClaim: parsed.detectionClaim, impacts, repairContract, vectors, pythonHarness: generatePythonHarness(parsed.assumptions, vectors), sources: DRIFT_GUARD_SOURCES, limitation: "This browser compares bounded schema metadata only. It never reads log records, executes generated Python, connects to a SIEM, validates detection logic, or proves telemetry completeness. Review and run the harness only in an authorized development/test environment." };
}

