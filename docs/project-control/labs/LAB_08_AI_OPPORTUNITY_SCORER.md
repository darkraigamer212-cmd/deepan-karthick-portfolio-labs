# Lab 08 - AI Opportunity Scorer

## Certificate connection

AI for Everyone: evaluates whether a business task is a sensible candidate for AI-assisted work before implementation begins.

## Workflow

The user rates task frequency, repetition, data availability, error cost, privacy, and required human judgment from 1–5. A visible weighted formula produces a 100-point score, recommendation band, factor breakdown, and risk-specific guardrails.

## Implementation and tests

`aiOpportunityScorer.js` owns validation, inverse risk factors, scoring, recommendation bands, and guardrails. `AiOpportunityScorer.jsx` renders the live assessment. Tests cover the example, inverse factors, high-risk controls, and invalid inputs.

## Limitations

The score is a planning heuristic, not a measured return-on-investment forecast or permission to automate a task.
