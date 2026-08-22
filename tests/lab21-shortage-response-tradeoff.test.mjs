import test from "node:test";
import assert from "node:assert/strict";
import {
  SHORTAGE_EXAMPLE,
  compareShortageResponses,
  parseDemandSegments,
  validateShortageInput
} from "../labs-src/labs/shortageResponseTradeoff.js";

test("example compares revenue, access, unmet demand, and spending burden", () => {
  const result = compareShortageResponses(SHORTAGE_EXAMPLE);

  assert.deepEqual(result.errors, {});
  assert.equal(result.candidate.units, 100);
  assert.equal(result.capped.units, 100);
  assert.equal(result.candidate.revenue, 11000);
  assert.equal(result.capped.revenue, 8000);
  assert.ok(result.capped.servedBuyers > result.candidate.servedBuyers);
  assert.ok(result.capped.averageSpendPerServedBuyer < result.candidate.averageSpendPerServedBuyer);
  assert.match(result.memo, /not pricing advice/i);
  assert.match(result.memo, /Anti-price-gouging/);
});

test("price exclusion remains visible as unmet baseline demand", () => {
  const result = compareShortageResponses({ ...SHORTAGE_EXAMPLE, candidatePrice: 140 });

  assert.equal(result.candidate.units, 0);
  assert.ok(result.candidate.unmetUnits > 0);
  assert.equal(result.candidate.accessCoverage, 0);
});

test("segment and numeric inputs are bounded", () => {
  const parsed = parseDemandSegments("Households|0|101|-2");
  assert.equal(parsed.errors.length, 3);
  const { errors } = validateShortageInput({ ...SHORTAGE_EXAMPLE, availableUnits: 0, purchaseCap: 1.5, unitCost: 100, baselinePrice: 80 });
  assert.deepEqual(Object.keys(errors).sort(), ["availableUnits", "purchaseCap", "unitCost"]);
  assert.equal(compareShortageResponses({}).candidate, null);
});
