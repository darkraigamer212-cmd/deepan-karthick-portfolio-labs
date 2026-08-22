# Lab 07 - GenAI Lifecycle Explorer

## Certificate connection

Introduction to Generative AI: demonstrates that a GenAI product requires scoping, data, evaluation, governance, deployment, and monitoring—not only prompting a model.

## Workflow

The user describes a use case and selects data readiness, risk/impact, and deployment context. The lab returns a 0–100 readiness score, blockers, six ordered stages, stage exit artifacts, and required project documents.

## Implementation and tests

`genAiLifecycleExplorer.js` contains the scoring and planning rules. `GenAiLifecycleExplorer.jsx` renders the form and plan. Tests cover stage order, high-impact controls, missing-data blockers, scoring, and validation.

## Limitations

The output is a deterministic educational checklist. It does not validate real datasets, laws, model providers, or organizational approvals.
