const MAX_CHARACTERS = 100_000;
const MAX_ROWS = 200;
const MAX_COLUMNS = 20;
const MAX_CELL_LENGTH = 2_000;
const MAX_GROUPS = 12;

export const CLAIM_EXAMPLE = Object.freeze({
  csvText: `quarter,tier,order_value
Q1,Standard,80
Q1,Standard,85
Q1,Standard,90
Q1,Premium,112
Q1,Premium,118
Q1,Premium,124
Q2,Standard,88
Q2,Standard,92
Q2,Standard,96
Q2,Premium,121
Q2,Premium,127
Q2,Premium,133
Q3,Standard,91
Q3,Standard,95
Q3,Standard,101
Q3,Premium,128
Q3,Premium,136
Q3,Premium,142
Q4,Standard,97
Q4,Standard,103
Q4,Standard,160
Q4,Premium,138
Q4,Premium,145
Q4,Premium,151`,
  outcomeColumn: "order_value",
  groupColumn: "tier",
  timeColumn: "quarter",
  claim: "Premium customers have higher order value than Standard customers."
});

export const CLAIM_RESET = Object.freeze({
  csvText: "",
  outcomeColumn: "",
  groupColumn: "",
  timeColumn: "",
  claim: ""
});

function finalizeRow(rows, row, field) {
  const completed = [...row, field];
  if (completed.some((cell) => cell.trim() !== "")) rows.push(completed);
}

/** A bounded RFC-4180-style parser supporting quoted commas, newlines, and escaped quotes. */
export function parseLocalCsv(input) {
  if (typeof input !== "string" || !input.trim()) throw new RangeError("Paste CSV data to begin.");
  if (input.length > MAX_CHARACTERS) throw new RangeError(`Keep CSV input under ${MAX_CHARACTERS.toLocaleString("en")} characters.`);

  const text = input.replace(/^\uFEFF/u, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let closedQuote = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (inQuotes) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        inQuotes = false;
        closedQuote = true;
      } else {
        field += character;
      }
    } else if (closedQuote) {
      if (character === ",") {
        row.push(field);
        field = "";
        closedQuote = false;
      } else if (character === "\n") {
        finalizeRow(rows, row, field);
        row = [];
        field = "";
        closedQuote = false;
      } else if (!["\r", " ", "\t"].includes(character)) {
        throw new SyntaxError("CSV has unexpected text after a closing quote.");
      }
    } else if (character === '"' && field === "") {
      inQuotes = true;
    } else if (character === '"') {
      throw new SyntaxError("CSV has an unexpected quote inside an unquoted field.");
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      finalizeRow(rows, row, field);
      row = [];
      field = "";
    } else if (character !== "\r") {
      field += character;
    }
    if (field.length > MAX_CELL_LENGTH) throw new RangeError(`Keep every CSV cell under ${MAX_CELL_LENGTH.toLocaleString("en")} characters.`);
  }
  if (inQuotes) throw new SyntaxError("CSV contains an unclosed quoted field.");
  finalizeRow(rows, row, field);

  if (rows.length < 3) throw new RangeError("Include a header and at least two data rows.");
  if (rows.length - 1 > MAX_ROWS) throw new RangeError(`Use ${MAX_ROWS} data rows or fewer.`);
  const headers = rows[0].map((header) => header.trim());
  if (headers.length < 2 || headers.length > MAX_COLUMNS) throw new RangeError(`Use between 2 and ${MAX_COLUMNS} columns.`);
  if (headers.some((header) => !header)) throw new SyntaxError("Every CSV column needs a header.");
  if (new Set(headers.map((header) => header.toLocaleLowerCase("en"))).size !== headers.length) {
    throw new SyntaxError("CSV headers must be unique, ignoring letter case.");
  }

  const records = rows.slice(1).map((cells, index) => {
    if (cells.length !== headers.length) {
      throw new SyntaxError(`Data row ${index + 2} has ${cells.length} cells; expected ${headers.length}.`);
    }
    return Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex].trim()]));
  });
  return { headers, records, rowCount: records.length };
}

function normalize(value) {
  return String(value).trim().toLocaleLowerCase("en");
}

