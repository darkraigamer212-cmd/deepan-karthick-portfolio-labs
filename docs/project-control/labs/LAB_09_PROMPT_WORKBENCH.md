# Lab 09 - Prompt Workbench

## Certificate connection

Prompt Engineering for ChatGPT: turns prompt components into a structured, reviewable instruction and identifies missing quality signals.

## Workflow

The user fills role, task, context, constraints, reference example, and output format. The lab assembles the prompt, runs six deterministic quality checks, calculates a score/band, lists improvements, and offers clipboard copy.

## Implementation and tests

`promptWorkbench.js` contains prompt assembly, validation, checks, scoring, and suggestions. `PromptWorkbench.jsx` provides the editable workbench and copy state. Tests cover deterministic assembly, a strong complete example, specific improvements, and empty required fields.

## Limitations

The lab does not call ChatGPT or judge an actual model response. A high structure score cannot guarantee correct or safe output.
