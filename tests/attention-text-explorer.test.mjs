import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateAttention,
  scaledDotProduct,
  softmax,
  tokenizeSequence,
  tokenFeatures,
  validateAttentionInput
} from "../labs-src/labs/attention-text-explorer.js";

test("tokenizeSequence handles extra whitespace deterministically", () => {
  assert.deepEqual(tokenizeSequence("  attention   makes\nrelationships visible  "), [
    "attention",
    "makes",
    "relationships",
    "visible"
  ]);
  assert.deepEqual(tokenizeSequence(null), []);
});

test("validation explains empty, oversized, and valid inputs", () => {
  assert.match(validateAttentionInput([], "focus"), /at least two/i);
  assert.match(validateAttentionInput(["one", "two"], ""), /focus token/i);
  assert.match(validateAttentionInput(["one", "!!!"], "one"), /letter or number/i);
  assert.match(validateAttentionInput(["one", "two"], "???"), /focus token needs/i);
  assert.match(validateAttentionInput(Array.from({ length: 13 }, () => "token"), "token"), /12 tokens/i);
  assert.equal(validateAttentionInput(["one", "two"], "one"), "");
});

test("token features and scaled dot product are finite and repeatable", () => {
  const first = tokenFeatures("Language");
  const second = tokenFeatures("Language");
  assert.deepEqual(first, second);
  assert.equal(first.length, 3);
  assert.ok(first.every((value) => Number.isFinite(value) && value >= 0 && value <= 1));
  assert.equal(scaledDotProduct(first, second), scaledDotProduct(second, first));
});

test("softmax is stable, normalized, and preserves score order", () => {
  const weights = softmax([1001, 1003, 1002]);
  assert.ok(Math.abs(weights.reduce((sum, weight) => sum + weight, 0) - 1) < 1e-12);
  assert.ok(weights[1] > weights[2]);
  assert.ok(weights[2] > weights[0]);
});

test("attention output is deterministic, normalized, and ranked", () => {
  const tokens = tokenizeSequence("The curious robot studies language patterns carefully");
  const first = calculateAttention(tokens, "language");
  const second = calculateAttention(tokens, "language");

  assert.deepEqual(first, second);
  assert.equal(first.focusIndex, 4);
  assert.equal(first.focusInSequence, true);
  assert.equal(first.rows.length, tokens.length);
  assert.ok(Math.abs(first.rows.reduce((sum, row) => sum + row.weight, 0) - 1) < 1e-12);
  assert.equal(first.ranked[0].weight, Math.max(...first.rows.map((row) => row.weight)));
  assert.ok(first.rows.every((row) => row.rawScore === row.similarityScore + row.positionBias));
});

test("a focus outside the sequence uses a documented centre anchor", () => {
  const result = calculateAttention(["alpha", "beta", "gamma", "delta"], "query");
  assert.equal(result.focusInSequence, false);
  assert.equal(result.focusIndex, 1);
  assert.equal(result.rows[1].distance, 0);
  assert.equal(result.rows[3].distance, 2);
  assert.ok(result.rows[1].positionBias > result.rows[3].positionBias);
});
