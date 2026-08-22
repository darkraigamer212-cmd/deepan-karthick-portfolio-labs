import test from "node:test";
import assert from "node:assert/strict";
import {
  DATA_FIREWALL_EXAMPLE,
  buildDataFirewall,
  decideField,
  parseFieldContract
} from "../labs-src/labs/llmDataContractFirewall.js";

test("example applies all four fail-closed field decisions", () => {
  const result = buildDataFirewall(DATA_FIREWALL_EXAMPLE);
  const actions = Object.fromEntries(result.decisions.map((field) => [field.name, field.action]));

  assert.deepEqual(result.errors, {});
  assert.equal(actions.ticket_id, "allow");
  assert.equal(actions.customer_email, "redact");
  assert.equal(actions.api_token, "quarantine");
  assert.equal(actions.internal_agent_note, "exclude");
  assert.equal(actions.public_product_name, "allow");
  assert.equal(result.leakageTests.length, 6);
  assert.match(result.datasetCard, /Actual records processed by this lab: none/);
  assert.equal(JSON.parse(result.jsonlSchema).additionalProperties, false);
});

test("purpose mismatch and excessive retention exclude fields", () => {
  assert.equal(decideField({ classification: "public", allowedUses: ["training"], retentionDays: 30 }, "retrieval").action, "exclude");
  assert.equal(decideField({ classification: "personal", allowedUses: ["retrieval"], retentionDays: 91 }, "retrieval").action, "exclude");
  assert.equal(decideField({ classification: "internal", allowedUses: ["training"], retentionDays: 366 }, "training").action, "exclude");
});

test("contract parser bounds rows and rejects unsafe schema metadata", () => {
  const parsed = parseFieldContract("9bad field|unknown|anything|forever");

  assert.ok(parsed.errors.length >= 4);
  const tooMany = Array.from({ length: 21 }, (_, index) => `field${index}|public|retrieval|30`).join("\n");
  assert.match(parseFieldContract(tooMany).errors[0], /at most 20/);
  assert.deepEqual(buildDataFirewall({}).decisions, []);
});
