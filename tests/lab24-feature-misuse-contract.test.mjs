import assert from "node:assert/strict";
import test from "node:test";

import {
  MISUSE_EXAMPLE,
  OWASP_REFERENCES,
  buildFeatureMisuseContract,
  parseActorRoles,
  validateMisuseInput
} from "../labs-src/labs/feature-misuse-contract.js";

test("actor role parsing is trimmed, unique, and deterministic", () => {
  assert.deepEqual(parseActorRoles("Owner, Member\nSupport, Owner"), ["Owner", "Member", "Support"]);
});

test("validation bounds promise, roles, data categories, and boundary rows", () => {
  const errors = validateMisuseInput({});
  assert.ok(errors.promise);
  assert.ok(errors.actorRoles);
  assert.ok(errors.dataCategories);
  assert.ok(errors.boundaries);
  assert.deepEqual(validateMisuseInput(MISUSE_EXAMPLE), {});
  assert.match(validateMisuseInput({ ...MISUSE_EXAMPLE, dataCategories: ["none", "payment"] }).dataCategories, /do not combine/i);
});

test("contract is deterministic and produces five to seven prioritized stories", () => {
  const first = buildFeatureMisuseContract(MISUSE_EXAMPLE);
  const second = buildFeatureMisuseContract(MISUSE_EXAMPLE);
  assert.deepEqual(first, second);
  assert.equal(first.valid, true);
  assert.ok(first.stories.length >= 5 && first.stories.length <= 7);
  assert.equal(new Set(first.stories.map((story) => story.id)).size, first.stories.length);
  assert.deepEqual(first.stories.map((story) => story.priority).slice(0, 2), ["P1", "P1"]);
});

test("every story links promise, safe test, observable pass, owner, evidence, and OWASP 2021", () => {
  const result = buildFeatureMisuseContract(MISUSE_EXAMPLE);
  for (const story of result.stories) {
    assert.match(story.promiseBroken, /promise breaks/i);
    assert.ok(story.scenario.length > 30);
    assert.ok(story.test.length > 30);
    assert.ok(story.passCondition.length > 30);
    assert.ok(story.owner.length > 3);
    assert.ok(story.evidence.length > 10);
    assert.match(story.category.id, /^A(0[1-9]|10):2021$/u);
    assert.match(story.category.url, /^https:\/\/owasp\.org\//u);
  }
});

test("sensitive data produces a cryptographic-failures acceptance story", () => {
  const result = buildFeatureMisuseContract(MISUSE_EXAMPLE);
  assert.ok(result.stories.some((story) => story.category.id === "A02:2021"));
  assert.ok(result.stories.some((story) => /synthetic-record trace/i.test(story.evidence)));
});

test("remote resource action adds a safe SSRF-related policy test", () => {
  const result = buildFeatureMisuseContract({
    ...MISUSE_EXAMPLE,
    boundaries: [{ from: "Customer browser", to: "Webhook service", action: "Send an event to a configured webhook URL" }]
  });
  const story = result.stories.find((item) => item.category.id === "A10:2021");
  assert.ok(story);
  assert.match(story.scenario, /controlled test list/i);
  assert.match(story.test, /without contacting any real/i);
  assert.match(story.passCondition, /no outbound request/i);
});

test("PR contract is tracked, copyable text with explicit non-scanning limits", () => {
  const result = buildFeatureMisuseContract(MISUSE_EXAMPLE);
  assert.match(result.acceptanceContract, /FEATURE MISUSE ACCEPTANCE CONTRACT/);
  assert.match(result.acceptanceContract, /- \[ \] MISUSE-01/);
  assert.match(result.acceptanceContract, /Observable pass:/);
  assert.match(result.acceptanceContract, /Owner:/);
  assert.match(result.acceptanceContract, /does not scan or exploit/i);
  assert.doesNotMatch(result.acceptanceContract, /CVSS:\d/iu);
});

test("grounding references use official OWASP properties only", () => {
  assert.ok(OWASP_REFERENCES.length >= 3);
  for (const reference of OWASP_REFERENCES) {
    const hostname = new URL(reference.url).hostname;
    assert.ok(["owasp.org", "cheatsheetseries.owasp.org"].includes(hostname));
  }
});
