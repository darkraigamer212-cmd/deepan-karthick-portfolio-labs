# Portfolio Labs Upgrade Status

Last updated: 2026-08-22

## Current phase

Batch 0 through Batch 5 functional work is complete. Both flagships are functional, the Printing Press ERP is claimed and verified on Cloudflare, and Labs 01-19 plus Lab 26 have passed automated and browser acceptance under the usefulness and originality gates.

## Confirmed product decisions

- Build working prototypes before visual polish.
- The portfolio homepage will feature only two flagship projects.
- Flagship 1: Printing Press ERP.
- Flagship 2: Timber CFT Pro with billing.
- The rental research project is removed from flagship positioning.
- All 30 certificate projects will live in one Applied Labs application with separate routes.
- Security labs must remain defensive, local-first, and educational.
- Client databases and imported ZIP artifacts must never be committed or deployed.

## Work completed

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

## In progress

- Batch 6 originality and usefulness redesign for Labs 20-24.

## Next checkpoint

Replace Batch 6's generic planned concepts with useful, differentiated workflows before implementation, then apply the complete acceptance gate.

## Known risks

- The timber archive includes a local SQLite database that may contain real client data.
- Timber CFT Pro currently depends on a local Express/SQLite runtime and cannot be published as-is.
- The current timber "bill" is a measurement statement, not a financial invoice; rates, tax, payments, and balances must be implemented explicitly.
- The existing portfolio source is large and must be simplified later without mixing visual redesign into functional batches.
- External API dependencies would reduce demo reliability; core lab workflows must work without API keys.
- The ERP dependency audit reports 2 moderate and 5 high advisories; remediation is deferred until it can be tested without destabilizing the working demo.
