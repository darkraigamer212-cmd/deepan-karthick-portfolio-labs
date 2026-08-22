# Lab 17 - Queue Fairness Replay

## User and problem

A small helpdesk, clinic, or event service manager needs to see how a scheduling policy changes human waiting, while a C student needs a deterministic data-structure contract they can implement.

## Certificate connection

Data Structures in C: applies records, bounded arrays, queue ordering, priority selection, tie-breaking, complexity-aware simulation, structures, and deterministic test vectors.

## Workflow and useful output

The user enters up to 30 cases with arrival minute, urgency, and service duration, plus an aging interval. The tool replays the same non-preemptive workload under FIFO and priority-with-aging. It compares dequeue order, waits, maximum wait, starvation flags, and a documented fairness score, then emits a copyable C struct and exact test-vector/algorithm contract.

## Differentiator

This is not a generic queue animation. It makes the operational and human trade-off between two policies inspectable and turns the chosen rules into a reproducible C implementation contract.

## Implementation and tests

`queueFairnessReplay.js` parses cases, runs both deterministic schedulers, calculates metrics, and generates the C contract. `QueueFairnessReplay.jsx` renders accessible comparisons and locally scrollable tables. Tests cover ordering, aging promotion, bounds, uniqueness, intervals, and generated vectors.

## Limitations

The replay models one server and omits preemption, staff skills, clinical rules, service-level obligations, and live arrivals. Its Jain-style fairness score describes wait distribution; it does not determine which policy is ethical or safe.
