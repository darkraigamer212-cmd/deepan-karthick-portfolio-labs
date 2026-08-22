import assert from "node:assert/strict";
import test from "node:test";
import {
  createLatentVariations,
  GAN_EXAMPLE_INPUT,
  generateLatentSample,
  validateLatentInput
} from "../labs-src/labs/ganLatentModel.js";

test("GAN latent simulator is deterministic for identical inputs", () => {
  const first = generateLatentSample(GAN_EXAMPLE_INPUT);
  const second = generateLatentSample({ ...GAN_EXAMPLE_INPUT });
  assert.equal(first.valid, true);
  assert.deepEqual(first, second);
  assert.equal(first.sample.shapes.length, 9);
  assert.equal(first.sample.palette.length, 4);
});

test("GAN latent coordinates and seed affect the generated signature", () => {
  const base = generateLatentSample(GAN_EXAMPLE_INPUT).sample;
  const moved = generateLatentSample({ ...GAN_EXAMPLE_INPUT, x: GAN_EXAMPLE_INPUT.x + 0.1 }).sample;
  const reseeded = generateLatentSample({ ...GAN_EXAMPLE_INPUT, seed: "another-seed" }).sample;
  assert.notEqual(base.signature, moved.signature);
  assert.notEqual(base.signature, reseeded.signature);
});

test("GAN latent simulator reports invalid controls without generating a sample", () => {
  const input = { x: 12, y: "nope", seed: "", style: "unknown" };
  assert.deepEqual(validateLatentInput(input), [
    "X coordinate must be between -10 and 10.",
    "Y coordinate must be a valid number.",
    "Seed is required.",
    "Choose a supported visual style."
  ]);
  assert.equal(generateLatentSample(input).sample, null);
});

test("GAN variation gallery produces deterministic nearby samples within bounds", () => {
  const variations = createLatentVariations({ ...GAN_EXAMPLE_INPUT, x: 9.8 }, 4, 0.9);
  assert.equal(variations.length, 4);
  assert.ok(variations.every((item) => item.valid));
  assert.equal(variations[0].sample.coordinates.x, 10);
  assert.equal(new Set(variations.map((item) => item.sample.signature)).size, 4);
});

