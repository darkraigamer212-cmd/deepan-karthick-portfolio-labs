# Lab 26 - Network Change Rollback Composer

## User and problem

A small-business network administrator planning an IPv4 change needs to detect obvious unsafe address plans and communicate a rollback-ready change before touching devices.

## Certificate connection

The Bits and Bytes of Computer Networking: applies IPv4 CIDR boundaries, usable capacity, overlap detection, DHCP/routing change control, verification, and rollback concepts.

## Workflow and useful output

The user enters a change goal, downtime window, before inventory, and proposed inventory. The tool normalizes CIDRs, compares named networks, detects overlaps and capacity failures, identifies changes, and composes precheck, execution, verification, rollback, and stakeholder-summary artifacts. When a blocker exists, execution instructions are intentionally withheld.

## Differentiator

This is not a subnet calculator. It combines deterministic plan comparison with a safety interlock and a platform-neutral, copyable rollback communication artifact.

## Implementation and tests

`networkChangeRollback.js` contains IPv4 conversion, CIDR normalization, inventory parsing, overlap/capacity analysis, diffing, runbook generation, and summary formatting. `NetworkChangeRollbackComposer.jsx` provides the local interface. Tests cover normalization, useful example output, blocking overlaps/capacity failures, reserved ranges, and row limits.

## Limitations

The lab supports IPv4 prefixes /1 through /30 and at most 20 inventory rows. It does not support IPv6, inspect devices, validate live routes or ACLs, or generate vendor commands. A network owner must review and rehearse every production change.
