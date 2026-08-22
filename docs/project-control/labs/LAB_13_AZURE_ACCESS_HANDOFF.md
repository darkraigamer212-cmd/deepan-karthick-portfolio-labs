# Lab 13 - Azure Access Handoff Simulator

## User and problem

A manager and Azure administrator handling joiners, movers, and leavers need a handoff artifact that makes access ownership and proof explicit.

## Certificate connection

Microsoft Azure Fundamentals: applies Azure RBAC, scope, least privilege, access review, identity lifecycle, and shared-account risk concepts.

## Workflow and useful output

The user enters a bounded local roster containing status, job role, resource scope, privilege, shared-credential use, and days since review. The simulator identifies orphan access, shared credentials, excessive scope, and review drift. It returns priority-ordered actions with owners and evidence, plus a copyable manager/security checklist.

## Differentiator

This is not a tenant scanner or generic permissions graph. It turns a staffing handoff into an owned evidence plan that connects each detected risk to the person responsible for removing or attesting it.

## Implementation and tests

`azureAccessHandoff.js` performs bounded parsing, validation, risk detection, ordering, and checklist generation. `AzureAccessHandoffSimulator.jsx` keeps the workflow local. Tests cover all four targeted risks, deterministic priority, clean active records, and malformed roster entries.

## References and limitations

The guidance links to official Azure RBAC, role-assignment, Microsoft Entra access-review, and shared-account documentation. The lab does not inspect an Azure tenant and cannot prove effective permissions, group inheritance, or successful removal.
