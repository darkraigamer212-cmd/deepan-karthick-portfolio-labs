# Printing Press ERP Public Demo Specification

Status: Batch 1B implementation

## Product boundary

The ERP has two explicit runtime modes:

1. `demo` - public portfolio deployment with synthetic browser-local data and no Supabase requests.
2. `live` - private authenticated business deployment using Supabase and real role permissions.

The application must never combine demo authentication with the live backend.

## Public demo requirements

- Start immediately with clearly labelled synthetic records.
- Make no request to Supabase, even when live environment variables exist in hosting.
- Store reviewer-created demo records only in that browser.
- Allow reset back to the synthetic seed.
- Explain that demo changes are local, disposable, and not real business records.
- Avoid real customer names, phone numbers, GST numbers, orders, invoices, or uploaded designs.

## Initial functional workflow

The first public acceptance path is:

1. Open the owner dashboard and see populated metrics without a loading hang.
2. Open the production board and see synthetic jobs.
3. Create a synthetic client order.
4. Reopen the created order.
5. Change its priority or production stage.
6. Confirm dashboard and production-board data update after navigation or reload.
7. Reset the demo without affecting any server data.

Secondary modules must at minimum load deterministic synthetic data without contacting Supabase: staff, inventory, notifications, designs, invoices, reverse requests, and reports.

## Private live requirements

- Use Supabase authentication and role-based routes.
- Never enable a temporary owner bypass.
- Fail closed when configuration, authentication, or backend requests fail.
- Use bounded requests and visible recoverable errors rather than endless loading.
- Never fall back from a failed live request to synthetic records, because that would hide an operational failure.

## Acceptance tests

- Demo mode creates zero Supabase clients or network calls.
- Demo mode loads owner metrics and recent orders from its seed.
- Demo order create/read/update persists through reload in local storage.
- Invalid or corrupt local demo state recovers safely without exposing or overwriting live data.
- Live mode requires valid configuration and authentication.
- Production build and lint pass.
- Browser workflow passes on the deployed demo route.
