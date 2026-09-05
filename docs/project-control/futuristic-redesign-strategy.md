# Portfolio + Applied Labs: futuristic redesign strategy

Date: 2026-08-31

Status: **Planning and visual exploration. Not implemented or deployed.**

## Outcome

One coherent, professional, futuristic experience across the portfolio, both flagship products, the lab directory, all 30 lab interfaces, and their documentation. Preserve working calculations and workflows. Make the apps easier to understand and use, not merely more decorative.

The homepage continues to feature **two flagships only**: Timber CFT Pro with Billing and Printing Press ERP. All 30 certificate projects remain accessible through the Applied Labs directory and search. The rental report is not a flagship.

This is a visual/interaction upgrade of existing products. It is not a claim that every project is a new invention, a production security product, or a full AI service. Each tool must explain its actual algorithm, simulation boundaries, privacy behavior, and useful application.

## Audit findings

- The source Timber preview currently depicts a curtain/wallpaper calculator. A real screenshot of the deployed Timber app has been captured with its built-in synthetic sample.
- The ERP preview currently depicts a marketing homepage. A real screenshot of the public synthetic owner dashboard has also been captured.
- The portfolio uses dark neon styling, but the lab directory and Timber use a different cream/green system. Shared visual foundations are needed across those surfaces.
- The lab interfaces use several distinct structural patterns. Changing one CSS background will not constitute completion for 30 projects.
- The current complete manual exists, but has outdated status/deployment references, thin lab summaries, and poor discoverability. It needs expansion and regeneration, not a claim that no guide exists.
- The existing test command has 151 domain/unit tests. That is not proof of full browser, accessibility, mobile, export, or print coverage.
- The actual ERP is a separate app and deployment. Its source is in an ignored private import. Do not publish that import, databases, customer data, secrets, or private configuration into the public portfolio repository.

Source surfaces: `portfolio-src/`, `labs-src/`, `timber-src/`, `docs/`, the separate ERP app, and generated output managed by the existing build scripts.

## Visual direction and selection gate

Generate three independent, grounded design concepts using captures of the real portfolio, lab directory, Timber app, and ERP dashboard. Choose one visual system before broad implementation. These are **concept images**, not working releases or replacement project evidence.

The shared direction across all options is colorful futuristic technology: deep ink surfaces, aurora color, crisp typography, restrained glass, clear hierarchy, and substantial breathing room. Options may differ in composition and product framing. They must not invent testimonials, employment experience, uptime claims, customer counts, or live product features.

After selection, resolve coordinated states for the directory, a representative form/results lab, a specialized workbench, Timber, and ERP before scaling the system. Reuse the selected design rather than asking for approval on every page.

## How the requested effects fit together

| Requested effect | Planned use | Usability/performance rule |
| --- | --- | --- |
| Aurora and dynamic mesh gradients | Portfolio backdrop, directory header, subtle category atmosphere | Animate a small number of layers. Keep text on stable, sufficiently opaque surfaces. |
| Glassmorphism | Navigation, flagship frames, search overlay, selected summary panels | Do not put blur behind every field or nest layers of glass. Provide solid-color fallback. |
| Bento grids | Two flagship showcase, selected directory sections, meaningful result summaries | Reading order remains logical at mobile widths. No arbitrary filler tiles. |
| Claymorphism | Small tactile category visuals and selected controls | Secondary accent, not low-contrast embossed form fields. |
| Neobrutalist details | Occasional strong label, crisp offset accent, high-emphasis action | Accent vocabulary within the same system; not a separate competing theme on each page. |
| Predictive search | Find projects by title, category, certificate and useful task keywords | Local index; keyboard selection, Escape dismissal, empty state and screen-reader labels. No external search service needed. |
| Intuitive navigation | Portfolio / Labs / Guide; breadcrumbs and back-to-directory actions | Preserve direct routes, hash navigation, browser back, and deep links. |
| Parallax | Decorative homepage art and section transitions | Small displacement only. No scroll hijacking. Disable for reduced motion and coarse pointers where appropriate. |
| Hover and spotlight | Flagship/project links and selected actions | Visible keyboard focus gives equivalent affordance. Never hide essential information behind hover. |
| CSS transitions | Focus, hover, disclosure, validation and selected states | Consistent timings; avoid layout animation for everyday controls. |
| Liquid motion | Hero atmosphere or a single visual accent | No rippling text or moving input targets. Disable continuous effects when reduced motion is requested. |
| Morphing | Search/disclosure/selection transitions and a decorative hero accent | Preserve hit targets and readable labels. Generated visual assets are not fake app screenshots. |
| Abstract 3D | One hero object or composition supporting the futuristic identity | Real source/generated asset first; responsive image fallback required. |
| Real-time rendering | At most one progressively loaded interactive hero scene, if validated | Dynamically import; cap pixel ratio/scene complexity, pause offscreen or when hidden, recover from context failure. Use static fallback for reduced motion or unsupported devices. |
| Sophisticated typography | One expressive display face and one highly readable body face | Responsive scale, bounded line lengths, readable labels. No all-caps display font for dense forms. |

