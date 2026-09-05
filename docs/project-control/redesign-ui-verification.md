# Portfolio redesign: UI verification plan

Prepared: 2026-08-31. Scope: 30 Applied Labs, two flagship applications, and the portfolio's surrounding navigation surfaces.

**Planning artifact only. Every verification check below is pending.** Source inspection identifies intended workflows; it is not evidence that a browser workflow, visual layout, deployment, or export currently passes. Do not carry forward an old test count as proof of this redesign.

Paths in this document are relative to the repository root unless explicitly identified as a separate repository. Use synthetic examples, never client records, identities, credentials, or private invoices.

## Surface and source map

| Surface | Route / entry | Authoritative source | Required redesign verification |
| --- | --- | --- | --- |
| Portfolio home | `/`, `/portfolio/index.html` compatibility alias | `portfolio-src/main.jsx`, `portfolio-src/styles.css`, `portfolio-src/index.html` | Hero, two flagship previews, two detailed project sections, labs entry, about, resources, footer, navigation and all links; pending |
| One-tap links | `/links.html`, `/portfolio/links.html` | `portfolio-src/links.html` and shared `main.jsx` / `styles.css` | Complete readable directory, same visual system, accessible focus, working links including discoverable manual; pending |
| Legacy career dashboard | `/dashboard.html`, `/portfolio/dashboard.html` | `portfolio-src/dashboard.jsx`, `portfolio-src/dashboard.css`, `portfolio-src/dashboard.html` | Existing tabs, search, status filters, tables and browser-local controls remain usable; distinguish its legacy printing demo from the separate flagship ERP; pending |
| Applied Labs catalog | `/labs/`, `/labs/#/` | `labs-src/main.jsx`, `labs-src/styles.css` | Search, categories, counts, empty state, reset, all 30 links, portfolio return and resume; pending |
| Applied Lab detail pages | `/labs/#/lab/<slug>` | `labs-src/main.jsx` (`LabRoute`), `labs-src/labs/*.jsx`, `labs-src/styles.css` | Common page frame plus each individual tool; all 30 rows below pending |
| Timber CFT Pro + Billing | `/timber-demo/` | `timber-src/App.jsx`, `timber-src/styles.css`, `timber-src/main.jsx` | Bill, pricing, totals, measurement table, history, validation, print and local persistence; pending |
| Printing Press ERP | Separate deployed application, `/owner` and its routed pages | Separate private `lakshmipriya-erp` repository: `src/index.css`, `src/layouts/DashboardLayout.jsx`, `src/components/PublicSiteLayout.jsx`, `src/routes/AppRoutes.jsx`, `src/pages/*.jsx` | Public and dashboard layouts, synthetic demo mode, orders, production, inventory, reports, invoices, staff, designer, notifications; separate release and evidence; pending |

The lab source of truth is `docs/project-control/project-manifest.json`: 30 IDs, exact slugs, titles, categories and credential associations. The separate ERP has public home/gallery/login and operational routes; these are sub-surfaces of one flagship, not additional projects in the 32-project count.

## Screenshot correction gate

- Source inspection of `portfolio-src/public/assets/screenshots/timber-calculator.png` shows a Curtain & Wallpaper Calculator. It must be replaced with a capture of the actual Timber application, populated only with its synthetic sample.
- `portfolio-src/public/assets/screenshots/printing-erp-dashboard.png` shows the printing company's marketing homepage, while the portfolio alt text describes an owner dashboard. Capture the actual public demo owner dashboard or change the description to match a deliberately chosen real capture. Prefer the actual operational dashboard for flagship proof.
- Capture again after the approved UI is implemented. Do not use generated concept art as a purported working-app screenshot.
- Verify both hero and detailed project images, accurate alt text, responsive crop and legible app identity. Save source assets under `portfolio-src/public/assets/screenshots/`; regenerate built copies through the build, not manual edits to generated bundles.
- Capture provenance record: project, route, viewport, synthetic state, capture date, implementation commit and file path. All capture/visual checks are pending.

## Archetype batches and ownership

