# Lab 19 - CSV Claim Stress Tester

## User and problem

A small-business analyst or data student has a claimed insight from a CSV and needs to learn whether the direction survives obvious quality and sensitivity checks before sharing it.

## Certificate connection

Data Analysis with Python: applies CSV parsing, cleaning, numeric conversion, grouping, descriptive statistics, missingness, outlier sensitivity, time slices, reproducibility, and pandas workflows.

## Workflow and useful output

The user pastes a bounded CSV, selects numeric outcome, group, and optional time columns, and writes a claim naming two exact group values plus a direction. The local tool checks missing and invalid rows, sample sizes, raw means and medians, standardized gap, per-group IQR trimming, and available time-slice consistency. It returns Support, Fragile, or Reject with reasons and produces a copyable pandas verification recipe without embedding the pasted rows.

## Differentiator

This is not a CSV dashboard, generic profiler, or chart studio. The unit of work is one explicit business claim, and the output is a bounded evidence verdict plus a reproducible independent-check recipe.

## Implementation and tests

`csv-claim-stress-tester.js` contains a bounded RFC-4180-style parser, claim interpretation, quality accounting, descriptive comparisons, IQR sensitivity, slice evaluation, verdict rules, and pandas generation. `CsvClaimStressTester.jsx` renders the analysis. Tests cover quoted data, malformed shapes, claims, outliers, support/reject/fragile paths, missingness, inconsistent slices, and recipe privacy.

## Limitations

The tool provides deterministic descriptive checks only. It does not establish causality, statistical significance, sampling validity, representativeness, or business correctness; a qualified analyst and domain owner must review the data and claim.
