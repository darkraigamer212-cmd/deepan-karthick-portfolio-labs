# Portfolio Labs Upgrade Status

Last updated: 2026-09-05 (portfolio-only redesign deployed)

## Current phase

The canonical manifest records all 30 labs as functional and both flagships as functional-complete. The portfolio, Applied Labs, and sanitized Timber demo have a unified Cloudflare release; Printing Press ERP is a separate Cloudflare demo. This is the existing implementation baseline, not completion of the newly requested redesign.

The latest user instruction narrows changes to **the portfolio only** and explicitly excludes Timber and Printing Press ERP. Applied Labs is not being redesigned in this pass. Preserve those applications, their business rules, private data boundaries, and deployment state. Existing flagship links/screenshots remain part of the portfolio. The portfolio redesign is implemented and verified locally; the final release step is Cloudflare deployment and GitHub push.

Detailed manual source now covers both flagships and all 30 labs. Completing portfolio documentation does not authorize changing the applications it describes. The regenerated PDF/DOCX manual is current with the Markdown source. The existing live URLs below remain the release targets for the final deploy.

## Final portfolio redesign checkpoint - 2026-09-05

- Portfolio homepage and links page were redesigned with aurora/glass backgrounds, bento-style sections, clay-like soft depth, neon accents, hover transitions, GSAP pointer parallax, Framer Motion section reveals, React Spring animated gradients, reduced-motion controls, and responsive mobile/tablet layouts.
- Timber CFT Pro and Printing Press ERP were not redesigned. Their public links and real screenshot previews are retained in the portfolio.
- Applied Labs UI was not redesigned. The generated build was refreshed only because the build pipeline assembles the public site and includes the earlier Lab 06 stale-result fix.
- Manual artifacts were regenerated from the expanded source. The PDF is 65 pages and was rendered to page thumbnails for visual review.
- Verification passed: `pnpm test` 169/169, `pnpm run build:site`, checkpoint integrity validator, root `design-qa.md` with `final result: passed`.
- Cloudflare deployment passed as version `b80bdec7-b3f0-4a60-ad32-ecbe0808f5a8`; public smoke tests returned 200 for the portfolio, links page, Applied Labs, Timber demo, and regenerated manual PDF.

## Documentation checkpoint — 2026-09-04

- Reconciled README, manual, and current status to portfolio-only scope; broad redesign language no longer authorizes Timber/ERP work.
- Removed the long rental-utility instructions from the root README, retaining a brief historical case-study link; no rental source or output was removed.
- Preserved the expanded 30-lab and ERP chapters; completed the remaining Timber chapter with source-backed input bounds, rounding, worked invoice, component map, operating steps, and troubleshooting.
- Corrected Timber's documented storage behavior: damaged history is preserved and reported, not silently reset; clearing requires explicit confirmation.
- Fresh documentation checks on 2026-09-04 passed: canonical manifest (30 labs, two flagships), 30 unique lab chapters plus two flagship chapters, all 90 Appendix A source/component/test file references, and README local-link targets. All nine Timber domain tests passed as a read-only documentation example check. No Timber build or browser mutation was performed.
- No application source, generated PDF/DOCX, or deployment was changed by this documentation lane. Generated manual artifacts remain August 22 snapshots until regeneration and visual QA are recorded.

## Local fix checkpoint — 2026-08-31

The coordinator reports the following completed local work:

- Replaced the portfolio's Timber/ERP image assets with actual project `.jpg` screenshots.
- Added guide PDF links to the portfolio header/resources/link directory and the labs header/detail view.
- Corrected the public repository link and reduced-motion hover/loop omissions.
- Ran `pnpm run test`: 151 tests passed.
- Ran `pnpm run build:site`: succeeded, with the necessary Windows/esbuild sandbox escalation.

These historical fixes were **not deployed at that checkpoint**. The guide PDF/DOCX have not been regenerated; local guide links still lead to the older artifact. Expanded Markdown chapters are now present, while final portfolio screenshots, rendered-guide QA, and production checks remain pending. The documentation lane did not independently rerun that coordinator's historical checks.

## Public routes and repository