| Batch | Project IDs | Shared layout selectors / implementation notes |
| --- | --- | --- |
| A: Input form to generated report | 01, 02, 06, 07, 11, 15, 16, 20, 21, 25, 26, 27 | `.lab-tool`, `.controls.lab-form`, `.lab-results`, `.button-row`; harmonize field spacing, result hierarchy, errors and long copyable output |
| B: Control sidebar to live output | 08, 09, 12, 13, 17, 18, 22, 23, 28, 29 | `.interactive-lab`, `.lab-workspace`, `.lab-control-panel`, `.lab-output`, `.lab-actions`; preserve live updates, findings, severity and ledger distinctions |
| C: Visual simulation workspaces | 03, 04 | `.latent-artwork`, `.variation-gallery`, `.cnn-workspace`, `.pixel-grid`, `.kernel-grid`, `.feature-map`; preserve output meaning, value labels and keyboard-editable controls |
| D: Specialized data workbenches | 05, 10, 14, 19, 24, 30 | `.lab05-*`, `.lab10-*`, `.lab14-*`, `.lab19-*`, `.lab24-*`, `.lab30-*`; individually inspect heatmap, neighbour tables, decision ledgers, dynamic rows and long result sections |
| E: Flagships | Timber, ERP | Independent source/layouts and independent ERP deployment; keep calculations, persistence, role checks and billing/print logic intact |

Only one implementation owner may edit `labs-src/styles.css` at a time. It currently combines original blue/white tool styling with later editorial overrides; theme-root changes alone cannot recolor hardcoded surfaces safely. Use explicit shared tokens and review every archetype before declaring the theme complete.

Assign one owner each for the portfolio source, lab shell/shared stylesheet, Timber source and separate ERP source. Agents working on disjoint lab JSX files must send required shared style changes to the stylesheet owner. The integrator owns shared dependencies, manifest changes, build artifacts and deployment. Do not alter pure domain algorithms as a side effect of visual work.

## 32-project functional verification matrix

For every row below, **all checks start pending**: **F** = core function plus example/reset/error states; **D** = desktop visual and navigation; **M** = mobile/reflow; **K** = keyboard/focus/accessibility; **R** = reduced motion/performance behavior; **X** = copy/download/print or readable/selectable output as applicable. A dash is not a pass. Mark a genuinely inapplicable action `N/A` only after recording why, and still verify readable output.

Component filenames in lab rows are under `labs-src/labs/`. The expected evidence is derived from the existing React UI, not from completed browser tests. For exact algorithmic results use the existing domain test fixtures; do not invent numerical expectations from a mockup.

