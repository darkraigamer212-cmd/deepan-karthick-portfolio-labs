import test from "node:test";
import assert from "node:assert/strict";
import {
  SHARE_AFTERLIFE_EXAMPLE,
  parseRecipientRoles,
  rehearseShareAfterlife,
  validateShareAfterlife
} from "../labs-src/labs/shareLinkAfterlife.js";

test("example narrows provider controls and exposes non-revocable residue", () => {
  const result = rehearseShareAfterlife(SHARE_AFTERLIFE_EXAMPLE);

  assert.deepEqual(result.errors, {});
  assert.equal(result.decision.recommendedAccessMode, "specific");
  assert.equal(result.decision.recommendedPermission, "edit");
  assert.equal(result.decision.recommendedExpiryDays, 10);
  assert.ok(result.decision.corrections.some((item) => item.includes("specific recipients")));
  assert.ok(result.ledger.some((item) => item.kind === "Downloaded copy" && item.revocable === "Not revocable"));
  assert.ok(result.ledger.some((item) => item.kind.includes("Screenshot") && item.revocable === "Not revocable"));
  assert.equal(result.verification.length, 6);
  assert.match(result.contract, /PRE-SHARE AND EXPIRY CONTRACT/);
});

test("restricted material with residue triggers do-not-share despite expiry", () => {
  const result = rehearseShareAfterlife({
    ...SHARE_AFTERLIFE_EXAMPLE,
    classification: "restricted",
    accessMode: "anyone",
    expiryDays: 1
  });

  assert.equal(result.decision.gate, "do-not-share");
  assert.match(result.decision.gateReason, /cannot be made revocable/);
});

test("view-only role needs downgrade unnecessary edit permission", () => {
  const result = rehearseShareAfterlife({
    ...SHARE_AFTERLIFE_EXAMPLE,
    recipientRows: "External auditor role|Review a bounded evidence summary|view|5",
    accessMode: "specific"
  });

  assert.equal(result.decision.recommendedPermission, "view");
  assert.ok(result.decision.corrections.some((item) => item.includes("view-only")));
});

test("validation rejects identifiers, links, malformed roles, and unconfirmed residue", () => {
  assert.match(validateShareAfterlife({ ...SHARE_AFTERLIFE_EXAMPLE, artifactLabel: "https://provider/item?token=secret" }).errors.artifactLabel, /Do not enter/);
  assert.match(parseRecipientRoles("person@example.com|Review|view|2").errors[0], /generic roles/);
  const result = rehearseShareAfterlife({ ...SHARE_AFTERLIFE_EXAMPLE, residue: { download: true } });
  assert.ok(result.errors.residue);
  assert.deepEqual(result.ledger, []);
});