These styles do not all receive equal visual weight. Aurora/glass/bento form the base. Clay and neobrutalist details are accents. Rich animation belongs mainly in the showcase; calculators and tables stay steady.

## Implementation and dependency policy

The project already includes React, Vite, GSAP, Framer Motion and React Spring. Do not add several frameworks that control the same element.

- CSS owns ordinary focus/hover/color transitions and static visual tokens.
- Motion owns interface entrances, disclosure, search and state transitions, with one site-wide reduced-motion policy.
- GSAP owns scoped hero/scroll choreography only, with lifecycle cleanup and media-query conditions.
- React Spring is retained only where a spring-driven interaction has a clear purpose; otherwise avoid loading it for decorative redundancy.
- Magic UI and Aceternity components are candidates, not blanket dependencies or claims of installation. Read relevant component source, licensing, dependencies, accessibility and reduced-motion behavior before adopting a specific component.
- A real-time scene is isolated from the tool routes. Failure to load decorative graphics must never block navigation or computation.
- Source screenshots are captured from actual apps with synthetic data. Image generation may create decorative artwork and design concepts, never purported proof that an app works.

## Small multi-agent execution model

Use a coordinator plus **two active implementation agents normally**, with a third specialist only for a bounded need. This respects the user's 32 GB machine and limits integration collisions; it is not a guarantee against resource exhaustion.

| Role | Ownership | Boundaries |
| --- | --- | --- |
| Coordinator | Selected design, shared tokens/components, homepage, integration, browser QA, release | Sole owner of shared style entry points and global dependencies. |
| UI agent | Assigned lab components or a flagship app per batch | No simultaneous editing of coordinator-owned global CSS/configuration. Changes must preserve domain APIs. |
| Documentation agent | Source-backed project chapters, examples, coverage and guide build support | No application behavior changes; no unverified claims or private-source publication. |
| Optional specialist | Bounded accessibility/export/ERP review | Read-only review preferred; explicitly assigned files if fixes are required. |

Execution rules:

1. Assign exact files and expected output before work begins.
2. One local dev server and one controlled browser session at a time. Build and test jobs are serialized, not duplicated by every agent.
3. Keep browser tabs bounded and close temporary tabs after evidence capture. Agents doing source/docs work do not start extra browsers.
4. Use small batches; inspect diffs and run the relevant tests before moving on. Do not stage unrelated user changes.
5. Save checkpoint/status notes per batch, including outstanding issues and evidence paths. A failed check remains visibly pending/failed.
6. Send short updates approximately every minute while active: completed work, current work and any important blocker. Do not claim background work continues after the task has stopped.
7. Only pause for consequential decisions: initial visual selection, new paid service, unavailable deployment credentials, private-source exposure, destructive data change, or a meaningful scope expansion.

## Ten controlled implementation batches

These are **redesign batches**, not the original functional-build batch numbers stored in the project manifest.

| Batch | UI deliverable | Documentation deliverable | Exit gate |
| --- | --- | --- | --- |
| 1 | Selected system, tokens, buttons/fields/focus states, navigation and motion policy; correct both source preview images | Correct README/status/deployment contradictions; establish source/evidence rules | Foundations reviewed at desktop/mobile, keyboard and reduced motion |
| 2 | Portfolio homepage, two flagship previews, links page, visible guide/resume access | Architecture, local run/build/release guide | All portfolio/resource links and hero fallbacks checked |
| 3 | Lab directory, predictive search, category filters, shared lab shell | Directory/navigation guide; reusable per-project chapter template | Search keyboard/no-results/deep-link/back behavior passes |
| 4 | Timber calculator, billing, measurement table, totals, history, print | Complete Timber chapter with worked synthetic bill | Arithmetic unchanged; save/reload/reset/print validated |
| 5 | Separate ERP visual system and owner/order/production/inventory/invoice/report surfaces; legacy dashboard consistency | ERP usage/architecture chapter from safe evidence | Synthetic role workflows pass; private files stay private |
| 6 | AI/ML labs 01–10, in subgroups of at most five | Ten source-backed chapters | Each primary operation plus invalid/empty state checked |
| 7 | Cloud/network labs 11–14 and 26 | Five source-backed chapters | Each report/simulation and export validated |
| 8 | Programming/data labs 15–20 | Six source-backed chapters | Parsing/input limits, dense output, copy/export and responsive behavior pass |
| 9 | Business/security labs 21–25 and 27–30, in small subgroups | Nine source-backed chapters | Limits/assumptions remain visible; workflows and exports checked |
| 10 | Cross-product polish, final real screenshots, guide access, regression fixes and release | Final searchable guide plus PDF/DOCX/Markdown; screenshot and link validation | Full verification ledger, successful builds, explicit release evidence and live smoke checks |

