# Redesign guide coverage plan

**Status: NOT YET IMPLEMENTED.** This is a planning and coverage audit, not a completed guide update or release acceptance report.

Audit date: 2026-08-31. Scope: the portfolio and Applied Labs platform, all 30 certificate-linked labs, and the two flagship applications. No app source, existing manual, generated artifact, or deployment is changed by this document.

## Existing evidence and what it means

- `docs/portfolio-labs-complete-manual.md` exists with 18 main sections, both flagship chapters, all 30 numbered lab chapters, shared setup/testing/troubleshooting guidance, and a route/source/test appendix.
- `docs/generated/portfolio_labs_complete_manual.pdf` and `.docx` exist, timestamped 2026-08-22. Their existence is confirmed; this audit did not inspect PDF/DOCX rendering or certify their contents.
- `scripts/build_complete_manual.py` builds both artifacts from the Markdown source. It supports a bounded Markdown subset and PDF outline bookmarks, but has no screenshot/image-block rendering path.
- `docs/project-control/labs/` contains one note for every lab. Notes for Labs 01–10 are 17–21 lines; Labs 11–19 and 26 are 25 lines; Labs 20–25 and 27–30 are 42–93 lines. Depth is uneven.
- Each main-manual lab chapter is a concise summary of certificate, user/problem, rationale, inputs, logic, outputs, safety, tests, limitations, and route/files. This is useful reference coverage, not yet a detailed build-and-operate tutorial.
- Domain modules, UI modules, and focused test files exist for all 30 labs. File presence is not proof of a fresh test pass or production behavior.
- The homepage/links-page resource list in `portfolio-src/main.jsx` does not currently include the manual. `scripts/assemble_cloudflare_site.mjs` copies the manual PDF but not the editable DOCX or Markdown into the public package.

## Coverage matrix

Names and slugs below come from `project-manifest.json`. Lab routes use `#/lab/<slug>`. Domain and UI paths are relative to `labs-src/labs/`; lab-note filenames are relative to `docs/project-control/labs/`. The existing manual's Appendix A maps the focused test filenames.

Coverage codes:

- **Summary**: existing main-manual chapter and a short supporting lab note.
- **Expanded note**: existing main-manual summary plus a more detailed supporting note; still not a complete tutorial.
- **Flagship chapter**: existing dedicated chapter with operational/rule descriptions.
- **Pending**: proposed detailed chapter has not been implemented or accepted.

