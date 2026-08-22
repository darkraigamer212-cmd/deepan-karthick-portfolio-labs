# Lab 12 - AWS Customer-Journey Outage Storyboard

## User and problem

A small product team preparing a launch needs a safe GameDay discussion that begins with customer harm rather than a list of cloud services.

## Certificate connection

AWS Cloud Practitioner Essentials: applies resilience, observability, fault isolation, recovery, and shared-responsibility thinking to a customer journey.

## Workflow and useful output

The user supplies ordered customer journey steps, architecture dependency categories, recovery priority, traffic shape, and data criticality. The tool generates three to five facilitator cards. Every card links a customer-visible symptom to detection evidence, containment, fallback, recovery proof, and an AWS concept. It also produces a GameDay safety checklist.

## Differentiator

This is not an AWS service-selection quiz or a fault-injection tool. It composes a customer-journey-first rehearsal artifact that a small team can discuss before it has mature chaos-engineering infrastructure.

## Implementation and tests

`awsOutageStoryboard.js` validates the journey and deterministically composes cards and facilitator rules. `AwsCustomerJourneyOutageStoryboard.jsx` renders the rehearsal. Tests cover card count, journey mapping, priority/traffic variation, and invalid inputs.

## References and limitations

The content is grounded in AWS Well-Architected guidance on GameDays, failure management, and fault isolation. The lab never connects to AWS or injects a fault. A qualified owner must approve any production exercise and its rollback boundary.