Documentation proceeds alongside stable UI batches. Final screenshots and generated documents are refreshed after the related UI is stable, not before.

## Complete guide: definition of done

Provide one discoverable master guide with architecture/setup/deployment chapters and **32 project chapters**: two flagships and 30 labs. The guide must be usable for learning, maintenance, demonstrations, and interviews.

Each project chapter includes:

1. Real problem, intended user, why this solution was chosen, and certificate mapping where applicable.
2. Working route, relevant public source paths, and verification date.
3. A synthetic quick start with exact inputs and expected outputs.
4. Numbered usage walkthrough with a screenshot of the real result.
5. Input types, units, defaults, validation, bounds and error behavior.
6. Output meaning, calculations, rounding, scoring rules or algorithm limits.
7. At least one worked example traceable to implementation; do not invent metrics.
8. Component/domain/state/storage/network architecture and dependency rationale.
9. A build walkthrough explaining how and why, including alternatives and trade-offs.
10. Tests, test commands, edge cases and interpretation of failures.
11. Troubleshooting, privacy/security constraints and known limitations.
12. A concise demo/interview explanation and realistic future improvements.

Include shared FAQ, glossary, route index, dependency/setup guide, data/reset rules, deployment/rollback instructions and a maintenance checklist. Distinguish deterministic educational simulations from live AI/cloud/security integrations.

Audit coverage in `redesign-guide-coverage.md`; do not count a short summary as a complete chapter. Upgrade the document builder for screenshots and verify page breaks, headings, code/tables, readable type and links in generated outputs. Add guide links to the homepage, directory and lab pages, with per-project anchors where supported.

## Verification and release gates

Use `redesign-ui-verification.md` as the project-by-project evidence ledger. All redesign checks start pending.

- Run manifest validation and domain tests before and after each risky batch.
- Exercise the primary real user flow for all 32 products, not merely page loading.
- Test at representative widths such as 390, 768 and 1440 CSS pixels. Check narrow desktop/tablet/table overflow explicitly.
- Verify keyboard order, names/labels, focus visibility, contrast, search interaction, error announcement and reduced motion.
- Check empty/invalid/loading/success states; inputs, add/remove/reset, persistence, copy/download/export and print where present.
- Inspect console errors and relevant failed requests. A screenshot alone is not a functional pass.
- Compare implemented screens against the selected concept at matching viewport/state. Review spacing, contrast, typography, imagery, cropping and density.
- Record baseline and after measurements for bundle/asset sizes and browser responsiveness; do not promise an unmeasured score or frame rate.
- Keep arithmetic, storage keys and public routes stable unless a separately documented fix is required. Timber paper output remains ink-friendly and includes complete bill data.
- Build with the existing pipeline. Deploy the verified portfolio/labs/Timber release to the existing Cloudflare target; deploy ERP separately after its own checks and authorization.
- Preserve the previous version/commit as rollback reference. Inspect the deployment output and live routes before saying the release is deployed.
- Push only intended public files. Ignored ERP imports and databases must remain excluded. Do not use force-push or overwrite unrelated work.

## Research used

The user-provided effect articles were reviewed as inspiration, not proof of suitability or technical correctness:

- [Groove Commerce: web design effects](https://www.groovecommerce.com/ecommerce-blog/web-design-effects/)
- [Slider Revolution: website effects](https://www.sliderrevolution.com/design/cool-website-effects/)
- [SVGator: animation examples and effects](https://www.svgator.com/blog/website-animation-examples-and-effects/)
- [GeeksforGeeks: website design effects](https://www.geeksforgeeks.org/websites-apps/top-website-design-effects/)

Implementation guidance:

- Predictive search keyboard and accessibility behavior: [W3C combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
- Respecting reduced-motion preferences, including alternate interface behavior: [Motion accessibility](https://motion.dev/docs/react-accessibility).
- Favoring transform/opacity animation and profiling rendering costs: [web.dev animation performance guide](https://web.dev/articles/animations-guide).
- Candidate component references, requiring source/license/performance review before reuse: [Aceternity aurora background](https://ui.aceternity.com/components/aurora-background) and [Magic UI animated beam](https://magicui.design/docs/components/animated-beam).

## Checkpoint

- Completed: source audits, live baseline captures of portfolio/catalog and genuine synthetic Timber/ERP screens, initial effect research, role/batch plan.
- In progress: three visual options and detailed guide/UI coverage artifacts.
- Pending: user selection of one visual option, source asset replacements, implementation, guide expansion, full verification and deployment.
- No redesigned UI or updated guide has been released at this checkpoint.