| ID / project and component | Core action to exercise | Expected evidence to retain | F | D | M | K | R | X |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 AI Workflow Canvas — `AIWorkflowCanvas.jsx` | Load example; Build workflow; edit a constraint; rebuild | Ordered workflow, risk register and ready-to-run checklist respond to inputs; reset clears/reverts appropriately | Pending | Pending | Pending | Pending | Pending | Pending |
| 02 Mini RAG Studio — `MiniRagStudio.jsx` | Load example; Retrieve answer; change question and submit | Extractive answer and ranked evidence correspond to entered source material; no unsupported generated-answer claim | Pending | Pending | Pending | Pending | Pending | Pending |
| 03 GAN Latent Gallery — `GanLatentGallery.jsx` | Load example; adjust latent controls; select a variation; Download selected SVG | Artwork/selection updates; downloaded SVG matches selected output and opens; explanatory simulation limits remain visible | Pending | Pending | Pending | Pending | Pending | Pending |
| 04 CNN Feature Explorer — `CnnFeatureExplorer.jsx` | Load example; change kernel and a pixel; reset | Editable 5 by 5 input, kernel and 3 by 3 feature map remain readable; values change consistently; invalid input gives visible feedback | Pending | Pending | Pending | Pending | Pending | Pending |
| 05 Attention Text Explorer — `AttentionTextExplorer.jsx` | Load example; change sequence/focus; inspect method | Heat sequence, ranked weights, summary and detailed method agree; weights retain text values independent of color | Pending | Pending | Pending | Pending | Pending | Pending |
| 06 Neural Network Playground — `NeuralNetworkPlayground.jsx` | Load OR-gate example; Run neuron; change weights/activation | Decision calculation and binary sample predictions update; displayed limitations distinguish this small model from trained production AI | Pending | Pending | Pending | Pending | Pending | Pending |
| 07 GenAI Lifecycle Explorer — `GenAiLifecycleExplorer.jsx` | Load example; Build lifecycle plan; change readiness choices | Readiness score, blockers, six-stage lifecycle and required artifacts reflect the selected inputs | Pending | Pending | Pending | Pending | Pending | Pending |
| 08 AI Opportunity Scorer — `AiOpportunityScorer.jsx` | Load example; adjust ratings; reset | Assessment band, score/breakdown and required guardrails update without hidden or color-only status | Pending | Pending | Pending | Pending | Pending | Pending |
| 09 Prompt Workbench — `PromptWorkbench.jsx` | Load example; edit prompt fields; Copy prompt | Quality checks, improvements and assembled prompt reflect edits; clipboard success or usable manual-copy fallback | Pending | Pending | Pending | Pending | Pending | Pending |
| 10 ML Model Lab — `MlModelLab.jsx` | Load example; change data/query/neighbour controls | Prediction, nearest neighbours, votes and leave-one-out check stay consistent and readable; malformed data feedback remains accessible | Pending | Pending | Pending | Pending | Pending | Pending |
| 11 Cloud Regret Pre-Mortem — `CloudRegretPremortem.jsx` | Load example; Run pre-mortem; Copy decision memo | Planning position, five regret scenarios and corresponding decision memo; invalid brief cannot masquerade as valid output | Pending | Pending | Pending | Pending | Pending | Pending |
| 12 AWS Customer-Journey Outage Storyboard — `AwsCustomerJourneyOutageStoryboard.jsx` | Load example; vary journey inputs; use checklist | Ordered failure rehearsal stories and GameDay facilitator checklist update; no real cloud changes occur | Pending | Pending | Pending | Pending | Pending | Pending |
| 13 Azure Access Handoff Simulator — `AzureAccessHandoffSimulator.jsx` | Load example; edit generic access rows; Copy checklist | Findings, ordered actions and manager/security checklist correspond to rows; copy/manual fallback works; no live permission changes | Pending | Pending | Pending | Pending | Pending | Pending |
| 14 GCP Transformation Promise Ledger — `GcpTransformationPromiseLedger.jsx` | Load example; Challenge the promise; Copy sponsor memo | Falsifiable hypothesis, reversible pilot, 30/60/90 gates, risk register and memo retain complete content | Pending | Pending | Pending | Pending | Pending | Pending |
| 15 Responsive Constraint Handoff — `ResponsiveConstraintHandoff.jsx` | Load example; Generate handoff; Copy CSS starter | Per-viewport decisions, collision guidance, keyboard/focus order, CSS and QA checklist agree with the inventory | Pending | Pending | Pending | Pending | Pending | Pending |
| 16 Exception-First Python Automator — `ExceptionFirstPythonAutomator.jsx` | Load example; Generate safe scaffold; Copy Python scaffold | Reviewable scaffold and test-run checklist reflect the brief; generated code is displayed, not executed | Pending | Pending | Pending | Pending | Pending | Pending |
| 17 Queue Fairness Replay — `QueueFairnessReplay.jsx` | Load example; change workload/aging; Copy C contract | FIFO versus priority-with-aging comparisons and waiting metrics update; copied deterministic contract is complete | Pending | Pending | Pending | Pending | Pending | Pending |
| 18 Safe C Input Harness — `SafeCInputHarness.jsx` | Load example; edit bounded field specification; Copy C skeleton | Generated contract, boundary/invalid vectors and reviewer checklist update; no compile/execute action is implied | Pending | Pending | Pending | Pending | Pending | Pending |
| 19 CSV Claim Stress Tester — `CsvClaimStressTester.jsx` | Load example; Stress-test the claim; Copy pandas recipe | Verdict, data-quality gate, outlier sensitivity, time-slice results and reproducible recipe; malformed CSV has actionable errors | Pending | Pending | Pending | Pending | Pending | Pending |
| 20 LLM Data Contract Firewall — `LlmDataContractFirewall.jsx` | Load example; Apply firewall; Copy schema and dataset card | Field decisions, least-data pipeline, leakage tests and both contracts reflect metadata; do not paste actual sensitive records | Pending | Pending | Pending | Pending | Pending | Pending |
| 21 Shortage Response Trade-off Lab — `ShortageResponseTradeoffLab.jsx` | Load example; Compare responses; Copy owner memo | Candidate-price versus purchase-cap measures, explicit assumptions and memo align; financial values remain legible | Pending | Pending | Pending | Pending | Pending | Pending |
| 22 LP Exit Rehearsal — `LpExitRehearsal.jsx` | Load example; change scenario values; Copy memo | Exit scenario metrics, stop triggers and pre-commitment memo update; educational limits remain visible; no wallet transaction | Pending | Pending | Pending | Pending | Pending | Pending |
| 23 Account Recovery Drill Composer — `AccountRecoveryDrillComposer.jsx` | Load example; change declared method/scenario categories; use checklist | Correlated risks, safe steps, emergency cards and owned actions update; input remains no-secrets metadata | Pending | Pending | Pending | Pending | Pending | Pending |
| 24 Feature Misuse Contract — `FeatureMisuseContract.jsx` | Load example; add/remove a boundary; Build misuse contract; Copy PR contract | Bounded row controls, prioritized defensive stories and complete PR acceptance contract; invalid boundaries are identified | Pending | Pending | Pending | Pending | Pending | Pending |
| 25 Share-Link Afterlife Rehearsal — `ShareLinkAfterlifeRehearsal.jsx` | Load example; Rehearse afterlife; change residue options; Copy contract | Decision gate, revocable/non-revocable ledger, expiry verification and contract update; screenshot residue is not falsely promised revocable | Pending | Pending | Pending | Pending | Pending | Pending |
| 26 Network Change Rollback Composer — `NetworkChangeRollbackComposer.jsx` | Load example; Compose safe change; test invalid/conflicting inventory; Copy summary | Blocked/ready status, phase guidance and stakeholder summary reflect analysis; no real network mutation | Pending | Pending | Pending | Pending | Pending | Pending |
| 27 Proof-to-Interview Compiler — `ProofToInterviewCompiler.jsx` | Load example; Compile evidence; remove supporting evidence; Copy packet | Claim ledger, task map, citation-bearing bullets, STAR answer and gap drill; unsupported claims are withheld | Pending | Pending | Pending | Pending | Pending | Pending |
| 28 Containment Side-Effect Ledger — `ContainmentSideEffectLedger.jsx` | Load example; change defensive metadata; Copy handoff | Dispositions, customer side effects, evidence/rollback gates and analyst handoff update without operational attack instructions | Pending | Pending | Pending | Pending | Pending | Pending |
| 29 Detection Contract Drift Guard — `DetectionContractDriftGuard.jsx` | Load example; change schema metadata; Copy Python harness | Drift impacts, repair contract, regression vectors and harness reflect old/new schema; no raw logs or generated-code execution | Pending | Pending | Pending | Pending | Pending | Pending |
| 30 Assurance Change Shockwave Mapper — `AssuranceChangeShockwaveMapper.jsx` | Load example; Map the change shockwave; Copy executive memo | Claim dispositions, evidence dependencies, renewal order, decision windows and executive memo remain complete | Pending | Pending | Pending | Pending | Pending | Pending |
| 31 Timber CFT Pro + Billing — `timber-src/App.jsx` | Load synthetic sample; edit measurement/rate; save locally; search/reopen after reload; Print / Save PDF | Correct CFT/M3, pieces, INR totals, discount/GST/paid/balance or change; preserved synthetic invoice; clean printable statement; correct new screenshot | Pending | Pending | Pending | Pending | Pending | Pending |
| 32 Printing Press ERP — separate private source | In public demo: inspect owner/orders, change a synthetic order priority/status and reload; visit inventory/invoices/reports/staff | Demo-only persistence, readable operational views, direct-route reload, maintained role/navigation behavior, no private backend or client-data exposure; actual owner screenshot | Pending | Pending | Pending | Pending | Pending | Pending |

