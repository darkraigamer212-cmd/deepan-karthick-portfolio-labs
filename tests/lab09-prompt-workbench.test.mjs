import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzePrompt,
  assemblePrompt,
  PROMPT_EXAMPLE_INPUT,
  PROMPT_RESET_INPUT,
  validatePromptInput
} from "../labs-src/labs/promptWorkbench.js";

test("prompt workbench deterministically assembles all structured sections", () => {
  const first = assemblePrompt(PROMPT_EXAMPLE_INPUT);
  const second = assemblePrompt({ ...PROMPT_EXAMPLE_INPUT });
  assert.equal(first.valid, true);
  assert.equal(first.prompt, second.prompt);
  assert.match(first.prompt, /^## Role\n/);
  assert.match(first.prompt, /## Constraints\n- Do not rewrite the whole function\./);
  assert.match(first.prompt, /## Output format\nReturn a numbered list/);
});

test("prompt workbench gives the complete example a strong score", () => {
  const result = analyzePrompt(PROMPT_EXAMPLE_INPUT);
  assert.equal(result.score, 100);
  assert.equal(result.band, "Strong");
  assert.deepEqual(result.suggestions, []);
  assert.ok(result.checks.every((check) => check.pass));
});

test("prompt workbench quality checks return specific improvements", () => {
  const input = {
    role: "Helper",
    task: "Do this",
    context: "Small context",
    constraints: "Be clear",
    example: "Short",
    outputFormat: "Answer"
  };
  const result = analyzePrompt(input);
  assert.equal(result.valid, true);
  assert.equal(result.score, 0);
  assert.equal(result.suggestions.length, 6);
});

test("prompt workbench validates all empty required fields", () => {
  const errors = validatePromptInput(PROMPT_RESET_INPUT);
  assert.equal(errors.length, 6);
  assert.deepEqual(errors, [
    "Role is required.",
    "Task is required.",
    "Context is required.",
    "Constraints is required.",
    "Example is required.",
    "Output format is required."
  ]);
  assert.equal(assemblePrompt(PROMPT_RESET_INPUT).prompt, "");
});

