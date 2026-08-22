import assert from "node:assert/strict";
import test from "node:test";
import { composeRecoveryDrill, parseRecoveryAccounts, RECOVERY_DRILL_EXAMPLE, RECOVERY_DRILL_SOURCES } from "../labs-src/labs/accountRecoveryDrill.js";

test("recovery drill identifies scenario-correlated single points and notification gaps", () => {
  const result = composeRecoveryDrill(RECOVERY_DRILL_EXAMPLE, ["device-loss", "phone-loss", "email-loss"]);
  assert.equal(result.valid, true);
  assert.ok(result.findings.some((item) => item.issue === "Correlated recovery single point"));
  assert.ok(result.findings.some((item) => item.issue === "Recovery notification gap"));
  assert.ok(result.emergencyCards.length === 9);
});

test("recovery drill outputs safe no-secret artifacts deterministically", () => {
  const first = composeRecoveryDrill(RECOVERY_DRILL_EXAMPLE, ["device-loss"]);
  const second = composeRecoveryDrill(RECOVERY_DRILL_EXAMPLE, ["device-loss"]);
  assert.deepEqual(first, second);
  assert.ok(first.drillSteps.some((item) => item.includes("do not start a real recovery")));
  assert.ok(first.drillSteps.some((item) => item.includes("didn't disclose") || item.includes("disclosed")));
  assert.ok(first.emergencyCards.every((card) => !JSON.stringify(card).includes("@")));
});

test("recovery parser rejects contact details, unsupported categories, and malformed rows", () => {
  const result = parseRecoveryAccounts(["me@example.com|critical|sms|recovery-phone|sms", "username=deepan|high|sms|recovery-phone|sms", "Work|urgent|totp|secret answer|call", "too|few"].join("\n"));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.includes("generic account label")));
  assert.ok(result.errors.some((item) => item.includes("importance")));
  assert.ok(result.errors.some((item) => item.includes("primary MFA")));
  assert.ok(result.errors.some((item) => item.includes("recovery method")));
  assert.ok(result.errors.some((item) => item.includes("five pipe-separated")));
});

test("recovery drill requires a selected scenario and embeds official sources", () => {
  const result = composeRecoveryDrill(RECOVERY_DRILL_EXAMPLE, []);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("Select at least one loss scenario."));
  assert.ok(RECOVERY_DRILL_SOURCES.some((source) => source.url.includes("nist.gov")));
  assert.ok(RECOVERY_DRILL_SOURCES.some((source) => source.url.includes("ftc.gov")));
  assert.ok(RECOVERY_DRILL_SOURCES.some((source) => source.url.includes("cisa.gov")));
});