| ID | Project | Canonical slug / ID | Existing coverage and source evidence | Detailed guide status |
| --- | --- | --- | --- | --- |
| F1 | Printing Press ERP | `printing-press-erp` | Flagship chapter, manual §5; `PRINTING_ERP_DEMO_SPEC.md`; `batches/BATCH_01B_REPORT.md`. Source is recorded as a separate private repository, not the public source tree audited here. | Pending; verify available source before documenting internals. |
| F2 | Timber CFT Pro with Billing | `timber-cft-pro` | Flagship chapter, manual §6; `TIMBER_BILLING_SPEC.md`; `timber-src/App.jsx`, `domain/calculations.js`, `domain/invoice.js`, `storage.js`; `tests/timber-domain.test.mjs`. | Pending; update screenshot and route evidence after UI acceptance. |
| 01 | AI Workflow Canvas | `ai-workflow-canvas` | Summary, manual §8; `LAB_01_AI_WORKFLOW_CANVAS.md`; `aiWorkflowCanvas.js` / `AIWorkflowCanvas.jsx`. | Pending |
| 02 | Mini RAG Studio | `mini-rag-studio` | Summary, manual §8; `LAB_02_MINI_RAG_STUDIO.md`; `miniRagStudio.js` / `MiniRagStudio.jsx`. | Pending |
| 03 | GAN Latent Gallery | `gan-latent-gallery` | Summary, manual §8; `LAB_03_GAN_LATENT_GALLERY.md`; `ganLatentModel.js` / `GanLatentGallery.jsx`. | Pending |
| 04 | CNN Feature Explorer | `cnn-feature-explorer` | Summary, manual §8; `LAB_04_CNN_FEATURE_EXPLORER.md`; `cnnConvolution.js` / `CnnFeatureExplorer.jsx`. | Pending |
| 05 | Attention Text Explorer | `attention-text-explorer` | Summary, manual §8; `LAB_05_ATTENTION_TEXT_EXPLORER.md`; `attention-text-explorer.js` / `AttentionTextExplorer.jsx`. | Pending |
| 06 | Neural Network Playground | `neural-network-playground` | Summary, manual §8; `LAB_06_NEURAL_NETWORK_PLAYGROUND.md`; `neuralNetworkPlayground.js` / `NeuralNetworkPlayground.jsx`. | Pending |
| 07 | GenAI Lifecycle Explorer | `genai-lifecycle-explorer` | Summary, manual §8; `LAB_07_GENAI_LIFECYCLE_EXPLORER.md`; `genAiLifecycleExplorer.js` / `GenAiLifecycleExplorer.jsx`. | Pending |
| 08 | AI Opportunity Scorer | `ai-opportunity-scorer` | Summary, manual §8; `LAB_08_AI_OPPORTUNITY_SCORER.md`; `aiOpportunityScorer.js` / `AiOpportunityScorer.jsx`. | Pending |
| 09 | Prompt Workbench | `prompt-workbench` | Summary, manual §8; `LAB_09_PROMPT_WORKBENCH.md`; `promptWorkbench.js` / `PromptWorkbench.jsx`. | Pending |
| 10 | ML Model Lab | `ml-model-lab` | Summary, manual §8; `LAB_10_ML_MODEL_LAB.md`; `ml-model-lab.js` / `MlModelLab.jsx`. | Pending |
| 11 | Cloud Regret Pre-Mortem | `cloud-regret-premortem` | Summary, manual §9; `LAB_11_CLOUD_REGRET_PREMORTEM.md`; `cloudRegretPremortem.js` / `CloudRegretPremortem.jsx`. | Pending |
| 12 | AWS Customer-Journey Outage Storyboard | `aws-outage-storyboard` | Summary, manual §9; `LAB_12_AWS_OUTAGE_STORYBOARD.md`; `awsOutageStoryboard.js` / `AwsCustomerJourneyOutageStoryboard.jsx`. | Pending |
| 13 | Azure Access Handoff Simulator | `azure-access-handoff` | Summary, manual §9; `LAB_13_AZURE_ACCESS_HANDOFF.md`; `azureAccessHandoff.js` / `AzureAccessHandoffSimulator.jsx`. | Pending |
| 14 | GCP Transformation Promise Ledger | `gcp-promise-ledger` | Summary, manual §9; `LAB_14_GCP_PROMISE_LEDGER.md`; `gcp-promise-ledger.js` / `GcpTransformationPromiseLedger.jsx`. | Pending |
| 15 | Responsive Constraint Handoff | `responsive-constraint-handoff` | Summary, manual §10; `LAB_15_RESPONSIVE_CONSTRAINT_HANDOFF.md`; `responsiveConstraintHandoff.js` / `ResponsiveConstraintHandoff.jsx`. | Pending |
| 16 | Exception-First Python Automator | `exception-first-python-automator` | Summary, manual §10; `LAB_16_EXCEPTION_FIRST_PYTHON_AUTOMATOR.md`; `exceptionFirstPythonAutomator.js` / `ExceptionFirstPythonAutomator.jsx`. | Pending |
| 17 | Queue Fairness Replay | `queue-fairness-replay` | Summary, manual §10; `LAB_17_QUEUE_FAIRNESS_REPLAY.md`; `queueFairnessReplay.js` / `QueueFairnessReplay.jsx`. | Pending |
| 18 | Safe C Input Harness | `safe-c-input-harness` | Summary, manual §10; `LAB_18_SAFE_C_INPUT_HARNESS.md`; `safeCInputHarness.js` / `SafeCInputHarness.jsx`. | Pending |
| 19 | CSV Claim Stress Tester | `csv-claim-stress-tester` | Summary, manual §10; `LAB_19_CSV_CLAIM_STRESS_TESTER.md`; `csv-claim-stress-tester.js` / `CsvClaimStressTester.jsx`. | Pending |
| 20 | LLM Data Contract Firewall | `llm-data-contract-firewall` | Expanded note, manual §10; `LAB_20_LLM_DATA_CONTRACT_FIREWALL.md`; `llmDataContractFirewall.js` / `LlmDataContractFirewall.jsx`. | Pending |
| 21 | Shortage Response Trade-off Lab | `shortage-response-tradeoff` | Expanded note, manual §11; `LAB_21_SHORTAGE_RESPONSE_TRADEOFF.md`; `shortageResponseTradeoff.js` / `ShortageResponseTradeoffLab.jsx`. | Pending |
| 22 | LP Exit Rehearsal | `lp-exit-rehearsal` | Expanded note, manual §11; `LAB_22_LP_EXIT_REHEARSAL.md`; `lpExitRehearsal.js` / `LpExitRehearsal.jsx`. | Pending |
| 23 | Account Recovery Drill Composer | `account-recovery-drill` | Expanded note, manual §11; `LAB_23_ACCOUNT_RECOVERY_DRILL.md`; `accountRecoveryDrill.js` / `AccountRecoveryDrillComposer.jsx`. | Pending |
| 24 | Feature Misuse Contract | `feature-misuse-contract` | Expanded note, manual §11; `LAB_24_FEATURE_MISUSE_CONTRACT.md`; `feature-misuse-contract.js` / `FeatureMisuseContract.jsx`. | Pending |
| 25 | Share-Link Afterlife Rehearsal | `share-link-afterlife` | Expanded note, manual §12; `LAB_25_SHARE_LINK_AFTERLIFE.md`; `shareLinkAfterlife.js` / `ShareLinkAfterlifeRehearsal.jsx`. | Pending |
| 26 | Network Change Rollback Composer | `network-change-rollback` | Summary, manual §9; `LAB_26_NETWORK_CHANGE_ROLLBACK.md`; `networkChangeRollback.js` / `NetworkChangeRollbackComposer.jsx`. | Pending |
| 27 | Proof-to-Interview Compiler | `proof-to-interview-compiler` | Expanded note, manual §12; `LAB_27_PROOF_TO_INTERVIEW_COMPILER.md`; `proofToInterviewCompiler.js` / `ProofToInterviewCompiler.jsx`. | Pending |
| 28 | Containment Side-Effect Ledger | `containment-side-effect-ledger` | Expanded note, manual §12; `LAB_28_CONTAINMENT_SIDE_EFFECT_LEDGER.md`; `containmentSideEffectLedger.js` / `ContainmentSideEffectLedger.jsx`. | Pending |
| 29 | Detection Contract Drift Guard | `detection-contract-drift-guard` | Expanded note, manual §12; `LAB_29_DETECTION_CONTRACT_DRIFT_GUARD.md`; `detectionContractDriftGuard.js` / `DetectionContractDriftGuard.jsx`. | Pending |
| 30 | Assurance Change Shockwave Mapper | `assurance-change-shockwave` | Expanded note, manual §12; `LAB_30_ASSURANCE_CHANGE_SHOCKWAVE.md`; `assuranceChangeShockwave.js` / `AssuranceChangeShockwaveMapper.jsx`. | Pending |

