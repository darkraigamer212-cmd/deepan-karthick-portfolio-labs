import assert from "node:assert/strict";
import test from "node:test";

import {
  ASSURANCE_EXAMPLE,
  ASSURANCE_REFERENCES,
  mapAssuranceChangeShockwave,
  parseAcceptedRiskRows,
  parseClaimRows,
  parseEvidenceRows,
  validateAssuranceInput
} from "../labs-src/labs/assuranceChangeShockwave.js";

test("bounded pipe parsers return typed claim, evidence, and decision metadata", () => {
  const claims = parseClaimRows(ASSURANCE_EXAMPLE.claimRows);
  const evidence = parseEvidenceRows(ASSURANCE_EXAMPLE.evidenceRows);
  const risks = parseAcceptedRiskRows(ASSURANCE_EXAMPLE.acceptedRiskRows);
  assert.equal(claims[0].cadenceDays, 90);
  assert.deepEqual(evidence[0].dependsOn, ["vendor", "owner"]);
  assert.equal(risks[1].expiryDays, -3);
});

test("validation rejects unknown claim links, URLs, and credential-like metadata", () => {
  assert.deepEqual(validateAssuranceInput(ASSURANCE_EXAMPLE).errors, {});
  assert.match(validateAssuranceInput({ ...ASSURANCE_EXAMPLE, evidenceRows: "EV-1|MISSING|Review|1|vendor" }).errors.evidenceRows, /unknown claim/i);
  assert.match(validateAssuranceInput({ ...ASSURANCE_EXAMPLE, changeDescription: "Vendor evidence moved to https://example.test today." }).errors.changeDescription, /generic metadata/i);
  assert.match(validateAssuranceInput({ ...ASSURANCE_EXAMPLE, changeDescription: "Vendor changed and secret=example-value was recorded." }).errors.changeDescription, /generic metadata/i);
});

test("matching change dependencies propagate invalidation from evidence to claims", () => {
  const result = mapAssuranceChangeShockwave(ASSURANCE_EXAMPLE);
  assert.equal(result.valid, true);
  assert.equal(result.evidence.find((item) => item.id === "EV-01").state, "invalidated");
  assert.equal(result.evidence.find((item) => item.id === "EV-03").state, "invalidated");
  assert.equal(result.claims.find((claim) => claim.id === "CLM-01").status, "invalidated");
  assert.equal(result.claims.find((claim) => claim.id === "CLM-02").status, "invalidated");
  assert.equal(result.summary.invalidated, 2);
});

test("cadence boundary is explicit: equal or older needs review, younger stays current", () => {
  const input = {
    ...ASSURANCE_EXAMPLE,
    changeCategory: "vendor",
    claimRows: "CLM-A|Customer records have reviewable change history|Owner A|30\nCLM-B|Service notices remain available to customers|Owner B|30",
    evidenceRows: "EV-A|CLM-A|History review|30|system\nEV-B|CLM-B|Notice review|29|system",
    acceptedRiskRows: ""
  };
  const result = mapAssuranceChangeShockwave(input);
  assert.equal(result.evidence.find((item) => item.id === "EV-A").state, "needs-review");
  assert.equal(result.evidence.find((item) => item.id === "EV-B").state, "current");
  assert.equal(result.claims.find((claim) => claim.id === "CLM-A").status, "needs-review");
  assert.equal(result.claims.find((claim) => claim.id === "CLM-B").status, "current");
});

test("accepted-risk decisions distinguish expired, due-soon, and active without approval", () => {
  const result = mapAssuranceChangeShockwave(ASSURANCE_EXAMPLE);
  assert.deepEqual(result.riskDecisions.map((risk) => [risk.id, risk.status]), [
    ["RISK-01", "due-soon"],
    ["RISK-02", "expired"],
    ["RISK-03", "active"]
  ]);
  assert.match(result.riskDecisions[1].decision, /do not rely/i);
  assert.match(result.riskDecisions[2].decision, /does not automatically accept or approve risk/i);
});

test("renewal order is deterministic and exposes its non-score tie-break", () => {
  const first = mapAssuranceChangeShockwave(ASSURANCE_EXAMPLE);
  const second = mapAssuranceChangeShockwave(ASSURANCE_EXAMPLE);
  assert.deepEqual(first, second);
  assert.equal(first.renewalOrder[0].claimId, "CLM-02");
  assert.equal(first.renewalOrder[1].claimId, "CLM-01");
  assert.ok(first.renewalOrder.every((item) => /then expired\/due-soon decision/i.test(item.orderingBasis)));
  assert.equal(Object.hasOwn(first, "score"), false);
  assert.ok(first.claims.every((claim) => !Object.hasOwn(claim, "score")));
});

test("executive memo records actions but makes no certification or approval claim", () => {
  const result = mapAssuranceChangeShockwave(ASSURANCE_EXAMPLE);
  assert.match(result.executiveMemo, /EXECUTIVE ASSURANCE CHANGE MEMO/);
  assert.match(result.executiveMemo, /does not certify compliance/i);
  assert.match(result.executiveMemo, /approve an audit/i);
  assert.match(result.executiveMemo, /automatically accept risk/i);
  assert.doesNotMatch(result.executiveMemo, /\bcompliant\b|\bcertified\b|risk approved/iu);
});

test("references are official NIST CSRC publications", () => {
  assert.equal(ASSURANCE_REFERENCES.length, 2);
  for (const reference of ASSURANCE_REFERENCES) {
    assert.equal(new URL(reference.url).hostname, "csrc.nist.gov");
  }
});
