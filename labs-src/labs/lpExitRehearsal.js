export const LP_EXIT_SOURCES = Object.freeze([
  Object.freeze({ label: "Uniswap: How token prices are determined", url: "https://support.uniswap.org/hc/en-us/articles/7422670207373-How-are-token-prices-determined" }),
  Object.freeze({ label: "Uniswap: Impermanent loss", url: "https://support.uniswap.org/hc/en-us/articles/20904453751693-What-is-Impermanent-Loss" }),
  Object.freeze({ label: "Uniswap: Liquidity-provision risks", url: "https://support.uniswap.org/hc/en-us/articles/37113550065549-What-are-the-risks-when-providing-liquidity" }),
  Object.freeze({ label: "Uniswap: Price impact", url: "https://support.uniswap.org/hc/en-us/articles/40074715860365-What-is-price-impact" })
]);

export const LP_EXIT_RESET = Object.freeze({ initialReserveX: 1000, initialReserveY: 100000, depositX: 100, depositY: 10000, feePercent: 0.3, priceMultiplier: 0.5, withdrawalPercent: 100 });
export const LP_EXIT_EXAMPLE = Object.freeze({ ...LP_EXIT_RESET });

const numericFields = Object.freeze([
  ["initialReserveX", "Initial reserve X", 0.000001, 1e12], ["initialReserveY", "Initial reserve Y", 0.000001, 1e12],
  ["depositX", "Deposit X", 0.000001, 1e12], ["depositY", "Deposit Y", 0.000001, 1e12],
  ["feePercent", "Pool fee assumption", 0, 5], ["priceMultiplier", "External price multiplier", 0.01, 100],
  ["withdrawalPercent", "Withdrawal share", 1, 100]
]);

export function validateLpExitInput(input) {
  const errors = [];
  for (const [key, label, minimum, maximum] of numericFields) {
    const raw = input?.[key];
    const value = typeof raw === "number" ? raw : Number(raw);
    if (raw === "" || !Number.isFinite(value)) errors.push(`${label} must be a valid number.`);
    else if (value < minimum || value > maximum) errors.push(`${label} must be between ${minimum} and ${maximum}.`);
  }
  return errors;
}

function round(value, places = 6) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

