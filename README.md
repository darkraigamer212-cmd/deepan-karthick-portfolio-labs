# Deepan Karthick — Portfolio and Applied Labs

Two flagship business applications and 30 certificate-linked, local-first Applied Labs. The homepage features **Printing Press ERP** and **Timber CFT Pro with Billing**; the labs demonstrate bounded, inspectable workflows across AI, cloud, software, data, business, and defensive security.

## Review the projects

- [Portfolio](https://deepan-karthick-portfolio.industrious-keyboard.workers.dev/)
- [30 Applied Labs](https://deepan-karthick-portfolio.industrious-keyboard.workers.dev/labs/)
- [Timber CFT Pro with Billing](https://deepan-karthick-portfolio.industrious-keyboard.workers.dev/timber-demo/)
- [Printing Press ERP demo](https://lakshmipriya-erp-demo.industrious-keyboard.workers.dev/owner)
- [ATS resume](https://deepan-karthick-portfolio.industrious-keyboard.workers.dev/docs/generated/karthik_ats_resume.pdf) · [Startup resume](https://deepan-karthick-portfolio.industrious-keyboard.workers.dev/docs/generated/karthik_startup_resume.pdf)
- [Current manual source](docs/portfolio-labs-complete-manual.md) · [Project status](docs/project-control/STATUS.md)
- [Public repository](https://github.com/darkraigamer212-cmd/deepan-karthick-portfolio-labs)

The public repository is configured locally as `portfolio-origin`; `origin` remains the older `career-application-kit` repository. Check the intended remote before pushing.

## Current checkpoint — 2026-09-04

The current design scope is **the portfolio only**. Timber and Printing Press ERP remain untouched; the Applied Labs application is not being redesigned in this pass. Existing flagship links remain part of the portfolio. The canonical [manifest](docs/project-control/project-manifest.json) records 30 functional labs and two functional-complete flagships; these labels describe the existing functional baseline, not acceptance of the current visual redesign.

The portfolio redesign is in local source and is being finished and verified. **Release remains pending.** The URLs above identify the existing public deployments, not a fresh deployment or uptime check. Read the dated [status record](docs/project-control/STATUS.md) for test, browser, and release evidence.

The Markdown manual now contains expanded chapters for both flagships and all 30 labs, including source-backed examples and limitations. The generated PDF/DOCX are still August 22 snapshots and **stale relative to the Markdown** until deliberately regenerated and visually checked. Current PDF links must not be presented as the newly expanded guide.

## Source and runtime boundaries

| Surface | Source | Built output | Purpose |
| --- | --- | --- | --- |
| Portfolio | `portfolio-src/` | `portfolio/` | Two flagships, resources, and links |
| Applied Labs | `labs-src/` | `labs/` | One catalog with 30 lazy-loaded hash routes |
| Timber demo | `timber-src/` | `timber-demo/` | Synthetic browser-local measurement and billing |
| Cloudflare package | `scripts/assemble_cloudflare_site.mjs` | `site-dist/` | Portfolio at root, labs/Timber subpaths, selected public PDFs |
| Printing ERP | Separate private source repository | Separate deployment | Public synthetic demo isolated from private live data |

React/Vite power the public interfaces. Labs separate pure JavaScript logic from React UI; tests use Node's test runner. The portfolio has Framer Motion, GSAP, and React Spring dependencies. Core labs require no API key or hosted model; some are transparent educational simulations rather than trained models or production services.

The private ERP source and imported Timber client database are not part of the public source boundary. Do not commit client records, SQLite databases, secrets, or imported runtime bundles. Public demos are for synthetic data, and browser-local records are not a backup.

## Develop, test, and build

The frontend CI uses Node 22 and pnpm 11.19.0. `package.json` does not currently pin an `engines` field.

```powershell
pnpm install --frozen-lockfile

# Current portfolio-only development and build
pnpm run dev:portfolio
pnpm run test
pnpm run build:portfolio
pnpm run preview
```

For separately authorized full-site maintenance, `dev:labs`, `dev:timber`, `build:labs`, and `build:timber` remain available. `pnpm run build` tests and rebuilds all three public surfaces. `pnpm run build:site` additionally assembles the shared Cloudflare package; it is **not** a portfolio-only build and does not deploy anything. Do not rebuild or publish excluded surfaces merely to finish the current portfolio scope.

`pnpm run site:assemble` packages existing outputs without rebuilding them. `wrangler.jsonc` names the `deepan-karthick-portfolio` Worker and serves `site-dist/`. Because the package also contains Labs and Timber, inspect its contents and preserve the accepted excluded-surface assets before any separately authorized release. See the [manual deployment section](docs/portfolio-labs-complete-manual.md#14-deployment-and-rollback).

Generated guides come from `scripts/build_complete_manual.py` and require Python, `python-docx`, and ReportLab. The Node build does not regenerate them. After generation, visually inspect both artifacts and explicitly verify the packaged public guide before claiming publication.

## Historical material

The older rental research utility is retained only for reproducibility, outside flagship positioning and the portfolio build. Its background is archived in [the rental research case study](docs/project_case_study_rental_research.md); it is not part of the current design or release scope.