## Cross-surface acceptance checklist

All items remain pending until an evidence entry is attached.

### Function and content

- Exercise each row's core workflow, its example/reset actions and at least one missing, malformed or out-of-range input where the tool accepts input. Check that stale outputs are cleared or clearly distinguished after edits.
- Retain meaningful limitations, provenance, certificate labels, error messages and local-first/privacy statements. Do not replace substantive content with decorative metrics or false production claims.
- Compare applicable output to domain test fixtures. Styling must not change numbers, calculation precision, decision gates, ordering or generated content.
- Verify every direct route, catalog return link, browser back/forward, portfolio compatibility alias and missing-lab state. Refresh a deep link without losing the route.
- Expose the existing complete project manual clearly in home resources and the link directory, and verify the deployed PDF opens. Cross-check guide coverage separately from visual sign-off.

### Desktop and mobile

- Capture full page and key workflow state at 1440 by 1024 and 390 by 844; inspect narrow 360px and 768px layouts for reflow risks. Record the actual tested sizes.
- No page-level horizontal overflow, clipped actions, concealed labels or off-screen validation. Dense tables may scroll inside an obvious labeled container; never hide columns silently.
- Input fields, date/number controls, select menus, generated code and long project names remain readable. Touch users can access everything without hover.
- Core touch targets should be approximately 44px high where practical, with separation between destructive and primary actions. At 200% zoom, navigation and task completion remain possible.

