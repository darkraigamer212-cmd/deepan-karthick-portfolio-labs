import test from "node:test";
import assert from "node:assert/strict";
import {
  NETWORK_CHANGE_EXAMPLE,
  analyzeNetworkChange,
  parseCidr,
  parseInventory
} from "../labs-src/labs/networkChangeRollback.js";

test("CIDR parser normalizes host input and reports safe boundaries", () => {
  const subnet = parseCidr("10.20.30.77/24");

  assert.equal(subnet.cidr, "10.20.30.0/24");
  assert.equal(subnet.broadcast, "10.20.30.255");
  assert.equal(subnet.firstUsable, "10.20.30.1");
  assert.equal(subnet.lastUsable, "10.20.30.254");
  assert.equal(subnet.usableHosts, 254);
  assert.equal(subnet.wasNormalized, true);
});

test("example creates concrete changes and rollback instructions", () => {
  const result = analyzeNetworkChange(NETWORK_CHANGE_EXAMPLE);

  assert.deepEqual(result.errors, {});
  assert.equal(result.blocked, false);
  assert.deepEqual(result.changes.map((change) => `${change.type}:${change.name}`), ["modify:Office", "add:VoIP"]);
  assert.ok(result.runbook.rollback.some((step) => step.includes("Restore Office to 10.20.10.0/24")));
  assert.match(result.stakeholderSummary, /READY FOR CONTROLLED CHANGE/);
});

test("overlap and host-capacity failures block execution", () => {
  const result = analyzeNetworkChange({
    changeGoal: "Add guest and voice networks without address collisions.",
    downtimeWindow: "Sunday 02:00–03:00",
    beforeInventory: "Office,10.0.0.0/24,80",
    proposedInventory: "Guest,10.0.0.0/25,150\nVoice,10.0.0.64/26,40"
  });

  assert.equal(result.blocked, true);
  assert.ok(result.findings.some((finding) => finding.type === "internal-overlap"));
  assert.ok(result.findings.some((finding) => finding.type === "capacity"));
  assert.match(result.runbook.change[0], /withheld/);
});

test("reserved ranges and inventory row bounds are rejected clearly", () => {
  assert.throws(() => parseCidr("127.0.0.1/24"), /loopback/);
  assert.throws(() => parseCidr("10.0.0.0/31"), /\/1 through \/30/);
  const tooMany = Array.from({ length: 21 }, (_, index) => `Net${index},10.0.${index}.0/24,10`).join("\n");
  assert.match(parseInventory(tooMany, "Proposed").errors[0], /safe limit is 20/);
});
