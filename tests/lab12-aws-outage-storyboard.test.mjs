import assert from "node:assert/strict";
import test from "node:test";
import {
  AWS_RESILIENCE_SOURCES,
  AWS_STORYBOARD_EXAMPLE_INPUT,
  generateOutageStoryboard,
  validateOutageStoryboardInput
} from "../labs-src/labs/awsOutageStoryboard.js";

test("AWS outage storyboard creates five journey-tied failure stories", () => {
  const result = generateOutageStoryboard(AWS_STORYBOARD_EXAMPLE_INPUT);
  assert.equal(result.valid, true);
  assert.equal(result.cards.length, 5);
  assert.equal(result.cards[0].journeyStep, "Open product page");
  assert.equal(result.cards.at(-1).journeyStep, "See order confirmation");
  assert.ok(result.cards.every((card) => card.customerSymptom && card.containment && card.fallback));
  assert.ok(result.cards.every((card) => card.detectionEvidence.length >= 2 && card.recoveryProof.length >= 2));
});
test("AWS outage storyboard guarantees a minimum three-card rehearsal", () => {
  const input = { ...AWS_STORYBOARD_EXAMPLE_INPUT, dependencies: ["data"] };
  const result = generateOutageStoryboard(input);
  assert.deepEqual(result.cards.map((card) => card.dependency), ["Primary data store", "Traffic and capacity", "Deployment and configuration"]);
});

test("AWS outage storyboard varies facilitator rules by priority and traffic", () => {
  const result = generateOutageStoryboard(AWS_STORYBOARD_EXAMPLE_INPUT);
  assert.ok(result.checklist.some((item) => item.includes("data reconciliation")));
  assert.ok(result.checklist.some((item) => item.includes("launch-like load")));
  assert.ok(result.checklist.some((item) => item.includes("stop conditions")));
});

test("AWS outage storyboard validates journey, categories, and options", () => {
  const invalid = { journeySteps: "Only one", dependencies: [], recoveryPriority: "fast", trafficShape: "huge", dataCriticality: "secret" };
  assert.deepEqual(validateOutageStoryboardInput(invalid), [
    "Enter at least two customer journey steps, one per line.",
    "Select at least one architecture dependency category.",
    "Choose a supported recovery priority.",
    "Choose a supported traffic shape.",
    "Choose a supported data criticality."
  ]);
  assert.equal(generateOutageStoryboard(invalid).cards.length, 0);
  assert.ok(AWS_RESILIENCE_SOURCES.every((source) => source.url.startsWith("https://docs.aws.amazon.com/")));
});