function findExactGroupMention(normalizedClaim, group) {
  const escaped = normalize(group).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = normalizedClaim.match(new RegExp(`(?:^|[^a-z0-9])(${escaped})(?=$|[^a-z0-9])`, "u"));
  return match ? match.index + match[0].indexOf(match[1]) : -1;
}

export function interpretPlainLanguageClaim(claim, groupValues) {
  const statement = String(claim ?? "").trim();
  if (statement.length < 15) throw new RangeError("Write a plain-language claim of at least 15 characters.");
  if (statement.length > 300) throw new RangeError("Keep the claim at 300 characters or fewer.");
  const normalizedClaim = normalize(statement);
  const mentions = groupValues.map((group) => ({
    group,
    index: findExactGroupMention(normalizedClaim, group)
  })).filter((mention) => mention.index >= 0).sort((left, right) => left.index - right.index);
  if (mentions.length < 2) {
    throw new RangeError("Mention two exact group values in the claim so the comparison is testable.");
  }

  const higherWords = ["higher", "more", "greater", "above", "outperform", "larger"];
  const lowerWords = ["lower", "less", "fewer", "below", "smaller"];
  const saysHigher = higherWords.some((word) => normalizedClaim.includes(word));
  const saysLower = lowerWords.some((word) => normalizedClaim.includes(word));
  if (saysHigher === saysLower) {
    throw new RangeError("Use one clear comparison word such as higher or lower in the claim.");
  }

  return {
    statement,
    focusGroup: mentions[0].group,
    comparisonGroup: mentions[1].group,
    direction: saysHigher ? "higher" : "lower",
    expectedSign: saysHigher ? 1 : -1
  };
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function quantile(sorted, fraction) {
  if (sorted.length === 1) return sorted[0];
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const weight = position - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function trimIqrOutliers(values) {
  if (!Array.isArray(values) || values.length < 4) return { values: [...values], removed: 0, lower: null, upper: null };
  const sorted = [...values].sort((left, right) => left - right);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  const trimmed = values.filter((value) => value >= lower && value <= upper);
  return { values: trimmed.length ? trimmed : [...values], removed: values.length - trimmed.length, lower, upper };
}

function variance(values, average) {
  return values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
}

function comparison(focusValues, comparisonValues, expectedSign) {
  const focusMean = mean(focusValues);
  const comparisonMean = mean(comparisonValues);
  const difference = focusMean - comparisonMean;
  const pooledDeviation = Math.sqrt((variance(focusValues, focusMean) + variance(comparisonValues, comparisonMean)) / 2);
  return {
    focus: { n: focusValues.length, mean: focusMean, median: median(focusValues) },
    comparison: { n: comparisonValues.length, mean: comparisonMean, median: median(comparisonValues) },
    difference,
    supports: Math.sign(difference) === expectedSign,
    standardizedDifference: pooledDeviation === 0 ? (difference === 0 ? 0 : Infinity) : Math.abs(difference) / pooledDeviation
  };
}

function buildPandasRecipe(config, claim, result) {
  const py = (value) => JSON.stringify(String(value));
  const claimComment = claim.statement.replace(/[\r\n]+/gu, " ").replace(/#/gu, "number");
  const timeSetup = config.timeColumn
    ? `time_col = ${py(config.timeColumn)}\n`
    : "time_col = None\n";
  return `# CSV Claim Stress Tester verification recipe
# Claim: ${claimComment}
import pandas as pd

df = pd.read_csv("claim_data.csv")
outcome = ${py(config.outcomeColumn)}
group = ${py(config.groupColumn)}
focus = ${py(claim.focusGroup)}
comparison = ${py(claim.comparisonGroup)}
${timeSetup}
df["_outcome"] = pd.to_numeric(df[outcome], errors="coerce")
clean = df.dropna(subset=["_outcome", group]).copy()
pair = clean[clean[group].isin([focus, comparison])]

baseline = pair.groupby(group)["_outcome"].agg(["count", "mean", "median"])
print("Baseline comparison")
print(baseline)
print("Mean difference (focus - comparison):", baseline.loc[focus, "mean"] - baseline.loc[comparison, "mean"])

def trim_iqr(series):
    q1, q3 = series.quantile([0.25, 0.75])
    iqr = q3 - q1
    return series[series.between(q1 - 1.5 * iqr, q3 + 1.5 * iqr)]

trimmed = pair.groupby(group)["_outcome"].apply(trim_iqr).reset_index(level=0)
print("IQR-trimmed means")
print(trimmed.groupby(group)["_outcome"].agg(["count", "mean"]))

if time_col:
    slices = pair.dropna(subset=[time_col]).groupby([time_col, group])["_outcome"].agg(["count", "mean"])
    print("Time-slice consistency")
    print(slices)

print("Local tester verdict:", ${py(result.verdict)})
# Inspect rows and assumptions before using this result for a business decision.
`;
}

export function stressTestCsvClaim(config) {
  const errors = {};
  let dataset;
  try {
    dataset = parseLocalCsv(config?.csvText);
  } catch (error) {
    return { valid: false, errors: { csvText: error.message } };
  }

  for (const field of ["outcomeColumn", "groupColumn"]) {
    if (!dataset.headers.includes(config?.[field])) errors[field] = `Choose an existing ${field === "outcomeColumn" ? "outcome" : "group"} column.`;
  }
  if (config?.outcomeColumn && config?.outcomeColumn === config?.groupColumn) errors.groupColumn = "Outcome and group columns must be different.";
  if (config?.timeColumn && !dataset.headers.includes(config.timeColumn)) errors.timeColumn = "Choose an existing time column or leave it blank.";
  if (config?.timeColumn && [config.outcomeColumn, config.groupColumn].includes(config.timeColumn)) errors.timeColumn = "Time must use a different column.";
  if (Object.keys(errors).length) return { valid: false, errors, dataset };

  const outcome = config.outcomeColumn;
  const group = config.groupColumn;
  const quality = {
    totalRows: dataset.rowCount,
    missingOutcome: 0,
    invalidOutcome: 0,
    missingGroup: 0,
    missingTime: 0
  };
  const usableRows = [];
  dataset.records.forEach((record, index) => {
    const rawOutcome = record[outcome];
    const numericOutcome = Number(rawOutcome);
    if (!rawOutcome) quality.missingOutcome += 1;
    else if (!Number.isFinite(numericOutcome)) quality.invalidOutcome += 1;
    if (!record[group]) quality.missingGroup += 1;
    if (config.timeColumn && !record[config.timeColumn]) quality.missingTime += 1;
    if (rawOutcome && Number.isFinite(numericOutcome) && record[group]) {
      usableRows.push({ index: index + 2, value: numericOutcome, group: record[group], time: config.timeColumn ? record[config.timeColumn] : "" });
    }
  });
  quality.usableRows = usableRows.length;
  quality.usableRate = usableRows.length / dataset.rowCount;

  const groupValues = [...new Set(usableRows.map((row) => row.group))].sort((left, right) => left.localeCompare(right));
  if (groupValues.length < 2) errors.groupColumn = "The usable data needs at least two group values.";
  if (groupValues.length > MAX_GROUPS) errors.groupColumn = `Use ${MAX_GROUPS} group values or fewer.`;
  let claim;
  try {
    claim = interpretPlainLanguageClaim(config.claim, groupValues);
  } catch (error) {
    errors.claim = error.message;
  }
  if (Object.keys(errors).length) return { valid: false, errors, dataset, quality };

  const focusRows = usableRows.filter((row) => row.group === claim.focusGroup);
  const comparisonRows = usableRows.filter((row) => row.group === claim.comparisonGroup);
  if (focusRows.length < 2 || comparisonRows.length < 2) {
    return { valid: false, errors: { claim: "Each claimed group needs at least two usable numeric rows." }, dataset, quality };
  }

  const focusValues = focusRows.map((row) => row.value);
  const comparisonValues = comparisonRows.map((row) => row.value);
  const baseline = comparison(focusValues, comparisonValues, claim.expectedSign);
  const focusTrim = trimIqrOutliers(focusValues);
  const comparisonTrim = trimIqrOutliers(comparisonValues);
  const trimmed = {
    ...comparison(focusTrim.values, comparisonTrim.values, claim.expectedSign),
    removed: focusTrim.removed + comparisonTrim.removed,
    focusRemoved: focusTrim.removed,
    comparisonRemoved: comparisonTrim.removed
  };

  const warnings = [];
  const missingOrInvalid = quality.missingOutcome + quality.invalidOutcome + quality.missingGroup;
  if (missingOrInvalid > 0) warnings.push(`${missingOrInvalid} row issue(s) affect outcome or group usability.`);
  if (config.timeColumn && quality.missingTime > 0) warnings.push(`${quality.missingTime} row(s) lack a time value and are excluded from slice checks.`);
  if (quality.usableRate < 0.9) warnings.push(`Only ${(quality.usableRate * 100).toFixed(1)}% of rows are usable.`);
  if (Math.min(focusRows.length, comparisonRows.length) < 5) warnings.push("At least one claimed group has fewer than five usable rows.");
  if (baseline.standardizedDifference < 0.2) warnings.push("The observed mean gap is small relative to within-group variation.");
  if (trimmed.removed > 0) warnings.push(`${trimmed.removed} IQR outlier(s) were removed for sensitivity analysis.`);

  let slices = [];
  let sliceConsistency = null;
  if (config.timeColumn) {
    const times = [...new Set(usableRows.map((row) => row.time).filter(Boolean))].sort((left, right) => left.localeCompare(right));
    if (times.length > 12) warnings.push("Only the first 12 sorted time slices were evaluated.");
    slices = times.slice(0, 12).map((time) => {
      const focus = focusRows.filter((row) => row.time === time).map((row) => row.value);
      const comparisonValuesForTime = comparisonRows.filter((row) => row.time === time).map((row) => row.value);
      if (focus.length < 2 || comparisonValuesForTime.length < 2) {
        return { time, evaluable: false, focusN: focus.length, comparisonN: comparisonValuesForTime.length };
      }
      const result = comparison(focus, comparisonValuesForTime, claim.expectedSign);
      return { time, evaluable: true, ...result };
    });
    const evaluable = slices.filter((slice) => slice.evaluable);
    sliceConsistency = {
      evaluable: evaluable.length,
      supporting: evaluable.filter((slice) => slice.supports).length,
      rate: evaluable.length ? evaluable.filter((slice) => slice.supports).length / evaluable.length : null
    };
    if (sliceConsistency.evaluable < 2) warnings.push("Fewer than two time slices have at least two rows per claimed group.");
    else if (sliceConsistency.rate < 0.75) warnings.push(`Only ${(sliceConsistency.rate * 100).toFixed(1)}% of evaluable time slices support the claim.`);
  } else {
    warnings.push("No time column selected; time-slice consistency was not tested.");
  }

  const fragilityReasons = [];
  if (quality.usableRate < 0.9) fragilityReasons.push("data-quality exclusions exceed 10%");
  if (config.timeColumn && quality.missingTime / quality.totalRows > 0.1) fragilityReasons.push("more than 10% of rows lack a time-slice value");
  if (Math.min(focusRows.length, comparisonRows.length) < 5) fragilityReasons.push("a claimed group has fewer than five rows");
  if (!trimmed.supports) fragilityReasons.push("the direction reverses after IQR outlier trimming");
  if (baseline.standardizedDifference < 0.2) fragilityReasons.push("the gap is small relative to within-group variation");
  if (config.timeColumn && (sliceConsistency.evaluable < 2 || sliceConsistency.rate < 0.75)) fragilityReasons.push("time-slice evidence is insufficient or inconsistent");

  const verdict = !baseline.supports ? "Reject" : fragilityReasons.length ? "Fragile" : "Support";
  const verdictReason = verdict === "Reject"
    ? `The observed mean difference runs against the claim that ${claim.focusGroup} is ${claim.direction} than ${claim.comparisonGroup}.`
    : verdict === "Fragile"
      ? `The baseline supports the claim, but ${fragilityReasons.join("; ")}.`
      : "The baseline direction survives quality, sample-size, outlier, and available time-slice checks.";

  const result = {
    valid: true,
    errors: {},
    dataset: { headers: dataset.headers, rowCount: dataset.rowCount },
    quality,
    claim,
    baseline,
    trimmed,
    slices,
    sliceConsistency,
    warnings,
    verdict,
    verdictReason
  };
  result.pandasRecipe = buildPandasRecipe(config, claim, result);
  return result;
}

export const csvClaimLimits = Object.freeze({
  maxCharacters: MAX_CHARACTERS,
  maxRows: MAX_ROWS,
  maxColumns: MAX_COLUMNS,
  maxGroups: MAX_GROUPS
});
