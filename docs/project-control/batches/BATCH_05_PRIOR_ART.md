# Batch 5 Prior-Art and Differentiation Note

Date checked: 2026-08-22

## Method and claim boundary

Searches covered the exact proposed names and adjacent categories: responsive design handoff and breakpoint QA, Python automation/code scaffolds with dry-run behavior, queue scheduling with priority aging, C console-input validation and test generation, and CSV robustness/profiling tools. Exact-name searches produced no direct match, but public search is neither exhaustive nor proof of worldwide novelty. The projects are original workflow combinations and will not be marketed as verified world-first inventions.

## Findings and locked differentiators

- Responsive component specifications and multi-breakpoint QA already exist. Lab 15 differs by accepting a bounded component inventory, calculating feasibility per supplied viewport, and producing explicit reflow, never-hide, keyboard-order, CSS Grid starter, and QA handoff artifacts together.
- Python task/code generators and dry-run automation patterns already exist. Lab 16 differs by generating an exception-first, standard-library-only scaffold whose default is dry-run and whose core contract includes path validation, duplicate policy, audit evidence, and an undo manifest.
- Priority queues, aging, and starvation prevention are established scheduling techniques. Lab 17 differs by replaying one real service queue under FIFO and priority-with-aging, quantifying the human waiting/fairness trade-off, and emitting a C struct plus deterministic test-vector contract.
- Safe `fgets` plus `strtol`/`strtod` input patterns and C test generators already exist. Lab 18 differs by turning a human field contract into a bounded parser scaffold, stack-buffer budget, invalid/boundary vectors, and reviewer checklist in one local workflow.
- CSV profilers, robustness checks, and subgroup analysis already exist. Lab 19 differs by beginning with an explicit business claim and returning Support, Fragile, or Reject only after data-quality, small-sample, missingness, outlier-trim, and time/subgroup consistency checks, plus a reproducible pandas recipe.

## Representative foundations reviewed

- W3C WCAG reflow and focus order guidance: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html and https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html
- Python standard-library path and file-operation documentation: https://docs.python.org/3/library/pathlib.html and https://docs.python.org/3/library/shutil.html
- Research literature on dynamic priority and starvation prevention: https://pmc.ncbi.nlm.nih.gov/articles/PMC12644854/
- SEI CERT C guidance for robust character-to-integer input: https://cmu-sei.github.io/secure-coding-standards/sei-cert-c-coding-standard/recommendations/integers/int05-c/
- NIST Software Assurance Reference Dataset C input test cases: https://samate.nist.gov/SARD/test-cases/87708/versions/1.0.0
- Research on when subgroup reliability alarms have adequate evidence: https://zenodo.org/records/19708008

## Acceptance consequence

Each implementation must prove its locked differentiator in automated tests and a realistic browser workflow. A renamed playground, visualizer, generic profiler, or code tutorial does not pass Batch 5.
