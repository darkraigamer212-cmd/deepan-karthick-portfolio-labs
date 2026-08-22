import test from "node:test";
import assert from "node:assert/strict";
import {
  AI_WORKFLOW_EXAMPLE,
  buildAIWorkflow,
  validateWorkflowInput
} from "../labs-src/labs/aiWorkflowCanvas.js";

test("AI workflow example creates an ordered, reviewable workflow", () => {
  const result = buildAIWorkflow(AI_WORKFLOW_EXAMPLE);

  assert.deepEqual(result.errors, {});
  assert.equal(result.steps.length, 7);
  assert.equal(result.steps[0].title, "Define success");
  assert.equal(result.steps.at(-1).title, "Release and learn");
  assert.match(result.steps[5].detail, /Expert approval/);
  assert.ok(result.risks.some((risk) => risk.title === "Sensitive data exposure"));
  assert.ok(result.checklist.every(Boolean));
});

test("AI workflow validation reports each missing decision", () => {
  const errors = validateWorkflowInput({ goal: "short", dataSource: "", aiTask: "unknown", reviewLevel: "" });

  assert.deepEqual(Object.keys(errors).sort(), ["aiTask", "dataSource", "goal", "reviewLevel"]);
  assert.deepEqual(buildAIWorkflow({}).steps, []);
});

test("recommendation workflows add decision-overreach protection", () => {
  const result = buildAIWorkflow({
    goal: "Recommend which maintenance request should be handled first.",
    dataSource: "A permitted queue of anonymized maintenance requests.",
    aiTask: "recommend",
    reviewLevel: "medium"
  });

  assert.ok(result.risks.some((risk) => risk.title === "Decision overreach"));
});
