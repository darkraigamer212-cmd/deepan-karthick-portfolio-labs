# Lab 27 - Proof-to-Interview Compiler

## User and problem

A cybersecurity student preparing for an internship interview has projects, tests, reports, and demos but needs to turn them into defensible claims. Conventional resume and STAR generators can polish unsupported achievements, detach claims from evidence, or invent impressive metrics. The student needs every released statement traceable to a generic artifact ID and every evidence gap made visible before an interviewer asks for proof.

## Certificate connection

Put It to Work: Prepare for Cybersecurity Jobs: applies target-role analysis, task statements, project evidence, skill articulation, resume bullets, STAR interviewing, evidence packets, gap planning, and honest claim boundaries. NIST NICE vocabulary supplies the task, knowledge, and skill orientation; the tool maps supplied target tasks to evidence without pretending to assign an official work role.

## Inputs and useful output

The user enters generic, bounded project metadata:

- a target cybersecurity role and up to eight target task statements;
- one project situation, action, and outcome;
- up to 16 artifacts using `artifact-id|type|what it proves`, where type is code, test, report, or demo; and
- up to 12 candidate skill claims.

Deterministic term matching connects each claim and target task to artifact descriptions. Every candidate claim receives one of three explicit states:

- **Backed** when at least one artifact description has sufficient meaningful overlap; only these claims may become resume bullets.
- **Needs evidence** when no artifact description meets the evidence threshold.
- **Do not claim** when unsupported numeric results or absolute language such as “expert,” “perfect,” or “guaranteed” appears.

The compiler returns artifact citations, a NICE-aligned target-task evidence map, citation-bearing resume bullets, one STAR answer whose action and result citations are calculated independently, an interviewer evidence packet, and one concrete gap drill. A supplied outcome cannot substitute for artifact proof of a numeric claim.

## Differentiator and prior-art boundary

Career trackers, resume builders, STAR generators, portfolio tools, and NICE role mappings already exist. Public prior-art searching was not exhaustive and does not establish worldwide novelty.

This lab is not a job tracker, generic resume writer, ATS optimizer, interview answer generator, or hiring predictor. Its locked differentiator is compiling the student's own artifact IDs into a claim ledger and withholding unsupported material instead of polishing it. Artifact citations remain local identifiers rather than invented links, and the evidence packet records the exact boundary.

## Safety and privacy boundaries

Inputs must remain generic. Validation rejects email-like identities and URLs in roles, tasks, project statements, claims, and artifact metadata. The lab does not request a real employer, reviewer identity, repository URL, portfolio link, school record, credential number, or personal contact detail. It performs no provider, GitHub, job-board, or model call.

The compiler never adds metrics, employers, responsibilities, outcomes, links, certifications, or hiring promises. Unsupported numeric claims are withheld unless the same number appears in a matched artifact description. Absolute proficiency claims are withheld rather than softened. Resume bullets are released only for backed claims; a needs-evidence or do-not-claim result produces no bullet.

## Official foundations

- [NIST SP 800-181 Rev. 1: Workforce Framework for Cybersecurity (NICE Framework)](https://csrc.nist.gov/pubs/sp/800/181/r1/final) provides the official task, knowledge, and skill vocabulary foundation.
- [NIST NICE Framework Resource Center: Getting Started](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/getting-started) provides current official guidance for using NICE components and resources.

The lab uses NICE-aligned task phrasing as a handoff structure. It does not reproduce the full NICE dataset, declare that a user belongs to a work role, or promise alignment with a specific employer's hiring rubric.

## Implementation and testing

`proofToInterviewCompiler.js` contains bounded generic-input validation, artifact parsing, deterministic evidence matching, numeric and absolute-claim guards, independent STAR citations, resume-bullet release rules, task mapping, evidence-packet generation, and one-gap-drill selection. `ProofToInterviewCompiler.jsx` renders the accessible browser-local form, example/reset workflow, claim ledger, task map, resume bullets, STAR answer, gap drill, and copyable packet.

Focused tests in `tests/lab27-proof-to-interview-compiler.test.mjs` passed **5/5** and prove:

- supported project claims receive artifact IDs and citation-bearing bullets;
- an unsupported 80% outcome is classified do-not-claim and never reaches a bullet;
- task evidence, STAR text, evidence packet, and gap drill preserve supplied material;
- unmatched enterprise-firewall experience remains needs-evidence and releases no bullet;
- an outcome statement alone cannot substitute for artifact proof of a metric; and
- unsupported artifact types, links, missing inputs, and unsafe metadata fail validation.

The React component also passed Vite JSX transformation. Shared-route integration, full-build, and rendered browser evidence are recorded at the batch level rather than assumed in this isolated implementation note.

## Limitations

Term overlap is a transparent screening heuristic, not semantic verification. It can miss valid evidence that uses different language and can over-match generic wording. Artifact descriptions are user assertions; the tool cannot open, execute, reproduce, grade, or authenticate an artifact. It does not test technical depth, communication, teamwork, interview performance, NICE work-role completeness, employer fit, or hiring probability. A reviewer should inspect every cited artifact, reproduce important results, remove ambiguous claims, and adapt final application language to the actual role.
