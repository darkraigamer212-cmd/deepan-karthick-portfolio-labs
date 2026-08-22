# Lab 15 - Responsive Constraint Handoff

## User and problem

A solo designer or front-end developer needs to hand off responsive behavior without leaving engineers to guess which components reflow, stay visible, or receive focus first.

## Certificate connection

Introduction to Front-End Development: applies semantic order, responsive layout, CSS Grid, keyboard focus, content priority, validation, and breakpoint testing.

## Workflow and useful output

The user describes the screen task, supplies up to eight viewport widths, and enters a bounded component inventory containing priority, minimum width, and interaction type. The tool calculates per-viewport feasibility, collision warnings, reflow and hide/never-hide decisions, an invariant keyboard order, a copyable CSS Grid starter, and a QA handoff checklist.

## Differentiator

This is not a breakpoint preview or wireframe generator. It converts component constraints into an explicit, reviewable handoff contract and refuses to hide critical navigation, input, or action elements.

## Implementation and tests

`responsiveConstraintHandoff.js` performs parsing, validation, layout packing, feasibility analysis, decision construction, and CSS generation. `ResponsiveConstraintHandoff.jsx` renders the workflow. Tests cover layout/reflow output, focus order, collision detection, formats, and bounds.

## Limitations

The packing model is a planning approximation and does not render or measure a real application. Developers must test real content, fonts, zoom, localization, assistive technology, and target browsers.
