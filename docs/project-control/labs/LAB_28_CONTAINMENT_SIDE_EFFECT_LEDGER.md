# Lab 28 - Containment Side-Effect Ledger

## User and problem

A junior SOC analyst has a plausible alert claim and several candidate containment actions but does not have authority to trade customer availability for security without review. The analyst needs to show what is known, what remains uncertain, which customer promise may be harmed, what evidence is required before action, and which decisions must be escalated to accountable owners.

## Certificate connection

Introduction to Cybersecurity Tools & Cyberattacks: applies incident-response roles, evidence confidence, source diversity, containment decision criteria, service-impact awareness, reversibility, recovery planning, escalation, documentation, and analyst-to-incident-lead handoff.

## Inputs

The local form accepts bounded defensive metadata only:

- one alert claim;
- one affected service or customer promise;
- up to 20 evidence rows using `fact|source category|confidence`; and
- up to 12 candidate-action rows using `action|reversibility|service harm|owner`.

Evidence source categories are limited to endpoint, identity, application, network, customer report, and change record. Confidence is low, medium, or high. Candidate actions are high-level labels only; reversibility is reversible, partial, or irreversible, service harm is low, medium, or high, and the owner must be a generic organizational role rather than contact information.

## Deterministic workflow and useful output

`containmentSideEffectLedger.js` validates the metadata and calculates transparent evidence gates. At least one high-confidence fact and two source categories are required before a high-harm action can become reviewable. The tool then creates one side-effect ledger entry per candidate action containing:

- the disposition: reviewable, escalate for review, blocked, or escalate only;
- the affected customer promise and likely service side effect;
- evidence to collect before any action;
- the explicit authorization gate;
- rollback or recovery proof;
- the escalation trigger; and
- the accountable owner.

The tool highlights missing high-confidence facts, weak source diversity, absent customer-impact evidence, and remaining low-confidence claims. It emits a copyable analyst handoff that preserves the alert claim, uncertainty, candidate ledger, decision owner, and evidence-location placeholder without embedding operational data.

Irreversible candidates are always marked **escalate only** and are explicitly blocked from recommendation. A high-harm candidate with insufficient confidence or source diversity is marked **blocked**, even if it was entered by the analyst.

## Locked differentiator and prior-art boundary

Incident-response playbooks, impact matrices, SOC simulators, timeline storyboards, and containment checklists already exist. This lab is not another SOC console or incident story generator. Its locked contribution is the evidence-to-side-effect decision ledger: every candidate action must carry customer harm, reversibility, pre-action evidence, rollback proof, escalation trigger, and owner in the same artifact.

The lab does not infer an attack, choose a containment command, or optimize for rapid shutdown. It is deliberately designed to slow unsupported high-impact action and make the missing authorization evidence visible.

## Defensive safety and privacy

The browser never connects to live telemetry, an endpoint, identity platform, network appliance, SIEM, ticket system, or external API. It does not execute or recommend a real containment action. Input validation rejects URLs, address-like indicators, long hash-like values, assigned credentials or secrets, payload or script markers, query-like content, command steps, and contact-address owners. The copy and output remain high-level, defensive, and metadata-only.

The tool is not authorization. Every result states that the organization's incident-response plan, incident command, service owner, legal requirements, evidence-preservation rules, and approved recovery process govern a real decision.

## Official foundation

- [NIST SP 800-61 Rev. 3: Incident Response Recommendations and Considerations for Cybersecurity Risk Management](https://csrc.nist.gov/pubs/sp/800/61/r3/final) supplies the current incident-response risk-management context, the importance of roles and responsibilities, coordinated response, secure recovery, integrity verification, restoration order, confirmation of normal operations, and completed incident documentation.

The lab translates those broad response and recovery concerns into a small educational pre-containment handoff. It does not claim to implement the full NIST profile.

## Implementation and testing

`containmentSideEffectLedger.js` contains the bounded parsers, metadata safety checks, evidence-gap rules, action dispositions, customer-side-effect statements, evidence gates, rollback/recovery proof, escalation triggers, and handoff generation. `ContainmentSideEffectLedger.jsx` renders the accessible local input, example/reset controls, evidence gaps, ledger entries, source link, and copyable handoff.

Focused tests in `tests/lab28-containment-side-effect-ledger.test.mjs` passed **4/4** and verify:

- complete evidence, side-effect, owner, recovery, and escalation output;
- the invariant that an irreversible action is never recommended;
- blocking unsupported high-harm containment; and
- rejection of URLs, queries, command-like content, and contact-address owners.

The Lab 28 and Lab 29 focused run passed **8/8 tests**. The Lab 28 JSX component also parsed and bundled successfully in the isolated lane, and `git diff --check` passed for the owned source and test files.

## Limitations

The deterministic rules do not establish whether an incident exists, whether evidence is authentic, whether containment will be effective, or whether customer harm is acceptable. Source categories do not replace evidence provenance, chain of custody, timestamps, technical scope, or legal review. The fixed confidence/diversity gate is an educational baseline rather than an organization-specific risk policy. A qualified incident commander and relevant service, legal, privacy, communications, and recovery owners must evaluate any real action.