export function modelLpExit(input) {
  const errors = validateLpExitInput(input);
  if (errors.length) return { valid: false, errors, memo: "", sources: LP_EXIT_SOURCES };
  const x0 = Number(input.initialReserveX), y0 = Number(input.initialReserveY);
  const dx = Number(input.depositX), dy = Number(input.depositY), feeRate = Number(input.feePercent) / 100;
  const multiplier = Number(input.priceMultiplier), withdrawalFraction = Number(input.withdrawalPercent) / 100;
  const depositRatio = Math.min(dx / x0, dy / y0);
  const usedX = x0 * depositRatio, usedY = y0 * depositRatio;
  const unusedX = dx - usedX, unusedY = dy - usedY;
  const ownership = depositRatio / (1 + depositRatio);
  const reserveAfterDepositX = x0 + usedX, reserveAfterDepositY = y0 + usedY;
  const k = reserveAfterDepositX * reserveAfterDepositY;
  const initialPriceYPerX = y0 / x0;
  const targetPriceYPerX = initialPriceYPerX * multiplier;
  const rebalancedX = Math.sqrt(k / targetPriceYPerX);
  const rebalancedY = Math.sqrt(k * targetPriceYPerX);
  const poolShareWithdrawn = ownership * withdrawalFraction;
  const withdrawX = rebalancedX * poolShareWithdrawn;
  const withdrawY = rebalancedY * poolShareWithdrawn;
  const lpValueY = withdrawX * targetPriceYPerX + withdrawY;
  const holdX = usedX * withdrawalFraction, holdY = usedY * withdrawalFraction;
  const holdValueY = holdX * targetPriceYPerX + holdY;
  const ilValueY = lpValueY - holdValueY;
  const ilPercent = holdValueY ? (ilValueY / holdValueY) * 100 : 0;
  const breakEvenFeesY = Math.max(0, -ilValueY);
  const breakEvenFeePercentOfLp = lpValueY ? (breakEvenFeesY / lpValueY) * 100 : 0;

  const sampleSwapX = rebalancedX * 0.01;
  const effectiveSwapX = sampleSwapX * (1 - feeRate);
  const sampleOutputY = rebalancedY - k / (rebalancedX + effectiveSwapX);
  const sampleOutputWithoutFeeY = rebalancedY - k / (rebalancedX + sampleSwapX);
  const executionPrice = sampleOutputY / sampleSwapX;
  const executionPriceWithoutFee = sampleOutputWithoutFeeY / sampleSwapX;
  const priceImpactPercent = (1 - executionPriceWithoutFee / targetPriceYPerX) * 100;
  const executionGapPercent = (1 - executionPrice / targetPriceYPerX) * 100;
  const stopTriggers = [];
  if (Math.abs(ilPercent) >= 5) stopTriggers.push("Pause: modeled impermanent loss reaches 5% or more versus holding.");
  if (multiplier <= 0.5 || multiplier >= 2) stopTriggers.push("Pause: the scenario price moved at least 2× in either direction; require a fresh treasury review.");
  if (priceImpactPercent >= 1) stopTriggers.push("Pause: the 1% reserve-X sample swap has at least 1% modeled price impact.");
  if (unusedX > 1e-9 || unusedY > 1e-9) stopTriggers.push("Pause: the proposed deposit is not proportional; this model leaves part of one token unused.");
  if (!stopTriggers.length) stopTriggers.push("No numeric trigger fired; still review token, contract, range, operational, and governance risks outside this model.");

  const result = {
    valid: true, errors: [], ownershipPercent: round(ownership * 100), usedDeposit: { x: round(usedX), y: round(usedY) }, unusedDeposit: { x: round(unusedX), y: round(unusedY) },
    initialPriceYPerX: round(initialPriceYPerX), targetPriceYPerX: round(targetPriceYPerX), constantProduct: round(k), rebalancedReserves: { x: round(rebalancedX), y: round(rebalancedY) },
    poolShareWithdrawnPercent: round(poolShareWithdrawn * 100), withdrawal: { x: round(withdrawX), y: round(withdrawY), valueY: round(lpValueY) },
    holdBenchmark: { x: round(holdX), y: round(holdY), valueY: round(holdValueY) }, ilValueY: round(ilValueY), ilPercent: round(ilPercent),
    breakEvenFeesY: round(breakEvenFeesY), breakEvenFeePercentOfLp: round(breakEvenFeePercentOfLp),
    sampleSwap: { inputX: round(sampleSwapX), outputY: round(sampleOutputY), feePercent: Number(input.feePercent), priceImpactPercent: round(priceImpactPercent), executionGapPercent: round(executionGapPercent) }, stopTriggers, sources: LP_EXIT_SOURCES,
    limitation: "Simplified full-range x×y=k scenario: assumes instant arbitrage to the target price, proportional liquidity, one pool fee, no accumulated fees, gas, taxes, token behavior, hooks, range liquidity, contract risk, or live market data. It is educational review material, not investment advice or transaction guidance."
  };
  result.memo = `LP EXIT PRE-COMMITMENT MEMO\nScenario only — no wallet or live-price connection\n\nPool starting price: ${result.initialPriceYPerX} Y per X\nAdverse target price: ${result.targetPriceYPerX} Y per X (${multiplier}×)\nModeled ownership: ${result.ownershipPercent}%\nWithdrawal: ${result.withdrawal.x} X + ${result.withdrawal.y} Y (${result.withdrawal.valueY} Y value)\nHold benchmark: ${result.holdBenchmark.valueY} Y\nModeled IL: ${result.ilValueY} Y (${result.ilPercent}%)\nFees needed to break even: ${result.breakEvenFeesY} Y (${result.breakEvenFeePercentOfLp}% of modeled LP value)\n1% reserve-X curve price impact: ${result.sampleSwap.priceImpactPercent}%\n1% reserve-X execution gap including fee: ${result.sampleSwap.executionGapPercent}%\n\nSTOP TRIGGERS\n${stopTriggers.map((item) => `- ${item}`).join("\n")}\n\nDecision owner: ____________________\nEvidence reviewed: ____________________\nRevisit date/condition: ____________________`;
  return result;
}
