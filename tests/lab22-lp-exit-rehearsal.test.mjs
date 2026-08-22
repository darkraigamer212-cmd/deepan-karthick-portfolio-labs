import assert from "node:assert/strict";
import test from "node:test";
import { LP_EXIT_EXAMPLE, LP_EXIT_SOURCES, modelLpExit, validateLpExitInput } from "../labs-src/labs/lpExitRehearsal.js";

test("LP exit rehearsal matches a constant-product adverse-price vector", () => {
  const result = modelLpExit(LP_EXIT_EXAMPLE);
  assert.equal(result.valid, true);
  assert.ok(Math.abs(result.ownershipPercent - 9.090909) < 1e-6);
  assert.ok(Math.abs(result.withdrawal.x - 141.421356) < 1e-6);
  assert.ok(Math.abs(result.withdrawal.y - 7071.067812) < 1e-6);
  assert.ok(Math.abs(result.ilPercent - -5.719096) < 1e-6);
  assert.ok(Math.abs(result.breakEvenFeesY - 857.864376) < 1e-6);
});

test("LP exit rehearsal leaves an unbalanced deposit remainder and fires stop trigger", () => {
  const result = modelLpExit({ ...LP_EXIT_EXAMPLE, depositY: 20000 });
  assert.equal(result.usedDeposit.y, 10000);
  assert.equal(result.unusedDeposit.y, 10000);
  assert.ok(result.stopTriggers.some((item) => item.includes("not proportional")));
});

test("LP exit rehearsal models sample price impact and copyable memo", () => {
  const result = modelLpExit(LP_EXIT_EXAMPLE);
  assert.ok(result.sampleSwap.inputX > 0);
  assert.ok(result.sampleSwap.outputY > 0);
  assert.ok(result.sampleSwap.priceImpactPercent > 0);
  assert.ok(result.sampleSwap.executionGapPercent > result.sampleSwap.priceImpactPercent);
  assert.match(result.memo, /LP EXIT PRE-COMMITMENT MEMO/);
  assert.match(result.memo, /STOP TRIGGERS/);
  assert.ok(LP_EXIT_SOURCES.every((source) => source.url.startsWith("https://support.uniswap.org/")));
});

test("LP exit rehearsal validates all bounded numeric inputs", () => {
  const invalid = { ...LP_EXIT_EXAMPLE, initialReserveX: 0, feePercent: 6, priceMultiplier: 0, withdrawalPercent: 101 };
  assert.equal(validateLpExitInput(invalid).length, 4);
  assert.equal(modelLpExit(invalid).valid, false);
});
