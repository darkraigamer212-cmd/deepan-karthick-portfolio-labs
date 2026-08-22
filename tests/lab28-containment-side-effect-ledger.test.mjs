import assert from "node:assert/strict";
import test from "node:test";
import { buildContainmentLedger, CONTAINMENT_EXAMPLE, validateContainmentInput } from "../labs-src/labs/containmentSideEffectLedger.js";

test("containment ledger links evidence, side effects, gates, proof, owner, and escalation", () => {
  const result = buildContainmentLedger(CONTAINMENT_EXAMPLE);
  assert.equal(result.valid, true);
  assert.equal(result.ledger.length, 3);
  assert.ok(result.ledger.every((item) => item.customerSideEffect && item.evidenceGate && item.rollbackRecoveryProof && item.owner && item.escalationTrigger));
  assert.match(result.handoff, /CONTAINMENT SIDE-EFFECT HANDOFF/);
});

test("containment ledger never recommends irreversible action", () => {
  const result = buildContainmentLedger(CONTAINMENT_EXAMPLE);
  const irreversible = result.ledger.find((item) => item.reversibility === "irreversible");
  assert.equal(irreversible.disposition, "escalate-only");
  assert.match(irreversible.evidenceGate, /Blocked from recommendation/);
  assert.ok(!result.ledger.some((item) => item.reversibility === "irreversible" && item.disposition === "reviewable"));
});

test("containment ledger blocks unsupported high-harm action", () => {
  const input = { ...CONTAINMENT_EXAMPLE, evidenceRows: "Single uncertain report|customer-report|low", actionRows: "Disable the service|reversible|high|Incident lead" };
  const result = buildContainmentLedger(input);
  assert.equal(result.ledger[0].disposition, "blocked");
  assert.ok(result.evidenceGaps.some((item) => item.includes("No high-confidence")));
  assert.ok(result.evidenceGaps.some((item) => item.includes("fewer than two")));
});

test("containment input rejects operationally unsafe content and contact owners", () => {
  const result = validateContainmentInput({ ...CONTAINMENT_EXAMPLE, alertClaim: "Check https://bad.example and run SELECT secret FROM users", actionRows: "Run curl payload|reversible|low|analyst@example.com" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.includes("defensive metadata only")));
  assert.ok(result.errors.some((item) => item.includes("high-level defensive label")));
  assert.ok(result.errors.some((item) => item.includes("generic role label")));
});

