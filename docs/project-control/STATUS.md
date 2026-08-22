# Portfolio Labs Upgrade Status

Last updated: 2026-08-22

## Current phase

Batch 0 complete. Batch 1 is in progress. Timber CFT Pro + Billing has reached its functional checkpoint; Printing Press ERP repair is active.

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
- Added the sanitized Timber CFT Pro + Billing React application.
- Preserved the locked business-inch, CFT, ICBM, and raw-millimetre M3 rules in independent domain modules.
- Added CFT/M3 pricing, discount, GST, payment, balance, and overpayment calculations.
- Added strict measurement and invoice validation with safe demo limits.
- Added browser-local save, history search, reopen, reset, synthetic sample, and print/Save PDF workflows.
- Passed 9 Timber domain tests and the combined portfolio + labs + Timber production build.
- Browser-tested the Timber sample, invoice totals, local save, reset, and reopen workflow.
- Located the Printing Press ERP source in the private `lakshmipriya-erp` repository and cloned an isolated ignored copy for repair.
- Reproduced the Printing ERP production failure: public pages load, but the owner dashboard remains on empty loading skeletons.

## In progress

- Add an explicit public demo runtime to Printing Press ERP so it never waits on or exposes the private Supabase backend.
- Make the flagship dashboard and core quote/order-to-production workflows work with clearly synthetic browser-local data.
- Keep the real authenticated Supabase edition separate from the public portfolio demo.

## Next checkpoint

Repair the Printing Press ERP dashboard loading failure, then verify the synthetic order workflow in the browser.

## Known risks

- The timber archive includes a local SQLite database that may contain real client data.
- Timber CFT Pro currently depends on a local Express/SQLite runtime and cannot be published as-is.
- The current timber "bill" is a measurement statement, not a financial invoice; rates, tax, payments, and balances must be implemented explicitly.
- The existing portfolio source is large and must be simplified later without mixing visual redesign into functional batches.
- External API dependencies would reduce demo reliability; core lab workflows must work without API keys.
- Printing Press ERP currently hardcodes a temporary owner bypass while still querying Supabase, which can leave public pages loading forever and risks mixing demo access with private infrastructure.
