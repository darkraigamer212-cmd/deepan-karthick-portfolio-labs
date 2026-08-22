# Decision Log

## 2026-08-22 - Functional models before visual polish

The user explicitly prioritized working models for all projects before making them visually polished. Functional batches therefore use a minimal shared interface and defer visual redesign to Batch 8.

## 2026-08-22 - Two flagship projects

The homepage will feature Printing Press ERP and Timber CFT Pro with billing. Rental Research Report Generator is removed from flagship positioning.

## 2026-08-22 - One Applied Labs deployment

Thirty independent deployments would create unnecessary operational risk. All certificate prototypes will be independent feature modules and routes inside one lazy-loaded Applied Labs application.

## 2026-08-22 - Timber import isolation

The supplied ZIP contains source, dependencies, a bundled runtime, SQLite databases, and tests. Only source/test files were extracted to the ignored `imports/` directory. The original database and client records will never be committed or deployed. A sanitized application will be created separately during Batch 1.

## 2026-08-22 - Stable demos over external integrations

Every core demo must work with local sample data. External APIs and AI providers may be optional enhancements but cannot be required for a reviewer to use the project.

## 2026-08-22 - Timber local edition and public demo are separate products

The supplied Windows application remains the private offline edition for real business records. The public flagship is a static demo with synthetic data and browser-local storage. The SQLite database, backup, bundled runtime, and launchers are excluded from Git and deployment.

## 2026-08-22 - Timber financial billing is additive

The verified timber formula remains unchanged. Financial billing is a separate calculation layer using a selectable CFT or M3 rate, invoice-level discount, optional GST percentage, paid amount, balance, and overpayment change. Currency defaults to INR. These are initial product assumptions and may be revised without changing timber measurement totals.

## 2026-08-22 - Printing ERP demo and live modes are explicit

The public portfolio deployment runs in demo mode with synthetic browser-local data and makes no Supabase requests. The private business deployment runs in live mode with Supabase authentication and fails closed. Demo authentication may never be combined with live backend access.

## 2026-08-22 - Printing ERP uses Cloudflare Workers Static Assets

The repaired public ERP demo is deployed as a static single-page application on Cloudflare Workers Static Assets, with SPA fallback enabled for direct routes such as `/owner`. The former Vercel deployment remains unchanged because its repository integration failed authentication. The portfolio link will change only after the Cloudflare deployment is claimed and its permanent URL is re-verified.
