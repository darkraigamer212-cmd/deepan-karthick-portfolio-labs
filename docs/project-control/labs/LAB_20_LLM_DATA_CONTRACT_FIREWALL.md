# Lab 20 - LLM Data Contract Firewall

## User and problem

A data engineer preparing customer-support data needs to decide which fields may cross an LLM dataset boundary before a pipeline reads real record values. The practical risk is that a broadly useful source table may also contain personal identifiers, internal notes, credentials, or fields that were approved for one purpose but not another.

## Certificate connection

Generative AI and LLMs: Architecture and Data Preparation: applies purpose limitation, classification, retention, schema enforcement, least-data preparation, dataset documentation, leakage testing, and fail-closed pipeline design to training, retrieval, and evaluation datasets.

## Inputs

The user enters:

- one bounded target LLM task;
- one exact dataset purpose: training, retrieval, or evaluation; and
- up to 20 field contracts using `field|classification|allowed use|retention days`.

Field names must be schema-safe identifiers. Classification is limited to public, internal, personal, or secret. Allowed use is a comma-separated subset of the three supported purposes, and retention is bounded to 0–3650 whole days. The browser form accepts field metadata only; it does not accept customer-support record values.

## Deterministic model and useful output

`llmDataContractFirewall.js` parses and validates the contract, then applies transparent rules to each field:

- **Allow** when purpose and retention comply with the contract.
- **Redact** permitted personal fields retained for no more than 90 days.
- **Quarantine** every secret field for manual security review.
- **Exclude** fields with a purpose mismatch or retention beyond the firewall limit.

The result includes per-field reasons and transformations, a six-stage least-data pipeline, six concrete leakage tests, a copyable strict JSON record-schema contract with `additionalProperties: false`, and a copyable dataset-card contract. `LlmDataContractFirewall.jsx` renders the accessible local workflow and example/reset/copy controls.

## Locked differentiator

This is not a pipeline visualizer, record profiler, prompt builder, DLP product, or model demo. Its unit of work is a field-level admission contract enforced before data values are ingested. Undeclared fields fail closed, secret values never receive an automatic pass, and the example deliberately demonstrates all four outcomes: allow, redact, quarantine, and exclude.

## Safety and privacy

The lab never ingests actual records, uploads content, calls a model, trains a model, builds embeddings, or contacts an external API. It generates a planning contract, not proof of regulatory compliance. The generated leakage checks must still be implemented against the real staging system, logs, caches, indexes, backups, and deletion process. Redaction must be selected and reviewed by privacy and security owners; stable tokens may remain linkable and are not automatically anonymous.

## Automated verification

Focused tests in `tests/lab20-llm-data-contract-firewall.test.mjs` cover all four decisions, purpose mismatch, personal/internal retention limits, row bounds, unsafe schema metadata, fail-closed invalid input, strict JSON parsing, and the no-records dataset-card statement.

Central integration verification completed with **126/126 tests passing**. The production portfolio, labs, and Timber builds also passed.

## Browser verification

The realistic customer-support example was run through the rendered lab. It produced allow, redact, quarantine, and exclude decisions; the least-data stages, leakage tests, strict schema, and dataset card rendered successfully; and the example/reset/copy workflow passed browser verification.

## Limitations

The deterministic rules are a conservative educational baseline, not a universal classification or retention policy. The tool does not inspect values, discover indirect identifiers, prove irreversible anonymization, test permissions, evaluate source provenance, enforce deletion, or verify downstream model behavior. A real deployment needs organization-specific legal, privacy, security, records-management, and data-owner approval.

## Official sources

- [NIST AI RMF: Generative Artificial Intelligence Profile (NIST AI 600-1)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) — lifecycle risk management, governance, and pre-deployment testing context.
- [OWASP LLM02:2025 Sensitive Information Disclosure](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/) — sanitization, input validation, least privilege, restricted sources, tokenization/redaction, and transparent data-use guidance.
- [JSON Schema object reference: additional properties](https://json-schema.org/understanding-json-schema/reference/object#additional-properties) — the strict object-schema behavior represented by `additionalProperties: false`.
