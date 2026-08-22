# Portfolio Labs Upgrade Status

Last updated: 2026-08-22

## Current phase

Batch 0 complete. Batch 1A - Timber CFT Pro public demo and financial billing model - is next.

## Confirmed product decisions

- Build working prototypes before visual polish.
- The portfolio homepage will feature only two flagship projects.
- Flagship 1: Printing Press ERP.
- Flagship 2: Timber CFT Pro with billing.
- The rental research project is removed from flagship positioning.
- All 30 certificate projects will live in one Applied Labs application with separate routes.
- Security labs must remain defensive, local-first, and educational.
- Client databases and imported ZIP artifacts must never be committed or deployed.

## Work completed

- Verified the original certificate archive contains 23 credentials.
- Identified the missing portfolio credential: Prompt Engineering for ChatGPT.
- Verified the seven additional credentials, producing a total of 30.
- Fetched the current public career-kit branch.
- Created working branch `codex/portfolio-labs-upgrade`.
- Safely inspected the Timber CFT Pro ZIP.
- Extracted source and tests only; bundled dependencies and Windows runtime were excluded.
- Started independent architecture and test audits of Timber CFT Pro.
- Added the canonical 30-project manifest and automated validation.
- Added the separate Applied Labs React/Vite application.
- Added working search, category filtering, stable hash routes, and responsive layout.
- Added a combined production build for the portfolio and labs.
- Added a frontend CI workflow.
- Verified the labs catalog at desktop and 390 x 844 mobile viewports.
- Verified the cybersecurity filter returns 7 labs and Lab 24 routing works.
- Confirmed there are no browser console warnings or errors in the tested flows.

## In progress

- Prepare a sanitized static Timber CFT Pro demo using browser-local persistence.
- Add a real financial billing module without changing the verified timber formula.
- Preserve the Windows offline edition as a separate, private-data local application.

## Next checkpoint

Create the Timber calculation and invoice domain modules with independent golden tests before building its functional interface.

## Known risks

- The timber archive includes a local SQLite database that may contain real client data.
- Timber CFT Pro currently depends on a local Express/SQLite runtime and cannot be published as-is.
- The current timber "bill" is a measurement statement, not a financial invoice; rates, tax, payments, and balances must be implemented explicitly.
- The existing portfolio source is large and must be simplified later without mixing visual redesign into functional batches.
- External API dependencies would reduce demo reliability; core lab workflows must work without API keys.
