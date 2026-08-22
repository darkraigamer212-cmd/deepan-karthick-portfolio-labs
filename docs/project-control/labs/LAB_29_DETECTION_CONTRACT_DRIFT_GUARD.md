# Lab 29 - Detection Contract Drift Guard

## User and problem

A SOC engineer maintains a Python-based detection whose meaning depends on stable telemetry fields, types, units, and time representation. A producer schema change can break the detection loudly, but it can also leave code running while thresholds, time windows, or missing-field behavior silently change. The engineer needs a reviewable contract and regression package before modifying the rule.

## Certificate connection

Automate Cybersecurity Tasks with Python: applies bounded parsing, dictionaries, type contracts, timestamp validation, deterministic comparison, regression vectors, Python standard-library testing, defensive automation, and change documentation.

## Inputs

The lab accepts schema metadata only:

- one bounded detection claim;
- up to 50 rule assumptions using `field|required yes/no|type|unit`;
- up to 50 old-schema rows using `field|type|unit`; and
- up to 50 new-schema rows using `field|type|unit`.

Field names must be bounded Python-style identifiers. A trailing `?` on a new-schema field records that the producer now considers the field optional. Supported types are string, number, boolean, and timestamp. Units are controlled metadata categories: none, count, bytes, milliseconds, seconds, percent, identifier, and UTC ISO 8601.

The tool never accepts log records, field values, queries, detection code, target URLs, or connection information.

## Deterministic workflow and useful output

`detectionContractDriftGuard.js` compares the declared detection contract with the old and new schema metadata. It reports:

- **invalid drift** when a required field disappears or a field type becomes incompatible;
- **silent drift** when an optional field disappears or a unit changes while values may remain parseable;
- **widened drift** when a required field becomes newly optional, the producer adds an undeclared field, or a producer change still matches the declared rule contract but needs regression evidence.

Every impact names the affected field, concrete change, consequence, and supplied detection claim. The repair contract gives one action and one proof requirement per drift. Generated regression vectors include a valid metadata contract, every missing-required case, and a wrong-type case for every assumed field.

The reusable output is a copyable, bounded, standard-library-only Python schema-contract test harness. It uses `unittest`, `datetime.fromisoformat`, a 64-field cap, explicit required-field checks, and deterministic type checks. It contains no file reader, log parser, network client, SIEM adapter, subprocess, third-party dependency, or detection query.

## Locked differentiator and prior-art boundary

Schema registries, data-quality dashboards, anomaly scanners, log analyzers, SIEM rule validators, and generic Python test generators already exist. This lab is not any of those. Its locked unit of work is one detection claim's declared semantic contract across a producer-schema change, including units and newly optional fields that can create silent or widened behavior even when Python still runs.

The tool does not inspect telemetry distributions, search for anomalies, execute a detector, or claim that matching metadata proves detection correctness. It converts a schema-change discussion into an explicit repair and regression contract.

## Defensive safety and privacy

All analysis is deterministic and browser-local. Input grammar permits field identifiers and controlled categories only; it cannot ingest event bodies or production records. Detection-claim validation rejects URL, query, credential, secret, and executable-step patterns. The generated harness uses fictional bounded values such as `sample`, `1`, `True`, and a fixed ISO timestamp; it never embeds user logs.

The application does not read files, run Python, connect to a SIEM, call an API, query a data source, or modify a detection. The copied harness is a review artifact that an authorized engineer may inspect and run later in an isolated development or test environment.

## Official foundations

- [NIST SP 800-92: Guide to Computer Security Log Management](https://csrc.nist.gov/pubs/sp/800/92/final) supplies the foundation for consistent, reliable log-management infrastructure and operational processes. The schema contract supports that planning goal but does not implement the full guidance.
- [Python `unittest` documentation](https://docs.python.org/3/library/unittest.html) supplies the standard-library test-case, assertion, suite, and runner model used by the generated harness.
- [Python `datetime` documentation](https://docs.python.org/3/library/datetime.html#datetime.datetime.fromisoformat) supplies the standard timestamp parser represented by `datetime.fromisoformat` in the generated type check.

## Implementation and testing

`detectionContractDriftGuard.js` contains bounded metadata parsing, trailing-`?` optionality notation, drift classification, affected-claim mapping, repair-contract construction, regression-vector generation, Python-literal generation, and standard-library harness generation. `DetectionContractDriftGuard.jsx` renders the accessible metadata workflow, example/reset controls, classified impacts, repair contract, vectors, official sources, and copyable harness.

Focused tests in `tests/lab29-detection-contract-drift-guard.test.mjs` passed **4/4** and verify:

- missing, type, unit, newly optional, and new-field classifications;
- deterministic repair contracts and bounded regression vectors;
- standard-library-only generated source with the 64-field guard; and
- rejection of query-like claims, invalid identifiers, unsupported requiredness, types, units, and malformed optional notation.

The Lab 28 and Lab 29 focused run passed **8/8 tests**. Both JSX components parsed and bundled successfully. The generated Python harness was passed directly to Python's `compile()` in memory and returned **syntax: PASS**; it was not executed. `git diff --check` also passed for the isolated lane.

## Limitations

Metadata comparison cannot prove event completeness, value quality, timestamp correctness, unit conversion, ordering, latency, retention, normalization, or rule semantics. The trailing-`?` notation is a lab input convention, not a universal schema standard. The generated vectors test the declared field/type contract only; they do not evaluate thresholds, windows, grouping, suppression, false positives, false negatives, or detection coverage. A SOC engineer must confirm the producer contract, adapt the detector, add domain-specific tests, and review results in an authorized non-production environment.

