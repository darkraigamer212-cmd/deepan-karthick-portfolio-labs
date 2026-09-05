# Design QA — Portfolio Aurora / Glass Redesign

Date: 2026-09-04. Scope: portfolio homepage and links page only. This replaces the earlier cyberpunk-target report; that target is not the visual truth for this release.

## Findings

- No actionable P0/P1/P2 findings remain after one corrective visual iteration.
- [P3] Buttons and borders have less luminous bloom than the target; cyan/coral/violet hierarchy and clear primary actions remain. Extra glow is optional polish.
- [P3] The handbook uses a Phosphor book icon and the existing generated aurora image rather than the target's ornate book treatment. Its purpose and hierarchy are retained.
- Accepted product differences: authentic screenshot aspect fitting, stack labels, expandable problem/approach/demo limitations, motion controls, About, and resource links remain intentional additions. Category cards truthfully open all labs because the existing application does not implement query-string category filtering.

## Source and implementation evidence

- Source visual truth: `C:/Users/Karth/.codex/generated_images/01a027a0-cd65-7ee3-8a98-e431e310116a/exec-1f4dbec2-2622-459b-99e8-ed27cd6a3568.png`.
- Implementation: `http://127.0.0.1:4173/`; secondary route: `/links.html`.
- Latest desktop screenshot: `C:/Users/Karth/AppData/Local/Temp/portfolio-qa-after-full.png`.
- Exact reference-width screenshot: `C:/Users/Karth/AppData/Local/Temp/portfolio-qa-after-869.png`.
- Combined full comparison: `C:/Users/Karth/AppData/Local/Temp/portfolio-qa-after-comparison-full.png`.
- Combined hero comparison: `C:/Users/Karth/AppData/Local/Temp/portfolio-qa-after-comparison-hero.png`.
- Combined project comparison: `C:/Users/Karth/AppData/Local/Temp/portfolio-qa-after-comparison-projects.png`.
- Earlier mobile evidence: `C:/Users/Karth/AppData/Local/Temp/portfolio-audit-mobile.png`.

### Viewport, state, and normalization

Source: 869 × 1810 px full-page generated design, with no browser chrome or declared CSS density. Desktop implementation: 1440 × 1024 CSS px, deviceScaleFactor 1, captured full-page at 1440 × 3087 px. Exact-width implementation: 869 × 1810 CSS px, deviceScaleFactor 1, captured full-page at 869 × 2783 px. Added About/resources and explanatory content intentionally extend the page.

State: public homepage, dark theme, search closed/unfiltered, project details closed, loaded fonts/images. Sections were revealed before capture and the page returned to the top. No browser frame is included. The exact-width sheet compares both at 869 px without stretching their heights. Initial desktop composition comparison additionally downsampled 1440 px to 869 px; it was not used to infer exact CSS font sizes. Project crops align card widths while preserving aspect ratios. Every sheet places source left and implementation right in one image; the combined images were opened and inspected.

### Browser environment

The Browser skill is absent. Explicit CUA attempts reported `Browser is not available: iab` and `Browser is not available: chrome`. Existing Playwright with installed Chrome supplied the rendered evidence; no new dependencies or browsers were installed. The bundled Playwright headless-shell binary is absent.

## Full-view and focused comparison

Full-view review confirms the selected sequence: glass navigation, two-line editorial hero opposite generated aurora artwork, numbered screenshot-led flagship cards, lab categories, and handbook. Navy/cyan/coral identity and actual project subjects are preserved. The real portfolio is not presented as a pixel-identical copy of a generated full-page mock.

Focused hero evidence confirms headline wrapping, copy/CTA/search/count hierarchy, readable text, intact artwork, and corrected tablet spacing. Focused project evidence confirms clear two-line titles, distinct numbers and accents, authentic screenshots, synthetic-demo labels, and usable entry actions. Focused regions were necessary because full-page small UI text is not sufficiently legible for detailed comparison.