### Keyboard and accessible states

- Complete one core workflow per project using keyboard only. Visible focus follows logical reading order; focus is not lost after dynamic rows/results, filter changes or modal close.
- Labels, button names, errors, landmarks, heading hierarchy and result announcements are meaningful. State/severity cannot rely solely on color.
- Hover effects have keyboard equivalents, and decorative spotlight/parallax layers never intercept input or obscure content.
- If predictive search/command navigation is introduced, verify the accessible combobox/listbox behavior: suggestions, arrows, Enter, Escape, empty results, result count and focus restoration. Existing search must still work without using suggestions.
- Check text/control contrast against the *rendered* translucent background, not only a solid token color. Include bright aurora positions, errors and disabled controls.

### Motion and performance

- With `prefers-reduced-motion: reduce`, remove decorative continuous motion, parallax, large translations and 3D tilt while preserving visible content and functional feedback.
- Provide a discoverable way to pause/disable nonessential continuing animation where needed. No strobing or rapid flash effects.
- Animation should use transform/opacity where suitable, clean up event listeners/timelines, pause offscreen work and avoid unnecessary independent animation loops. Do not add several engines for the same effect.
- Search/typing remains responsive during effects; results do not shift unexpectedly. Check a narrow-screen/throttled session and record the environment; do not claim an unmeasured frame rate.
- Verify no route crashes, unresolved assets, blocking overlays or unexpected console errors in tested flows. Track baseline third-party warnings separately from regressions.

### Copy, download, print and local persistence

- For existing copy buttons, compare clipboard text to visible output; test unsupported/denied clipboard behavior and retain a selectable manual-copy fallback.
- For GAN SVG export, confirm the file corresponds to the selected variation and can be opened. A download toast alone is not sufficient evidence.
- For Timber, validate before print; inspect multi-row PDF/print pagination, headings, units, totals, INR symbols and white-paper contrast. Hide decorative/interactive UI without losing invoice content.
- For tools without a dedicated export button, verify readable/selectable output and document that no dedicated export exists; do not claim PDF/export coverage that is absent.
- Use only synthetic browser-local records for save/reload/search/reopen/delete tests. Confirm destructive actions are explicit, scoped and reversible where designed; never clear the user's actual storage as a test.

## Private-source and release boundaries

- The public portfolio repository and the private ERP repository remain separate. Do not publish the private ERP source, ignored imports, local databases, tokens, environment secrets, customer records or screenshots containing them.
- ERP work is limited to its public fictional demo/UI unless separately authorized. Preserve explicit live-mode/authentication boundaries and do not switch the demo to private services for screenshot capture or QA.
- `vite.config.js`, `vite.labs.config.js` and `vite.timber.config.js` build the three main applications. `scripts/assemble_cloudflare_site.mjs` assembles the main Cloudflare site; it does **not** release the separate ERP.
- Main release gates, all pending: manifest validation; lab/Timber domain tests; three production builds; browser checks above; updated source screenshots/manual links; sanitized diff; deployment; post-deploy route smoke checks; rollback identification.
- ERP release gates, all pending: separate runtime/store tests, lint/build, demo-only browser checks and separate deploy/rollback evidence.
- Do not mark the 32-project upgrade complete when only the homepage or one representative lab was checked. Shared visual work can be batched, but each project needs its own recorded core workflow evidence.

## Evidence log template

Create one record per verified project/surface or tightly scoped check. A pending row becomes pass only after its relevant evidence exists; failures retain a reproducible issue and owner.

```text
Project/surface:
Check IDs (F/D/M/K/R/X or surrounding surface gate):
Status: Pending | Pass | Fail | N/A with reason
Commit and environment:
Route and viewport:
Synthetic input or fixture:
Actions:
Expected result:
Observed result:
Screenshot/export/test-log path:
Console/accessibility/motion findings:
Remaining issue and owner:
Verified by / timestamp:
```

Initial evidence state: source inventory completed; all browser, visual, functional-regression, accessibility, motion, export, build and deployment checks in this plan are **pending**.
