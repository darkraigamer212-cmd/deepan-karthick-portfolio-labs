import React, { useMemo, useState } from "react";
import {
  CLAIM_EXAMPLE,
  CLAIM_RESET,
  csvClaimLimits,
  parseLocalCsv,
  stressTestCsvClaim
} from "./csv-claim-stress-tester.js";

function formatNumber(value) {
  if (value === Infinity) return "∞";
  if (value === -Infinity) return "−∞";
  if (!Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en", { maximumFractionDigits: 3 }).format(value);
}

function formatPercent(value) {
  return new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

function availableHeaders(csvText) {
  try {
    return parseLocalCsv(csvText).headers;
  } catch {
    return [];
  }
}

export default function CsvClaimStressTester() {
  const [form, setForm] = useState({ ...CLAIM_RESET });
  const [result, setResult] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const headers = useMemo(() => availableHeaders(form.csvText), [form.csvText]);
  const errors = result?.errors ?? {};

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setCopyStatus("");
  }

  function submit(event) {
    event.preventDefault();
    setResult(stressTestCsvClaim(form));
    setCopyStatus("");
  }

  function loadExample() {
    const example = { ...CLAIM_EXAMPLE };
    setForm(example);
    setResult(stressTestCsvClaim(example));
    setCopyStatus("");
  }

  function reset() {
    setForm({ ...CLAIM_RESET });
    setResult(null);
    setCopyStatus("");
  }

  async function copyRecipe() {
    if (!result?.valid || !navigator.clipboard) {
      setCopyStatus("Copy is unavailable. Select the recipe and copy it manually.");
      return;
    }
    try {
      await navigator.clipboard.writeText(result.pandasRecipe);
      setCopyStatus("Pandas verification recipe copied.");
    } catch {
      setCopyStatus("Copy failed. Select the recipe and copy it manually.");
    }
  }

  return (
    <section className="lab19-claim-tester" aria-labelledby="lab19-title">
      <header className="lab19-heading">
        <div>
          <h2 id="lab19-title">CSV Claim Stress Tester</h2>
          <p>Challenge one claimed business insight against quality problems, outliers, and inconsistent time slices.</p>
        </div>
        <p className="lab19-limit">
          Deterministic local analysis only—no upload, network, or AI. Association does not prove causation,
          and this result does not replace statistical or domain review.
        </p>
      </header>

      <form className="lab19-controls" onSubmit={submit} noValidate>
        <label htmlFor="lab19-csv">
          Pasted CSV
          <textarea
            id="lab19-csv"
            name="csvText"
            rows="14"
            value={form.csvText}
            onChange={update}
            spellCheck="false"
            aria-invalid={Boolean(errors.csvText)}
            aria-describedby="lab19-csv-help lab19-csv-error"
            placeholder={"period,segment,outcome\nQ1,A,12\nQ1,B,9"}
          />
          <small id="lab19-csv-help">Maximum {csvClaimLimits.maxRows} rows and {csvClaimLimits.maxColumns} columns. Quoted commas and escaped quotes are supported.</small>
          {errors.csvText && <small id="lab19-csv-error" role="alert">{errors.csvText}</small>}
        </label>

        <label htmlFor="lab19-outcome">
          Numeric outcome column
          <select id="lab19-outcome" name="outcomeColumn" value={form.outcomeColumn} onChange={update} aria-invalid={Boolean(errors.outcomeColumn)}>
            <option value="">Choose a column</option>
            {headers.map((header) => <option value={header} key={header}>{header}</option>)}
          </select>
          {errors.outcomeColumn && <small role="alert">{errors.outcomeColumn}</small>}
        </label>

        <label htmlFor="lab19-group">
          Group column
          <select id="lab19-group" name="groupColumn" value={form.groupColumn} onChange={update} aria-invalid={Boolean(errors.groupColumn)}>
            <option value="">Choose a column</option>
            {headers.map((header) => <option value={header} key={header}>{header}</option>)}
          </select>
          {errors.groupColumn && <small role="alert">{errors.groupColumn}</small>}
        </label>

        <label htmlFor="lab19-time">
          Time-slice column (optional)
          <select id="lab19-time" name="timeColumn" value={form.timeColumn} onChange={update} aria-invalid={Boolean(errors.timeColumn)}>
            <option value="">Do not test time consistency</option>
            {headers.map((header) => <option value={header} key={header}>{header}</option>)}
          </select>
          {errors.timeColumn && <small role="alert">{errors.timeColumn}</small>}
        </label>

        <label htmlFor="lab19-claim">
          Plain-language claim
          <textarea id="lab19-claim" name="claim" rows="3" maxLength="300" value={form.claim} onChange={update} aria-invalid={Boolean(errors.claim)} placeholder="Premium customers have higher order value than Standard customers." />
          <small>Mention two exact group values and one direction word such as higher or lower.</small>
          {errors.claim && <small role="alert">{errors.claim}</small>}
        </label>

        <div className="lab19-actions">
          <button type="submit">Stress-test the claim</button>
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {result && !result.valid && (
        <div className="lab19-errors" role="alert" aria-live="assertive">
          <h3>Fix the analysis brief</h3>
          <ul>{Object.values(result.errors).map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}

      {result?.valid && (
        <div className="lab19-results" aria-live="polite">
          <section className={`lab19-verdict lab19-verdict-${result.verdict.toLocaleLowerCase("en")}`} aria-labelledby="lab19-verdict-title">
            <h3 id="lab19-verdict-title">Verdict: <output>{result.verdict}</output></h3>
            <p>{result.verdictReason}</p>
          </section>

          <section aria-labelledby="lab19-quality-title">
            <h3 id="lab19-quality-title">Data-quality gate</h3>
            <dl>
              <div><dt>Total rows</dt><dd>{result.quality.totalRows}</dd></div>
              <div><dt>Usable rows</dt><dd>{result.quality.usableRows} ({formatPercent(result.quality.usableRate)})</dd></div>
              <div><dt>Missing outcomes</dt><dd>{result.quality.missingOutcome}</dd></div>
              <div><dt>Invalid numeric outcomes</dt><dd>{result.quality.invalidOutcome}</dd></div>
              <div><dt>Missing groups</dt><dd>{result.quality.missingGroup}</dd></div>
              {form.timeColumn && <div><dt>Missing time values</dt><dd>{result.quality.missingTime}</dd></div>}
            </dl>
            {result.warnings.length > 0 && <><h4>Warnings</h4><ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></>}
          </section>

          <section aria-labelledby="lab19-comparison-title">
            <h3 id="lab19-comparison-title">Baseline and outlier sensitivity</h3>
            <div className="lab19-table-wrap"><table>
              <caption>Means before and after per-group IQR outlier trimming</caption>
              <thead><tr><th scope="col">Comparison</th><th scope="col">{result.claim.focusGroup}</th><th scope="col">{result.claim.comparisonGroup}</th><th scope="col">Difference</th><th scope="col">Supports claim?</th></tr></thead>
              <tbody>
                <tr><th scope="row">All usable rows</th><td>{formatNumber(result.baseline.focus.mean)} (n={result.baseline.focus.n})</td><td>{formatNumber(result.baseline.comparison.mean)} (n={result.baseline.comparison.n})</td><td>{formatNumber(result.baseline.difference)}</td><td>{result.baseline.supports ? "Yes" : "No"}</td></tr>
                <tr><th scope="row">IQR-trimmed</th><td>{formatNumber(result.trimmed.focus.mean)} (n={result.trimmed.focus.n})</td><td>{formatNumber(result.trimmed.comparison.mean)} (n={result.trimmed.comparison.n})</td><td>{formatNumber(result.trimmed.difference)}</td><td>{result.trimmed.supports ? "Yes" : "No"}</td></tr>
              </tbody>
            </table></div>
            <p>{result.trimmed.removed} outlier(s) removed in sensitivity analysis. Standardized gap: {formatNumber(result.baseline.standardizedDifference)}.</p>
          </section>

          {form.timeColumn && (
            <section aria-labelledby="lab19-slices-title">
              <h3 id="lab19-slices-title">Time-slice consistency</h3>
              <p>{result.sliceConsistency.evaluable} slice(s) evaluable; {result.sliceConsistency.supporting} support the claim.</p>
              <div className="lab19-table-wrap"><table>
                <caption>Claim direction inside each available time slice</caption>
                <thead><tr><th scope="col">Time</th><th scope="col">Group sizes</th><th scope="col">Mean difference</th><th scope="col">Result</th></tr></thead>
                <tbody>{result.slices.map((slice) => (
                  <tr key={slice.time}><th scope="row">{slice.time}</th><td>{slice.focusN ?? slice.focus.n} / {slice.comparisonN ?? slice.comparison.n}</td><td>{slice.evaluable ? formatNumber(slice.difference) : "Not evaluable"}</td><td>{slice.evaluable ? (slice.supports ? "Supports" : "Contradicts") : "Needs 2 rows per group"}</td></tr>
                ))}</tbody>
              </table></div>
            </section>
          )}

          <section aria-labelledby="lab19-recipe-title">
            <h3 id="lab19-recipe-title">Reproduce in pandas</h3>
            <p>Save the same data as <code>claim_data.csv</code>, review the generated recipe, and run it in your own Python environment.</p>
            <label htmlFor="lab19-recipe">Pandas verification recipe</label>
            <textarea id="lab19-recipe" rows="24" readOnly value={result.pandasRecipe} onFocus={(event) => event.target.select()} />
            <button type="button" onClick={copyRecipe}>Copy pandas recipe</button>
            <p role="status" aria-live="polite">{copyStatus}</p>
          </section>
        </div>
      )}
    </section>
  );
}
