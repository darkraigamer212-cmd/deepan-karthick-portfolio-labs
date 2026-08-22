import assert from "node:assert/strict";
import test from "node:test";
import {
  AZURE_ACCESS_SOURCES,
  AZURE_HANDOFF_EXAMPLE_INPUT,
  parseAccessLines,
  simulateAzureAccessHandoff
} from "../labs-src/labs/azureAccessHandoff.js";

test("Azure handoff simulator detects all four targeted access risks", () => {
  const result = simulateAzureAccessHandoff(AZURE_HANDOFF_EXAMPLE_INPUT);
  assert.equal(result.valid, true);
  const types = new Set(result.findings.map((item) => item.type));
  assert.deepEqual(types, new Set(["orphan-access", "shared-credential", "excessive-scope", "review-drift"]));
  assert.equal(result.records.length, 4);
});
test("Azure handoff plan is deterministic and priority ordered", () => {
  const first = simulateAzureAccessHandoff(AZURE_HANDOFF_EXAMPLE_INPUT);
  const second = simulateAzureAccessHandoff(AZURE_HANDOFF_EXAMPLE_INPUT);
  assert.deepEqual(first, second);
  assert.deepEqual(first.plan.map((item) => item.priority), [...first.plan.map((item) => item.priority)].sort((a, b) => a - b));
  assert.match(first.checklistText, /^- \[ \] Manager:/);
});

test("Azure handoff gives a clean active record an attestation action", () => {
  const result = simulateAzureAccessHandoff("Esha|active|developer|resource: demo-api|reader|no|30");
  assert.equal(result.findings.length, 0);
  assert.equal(result.plan.length, 1);
  assert.match(result.plan[0].action, /Reconfirm/);
});

test("Azure access parser reports structural and field validation errors", () => {
  const result = parseAccessLines([
    "Asha|moving|developer|scope|admin|maybe|-1",
    "Asha|active|developer|scope|reader|no|20",
    "short|line"
  ].join("\n"));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("status must be")));
  assert.ok(result.errors.some((error) => error.includes("privilege must be")));
  assert.ok(result.errors.some((error) => error.includes("shared credential")));
  assert.ok(result.errors.some((error) => error.includes("must be unique")));
  assert.ok(result.errors.some((error) => error.includes("seven pipe-separated fields")));
  assert.ok(AZURE_ACCESS_SOURCES.every((source) => source.url.startsWith("https://learn.microsoft.com/")));
});
