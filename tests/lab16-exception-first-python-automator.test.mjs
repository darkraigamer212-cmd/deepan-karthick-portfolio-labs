import test from "node:test";
import assert from "node:assert/strict";
import {
  PYTHON_AUTOMATOR_EXAMPLE,
  buildPythonAutomation,
  validateAutomationPlan
} from "../labs-src/labs/exceptionFirstPythonAutomator.js";

test("generator emits a dry-run stdlib scaffold with audit and undo records", () => {
  const result = buildPythonAutomation(PYTHON_AUTOMATOR_EXAMPLE);

  assert.deepEqual(result.errors, {});
  assert.match(result.code, /DRY_RUN = True/);
  assert.match(result.code, /MAX_FILES = 1000/);
  assert.match(result.code, /automation-audit\.json/);
  assert.match(result.code, /"action": "move-back"/);
  assert.match(result.code, /except \(PermissionError, FileNotFoundError, ValueError, OSError\)/);
  assert.doesNotMatch(result.code, /subprocess|eval\(|exec\(/);
  assert.equal(result.checklist.length, 7);
});

test("selected policies are embedded deterministically", () => {
  const result = buildPythonAutomation({
    ...PYTHON_AUTOMATOR_EXAMPLE,
    operation: "copy",
    failurePolicy: "stop",
    duplicatePolicy: "overwrite"
  });

  assert.match(result.code, /OPERATION = "copy"/);
  assert.match(result.code, /FAILURE_POLICY = "stop"/);
  assert.match(result.code, /DUPLICATE_POLICY = "overwrite"/);
  assert.match(result.code, /shutil\.copy2\(destination, backup\)/);
  assert.match(result.code, /record\["undo"\]\["then_restore"\]/);
});

test("validation rejects unbounded or unsafe patterns and unknown policies", () => {
  const errors = validateAutomationPlan({
    taskName: "short",
    sourcePattern: "C:/Office/../secrets/*.txt",
    destinationPattern: "C:/Output/*",
    operation: "delete",
    failurePolicy: "ignore",
    duplicatePolicy: "destroy"
  });

  assert.deepEqual(Object.keys(errors).sort(), ["destinationPattern", "duplicatePolicy", "failurePolicy", "operation", "sourcePattern", "taskName"]);
  assert.equal(buildPythonAutomation({}).code, "");
});

test("validation rejects unknown destination placeholders", () => {
  const errors = validateAutomationPlan({ ...PYTHON_AUTOMATOR_EXAMPLE, destinationPattern: "C:/Output/{owner}/{name}" });

  assert.match(errors.destinationPattern, /supports only/);
});
