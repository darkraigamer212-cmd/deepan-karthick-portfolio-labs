# Lab 22 - LP Exit Rehearsal

## User and problem

An educational DAO or club-treasury reviewer is considering a constant-product liquidity-pool position and needs to rehearse an adverse exit before making a governance decision. The reviewer needs a transparent comparison with simply holding the deposited assets, explicit stop conditions, and a record that can be discussed without connecting a wallet or using live prices.

## Certificate connection

Decentralized Finance (DeFi): The Future of Finance: applies constant-product pool mechanics, proportional liquidity ownership, reserve rebalancing, liquidity-provider withdrawal accounting, impermanent loss, swap fees, price impact, and risk-aware treasury review.

## Inputs and useful output

The user supplies bounded hypothetical initial reserves, proposed deposits, a pool swap-fee assumption, an adverse external-price multiplier, and the percentage of the owned LP position to withdraw. The local model:

- uses the proportional part of the deposit and reports any unused token amount;
- calculates LP ownership and the position share being withdrawn;
- holds `x × y = k` constant while rebalancing the simplified pool to the target external price;
- reports the modeled withdrawal balances and their value in token Y;
- compares the withdrawal with holding the same contributed assets;
- reports impermanent-loss value and percentage;
- calculates the fees needed to reach the hold benchmark;
- models a small sample swap and reports both curve price impact and the fee-inclusive execution gap;
- produces deterministic stop triggers and a copyable pre-commitment memo.

### Math correction: impact versus execution gap

The sample swap deliberately exposes two different quantities:

- **Curve price impact** compares the no-fee constant-product execution price with the pre-swap spot price. It isolates the movement caused by trade size against pool depth.
- **Fee-inclusive execution gap** compares the output after the assumed pool fee with the same pre-swap spot price. It includes both curve movement and the fee.

These values must not be labelled interchangeably. The stop-trigger rule uses curve price impact; the memo displays both values so a reviewer can see what the fee adds.

## Differentiator

This is not a generic AMM calculator, yield forecast, or transaction interface. Its unit of work is an adverse exit rehearsal: hold comparison, fee break-even requirement, explicit stop rules, named decision evidence, and a pre-commitment memo suitable for a treasury discussion.

## Safety

The lab has no wallet connection, token lookup, live price, approval flow, transaction instructions, or promise of returns. The copy states that the output is educational scenario material rather than investment advice. Values are bounded, deterministic, and local. Stop triggers intentionally pause the review for material modeled loss, large external-price movement, meaningful curve impact, or a non-proportional deposit.

## Implementation and verification

`lpExitRehearsal.js` contains validation, proportional-deposit accounting, constant-product rebalancing, hold and IL comparisons, the corrected two-part swap analysis, stop rules, and memo generation. `LpExitRehearsal.jsx` renders the accessible local workflow and copyable result.

Focused tests cover the adverse-price vector, ownership and withdrawal balances, impermanent loss, unused deposit handling, break-even fees, separate curve-impact and execution-gap values, memo content, source boundaries, and invalid numeric input. Realistic browser interaction was completed with the example scenario and generated memo. The Lab 22 route was also checked at a mobile viewport to confirm that controls, results, stop triggers, and memo remain usable without page-level horizontal overflow.

At the final Batch 6 checkpoint, the complete Node suite passed **126/126 tests**, and all portfolio, labs, and flagship production builds passed.

## Official sources

- [Uniswap: How token prices are determined](https://support.uniswap.org/hc/en-us/articles/7422670207373-How-are-token-prices-determined)
- [Uniswap: What is impermanent loss?](https://support.uniswap.org/hc/en-us/articles/20904453751693-What-is-Impermanent-Loss)
- [Uniswap: Risks when providing liquidity](https://support.uniswap.org/hc/en-us/articles/37113550065549-What-are-the-risks-when-providing-liquidity)
- [Uniswap: What is price impact?](https://support.uniswap.org/hc/en-us/articles/40074715860365-What-is-price-impact)

## Limitations

The model represents simplified full-range proportional liquidity and assumes immediate arbitrage to one target price. It excludes accumulated fees, gas and network costs, taxes, concentrated ranges, hooks, unusual token behavior, contract vulnerabilities, changing liquidity, governance controls, and execution slippage beyond the sample. The external-price multiplier is a user-supplied scenario, not a forecast. A qualified treasury, legal, security, and financial reviewer must assess any real position.