All 32 project rows have existing documentation coverage. None has been accepted against the proposed detailed chapter template below during this audit. The manifest's functional status describes implementation, not completeness of documentation.

## Conflicts to reconcile before calling the guide complete

1. **Final release versus unknown deployment:** the manual introduction records the unified Cloudflare URL as final, while §14 says portfolio/labs deployment is unrecorded and no Cloudflare command/configuration exists. `wrangler.jsonc`, `scripts/assemble_cloudflare_site.mjs`, and the `build:site` / `site:assemble` package scripts now exist. Document their actual behavior and then verify the release, rather than treating the introduction as sufficient evidence.
2. **Timber identity:** §6 discusses an unverified `calculator00.pages.dev` association, while `portfolio-src/main.jsx` links to the unified `../timber-demo/index.html`. Capture the actual built project after the redesign and record its route/build revision. Do not reuse the questionable image as proof of the new application.
3. **Acceptance chronology:** `STATUS.md` and multiple manual passages stop at batch 6 or leave batch 7 acceptance pending. Batch reports present in this audit stop at `BATCH_06_REPORT.md`; batch 7 has a prior-art record. Preserve historical claims with dates and create new acceptance evidence to resolve current state.
4. **Repository identity:** root `README.md` still presents Rental Research as the primary project, and `portfolio-src/main.jsx` still names the older career-kit repository. Reconcile the intended public repository using verified remotes/release records when implementation begins.
5. **User access:** add an obvious guide entry to the portfolio and Applied Labs when approved implementation proceeds. Decide deliberately which editable artifacts are public; do not silently expose the entire documentation/import tree.
6. **Generation and verification:** the current Node build/CI does not generate or validate the manual. Add a documented generation command and a documentation gate; do not equate a successfully generated PDF with correct content or legible layout.

