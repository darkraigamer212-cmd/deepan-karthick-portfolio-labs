import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLatentSvgFilename,
  createLatentVariations,
  GAN_EXAMPLE_INPUT,
  generateLatentSample,
  serializeLatentSvg,
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

test("SVG export is stable and embeds accessible simulation provenance", () => {
  const sample = generateLatentSample(GAN_EXAMPLE_INPUT).sample;
  const first = serializeLatentSvg(sample);
  const second = serializeLatentSvg(sample);
  assert.equal(first, second);
  assert.match(first, /<title id="latent-title">Abstract background/);
  assert.match(first, /<desc id="latent-description">/);
  assert.match(first, /aria-labelledby="latent-title latent-description"/);
  assert.match(first, /not a trained GAN/);
  assert.match(first, new RegExp(sample.signature));
  assert.match(first, new RegExp(sample.seed));
  assert.match(first, /&quot;style&quot;:&quot;orbit&quot;/);
  assert.equal((first.match(/<(circle|ellipse|rect|polygon)\b/gu) || []).length, sample.shapes.length + 1);
});

test("SVG export escapes custom titles, seed metadata, and descriptions", () => {
  const sample = generateLatentSample({ ...GAN_EXAMPLE_INPUT, seed: "design<&seed" }).sample;
  const svg = serializeLatentSvg(sample, { title: "Hero <Background> & Accent" });
  assert.match(svg, /Hero &lt;Background&gt; &amp; Accent/);
  assert.match(svg, /design&lt;&amp;seed/);
  assert.doesNotMatch(svg, /Hero <Background>/);
  assert.doesNotMatch(svg, /design<&seed/);
});

test("SVG filename is useful, stable, and filesystem-safe", () => {
  const sample = generateLatentSample(GAN_EXAMPLE_INPUT).sample;
  const filename = buildLatentSvgFilename(sample);
  assert.equal(filename, `abstract-background-orbit-${sample.signature}.svg`);
  assert.match(filename, /^[a-z0-9-]+\.svg$/u);
});
