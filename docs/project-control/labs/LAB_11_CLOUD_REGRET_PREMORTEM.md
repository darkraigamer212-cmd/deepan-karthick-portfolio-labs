# Lab 11 - Cloud Regret Pre-Mortem

## User and problem

A startup founder or technical lead is considering a cloud migration but needs to expose how the decision could fail before signing a broad commitment.

## Certificate connection

Introduction to Cloud Computing: applies cloud economics, portability, skills, downtime, export, and lock-in concepts to a bounded migration decision.

## Workflow and useful output

The user enters a migration decision, transparent planning costs, a 12-36 month horizon, and five risk ratings. The tool calculates stay-versus-migrate planning totals, generates exactly five regret scenarios with early warnings and reversible responses, and produces a copyable decision memo plus a 30-day pilot contract and exit test.

## Differentiator

This is not a cloud price calculator or provider chooser. It combines lightweight economics with a failure pre-mortem, explicit reversibility conditions, and an independent exit test so the output can be used in a real decision review.

## Implementation and tests

`cloudRegretPremortem.js` contains validation, planning arithmetic, risk transformations, scenarios, pilot rules, and memo formatting. `CloudRegretPremortem.jsx` provides the local workflow. Tests cover the five-scenario contract, pause conditions, cost bounds, and horizon validation.

## Limitations

All costs are user assumptions, not provider quotes. The output is a planning aid, not architecture, procurement, financial, security, or legal approval.
