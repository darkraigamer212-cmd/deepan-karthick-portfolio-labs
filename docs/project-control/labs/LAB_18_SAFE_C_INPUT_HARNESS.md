# Lab 18 - Safe C Input Harness

## User and problem

A C student or junior embedded developer needs a bounded console-input parser and a concrete set of negative tests instead of relying on permissive `scanf` examples.

## Certificate connection

Programming with C: applies identifiers, types, arrays, buffers, functions, pointers, `errno`, `fgets`, `strtol`, `strtod`, bounds checks, string handling, and stack budgeting.

## Workflow and useful output

The user specifies up to 20 integer, decimal, or text fields with bounds or maximum length and required/optional status. The tool generates a copyable C skeleton that reads full lines, rejects truncation and trailing junk, checks conversion errors and non-finite numbers, enforces bounds, and keeps text bounded. It also produces invalid/boundary vectors, a conservative active-stack estimate, and a reviewer checklist.

## Differentiator

This is not a memory visualizer, syntax tutorial, or code executor. It converts a human field contract into parser code, memory expectations, and failure-oriented test evidence together.

## Implementation and tests

`safeCInputHarness.js` performs field parsing, C identifier checks, integer/fractional bound validation, C string escaping, vector generation, stack estimation, and source generation. `SafeCInputHarness.jsx` renders the local workflow. Tests cover generated conversions, boundary/invalid/optional/overlength cases, stack transparency, unsafe identifiers, fractional bounds, and escaping.

## Limitations

The tool does not compile or execute C, prove portability, measure a real call stack, or replace compiler warnings, static analysis, fuzzing, and target-device testing.
