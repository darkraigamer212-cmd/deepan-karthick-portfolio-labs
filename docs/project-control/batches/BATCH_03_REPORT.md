# Batch 3 Report - Applied Labs 06-10

Date: 2026-08-22

## Outcome

The second five AI/ML certificate projects are functional, local-first, documented, tested, and lazy-loaded from stable Applied Labs routes. The models expose their calculations and avoid external APIs, hidden training services, and unsupported claims.

## Delivered labs

6. Neural Network Playground - calculates one neuron's weighted sum and step, sigmoid, or ReLU output, with a contribution breakdown and four binary predictions.
7. GenAI Lifecycle Explorer - converts explicit readiness and risk choices into a six-stage plan, score, blockers, exit artifacts, and governance requirements.
8. AI Opportunity Scorer - scores a business task with a transparent weighted formula and returns recommendation bands and guardrails.
9. Prompt Workbench - assembles a structured prompt, performs six local quality checks, and provides deterministic suggestions and copy-ready output.
10. ML Model Lab - parses two-feature labelled data, standardizes features, runs KNN, exposes neighbours and votes, and calculates leave-one-out accuracy.

## Verification

- Canonical manifest: valid with 30 labs and 2 flagships.
- Automated tests: 53 passed overall; 23 directly cover Batch 3.
- Production builds: portfolio, Applied Labs, and Timber passed before the final responsive fix.
- Applied Labs production build: passed again after the final responsive fix.
- Code splitting: each of the ten implemented labs builds as an independent lazy-loaded chunk.
- Browser: all five Batch 3 direct routes rendered meaningful content.
- Browser interactions: neuron example, lifecycle example, opportunity scoring, prompt assembly/copy state, ML reset/error/reload/prediction all passed.
- Responsive QA: ML Model Lab passed at 390 × 844 after a table-overflow repair.
- Console: no warnings or errors in the accepted flows.
- Privacy/security: all calculations remain in the browser; no entered text or datasets are transmitted.

## Limitations

- Neural Network Playground calculates one manually configured neuron; it does not train a network.
- GenAI Lifecycle Explorer and AI Opportunity Scorer are deterministic planning aids, not investment or deployment decisions.
- Prompt Workbench analyzes prompt structure but does not execute the prompt against a model.
- ML Model Lab supports two numeric features, bounded rows, simple comma-separated cells, and KNN classification only.
- Leave-one-out accuracy is a learning diagnostic and does not establish production performance.
- Final visual direction remains scheduled for Batch 8.