- Portfolio: `https://deepan-karthick-portfolio.industrious-keyboard.workers.dev/`
- Applied Labs: `https://deepan-karthick-portfolio.industrious-keyboard.workers.dev/labs/`
- Timber demo: `https://deepan-karthick-portfolio.industrious-keyboard.workers.dev/timber-demo/`
- ERP demo: `https://lakshmipriya-erp-demo.industrious-keyboard.workers.dev/owner`
- Public repository: `https://github.com/darkraigamer212-cmd/deepan-karthick-portfolio-labs` (configured local remote: `portfolio-origin`). `origin` still points at the older career-kit repository.

`pnpm run build:site` runs the test/build pipeline and assembles `site-dist/`; `wrangler.jsonc` serves that directory through the `deepan-karthick-portfolio` Worker. `pnpm run site:assemble` only packages existing outputs. A release or rollback needs its own recorded revision/version and workflow checks.

## Documentation checkpoint

- Corrected the root README to lead with the two flagships and 30 labs; rental research now has only a brief historical reference.
- Reconciled the Markdown manual's source/build/route architecture and separated historical evidence from new redesign acceptance.
- `redesign-guide-coverage.md` preserves the original August 31 planning inventory/template. Its pending-coverage labels predate the expanded Markdown chapters; use this status and the manual for current content state, and retain its rendered-artifact acceptance checklist.
- Existing manual PDF/DOCX artifacts were generated on 2026-08-22 and are now **stale relative to the corrected Markdown**. They must be regenerated and visually checked after the guide update; they have not been regenerated at this checkpoint.

## Confirmed product decisions

- Build working prototypes before visual polish.
- The portfolio homepage will feature only two flagship projects.
- Flagship 1: Printing Press ERP.
- Flagship 2: Timber CFT Pro with billing.
- The rental research project is removed from flagship positioning.
- All 30 certificate projects will live in one Applied Labs application with separate routes.
- Security labs must remain defensive, local-first, and educational.
- Client databases and imported ZIP artifacts must never be committed or deployed.

## Historical functional work recorded through 2026-08-22

The entries below preserve earlier batch evidence. Their test counts and browser checks are historical, not fresh results for the planned redesign. Available batch reports cover batches 0–6; batch 7 has implementation notes and a prior-art record, but its consolidated acceptance record needs reconciliation. Existing release availability does not substitute for missing route-level evidence.

