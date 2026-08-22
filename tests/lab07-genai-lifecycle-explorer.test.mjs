import test from "node:test";
import assert from "node:assert/strict";
import {
  LIFECYCLE_EXAMPLE,
  buildLifecyclePlan,
  validateLifecycleInput
} from "../labs-src/labs/genAiLifecycleExplorer.js";

test("lifecycle example builds six ordered stages and a readiness score", () => {
  const result = buildLifecyclePlan(LIFECYCLE_EXAMPLE);

  assert.deepEqual(result.errors, {});
  assert.equal(result.score, 81);
  assert.deepEqual(result.stages.map((stage) => stage.name), ["Scope", "Data", "Evaluate", "Govern", "Deploy", "Monitor"]);
  assert.ok(result.stages.every((stage) => stage.exitArtifact));
  assert.ok(result.artifacts.includes("Monitoring log"));
});

test("high-impact automated deployment produces hard blockers and controls", () => {
  const result = buildLifecyclePlan({
    useCase: "Automatically decide whether an applicant receives access to a financial service.",
    dataReadiness: "ready",
    riskImpact: "high",
    deploymentContext: "automated"
  });

  assert.equal(result.score, 65);
  assert.equal(result.blockers.length, 2);
  assert.ok(result.artifacts.includes("Impact assessment"));
  assert.ok(result.artifacts.includes("Human-override procedure"));
  assert.match(result.readiness, /controls/i);
});

test("missing data is a blocker and lowers readiness", () => {
  const result = buildLifecyclePlan({
    useCase: "Create draft summaries of approved public meeting transcripts for staff.",
    dataReadiness: "none",
    riskImpact: "low",
    deploymentContext: "internal"
  });

  assert.equal(result.score, 65);
  assert.ok(result.blockers.some((blocker) => blocker.includes("No usable dataset")));
});

test("lifecycle validation reports all missing planning inputs", () => {
  const errors = validateLifecycleInput({ useCase: "vague" });

  assert.deepEqual(Object.keys(errors).sort(), ["dataReadiness", "deploymentContext", "riskImpact", "useCase"]);
  assert.deepEqual(buildLifecyclePlan({}).stages, []);
});
