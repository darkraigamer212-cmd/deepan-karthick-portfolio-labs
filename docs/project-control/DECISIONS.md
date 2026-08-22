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