- Verified the original certificate archive contains 23 credentials.
- Identified the missing portfolio credential: Prompt Engineering for ChatGPT.
- Verified the seven additional credentials, producing a total of 30.
- Fetched the current public career-kit branch.
- Created working branch `codex/portfolio-labs-upgrade`.
- Safely inspected the Timber CFT Pro ZIP.
- Extracted source and tests only; bundled dependencies and Windows runtime were excluded.
- Started independent architecture and test audits of Timber CFT Pro.
- Added the canonical 30-project manifest and automated validation.
- Added the separate Applied Labs React/Vite application.
- Added working search, category filtering, stable hash routes, and responsive layout.
- Added a combined production build for the portfolio and labs.
- Added a frontend CI workflow.
- Verified the labs catalog at desktop and 390 x 844 mobile viewports.
- Verified the cybersecurity filter returns 7 labs and Lab 24 routing works.
- Confirmed there are no browser console warnings or errors in the tested flows.
- Added the sanitized Timber CFT Pro + Billing React application.
- Preserved the locked business-inch, CFT, ICBM, and raw-millimetre M3 rules in independent domain modules.
- Added CFT/M3 pricing, discount, GST, payment, balance, and overpayment calculations.
- Added strict measurement and invoice validation with safe demo limits.
- Added browser-local save, history search, reopen, reset, synthetic sample, and print/Save PDF workflows.
- Passed 9 Timber domain tests and the combined portfolio + labs + Timber production build.
- Browser-tested the Timber sample, invoice totals, local save, reset, and reopen workflow.
- Located the Printing Press ERP source in the private `lakshmipriya-erp` repository and cloned an isolated ignored copy for repair.
- Reproduced the Printing ERP production failure: public pages load, but the owner dashboard remains on empty loading skeletons.
- Added explicit demo and live runtime modes to Printing Press ERP.
- Isolated the public demo from Supabase and replaced production-shaped records with clearly fictional browser-local data.
- Added persistent demo order workflows and kept the authenticated Supabase edition behind explicit live mode.
- Passed 6 ERP runtime/store tests, lint, and the production build.
- Browser-verified the owner dashboard, production priority persistence, major dashboard routes, SPA deep-link routing, and a clean console.
- Deployed the repaired ERP demo to Cloudflare Workers Static Assets as version `4bd9ebd0-69d8-4c3f-b238-947fde815cc5`.
- Re-verified the claimed Cloudflare ERP deployment and promoted its `/owner` URL into the portfolio source.
- Added Lab 01 AI Workflow Canvas with validation, ordered workflow generation, review controls, risks, and readiness checks.
- Added Lab 02 Mini RAG Studio with local chunking, deterministic retrieval, extractive answers, evidence scores, and citations.
- Added Lab 03 GAN Latent Gallery with a deterministic 2D latent-space simulation and nearby SVG variations.
- Added Lab 04 CNN Feature Explorer with editable 5 × 5 pixels, selectable kernels, convolution, and a visual 3 × 3 feature map.
- Added Lab 05 Attention Text Explorer with transparent similarity, positional bias, softmax weights, ranking, and a heat sequence.
- Added lazy-loaded routes for Labs 01-05 and marked them functional in the canonical manifest.
- Passed all 30 current domain tests and the combined portfolio, Applied Labs, and Timber production build.
- Browser-tested every Batch 2 lab workflow, including a 390 × 844 mobile check, with no console warnings or errors.
- Added Lab 06 Neural Network Playground with transparent one-neuron arithmetic, three activations, contribution breakdown, and binary sample predictions.
- Added Lab 07 GenAI Lifecycle Explorer with six delivery stages, deterministic readiness scoring, blockers, and required artifacts.
- Added Lab 08 AI Opportunity Scorer with a transparent 100-point weighted formula, recommendation bands, and risk-specific guardrails.
- Added Lab 09 Prompt Workbench with structured prompt assembly, six local quality checks, scoring, suggestions, and copy support.
- Added Lab 10 ML Model Lab with bounded CSV parsing, feature standardization, KNN classification, deterministic tie-breaking, nearest-neighbour evidence, and leave-one-out evaluation.
- Added lazy-loaded routes for Labs 06-10 and marked them functional in the canonical manifest.
- Expanded the automated suite to 53 passing tests and passed the combined portfolio, Applied Labs, and Timber production build.
- Browser-tested every Batch 3 lab workflow and the Prompt Workbench clipboard state with no console warnings or errors.
- Found and fixed page-level mobile overflow from ML result tables; re-verified at 390 × 844.
- Repaired Lab 03 so a designer or student can select and download a deterministic 1600 x 1600 SVG background with reproducibility and simulation-provenance metadata.
- Added Lab 11 Cloud Regret Pre-Mortem with five failure scenarios, transparent planning assumptions, reversible pilot rules, exit test, and decision memo.
- Added Lab 12 AWS Customer-Journey Outage Storyboard with journey-tied failure cards, evidence, containment, fallback, recovery proof, and facilitator checklist.
- Added Lab 13 Azure Access Handoff Simulator with local joiner/mover/leaver risk detection, owned actions, evidence requirements, and a copyable checklist.
- Added Lab 14 GCP Transformation Promise Ledger with a falsifiable hypothesis, reversible pilot, assumption ledger, evidence gates, triggers, risks, and sponsor memo.
- Added Lab 26 Network Change Rollback Composer with CIDR normalization, inventory diffing, overlap/capacity safety blockers, rollback steps, and stakeholder summary.
- Expanded the automated suite to 78 passing tests and passed the combined portfolio, Applied Labs, and Timber production build.
- Browser-tested every Batch 4 example plus Lab 26's blocked-overlap path with no console warnings or errors.
- Verified the two densest Batch 4 tools at a 390px viewport with no page-level horizontal overflow.
- Recorded a dated prior-art review, specific differentiators, and the explicit boundary against unsupported worldwide-novelty claims.
- Replaced Batch 5's generic playground, visualizer, and CSV studio concepts with five original practical workflows before implementation.
- Added Lab 15 Responsive Constraint Handoff with per-viewport feasibility, reflow/visibility decisions, keyboard order, CSS starter, and QA checklist.
- Added Lab 16 Exception-First Python Automator with bounded path validation and dry-run, failure, duplicate, audit, backup, and undo-aware source generation.
- Added Lab 17 Queue Fairness Replay with FIFO versus priority-aging waits, starvation and fairness evidence, and a copyable C contract.
- Added Lab 18 Safe C Input Harness with bounded `fgets`/`strtol`/`strtod` source generation, boundary vectors, stack estimate, and reviewer checklist.
- Added Lab 19 CSV Claim Stress Tester with local quality gates, outlier and time-slice sensitivity, Support/Fragile/Reject evidence, and a pandas recipe.
- Expanded the automated suite to 104 passing tests and passed the combined portfolio, Applied Labs, and Timber production build.
- Browser-tested every Batch 5 realistic example, unsafe Python traversal rejection, and contradicted CSV claim rejection with no console warnings or errors.
- Found and repaired mobile intrinsic-width overflow in the queue results; verified table-heavy Labs 17-19 at 390 x 844.
- Recorded Batch 5's dated prior-art boundaries and concrete differentiators without unsupported worldwide-novelty claims.
- Replaced Batch 6's generic finance and security ideas with five original workflow combinations before implementation.
- Added Lab 20 LLM Data Contract Firewall with fail-closed allow/redact/quarantine/exclude decisions, least-data stages, leakage gates, strict schema output, and a dataset-card contract without processing records.
- Added Lab 21 Shortage Response Trade-off Lab with candidate-price versus purchase-cap allocation evidence, distribution proxies, assumptions, owner memo, and mandatory local legal/anti-gouging review.
- Added Lab 22 LP Exit Rehearsal with synthetic constant-product rebalancing, withdrawal and hold comparison, impermanent loss, fee break-even, separate curve-impact and fee-inclusive execution-gap measures, stop triggers, and governance memo.
- Added Lab 23 Account Recovery Drill Composer with label-only inputs, correlated device/phone/email recovery checks, notification gaps, secret-free tabletop steps, emergency cards, and owned actions.
- Added Lab 24 Feature Misuse Contract with customer-promise-linked defensive misuse stories, OWASP mappings, observable negative acceptance tests, owners, evidence, and a copyable PR merge contract.
- Expanded the automated suite to 126 passing tests and passed the portfolio, Applied Labs, and Timber production builds.
- Browser-tested every Batch 6 realistic example and the recovery drill's unsafe username-style input rejection with no warnings or errors.
- Verified the table-heavy finance/security tools at 390 x 844 and recorded Batch 6's prior-art and safety boundaries without unsupported worldwide-novelty claims.

