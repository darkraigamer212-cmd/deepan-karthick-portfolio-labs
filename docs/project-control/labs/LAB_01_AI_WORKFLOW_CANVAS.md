# Lab 01 - AI Workflow Canvas

## Certificate connection

Generative AI for Everyone: turns a possible AI use case into a reviewable workflow with clear human responsibility.

## Workflow

The user supplies a goal, data source, AI task type, and human-review level. The model validates the choices and produces seven ordered implementation steps, a risk register, and a ready-to-run checklist.

## Implementation

`aiWorkflowCanvas.js` contains the pure validation and workflow builder. `AIWorkflowCanvas.jsx` owns only the form and rendered result.

## Tests

Tests cover the sample workflow, missing fields, ordering, and decision-overreach protection.

## Limitations

The generated plan is a deterministic planning aid. It does not call an AI model, inspect real data, or prove that the proposed workflow is suitable for production.
