# Lab 30 - Assurance Change Shockwave Mapper

## Purpose, user, and problem

A small-company security lead has just learned that a vendor, system, configuration, or control owner changed. Existing control claims may still read correctly while the evidence behind them has become stale or no longer describes the changed operating condition. The user needs a bounded way to identify which customer and business promises require new evidence, who must act, and which accepted-risk decisions are expiring.

The purpose is change-triggered assurance review planning. It is not a compliance certification, control catalog, audit dashboard, or automatic risk-acceptance workflow.

## Certificate connection

Play It Safe: Manage Security Risks: applies control ownership, evidence-based assurance, change monitoring, review cadence, risk-decision expiry, transparent prioritization, documentation, and accountable follow-up.

## Inputs

The browser-local workflow accepts generic metadata only:

- one change category: `vendor`, `system`, `config`, or `owner`;
- a bounded 15–280 character change description;
- up to 20 claim rows using `claim-id|customer/business promise|owner|review cadence days`;
- up to 40 evidence rows using `evidence-id|claim-id|evidence type|age days|depends-on categories`; and
- up to 20 optional accepted-risk rows using `risk-id|claim-id|days until expiry`.

Claim and evidence identifiers must be unique within their row type. Evidence and accepted-risk rows must reference a declared claim. Evidence dependencies are limited to the four supported change categories. The parser rejects malformed rows, unknown links, unsupported dependency labels, URLs, and credential-like values.

## Workflow and useful outputs

The user describes the change, pastes the three metadata tables, and runs the mapper. The resulting artifact contains:

- an invalidated, needs-review, or current disposition for every claim;
- an evidence dependency shockwave explaining why each evidence record changed state;
- explicit evidence-renewal instructions and the responsible claim owner;
- a deterministic renewal order with its tie-break rules shown;
- expired, due-soon, or active accepted-risk decision windows;
- assumptions and non-certification limits; and
- a copyable executive change memo summarizing the affected claims, renewal order, owners, evidence needs, and decision expiries.

## Deterministic decision rules

The model never produces an opaque likelihood, impact, confidence, or risk score. It applies the following inspectable rules:

1. Evidence is **invalidated** when its declared dependency list contains the selected change category. This invalidates the supplied evidence chain, not the underlying control itself.
2. Otherwise, evidence **needs review** when its age is equal to or greater than its claim's review cadence.
3. Otherwise, evidence is **current** from the supplied metadata.
4. A claim is **invalidated** when any linked evidence is invalidated.
5. A claim **needs review** when it has no evidence or any linked evidence has reached cadence, provided none is invalidated.
6. A claim is **current** only when it has linked evidence, no matching change dependency, and all linked evidence remains within cadence. “Current” is not a compliance claim.
7. An accepted-risk decision is **expired** at zero or fewer days, **due soon** from 1–30 days, and **active** above 30 days. These labels request owner review; they never approve or renew acceptance automatically.
8. Renewal order is sorted by claim state—invalidated, needs-review, current—then expired/due-soon decision status, overdue cadence days, and finally claim ID. The output states this ordering rule beside the result.

## Locked originality and prior-art boundary

Risk registers, control catalogs, governance/risk/compliance platforms, evidence-management products, and continuous-monitoring dashboards already exist. Public prior-art searching is not exhaustive, and the project makes no worldwide-novelty claim.

The locked differentiator is starting with one concrete operational change and tracing its assurance shockwave through declared evidence dependencies, evidence age, claim cadence, accepted-risk expiry, and ownership. The output is a transparent evidence-renewal sequence and executive change memo rather than another static likelihood-impact register or audit status dashboard.

## Safety and privacy boundaries

The lab runs deterministically in the browser and accepts metadata descriptions only. It does not accept or inspect system records, production evidence, target URLs, credentials, secrets, tokens, customer identities, or control-test results. It does not connect to a vendor, system, scanner, ticketing platform, audit tool, or compliance service.

The mapper does not certify compliance, establish control effectiveness, approve an audit, authorize a change, accept risk, renew an accepted-risk decision, or replace a qualified security assessment. Owners must re-establish evidence and record real decisions in the organization's authorized system.

## Implementation and automated verification

Exact implementation files:

- `labs-src/labs/assuranceChangeShockwave.js` — bounded parsers, metadata safety checks, relationship validation, dependency/cadence propagation, claim dispositions, expiry decisions, renewal ordering, assumptions, limits, and executive memo generation.
- `labs-src/labs/AssuranceChangeShockwaveMapper.jsx` — accessible example/reset workflow, pipe-format guidance, validation, result tables, renewal and expiry views, NIST references, and copyable memo control.
- `tests/lab30-assurance-change-shockwave.test.mjs` — focused deterministic model tests.

Focused verification completed with **8/8 tests passing**. Coverage proves:

- typed parsing of claim, evidence, and accepted-risk metadata;
- rejection of unknown claim references, URLs, and credential-like entries;
- propagation from a matching change dependency through evidence to claim invalidation;
- the exact cadence boundary where age equal to cadence needs review;
- expired, due-soon, and active accepted-risk decision labels without approval;
- deterministic renewal ordering and the absence of score properties;
- executive-memo language that does not claim compliance certification, audit approval, or automatic risk acceptance; and
- official NIST CSRC source domains.

The React component also passed an independent Vite JSX parse, and the three-file change passed `git diff --check`.

## Official foundations

- [NIST SP 800-53A Rev. 5 — Assessing Security and Privacy Controls](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final) provides the evidence-based, tailorable assessment-procedure foundation.
- [NIST SP 800-137 — Information Security Continuous Monitoring](https://csrc.nist.gov/pubs/sp/800/137/final) provides continuous-monitoring context for maintaining visibility into controls and responding when observations indicate that assurance may no longer be adequate.
- [NIST RMF Monitor — Tips and Techniques for Systems](https://csrc.nist.gov/CSRC/media/Projects/Risk-Management/documents/monitor/qsg_monitor_system-perspective.pdf) provides change-review and security-documentation context.

These publications ground the planning concepts. The lab does not claim NIST conformance.

## Limitations

The result is only as complete as the entered claim, owner, cadence, evidence-age, dependency, and expiry metadata. Category matching is deliberately conservative and cannot determine whether a real control failed, whether evidence is authentic or sufficient, whether a dependency was omitted, or whether a risk decision remains appropriate. Whole-day age and expiry fields omit calendar, timezone, and business-day detail. Real organizations must validate scope, inspect actual evidence in approved systems, involve accountable owners and assessors, document the change, and apply their own legal, contractual, audit, and risk-governance requirements.