## In progress

- Finish the current portfolio-only visual and motion pass; preserve Timber, ERP, and Labs applications and avoid shared-style changes that alter excluded surfaces.
- The earlier Batch 7 checkpoint recorded 151 automated tests, but consolidated build/browser/mobile/console evidence was not closed in the batch-report directory. Reconcile with fresh regression results instead of repeating an unverified pass.
- Detailed guide chapters are present in Markdown. Final portfolio screenshots and document generation/visual QA remain pending. Guide discoverability exists in local source; current guide PDF links still target the older artifact.

## Next checkpoint

Keep one owner for portfolio integration and save a resumable checkpoint after verification. Test changed portfolio routes, keyboard/mobile/reduced-motion behavior, and its build without rebuilding excluded applications. After acceptance, capture actual portfolio screenshots, regenerate and visually inspect PDF/DOCX in a dedicated documentation-artifact step, and record any separately authorized release with its version and live checks. Do not mark publication complete from a local build or old baseline status.

## Known risks

- The timber archive includes a local SQLite database that may contain real client data.
- The imported private Timber edition uses Express/SQLite and must not be published as-is. The separate sanitized public React demo already implements rates, tax, payments, balances, and local invoice history.
- The reported incorrect Timber image has been replaced locally with an actual project screenshot. Confirm the portfolio asset after a separately authorized release; Timber UI changes are excluded.
- Shared visual files can inadvertently alter excluded applications. Scope portfolio CSS/motion to portfolio-owned files and keep keyboard/mobile/reduced-motion checks in the acceptance gate.
- External API dependencies would reduce demo reliability; core lab workflows must work without API keys.
- The historical ERP audit reported 2 moderate and 5 high advisories. Current advisory status has not been rechecked in this documentation pass; any remediation needs its own tested change.
- The old generated guide remains publicly packaged until a deliberate regeneration/release; direct readers to current Markdown for corrected status in the meantime.
