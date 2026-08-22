import assert from "node:assert/strict";
import test from "node:test";
import { analyzeDetectionDrift, DRIFT_GUARD_EXAMPLE, validateDriftGuardInput } from "../labs-src/labs/detectionContractDriftGuard.js";

test("drift guard classifies missing, type, unit, optional, and new-field impacts", () => {
  const result = analyzeDetectionDrift(DRIFT_GUARD_EXAMPLE);
  assert.equal(result.valid, true);
  assert.ok(result.impacts.some((item) => item.change === "missing" && item.classification === "invalid"));
  assert.ok(result.impacts.some((item) => item.change.startsWith("type") && item.classification === "invalid"));
  assert.ok(result.impacts.some((item) => item.change.startsWith("unit") && item.classification === "silent"));
  assert.ok(result.impacts.some((item) => item.change.includes("newly optional") && item.classification === "widened"));
  assert.ok(result.impacts.some((item) => item.change === "new field" && item.classification === "widened"));
});

test("drift guard produces deterministic repair contracts and bounded regression vectors", () => {
  const first = analyzeDetectionDrift(DRIFT_GUARD_EXAMPLE), second = analyzeDetectionDrift(DRIFT_GUARD_EXAMPLE);
  assert.deepEqual(first, second);
  assert.ok(first.repairContract.every((item) => item.action && item.proof));
  assert.equal(first.vectors.length, 9);
  assert.ok(first.vectors.some((item) => item.id === "valid-contract" && item.expectValid));
  assert.ok(first.vectors.some((item) => item.id.startsWith("missing-") && !item.expectValid));
});

test("generated Python harness is stdlib-only and schema-contract focused", () => {
  const harness = analyzeDetectionDrift(DRIFT_GUARD_EXAMPLE).pythonHarness;
  assert.match(harness, /from datetime import datetime/);
  assert.match(harness, /import unittest/);
  assert.match(harness, /MAX_FIELDS = 64/);
  assert.match(harness, /def validate_event\(event\):/);
  assert.doesNotMatch(harness, /requests|pandas|splunk|elastic|socket|subprocess|open\(/i);
});

test("drift guard accepts metadata only and validates schema grammar", () => {
  const result = validateDriftGuardInput({ detectionClaim: "Run SELECT * FROM logs", assumptionRows: "bad-name|maybe|object|raw", oldSchemaRows: "field|string|none", newSchemaRows: "field??|string|none" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.includes("defensive metadata only")));
  assert.ok(result.errors.some((item) => item.includes("required must be")));
  assert.ok(result.errors.some((item) => item.includes("type must be")));
  assert.ok(result.errors.some((item) => item.includes("unit category")));
  assert.ok(result.errors.some((item) => item.includes("Python-style identifier")));
});

