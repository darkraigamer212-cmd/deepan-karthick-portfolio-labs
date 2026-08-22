import test from "node:test";
import assert from "node:assert/strict";
import {
  CLOUD_PREMORTEM_EXAMPLE,
  buildCloudPremortem,
  validateCloudPremortem
} from "../labs-src/labs/cloudRegretPremortem.js";

test("pre-mortem produces exactly five regret scenarios and a reversible contract", () => {
  const result = buildCloudPremortem(CLOUD_PREMORTEM_EXAMPLE);

  assert.deepEqual(result.errors, {});
  assert.equal(result.scenarios.length, 5);
  assert.equal(result.summary.stayTco, 2040000);
  assert.equal(result.summary.migrateTco, 1872000);
  assert.equal(result.summary.difference, 168000);
  assert.equal(result.pilot.continueTriggers.length, 4);
  assert.equal(result.pilot.stopTriggers.length, 4);
  assert.equal(result.pilot.exitChecklist.length, 5);
  assert.match(result.decisionMemo, /NOT PROVIDER QUOTES/);
  assert.match(result.decisionMemo, /REVERSIBLE PILOT CONTRACT/);
});

test("high risk or negative economics pauses full migration", () => {
  const result = buildCloudPremortem({
    ...CLOUD_PREMORTEM_EXAMPLE,
    cloudMonthlyCost: 110000,
    lockInRisk: "high",
    exportRisk: "high"
  });

  assert.ok(result.summary.difference < 0);
  assert.match(result.summary.recommendation, /Pause/);
  assert.match(result.scenarios[3].cause, /High lock-in/);
});

test("cost and horizon validation are bounded", () => {
  const errors = validateCloudPremortem({
    ...CLOUD_PREMORTEM_EXAMPLE,
    currentMonthlyCost: -1,
    migrationCost: 100000001,
    horizonMonths: 48
  });

  assert.deepEqual(Object.keys(errors).sort(), ["currentMonthlyCost", "horizonMonths", "migrationCost"]);
  assert.equal(buildCloudPremortem({}).decisionMemo, "");
});
