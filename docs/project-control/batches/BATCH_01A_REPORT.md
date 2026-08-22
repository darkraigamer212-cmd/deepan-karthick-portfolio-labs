# Batch 1A Checkpoint - Timber CFT Pro + Billing

Date: 2026-08-22

## Outcome

The public Timber flagship now has a deployable functional model built from sanitized code and synthetic data. It does not contain, read, or deploy the client SQLite database from the supplied Windows archive.

## Delivered

- Locked timber measurement domain for business inches, CFT, ICBM, and M3.
- Financial invoice domain for CFT/M3 pricing, discount, GST, paid amount, balance, and change.
- Strict validation and safe upper bounds.
- Responsive React workflow for bill metadata, measurement rows, totals, and history.
- Browser-local persistence with corrupt-storage recovery.
- Synthetic sample data and visible privacy boundary.
- Browser print / Save as PDF workflow.
- Independent domain tests and a production Vite build.

## Verification

- `pnpm run test`: 9 Timber tests passed and the 30-lab manifest remained valid.
- `pnpm run build`: portfolio, Applied Labs, and Timber production builds passed.
- Browser sample result: 12 pieces, 15.834 CFT, 0.240 M3, and INR 34,270.96 grand total.
- Browser-local save, reset, and reopen restored the same invoice and totals.

## Deferred

- Final visual design and motion are Batch 8 work.
- Production hosting and recurring health checks are Batch 10 work.
- The private Windows/SQLite edition remains isolated and is not part of the public deployment.