## Required fidelity surfaces

- **Fonts and typography:** Loaded Space Grotesk Variable display and Inter Variable body/UI. Geometric sans direction, tight display tracking, two-line hero/project structure, appropriate optical weights, and hierarchy agree with the target. Corrected project-title scale/wrapping. No visible fallback, clipping, or truncation.
- **Spacing and layout rhythm:** Rounded glass header, left-copy/right-art hero, two-column project cards, consistent alignments and gaps retained. Corrected excessive tablet hero height. Mobile uses one column; categories wrap to available width. Real screenshot fitting and disclosure rows intentionally change card height.
- **Colors and tokens:** Navy surfaces, near-white headings, muted blue-gray body copy, cyan focus/primary accents, coral cards and violet artwork preserve source intent. Bloom differences are P3. Keyboard focus remains visible.
- **Image quality and asset fidelity:** Aurora is a real generated raster; project previews are real synthetic-demo captures, not fake dashboards. All three images loaded with nonzero natural dimensions. No distortion, broken images, or placeholder art. The illustration crops responsively; standard symbols come from Phosphor rather than handcrafted SVG/CSS artwork. Handbook ornamental treatment is the P3 difference above.
- **Copy and content:** Headline and core section copy follow the target. Name, two flagships, 30 labs, category counts, source links and demo limitations are grounded in existing source. Additional explanation remains intentional. No prompt instructions or invented client claims leak into the page.

## Comparison history

1. **Initial combined comparison — blocked.** Evidence in the same Temp folder: `portfolio-qa-comparison-full.png`, `portfolio-qa-comparison-hero.png`, `portfolio-qa-comparison-projects.png`, and `portfolio-qa-comparison-869.png`. [P2] Project typography was undersized; ERP collapsed to one line at desktop, weakening target hierarchy. [P2] Tablet hero retained a 740 px minimum height, pushing work discovery substantially below the reference.
2. **Fixes.** In `portfolio-src/main.jsx`, added explicit source-consistent flagship title line breaks. In `portfolio-src/styles.css`, increased project-title scale, set 38 px tablet titles, and reduced the 721–1050 px hero minimum height to 550 px with 66 px top padding. Mobile layout retained.
3. **Post-fix comparison — passed.** Fresh combined full/hero/project sheets listed above were opened together and reviewed. Heading hierarchy and tablet work discovery are restored, without new overlap/clipping. Remaining differences are P3 or documented content constraints; no further visual correction required.

## Functional and responsive evidence

- Correct homepage/links identity, meaningful rendered content, and no framework overlay.
- No page horizontal overflow after final fixes at 320, 390, 720, 768, 869, 1024, and 1440 px.
- Search first/last wrapping, active-option scrolling, empty state, Clear, Escape passed; the full automated suite now passes 169 tests.
- Primary work anchor and project disclosure expansion passed. Links page has ten destination cards and no empty links.
- Manual motion pause resets hero transform and disables smooth scrolling; preference persists on reload. Live system reduced-motion changes apply immediately and restore correctly.
- No application exceptions. Observed console issues: development `favicon.ico` 404 and Framer's expected reduced-motion warning after deliberately enabling that preference.
- Vite serves HTML for the three generated-document PDF routes; release assembly must supply and verify actual PDFs. Certificate route returned PDF. This visual gate does not certify production delivery, external destinations, or deployment.

## Implementation checklist

- [x] Canonical target and browser implementation compared in combined full/focused inputs.
- [x] Five required fidelity surfaces reviewed.
- [x] P2 findings fixed, recaptured, and re-compared.
- [x] Search, motion, disclosures, links, and responsive checks recorded.
- [x] Timber, ERP, and labs application source untouched by this QA lane.
- [ ] Optional P3 bloom/handbook-asset refinement.
- [x] Release owner verified final assembled PDF routes and production build.

final result: passed
