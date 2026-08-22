import assert from "node:assert/strict";
import test from "node:test";
import {
  CNN_PRESETS,
  convolveGrid,
  createBlankGrid,
  normalizeFeatureMap,
  validatePixelGrid
} from "../labs-src/labs/cnnConvolution.js";

test("CNN explorer computes a valid 3 by 3 edge feature map", () => {
  const result = convolveGrid(CNN_PRESETS.diagonal, "edge");
  assert.equal(result.valid, true);
  assert.deepEqual(result.featureMap, [
    [1450, -410, -295],
    [-410, 1450, -410],
    [-295, -410, 1450]
  ]);
});

test("CNN explorer applies the blur divisor", () => {
  const grid = Array.from({ length: 5 }, () => Array(5).fill(90));
  assert.deepEqual(convolveGrid(grid, "blur").featureMap, [
    [90, 90, 90],
    [90, 90, 90],
    [90, 90, 90]
  ]);
});

test("CNN explorer validates dimensions, pixels, and kernel selection", () => {
  assert.deepEqual(validatePixelGrid([[1]]), ["Pixel input must be a 5 by 5 grid."]);
  const grid = createBlankGrid();
  grid[0][0] = 300;
  grid[0][1] = "";
  const result = convolveGrid(grid, "missing");
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, [
    "Row 1, column 1 must be between 0 and 255.",
    "Row 1, column 2 must be a valid number.",
    "Choose a supported convolution kernel."
  ]);
});

test("CNN feature-map normalization handles ranges and flat outputs", () => {
  assert.deepEqual(normalizeFeatureMap([[-10, 0], [10, 30]]), [[0, 0.25], [0.5, 1]]);
  assert.deepEqual(normalizeFeatureMap([[7, 7], [7, 7]]), [[0.5, 0.5], [0.5, 0.5]]);
});
