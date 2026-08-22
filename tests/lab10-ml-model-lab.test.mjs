import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateFeatureStats,
  calculateLeaveOneOut,
  classifyKnn,
  parseFiniteInput,
  parseKnnDataset,
  standardizedDistance
} from "../labs-src/labs/ml-model-lab.js";

const DATA = `hours,score,outcome
1,10,Developing
2,20,Developing
3,30,Developing
8,80,Ready
9,90,Ready
10,100,Ready`;

test("CSV-style parser returns named numeric features and sorted labels", () => {
  const dataset = parseKnnDataset(DATA);
  assert.deepEqual(dataset.featureNames, ["hours", "score"]);
  assert.equal(dataset.labelName, "outcome");
  assert.equal(dataset.rows.length, 6);
  assert.deepEqual(dataset.rows[0], { id: 1, x: 1, y: 10, label: "Developing" });
  assert.deepEqual(dataset.labels, ["Developing", "Ready"]);
});

test("parser and numeric input validation return actionable errors", () => {
  assert.throws(() => parseKnnDataset("x,y,label\n1,2,A"), /at least 3/i);
  assert.throws(() => parseKnnDataset("x,y,label\n1,nope,A\n2,3,B\n3,4,B"), /numeric/i);
  assert.throws(() => parseKnnDataset("x,y,label\n1,2,A\n2,3,A\n3,4,A"), /two different/i);
  assert.throws(() => parseKnnDataset('x,y,label\n1,2,"A"\n2,3,B\n3,4,B'), /quoted cells/i);
  assert.throws(() => parseFiniteInput("", "hours"), /required/i);
  assert.throws(() => parseFiniteInput("Infinity", "hours"), /finite/i);
});

test("feature statistics standardize different units before distance", () => {
  const rows = parseKnnDataset(DATA).rows;
  const stats = calculateFeatureStats(rows);
  const distance = standardizedDistance(rows[0], { x: 1, y: 10 }, stats);
  assert.equal(distance, 0);
  assert.ok(stats.standardDeviations.x > 0);
  assert.ok(stats.standardDeviations.y > stats.standardDeviations.x);
});

test("KNN selects nearest neighbours and predicts their majority label", () => {
  const dataset = parseKnnDataset(DATA);
  const result = classifyKnn(dataset, { x: 8.5, y: 85 }, 3);
  assert.equal(result.prediction, "Ready");
  assert.equal(result.neighbours.length, 3);
  assert.ok(result.neighbours[0].distance <= result.neighbours[1].distance);
  assert.ok(result.neighbours[1].distance <= result.neighbours[2].distance);
  assert.deepEqual(result.votes.map((vote) => [vote.label, vote.count]), [["Ready", 3]]);
});

test("vote ties use summed distance and then alphabetical label deterministically", () => {
  const closerA = parseKnnDataset(`x,y,label
0,0,A
0,1,A
10,10,B
20,20,B`);
  assert.equal(classifyKnn(closerA, { x: 0, y: 0 }, 4).prediction, "A");

  const alphabetical = parseKnnDataset(`x,y,label
-1,0,B
1,0,A
0,-1,B
0,1,A`);
  assert.equal(classifyKnn(alphabetical, { x: 0, y: 0 }, 4).prediction, "A");
  assert.equal(classifyKnn(alphabetical, { x: 0, y: 0 }, 4).prediction, "A");
});

test("leave-one-out evaluation returns accuracy, predictions, and confusion counts", () => {
  const dataset = parseKnnDataset(DATA);
  const evaluation = calculateLeaveOneOut(dataset, 1);
  assert.equal(evaluation.total, dataset.rows.length);
  assert.equal(evaluation.predictions.length, dataset.rows.length);
  assert.ok(evaluation.accuracy >= 0 && evaluation.accuracy <= 1);
  const confusionTotal = evaluation.confusion.reduce(
    (total, row) => total + Object.values(row.counts).reduce((sum, count) => sum + count, 0),
    0
  );
  assert.equal(confusionTotal, dataset.rows.length);
});

test("leave-one-out caps k to the available training rows", () => {
  const dataset = parseKnnDataset(DATA);
  const evaluation = calculateLeaveOneOut(dataset, dataset.rows.length);
  assert.equal(evaluation.k, dataset.rows.length - 1);
});
