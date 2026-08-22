# Lab 24 - Feature Misuse Contract

## User and problem

A startup founder or developer is about to ship one web feature. They need to challenge the customer promise before merge and turn plausible misuse into owned, observable negative acceptance tests without running a scanner or writing exploit instructions.

## Certificate connection

OWASP Top 10 - 2021: applies feature scoping, actor and trust-boundary analysis, defensive abuse cases, relevant OWASP category mapping, negative security requirements, observable test outcomes, control ownership, and evidence tracking.

## Workflow and useful output

The user describes the feature and customer promise, lists two to eight actor roles, identifies handled data categories, and enters up to eight actions crossing actor, client, service, or storage boundaries. The local rules produce five to seven prioritized defensive misuse stories. Every story links the broken customer promise to a safe non-exploit scenario, relevant OWASP Top 10:2021 category, negative acceptance test, observable pass condition, control owner, and required evidence. The reusable output is a copyable pull-request acceptance contract with tracked checkboxes, boundary scope, assumptions, and merge evidence.

## Differentiator

Threat-modelling templates, abuse-case methods, OWASP mappings, and security-test checklists already exist. This lab is not an OWASP quiz, generic checklist, vulnerability scanner, or attack generator. Its locked differentiator is beginning with one customer promise and concrete trust-boundary actions, then converting them into feature-specific negative PR acceptance tests with observable evidence and accountable owners.

## Defensive safety boundaries

The workflow is deterministic and browser-local. It accepts descriptions only and never requests target URLs, credentials, secrets, payloads, exploit steps, or production records. It does not scan, contact, probe, authenticate to, or exploit a system; generate attack code; calculate CVSS; or claim that a mapped category proves a vulnerability. Remote-resource scenarios use controlled local or test fixtures and explicitly prohibit contacting real third-party or internal targets.

## Official OWASP foundations

- [OWASP Top 10:2021](https://owasp.org/Top10/) supplies the category names and defensive context.
- [OWASP Abuse Case Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Abuse_Case_Cheat_Sheet.html) supports turning feature misuse into security requirements and acceptance criteria.
- [OWASP Threat Modeling Project](https://owasp.org/www-project-threat-modeling/) supports scoping the system, asking what can go wrong, defining responses, and checking the resulting work.
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) supports repeatable negative security-test framing and evidence.

## Implementation and verification

`feature-misuse-contract.js` contains bounded validation, actor parsing, deterministic story selection and prioritization, OWASP mappings, observable test contracts, assumptions, safety limits, and PR-checklist generation. `FeatureMisuseContract.jsx` renders the accessible local workflow, repeatable boundary rows, data selection, prioritized results, source links, and clipboard handoff.

- Focused automated tests: 8 passed, covering input bounds, deterministic prioritization, complete story contracts, sensitive-data handling, safe remote-resource handling, PR checklist output, limits, and official-source domains.
- Full automated suite: 126 passed.
- Production build: portfolio, Applied Labs, and Timber builds passed after integration; Lab 24 remains an independently lazy-loaded Applied Labs chunk.
- Realistic browser QA: the workspace-invitation and billing example generated six complete defensive stories and the copyable PR contract. The accepted flow emitted no target scanning or payloads and produced no browser console warnings or errors.
- Responsive QA: the direct Lab 24 route was inspected at 390 x 844. Boundary controls, prioritized stories, contract output, source links, and copy control remained contained and usable without page-level overflow.

## Limitations

The generated stories are planning artifacts derived from the supplied roles, data categories, and boundary descriptions. They cannot prove coverage, absence of vulnerabilities, production control effectiveness, legal or regulatory compliance, or correct architecture. Real feature owners must validate the trust-boundary inventory, adapt tests to the implementation, use synthetic test data, attach reviewable evidence, and obtain qualified security review when the feature risk warrants it. The contract must be regenerated when the customer promise, roles, data flows, dependencies, or controls change.
