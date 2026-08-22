# Lab 16 - Exception-First Python Automator

## User and problem

An office worker or junior developer wants to automate a repeated file task but needs a safe starting point that exposes failure, duplicate, audit, and undo behavior before files are changed.

## Certificate connection

Hello, Python!: applies variables, choices, functions, loops, exceptions, file paths, standard-library modules, validation, and deterministic program generation.

## Workflow and useful output

The user describes the task, source glob, destination template, copy/move operation, failure policy, and duplicate policy. The tool validates bounded patterns and generates a copyable standard-library-only Python scaffold. The scaffold defaults to dry-run, caps matches, validates resolved paths, catches expected file errors, calculates checksums, records an audit manifest, backs up overwritten destinations, and records undo metadata. A test-run checklist accompanies the code.

## Differentiator

This is not a Python playground, tutorial, arbitrary executor, or one-click file mover. It starts from failure and reversibility requirements and generates code for human review without reading or touching the user's files.

## Implementation and tests

`exceptionFirstPythonAutomator.js` contains bounded validation and deterministic source generation. `ExceptionFirstPythonAutomator.jsx` provides the local form and copy workflow. Tests cover dry-run, standard-library, audit/undo, embedded policies, traversal, unsafe patterns, and unknown placeholders.

## Limitations

The browser only generates text; it never executes Python. A user must review paths and permissions, test on disposable data, validate the audit and manual undo process, and obtain business approval before scheduling real file operations.
