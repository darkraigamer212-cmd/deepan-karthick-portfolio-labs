# Batch 6 Prior-Art and Differentiation Note

Date checked: 2026-08-22

## Method and claim boundary

Searches covered the exact proposed names and adjacent categories: LLM dataset classification and leakage controls, shortage allocation and price-response analysis, automated-market-maker liquidity-provider calculators, account-recovery planning, and abuse-case or negative-security-test generators. Exact-name searches produced no direct match. That result is not exhaustive and does not establish worldwide novelty. These projects are original workflow combinations and will be described that way rather than marketed as verified world-first inventions.

## Findings and locked differentiators

- Data-loss prevention, dataset cards, privacy classification, and LLM safety checklists already exist. Lab 20 differs by converting a field-level purpose and retention contract into allow, redact, quarantine, or exclude decisions; a least-data pipeline; leakage tests; and a copyable JSONL and dataset-card contract without ingesting records or calling a model.
- Supply-and-demand, price-ceiling, rationing, and shortage calculators already exist. Lab 21 differs by making a small operator compare a candidate price response with a per-buyer purchase cap using served buyers, unmet demand, revenue, consumer-spend burden, and distribution proxies, then exporting a neutral decision memo with an explicit local-law review gate.
- Impermanent-loss and automated-market-maker calculators already exist. Lab 22 differs by rehearsing an educational club or DAO treasury's exit under a bounded adverse scenario and joining ownership, withdrawal balances, hold benchmark, impermanent loss, fee break-even, price impact, stop triggers, and a copyable governance memo in one offline rehearsal.
- Provider recovery pages and general account-security checklists already exist. Lab 23 differs by modelling only labels and recovery-method descriptions, detecting correlated recovery single points across device, phone, and email loss scenarios, and producing a tabletop drill plus a secret-free emergency card without attempting account recovery.
- Threat modelling, abuse cases, OWASP mappings, and security-test checklists already exist. Lab 24 differs by beginning with a customer promise and converting bounded trust-boundary actions into defensive misuse stories that link the broken promise, a non-actionable scenario, an OWASP category, an observable negative acceptance test, an owner, and required evidence in a copyable pull-request contract.

## Representative foundations reviewed

- NIST AI Risk Management Framework and Generative AI Profile: https://www.nist.gov/itl/ai-risk-management-framework and https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf
- OWASP guidance on LLM sensitive-information disclosure: https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/
- OpenStax treatment of shortages, allocation trade-offs, and price controls: https://openstax.org/books/principles-microeconomics-3e/pages/3-4-price-ceilings-and-price-floors and https://openstax.org/books/principles-economics-3e/pages/3-5-demand-supply-and-efficiency
- FTC price-gouging topic index, used only to establish that legal treatment depends on context and jurisdiction: https://www.ftc.gov/terms/price-gouging
- Uniswap explanation of liquidity provision and impermanent-loss risk: https://blog.uniswap.org/how-liquidity-provision-in-defi-works
- NIST Digital Identity Guidelines, FTC hacked-account recovery guidance, and CISA identity/access-management practices: https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=959882, https://consumer.ftc.gov/articles/how-recover-your-hacked-email-or-social-media-account, and https://www.cisa.gov/sites/default/files/2023-12/ESF%20IDENTITY%20AND%20ACCESS%20MANAGEMENT%20RECOMMENDED%20BEST%20PRACTICES%20FOR%20ADMINISTRATORS%20PP-23-0248_508C.pdf
- OWASP abuse-case, threat-modelling, and testing foundations: https://cheatsheetseries.owasp.org/cheatsheets/Abuse_Case_Cheat_Sheet.html, https://owasp.org/www-community/Threat_Modeling, and https://owasp.org/www-project-web-security-testing-guide/v41/2-Introduction/

## Safety boundaries

- Lab 20 accepts schema descriptions only: never records, secrets, or model credentials.
- Lab 21 is a transparent comparison tool, not pricing, legal, or emergency-market advice. It must require jurisdiction-specific review before any real decision.
- Lab 22 uses synthetic numbers only, never connects a wallet, fetches live prices, gives transaction instructions, or predicts returns.
- Lab 23 must explicitly reject secrets, recovery codes, personal contact details, credentials, and cryptographic keys.
- Lab 24 remains defensive and local: no target URLs, scanning, payloads, credentials, exploit steps, or vulnerability scores.

## Acceptance consequence

Each implementation must prove its locked differentiator through automated tests and a realistic browser workflow. A renamed data-flow visualizer, economics calculator, DeFi dashboard, recovery checklist, or OWASP quiz does not pass Batch 6.