## Source-of-truth policy

- Use `project-manifest.json` for canonical lab IDs, names, slugs, categories, and certificate associations. Cross-check route registration in `labs-src/main.jsx` before publishing links.
- Use current source and focused tests for exact formulas, thresholds, rounding, validation limits, algorithms, and state transitions. The existing manual is a starting point, not proof that a rule still matches the code.
- Use verified commands/configuration for build and deployment instructions. Record the tested commit, date, surface, deployment/version identifier, route, and observed result separately from intended configuration.
- Treat screenshots as dated evidence of the actual running project. Use synthetic sample data only. Capture them after the chosen UI has passed functional checks; never substitute a concept image for a product screenshot.
- Preserve domain-specific constraints, especially Timber's locked business-inch and billing rules. Do not change formulas to match attractive examples or explanatory prose.
- Describe a historical test result as historical. Current acceptance needs a fresh run. Avoid permanent claims such as “always online,” “fully secure,” “production AI,” or worldwide novelty.
- Keep the ERP's public demo boundary separate from its private live implementation. If internals cannot be safely verified, mark the detail unknown/pending rather than inventing it.
- Never publish imported client databases, runtime bundles, real customer records, secrets, credentials, or private import contents. Public source maps may describe sanitized boundaries without disclosing private paths or data.
- Record unresolved inconsistencies explicitly. A planning document, status label, assistant message, or HTTP 200 alone is not an end-to-end functional acceptance result.

## Proposed detailed chapter template

Each project chapter should follow the same structure, with additional workflow subsections for the flagships:

1. **Identity and evidence:** project title, certificate connection, intended route, source entry points, verified revision/date, and implementation/simulation status.
2. **User and problem:** who uses it, the decision or task it supports, why it was built, and the specific usefulness of its output.
3. **Quick start:** exact synthetic sample inputs and the shortest path to a useful result.
4. **Step-by-step operation:** numbered actions matching actual labels, a genuine result screenshot, reset/retry behavior, and copy/download/save/print steps where implemented.
5. **Input reference:** field, type, unit, default, allowed values/bounds, requiredness, validation message, and sensitive-data restrictions.
6. **Output reference:** field meaning, units, caveats, how to interpret it, and how someone can reuse the artifact.
7. **Worked example:** trace one sample through intermediate calculations or rule decisions to the exact expected output; explain rounding and tie-breaks where applicable.
8. **Implementation map:** UI component, pure domain functions, state flow, shared helpers, persistence, and network boundary. Link only to verified files/functions.
9. **Algorithm explanation:** pseudocode, formulas, thresholds, ordering, complexity where meaningful, and known approximation/simulation boundaries.
10. **How to build it:** reproducible implementation stages and why the chosen approach fits the problem; distinguish reconstruction guidance from a claimed historical development chronology.
11. **Verification:** exact focused command, representative expected vectors, invalid/edge cases, browser workflow, mobile and keyboard checks, and dated outcomes.
12. **Troubleshooting:** symptom, likely cause, diagnostic check, safe remedy, and when not to proceed.
13. **Limitations and maintenance:** privacy/safety limits, unsupported cases, dependency/domain risks, safe extension points, and next improvements.
14. **Explain it:** a short demo/interview narrative and authoritative conceptual references where needed, without exaggerated capability claims.

