import assert from "node:assert/strict";
import test from "node:test";

import {
  GCP_EVIDENCE_REFERENCES,
  PROMISE_EXAMPLE,
  buildPromiseLedger,
  validatePromiseInput
} from "../labs-src/labs/gcp-promise-ledger.js";

test("validation requires a measurable, bounded cloud promise brief", () => {
  const errors = validatePromiseInput({});
  assert.ok(errors.promiseStatement);
  assert.ok(errors.metricName);
  assert.ok(errors.baseline);
  assert.ok(errors.target);
  assert.ok(errors.workloadCount);
  assert.ok(errors.sensitivity);

  const sameTarget = validatePromiseInput({ ...PROMISE_EXAMPLE, target: PROMISE_EXAMPLE.baseline });
  assert.match(sameTarget.target, /differ/i);
  assert.deepEqual(validatePromiseInput(PROMISE_EXAMPLE), {});
});

test("ledger deterministically converts the promise into a falsifiable hypothesis", () => {
  const first = buildPromiseLedger(PROMISE_EXAMPLE);
  const second = buildPromiseLedger(PROMISE_EXAMPLE);
  assert.deepEqual(first, second);
  assert.equal(first.valid, true);
  assert.match(first.hypothesis, /from 45 to 15/i);
  assert.match(first.hypothesis, /66\.7%/);
  assert.match(first.hypothesis, /without breaching/i);
});

test("smallest pilot is bounded and leaves the source intact", () => {
  const standard = buildPromiseLedger(PROMISE_EXAMPLE);
  assert.equal(standard.pilot.workloadCount, 2);
  assert.match(standard.pilot.summary, /source path intact/i);
  assert.match(standard.pilot.summary, /do not retire/i);

  const complex = buildPromiseLedger({ ...PROMISE_EXAMPLE, workloadCount: "400", dependencies: "unknown" });
  assert.equal(complex.pilot.workloadCount, 1);
});

test("risk-sensitive inputs add owned security, dependency, and capability assumptions", () => {
  const result = buildPromiseLedger({
    ...PROMISE_EXAMPLE,
    sensitivity: "restricted",
    dependencies: "unknown",
    skill: "none"
  });
  const owners = result.assumptions.map((item) => item.owner);
  assert.ok(owners.includes("Security and data owner"));
  assert.ok(owners.includes("Integration owner"));
  assert.ok(owners.includes("Delivery lead"));
  assert.ok(result.risks.every((risk) => risk.owner && risk.response));
  assert.ok(result.stopTriggers.some((trigger) => /unknown dependencies/i.test(trigger)));
});

test("30, 60, and 90 outputs are evidence gates rather than guaranteed dates", () => {
  const result = buildPromiseLedger(PROMISE_EXAMPLE);
  assert.deepEqual(result.gates.map((gate) => gate.horizon), [
    "30-day evidence gate",
    "60-day evidence gate",
    "90-day evidence gate"
  ]);
  assert.ok(result.gates.every((gate) => gate.evidence.length >= 3 && gate.decision));
  assert.match(result.gates[2].purpose, /not declare success by date/i);
});

test("memo is sponsor-ready and limits the decision being requested", () => {
  const result = buildPromiseLedger(PROMISE_EXAMPLE);
  assert.match(result.memo, /SPONSOR REVIEW/);
  assert.match(result.memo, /Approve evidence collection only/i);
  assert.match(result.memo, /does not approve production migration/i);
  assert.match(result.memo, /Continue pilot.*Revise hypothesis.*Stop/s);
});

test("references are official Google Cloud documentation URLs only", () => {
  assert.equal(GCP_EVIDENCE_REFERENCES.length, 2);
  for (const reference of GCP_EVIDENCE_REFERENCES) {
    const url = new URL(reference.url);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, "docs.cloud.google.com");
  }
});
