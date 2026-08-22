# Lab 21 - Shortage Response Trade-off Lab

## User and problem

A small cooperative or shop has limited inventory of an essential item and must choose a temporary allocation response. Raising the price may change who remains eligible and increase consumer spending, while keeping the baseline price with a purchase cap may spread access differently. The owner needs the trade-offs recorded without receiving a false “optimal price” or legal conclusion.

## Certificate connection

Microeconomics Principles: applies scarcity, willingness to pay, quantity constraints, allocation rules, revenue, cost and margin proxies, unmet demand, incidence, and distributional trade-offs through an explicit deterministic comparison.

## Inputs

The user supplies:

- an essential-item description;
- up to 12 aggregate demand segments using `segment|buyers|max units per buyer|willingness to pay`;
- available units;
- baseline price and unit cost;
- one candidate price; and
- one whole-number purchase cap.

Counts, prices, quantities, rows, and per-buyer limits are bounded. The tool accepts aggregate segments, not personal customer records, and does not fetch current prices or market data.

## Deterministic model and useful output

`shortageResponseTradeoff.js` evaluates two intentionally different policies against the same inventory:

1. **Candidate-price allocation** admits segments whose stated willingness to pay meets the candidate price, then serves higher-willingness segments first.
2. **Baseline-price purchase cap** retains the baseline price, limits each buyer's demand to the selected cap, and distributes scarce units proportionally across eligible segment demand.

For both policies the model reports allocated units, revenue, a gross-margin proxy, served buyers, unmet baseline demand, average spend per served buyer, access coverage, and the gap between the highest and lowest segment service rates. It also exposes five assumptions and generates a copyable owner policy memo with the legal/ethics review boundary. `ShortageResponseTradeoffLab.jsx` renders the comparison, example/reset controls, table, assumptions, and memo copy action.

## Locked differentiator

This is not an equilibrium calculator, demand-curve toy, price optimizer, profit maximizer, or pricing recommendation. It compares two declared shortage-response rules and keeps access, unmet need, consumer-spend burden, and distribution proxies beside revenue so the owner must document the human trade-off.

## Safety and privacy

The lab uses aggregate fictional or user-supplied segment counts only, performs no external lookup, and does not save personal data. The memo explicitly states that the output is not pricing advice and requires local review of anti-price-gouging, essential-goods, consumer-protection, rationing, and other applicable rules. “Willingness to pay” is an input assumption and must not be treated as a measure of need, vulnerability, fairness, or ability to absorb harm.

## Automated verification

Focused tests in `tests/lab21-shortage-response-tradeoff.test.mjs` verify both allocation paths, revenue, equal inventory use, served-buyer and average-spend differences, candidate-price exclusion, unmet baseline demand, zero-access behavior, segment bounds, numeric bounds, unit-cost validation, and the memo's legal/no-advice language.

Central integration verification completed with **126/126 tests passing**. The production portfolio, labs, and Timber builds also passed.

## Browser verification

The realistic essential-inventory example was run through the rendered lab and produced the expected comparison table, transparent assumptions, and copyable owner memo. Example, reset, calculation, and copy-oriented output rendering passed browser verification. Lab 21 also passed the central mobile-viewport check without losing the core form or comparison workflow.

## Limitations

This is a static, one-period allocation model. It omits changing supply, restocking lead time, substitution, repeat visits, household size, heterogeneous need, taxes, fixed costs, spoilage, enforcement cost, strategic behavior, queue order, emergency eligibility, and future demand response. Proportional segment allocation is a transparent proxy, not proof of fair individual allocation. Results depend entirely on the supplied aggregate schedule and cannot determine the lawful, ethical, or commercially correct policy.

## Official sources

- [India Code: Essential Commodities Act, 1955](https://www.indiacode.nic.in/handle/123456789/14100?locale=en) — official statutory context for controls concerning production, supply, distribution, trade, and commerce in declared essential commodities.
- [Department of Consumer Affairs: Price Monitoring System](https://fcainfoweb.nic.in/default.aspx) — official explanation of India's monitoring and market-intervention role for selected essential commodities; the lab intentionally does not import these live prices.
- [India Code: Consumer Protection Act, 2019](https://www.indiacode.nic.in/handle/123456789/15256) — official consumer-rights and unfair-trade-practice context supporting the mandatory legal-review limitation.
