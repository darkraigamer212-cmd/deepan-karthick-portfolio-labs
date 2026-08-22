import test from "node:test";
import assert from "node:assert/strict";
import {
  NEURON_EXAMPLE,
  applyActivation,
  predictBinaryGrid,
  runNeuron
} from "../labs-src/labs/neuralNetworkPlayground.js";

test("activation functions return deterministic values", () => {
  assert.equal(applyActivation(-0.1, "step"), 0);
  assert.equal(applyActivation(0, "step"), 1);
  assert.equal(applyActivation(-3, "relu"), 0);
  assert.equal(applyActivation(2.5, "relu"), 2.5);
  assert.ok(Math.abs(applyActivation(0, "sigmoid") - 0.5) < 1e-12);
});

test("one-neuron example exposes its weighted calculation", () => {
  const result = runNeuron(NEURON_EXAMPLE);

  assert.deepEqual(result.errors, {});
  assert.equal(result.weightedSum, 0.5);
  assert.equal(result.output, 1);
  assert.deepEqual(result.contributions.map((item) => item.value), [1, 0, -0.5]);
  assert.match(result.equation, /= 0.5$/);
});

test("OR-gate example predicts all four binary pairs", () => {
  assert.deepEqual(
    predictBinaryGrid(NEURON_EXAMPLE).map((row) => row.output),
    [0, 1, 1, 1]
  );
});

test("neuron validation rejects blank and non-finite values", () => {
  const result = runNeuron({ input1: "", input2: 1, weight1: Infinity, weight2: 1, bias: 0, activation: "mystery" });

  assert.deepEqual(Object.keys(result.errors).sort(), ["activation", "input1", "weight1"]);
  assert.equal(result.output, null);
});
