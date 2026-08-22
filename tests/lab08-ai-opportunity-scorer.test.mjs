import assert from "node:assert/strict";
import test from "node:test";
import {
  OPPORTUNITY_EXAMPLE_INPUT,
  scoreAiOpportunity,
  validateOpportunityInput
} from "../labs-src/labs/aiOpportunityScorer.js";

test("AI opportunity scorer calculates a transparent weighted example", () => {
  const result = scoreAiOpportunity(OPPORTUNITY_EXAMPLE_INPUT);
  assert.equal(result.valid, true);
  assert.equal(result.score, 83);
  assert.equal(result.band.id, "strong");
  assert.equal(result.breakdown.reduce((sum, item) => sum + item.weight, 0), 100);
  assert.deepEqual(result.breakdown.map((item) => item.points), [20, 20, 15, 5, 11.25, 11.25]);
});

test("AI opportunity scorer applies inverse risk factors", () => {
  const safe = scoreAiOpportunity({ ...OPPORTUNITY_EXAMPLE_INPUT, privacy: 1, humanJudgment: 1 });
  const sensitive = scoreAiOpportunity({ ...OPPORTUNITY_EXAMPLE_INPUT, privacy: 5, humanJudgment: 5 });
  assert.equal(safe.score - sensitive.score, 30);
  assert.ok(sensitive.guardrails.some((item) => item.includes("privacy review")));
  assert.ok(sensitive.guardrails.some((item) => item.includes("human approval")));
});

test("AI opportunity scorer returns actionable high-risk guardrails", () => {
  const result = scoreAiOpportunity({
    ...OPPORTUNITY_EXAMPLE_INPUT,
    dataAvailability: 2,
    errorCost: 5,
    repetition: 2
  });
  assert.ok(result.guardrails.some((item) => item.includes("staged rollout")));
  assert.ok(result.guardrails.some((item) => item.includes("data quality")));
  assert.ok(result.guardrails.some((item) => item.includes("standardize")));
});

test("AI opportunity scorer validates task and rating ranges", () => {
  const invalid = { ...OPPORTUNITY_EXAMPLE_INPUT, taskName: "", frequency: 0, privacy: 2.5 };
  assert.deepEqual(validateOpportunityInput(invalid), [
    "Task name is required.",
    "Task frequency must be a whole number from 1 to 5.",
    "Privacy and sensitivity must be a whole number from 1 to 5."
  ]);
  assert.equal(scoreAiOpportunity(invalid).score, null);
});

