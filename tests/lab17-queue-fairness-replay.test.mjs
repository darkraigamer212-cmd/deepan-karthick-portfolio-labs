import assert from "node:assert/strict";
import test from "node:test";
import {
  parseQueueCases,
  QUEUE_REPLAY_EXAMPLE,
  replayQueueFairness
} from "../labs-src/labs/queueFairnessReplay.js";

test("queue replay produces deterministic FIFO and priority-aging orders", () => {
  const result = replayQueueFairness(QUEUE_REPLAY_EXAMPLE, 10);
  assert.equal(result.valid, true);
  assert.deepEqual(result.fifo.rows.map((row) => row.id), ["WALK-IN-01", "URGENT-02", "CALL-03", "FOLLOWUP-04", "URGENT-05"]);
  assert.deepEqual(result.priorityAging.rows.map((row) => row.id), ["WALK-IN-01", "URGENT-02", "URGENT-05", "CALL-03", "FOLLOWUP-04"]);
  assert.deepEqual(replayQueueFairness(QUEUE_REPLAY_EXAMPLE, 10), result);
});

test("priority aging eventually promotes a long-waiting lower urgency case", () => {
  const input = ["FIRST|0|5|20", "LOW|1|1|2", "HIGH-A|2|5|15", "HIGH-B|3|5|15", "HIGH-C|4|5|15"].join("\n");
  const result = replayQueueFairness(input, 5);
  const low = result.priorityAging.rows.find((row) => row.id === "LOW");
  assert.ok(low.effectiveUrgency > low.urgency);
  assert.equal(low.starved, true);
  assert.ok(result.priorityAging.metrics.maxWait >= 30);
});

test("queue replay validates bounded unique cases and aging interval", () => {
  const input = ["BAD ID|0|6|0", "BAD ID|1500|2|5"].join("\n");
  const parsed = parseQueueCases(input);
  assert.equal(parsed.valid, false);
  assert.ok(parsed.errors.some((error) => error.includes("id must use")));
  assert.ok(parsed.errors.some((error) => error.includes("urgency")));
  assert.ok(parsed.errors.some((error) => error.includes("service minutes")));
  assert.ok(parsed.errors.some((error) => error.includes("arrival minute")));
  assert.equal(replayQueueFairness("A|0|1|1", 0).valid, false);
});

test("queue replay emits a bounded copyable C contract and exact vector", () => {
  const result = replayQueueFairness("A|0|1|3\nB|2|5|4", 12);
  assert.match(result.cContract, /typedef struct/);
  assert.match(result.cContract, /char id\[CASE_ID_CAP\]/);
  assert.match(result.cContract, /#define AGING_MINUTES 12/);
  assert.match(result.cContract, /\{"A", 0, 1, 3\}/);
  assert.match(result.cContract, /single-server, non-preemptive/);
});