Shared platform chapters should cover repository setup, architecture and lazy routing, design system and reduced-motion behavior, public versus private data, test/build commands, Cloudflare packaging and rollback, document generation, release evidence, and a searchable project index. Reuse shared explanations instead of copying identical setup instructions into every chapter.

## Proposed document batches

| Batch | Scope | Exit evidence |
| --- | --- | --- |
| D0 | Reconcile identity, stale release/status wording, guide access, source-of-truth policy. | Verified link/command inventory and conflict list resolved or explicitly pending. |
| D1 | Shared architecture and both flagship chapters. | Exact Timber worked example; ERP boundaries documented from available verified source; no private data disclosure. |
| D2 | Labs 01–05. | Five complete chapters matched to source, tests, and sample workflows. |
| D3 | Labs 06–10. | Five complete chapters including transparent math, limits, and worked outputs. |
| D4 | Labs 11–14 and 26. | Five complete chapters distinguishing planning artifacts from actual cloud/network changes. |
| D5 | Labs 15–19. | Five complete chapters with input grammar, generated-artifact boundaries, and edge cases. |
| D6 | Labs 20–24. | Five complete chapters with privacy, financial/safety limitations, and defensive-only boundaries. |
| D7 | Labs 25 and 27–30. | Five complete chapters with source-verified rules and no unverified security/compliance claims. |
| D8 | Final screenshots, generation, rendered QA, links, and publishing. | Accepted 32-project coverage, readable artifacts, and verified public guide route. |

Documentation agents may work on isolated chapters while UI agents work on separate application files. One coordinator owns the master assembly, shared metadata, generator changes, navigation integration, and release record. Final screenshots and instructions wait until the corresponding UI is stable; otherwise the guide will immediately diverge from the application.

## Documentation acceptance checks

These checks are proposed and **not yet passed** in this planning artifact.

- [ ] Exactly 30 lab chapters and two flagship chapters match canonical IDs/names; no missing or duplicate project entries.
- [ ] Every chapter meets the template or explicitly labels an inapplicable section with a reason.
- [ ] Each input limit, formula, weight, rounding rule, tie-break, and error behavior is reconciled with current source/tests.
- [ ] Every chapter includes at least one reproducible synthetic happy path and one relevant failure/edge case, with expected results.
- [ ] Focused test commands resolve to existing files and current results are dated; historical counts remain clearly historical.
- [ ] Every lab route, flagship route, guide link, source link, and artifact download is checked after the final build.
- [ ] Timber screenshots show the actual sanitized project; sample totals agree with the locked golden rules.
- [ ] Product screenshots are captured from accepted running pages, include only synthetic data, have useful captions/alt descriptions, and reflect final labels/layout.
- [ ] Public ERP guidance does not expose private data/configuration or claim that local demo acceptance proves live backend health.
- [ ] Deployment instructions match actual package scripts/configuration, and release claims identify a verified revision/version and observed workflow result.
- [ ] README, project-control status, manual, visible site links, and final release record no longer contradict each other about project identity or completion.
- [ ] Generator commands and dependencies are documented; Markdown, PDF, and DOCX are regenerated from the accepted source.
- [ ] Coverage validation checks IDs/slugs, required sections, missing assets, and broken internal references before publication.
- [ ] PDF/DOCX are visually inspected for clipping, blank/missing content, code/table wrapping, legible screenshots, page breaks, and usable navigation.
- [ ] The public package includes only the deliberately selected guide artifacts, not the entire docs tree or private imports.
- [ ] The guide is discoverable from the portfolio and Applied Labs, including mobile/keyboard navigation.
- [ ] Completion is recorded only after content, functional example, rendered-output, and published-link checks pass.
