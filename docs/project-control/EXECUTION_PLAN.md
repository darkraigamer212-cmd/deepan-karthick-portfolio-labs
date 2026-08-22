# Massive Project Execution Plan

## Delivery model

The project is delivered sequentially. Only one batch may be in implementation at a time. Limited sub-agents may audit or build non-overlapping files, but the coordinator owns integration, tests, and final acceptance.

## Public deployment model

1. Main portfolio - two flagship projects and a concise link to Applied Labs.
2. Applied Labs - one application with 30 lazy-loaded project routes.
3. Printing Press ERP - standalone flagship deployment.
4. Timber CFT Pro with billing - standalone flagship deployment.

This keeps maintenance practical while every credential still has a working URL.

## Batch map

| Batch | Scope |
|---|---|
| 0 | Repository controls, manifest, functional shell, CI/test gates, documentation templates |
| 1 | Printing Press ERP and Timber CFT Pro with billing |
| 2 | Labs 01-05 |
| 3 | Labs 06-10 |
| 4 | Labs 11-14 and 26 |
| 5 | Labs 15-19 |
| 6 | Labs 20-24 |
| 7 | Labs 25 and 27-30 |
| 8 | Visual direction, portfolio redesign, integration, accessibility polish |
| 9 | ATS resume and startup resume |
| 10 | Production deployment, regression QA, health checks, complete manual |

## Agent limits

- Coordinator: architecture, integration, shared files, tests, and deployment.
- One builder: one lab or isolated feature at a time.
- One QA reviewer: read-only review until the builder has stopped editing.
- Maximum one development server at a time.
- No two agents may edit the same file or shared configuration concurrently.

## Functional-first rule

Each lab first receives an intentionally plain but usable model. It must accept realistic input, calculate or transform data, show output, handle invalid input, reset safely, and include sample data. Visual concepting and polish happen only after all functional batches pass.

## Checkpoint files

- `STATUS.md` - current state and next action.
- `DECISIONS.md` - durable product and engineering decisions.
- `ACCEPTANCE_CRITERIA.md` - definition of done.
- `project-manifest.json` - source of truth for all 30 labs.
- `batches/` - completion report for each finished batch.
- Each lab README - purpose, certificate mapping, implementation, tests, and limitations.

## Failure containment

- A failing batch blocks the next batch.
- A production build is created only after tests pass.
- Public demos use sanitized sample data.
- Each accepted batch receives a Git checkpoint.
- Rollback uses the previous passing checkpoint.
- Optional AI features may enhance a lab but cannot be required for its core workflow.
