import assert from "node:assert/strict";
import test from "node:test";

import {
  CLAIM_EXAMPLE,
  interpretPlainLanguageClaim,
  parseLocalCsv,
  stressTestCsvClaim,
  trimIqrOutliers
} from "../labs-src/labs/csv-claim-stress-tester.js";

test("bounded CSV parser handles quoted commas, escaped quotes, and embedded newlines", () => {
  const parsed = parseLocalCsv('group,outcome,note\nA,10,"hello, world"\nB,12,"line one\nline ""two"""');
  assert.deepEqual(parsed.headers, ["group", "outcome", "note"]);
  assert.equal(parsed.rowCount, 2);
  assert.equal(parsed.records[0].note, "hello, world");
  assert.equal(parsed.records[1].note, 'line one\nline "two"');
});

test("CSV parser rejects malformed shapes and duplicate headers", () => {
  assert.throws(() => parseLocalCsv('a,b\n1,"open\n2,closed'), /unclosed/i);
  assert.throws(() => parseLocalCsv('a,b\n1,"closed"tail\n2,value'), /after a closing quote/i);
  assert.throws(() => parseLocalCsv('a,b\n1,un"quoted\n2,value'), /unexpected quote/i);
  assert.throws(() => parseLocalCsv("group,GROUP\nA,B\nC,D"), /unique/i);
  assert.throws(() => parseLocalCsv("a,b\n1,2,3\n4,5"), /expected 2/i);
});

test("claim interpreter binds exact group values and one direction", () => {
  const claim = interpretPlainLanguageClaim(
    "Premium customers have higher value than Standard customers.",
    ["Premium", "Standard"]
  );
  assert.equal(claim.focusGroup, "Premium");
  assert.equal(claim.comparisonGroup, "Standard");
  assert.equal(claim.expectedSign, 1);
  assert.equal(interpretPlainLanguageClaim("A segment is above B segment.", ["A", "B"]).comparisonGroup, "B");
  assert.throws(() => interpretPlainLanguageClaim("One group is different", ["A", "B"]), /two exact group values/i);
});

test("IQR trimming deterministically removes an extreme outlier", () => {
  const result = trimIqrOutliers([4, 5, 5, 6, 6, 7, 100]);
  assert.deepEqual(result.values, [4, 5, 5, 6, 6, 7]);
  assert.equal(result.removed, 1);
});

test("realistic example supports the claim across quality and time checks", () => {
  const result = stressTestCsvClaim(CLAIM_EXAMPLE);
  assert.equal(result.valid, true);
  assert.equal(result.verdict, "Support");
  assert.equal(result.baseline.supports, true);
  assert.equal(result.trimmed.supports, true);
  assert.equal(result.sliceConsistency.evaluable, 4);
  assert.equal(result.sliceConsistency.supporting, 4);
  assert.match(result.pandasRecipe, /pd\.read_csv/);
  assert.match(result.pandasRecipe, /time_col = "quarter"/);
});

test("baseline contradiction rejects a reversed claim", () => {
  const result = stressTestCsvClaim({
    ...CLAIM_EXAMPLE,
    claim: "Standard customers have higher order value than Premium customers."
  });
  assert.equal(result.valid, true);
  assert.equal(result.verdict, "Reject");
  assert.equal(result.baseline.supports, false);
  assert.match(result.verdictReason, /runs against/i);
});

test("outlier-dependent direction is marked fragile", () => {
  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 100].map((value) => `A,${value}`)
    .concat(Array.from({ length: 10 }, () => "B,10"));
  const result = stressTestCsvClaim({
    csvText: `group,value\n${rows.join("\n")}`,
    outcomeColumn: "value",
    groupColumn: "group",
    timeColumn: "",
    claim: "A has higher value than B."
  });
  assert.equal(result.baseline.supports, true);
  assert.equal(result.trimmed.supports, false);
  assert.equal(result.verdict, "Fragile");
  assert.match(result.verdictReason, /outlier trimming/i);
});

test("missingness and inconsistent time slices make baseline support fragile", () => {
  const csvText = `period,group,value
T1,A,20
T1,A,22
T1,B,10
T1,B,12
T2,A,5
T2,A,6
T2,B,15
T2,B,16
T3,A,
T3,A,25
T3,B,14
T3,B,15`;
  const result = stressTestCsvClaim({
    csvText,
    outcomeColumn: "value",
    groupColumn: "group",
    timeColumn: "period",
    claim: "A has higher value than B."
  });
  assert.equal(result.valid, true);
  assert.equal(result.baseline.supports, true);
  assert.equal(result.verdict, "Fragile");
  assert.ok(result.quality.usableRate < 1);
  assert.ok(result.warnings.some((warning) => /time slices|usable/i.test(warning)));
});

test("pandas recipe uses selected columns and does not embed pasted row data", () => {
  const result = stressTestCsvClaim(CLAIM_EXAMPLE);
  assert.match(result.pandasRecipe, /outcome = "order_value"/);
  assert.match(result.pandasRecipe, /group = "tier"/);
  assert.match(result.pandasRecipe, /focus = "Premium"/);
  assert.doesNotMatch(result.pandasRecipe, /Q1,Standard,80/);
  assert.match(result.pandasRecipe, /Inspect rows and assumptions/);
});
