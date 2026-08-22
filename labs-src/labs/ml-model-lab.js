const MIN_ROWS = 3;
const MAX_ROWS = 40;
const MAX_LABEL_LENGTH = 32;
const MAX_LABELS = 8;

function splitCells(line) {
  return line.split(",").map((cell) => cell.trim());
}

export function parseKnnDataset(input) {
  if (typeof input !== "string" || !input.trim()) {
    throw new RangeError("Enter a header and at least three data rows.");
  }

  const lines = input.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  if (lines.length < MIN_ROWS + 1) {
    throw new RangeError(`Include a header and at least ${MIN_ROWS} data rows.`);
  }
  if (lines.length > MAX_ROWS + 1) {
    throw new RangeError(`Use ${MAX_ROWS} data rows or fewer.`);
  }
  if (lines.some((line) => line.includes('"'))) {
    throw new SyntaxError("Quoted cells are not supported; use plain values without commas.");
  }

  const headers = splitCells(lines[0]);
  if (headers.length !== 3 || headers.some((header) => !header)) {
    throw new SyntaxError("The header must contain two feature names and one label name.");
  }
  if (new Set(headers.map((header) => header.toLocaleLowerCase("en"))).size !== 3) {
    throw new SyntaxError("Header names must be unique.");
  }

  const rows = lines.slice(1).map((line, index) => {
    const cells = splitCells(line);
    if (cells.length !== 3) {
      throw new SyntaxError(`Row ${index + 2} must contain exactly three comma-separated values.`);
    }

    const x = Number(cells[0]);
    const y = Number(cells[1]);
    const label = cells[2];
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new TypeError(`Row ${index + 2} needs numeric values for both features.`);
    }
    if (!label) {
      throw new RangeError(`Row ${index + 2} needs a class label.`);
    }
    if (label.length > MAX_LABEL_LENGTH) {
      throw new RangeError(`Keep labels at ${MAX_LABEL_LENGTH} characters or fewer.`);
    }

    return { id: index + 1, x, y, label };
  });

  const labels = [...new Set(rows.map((row) => row.label))].sort((left, right) => left.localeCompare(right));
  if (labels.length < 2) {
    throw new RangeError("Include at least two different class labels.");
  }
  if (labels.length > MAX_LABELS) {
    throw new RangeError(`Use ${MAX_LABELS} class labels or fewer.`);
  }

  return {
    featureNames: headers.slice(0, 2),
    labelName: headers[2],
    rows,
    labels
  };
}

export function parseFiniteInput(value, fieldName) {
  if ((typeof value === "string" && !value.trim()) || value === null || value === undefined) {
    throw new RangeError(`${fieldName} is required.`);
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new TypeError(`${fieldName} must be a finite number.`);
  }
  return parsed;
}

export function calculateFeatureStats(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new RangeError("Feature statistics require at least one row.");
  }

  const means = {
    x: rows.reduce((sum, row) => sum + row.x, 0) / rows.length,
    y: rows.reduce((sum, row) => sum + row.y, 0) / rows.length
  };
  const standardDeviations = {
    x: Math.sqrt(rows.reduce((sum, row) => sum + (row.x - means.x) ** 2, 0) / rows.length),
    y: Math.sqrt(rows.reduce((sum, row) => sum + (row.y - means.y) ** 2, 0) / rows.length)
  };

  return {
    means,
    standardDeviations,
    scales: {
      x: standardDeviations.x || 1,
      y: standardDeviations.y || 1
    },
    constantFeatures: {
      x: standardDeviations.x === 0,
      y: standardDeviations.y === 0
    }
  };
}

export function standardizedDistance(row, query, stats) {
  const xDifference = (row.x - query.x) / stats.scales.x;
  const yDifference = (row.y - query.y) / stats.scales.y;
  return Math.hypot(xDifference, yDifference);
}

function validateK(k, rowCount) {
  if (!Number.isInteger(k) || k < 1 || k > rowCount) {
    throw new RangeError(`k must be a whole number from 1 to ${rowCount}.`);
  }
}

export function classifyKnn(dataset, query, k) {
  if (!dataset?.rows || !Array.isArray(dataset.rows) || dataset.rows.length === 0) {
    throw new RangeError("A parsed dataset is required.");
  }
  validateK(k, dataset.rows.length);
  const numericQuery = {
    x: parseFiniteInput(query?.x, dataset.featureNames?.[0] || "Feature x"),
    y: parseFiniteInput(query?.y, dataset.featureNames?.[1] || "Feature y")
  };
  const stats = calculateFeatureStats(dataset.rows);
  const distances = dataset.rows.map((row, index) => ({
    ...row,
    sourceIndex: index,
    distance: standardizedDistance(row, numericQuery, stats)
  })).sort((left, right) => left.distance - right.distance || left.sourceIndex - right.sourceIndex);
  const neighbours = distances.slice(0, k);

  const voteMap = new Map();
  neighbours.forEach((neighbour) => {
    const vote = voteMap.get(neighbour.label) || {
      label: neighbour.label,
      count: 0,
      distanceTotal: 0
    };
    vote.count += 1;
    vote.distanceTotal += neighbour.distance;
    voteMap.set(neighbour.label, vote);
  });
  const votes = [...voteMap.values()].sort((left, right) => (
    right.count - left.count
    || left.distanceTotal - right.distanceTotal
    || left.label.localeCompare(right.label)
  ));

  return {
    prediction: votes[0].label,
    query: numericQuery,
    k,
    stats,
    neighbours,
    distances,
    votes
  };
}

export function calculateLeaveOneOut(dataset, k) {
  if (!dataset?.rows || dataset.rows.length < MIN_ROWS) {
    throw new RangeError(`Leave-one-out evaluation needs at least ${MIN_ROWS} rows.`);
  }
  validateK(k, dataset.rows.length);
  const evaluationK = Math.min(k, dataset.rows.length - 1);
  const predictions = dataset.rows.map((heldOut, heldOutIndex) => {
    const trainingRows = dataset.rows.filter((_, index) => index !== heldOutIndex);
    const trainingDataset = { ...dataset, rows: trainingRows };
    const result = classifyKnn(trainingDataset, { x: heldOut.x, y: heldOut.y }, evaluationK);
    return {
      id: heldOut.id,
      actual: heldOut.label,
      predicted: result.prediction,
      correct: result.prediction === heldOut.label
    };
  });
  const correct = predictions.filter((prediction) => prediction.correct).length;
  const confusion = dataset.labels.map((actual) => ({
    actual,
    counts: Object.fromEntries(dataset.labels.map((predicted) => [
      predicted,
      predictions.filter((item) => item.actual === actual && item.predicted === predicted).length
    ]))
  }));

  return {
    k: evaluationK,
    correct,
    total: predictions.length,
    accuracy: correct / predictions.length,
    predictions,
    confusion
  };
}

export const knnLimits = Object.freeze({
  minRows: MIN_ROWS,
  maxRows: MAX_ROWS,
  maxLabels: MAX_LABELS
});
