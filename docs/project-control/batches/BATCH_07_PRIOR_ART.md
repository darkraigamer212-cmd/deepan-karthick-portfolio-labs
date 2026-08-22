# Batch 7 Prior-Art and Differentiation Note

Date checked: 2026-08-22

## Method and claim boundary

Searches covered the exact proposed names and adjacent categories: share-link permission and expiry review, cybersecurity career and interview preparation, SOC alert investigation and blast-radius tools, log-schema or detection-rule drift, and control-evidence freshness or continuous monitoring. Exact-name searches produced no direct match. Public search is not exhaustive and does not establish worldwide novelty. These projects are original workflow combinations and will not be marketed as verified world-first inventions.

## Findings and locked differentiators

- Secure-sharing settings, DLP, and link-expiry controls already exist. Lab 25 differs by rehearsing what remains after access revocation: provider access, downloaded copies, screenshots, forwarded notifications, cached previews, and recipient-held derivatives. It produces a pre-share minimum-access contract, an explicit non-revocable residue ledger, expiry verification, and a safer-channel decision without handling a real link or file.
- Career trackers, resume builders, STAR generators, and NICE role mappings already exist. Lab 27 differs by compiling a student's own artifact IDs into backed, needs-evidence, or do-not-claim statements mapped to target work tasks, then emitting citation-bearing resume bullets, a STAR interview answer, an evidence packet, and one concrete gap drill. Unsupported achievements must be withheld rather than polished.
- SOC triage platforms, playbooks, investigation storyboards, and blast-radius tools already exist. Lab 28 differs by comparing containment choices before action through two linked ledgers: evidence confidence and customer-promise side effects. It must expose reversibility, service harm, evidence-to-collect-first, rollback proof, owner, escalation trigger, and uncertainty without ingesting live alerts or recommending an irreversible action.
- Log analyzers, schema registries, detection-as-code testing, and anomaly scanners already exist. Lab 29 differs by comparing a detection rule's declared field/type/unit/time assumptions with before-and-after telemetry contracts, showing which detection claims become silent, widened, or invalid, and generating a standard-library Python regression harness without ingesting log events or connecting to a SIEM.
- Risk registers, control catalogs, evidence-management tools, and continuous-monitoring dashboards already exist. Lab 30 differs by starting with one concrete system/vendor/owner/configuration change and tracing its assurance shockwave across control claims, evidence dependencies, accepted risks, and review cadences. It emits invalidated claims, renewal order, decision expiries, owners, and an executive change memo rather than another static likelihood-impact register.

## Representative foundations reviewed

- CISA SharePoint and OneDrive secure-configuration baseline for restrictive link types, view defaults, and bounded public-link expiry: https://www.cisa.gov/sites/default/files/2023-12/SharePoint%20and%20OneDrive%20SCB_12.20.2023.pdf
- NIST NICE Workforce Framework and current resource center for task, knowledge, skill, competency, and work-role vocabulary: https://csrc.nist.gov/pubs/sp/800/181/r1/final and https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/getting-started
- NIST SP 800-61 Rev. 3 for incident-response preparation, detection, response, recovery, and impact reduction: https://csrc.nist.gov/pubs/sp/800/61/r3/final
- NIST SP 800-92 for robust security log-management processes: https://csrc.nist.gov/pubs/sp/800/92/final
- NIST SP 800-53A Rev. 5 and continuous-monitoring guidance for evidence-based assessment, system changes, assessment cadence, and updated security documentation: https://csrc.nist.gov/pubs/sp/800/53/a/r5/final and https://csrc.nist.gov/CSRC/media/Projects/Risk-Management/documents/monitor/qsg_monitor_system-perspective.pdf

## Safety boundaries

- Lab 25 accepts generic sharing-policy metadata only: no URLs, file contents, recipient identities, access tokens, or provider connections.
- Lab 27 accepts artifact labels and evidence descriptions only; it must not fabricate metrics, employers, responsibilities, outcomes, or links.
- Lab 28 is a defensive tabletop. It must not ingest live telemetry, query infrastructure, contain a host, revoke an identity, or generate attack details.
- Lab 29 accepts schema/rule contracts only, generates reviewable text, and never reads log records, executes Python, or connects to security infrastructure.
- Lab 30 provides change-triggered review planning, not compliance certification, audit approval, or an automatic risk-acceptance decision.

## Acceptance consequence

Each implementation must prove its differentiator through tests and a realistic browser workflow. A renamed privacy checklist, job tracker, SOC simulator, anomaly scanner, or risk register does not pass Batch 7.
