import React, { useMemo, useState } from "react";
import {
  calculateLeaveOneOut,
  classifyKnn,
  knnLimits,
  parseFiniteInput,
  parseKnnDataset
} from "./ml-model-lab.js";

const EXAMPLE_DATA = `study_hours,practice_score,outcome
2,34,Developing
3,43,Developing
4,51,Developing
5,61,Developing
6,70,Ready
7,76,Ready
8,84,Ready
9,91,Ready`;

const EXAMPLE_QUERY = { x: "6.5", y: "74" };

function formatNumber(value) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 3 }).format(value);
}

function formatPercent(value) {
  return new Intl.NumberFormat("en", {
    style: "percent",
    maximumFractionDigits: 1
  }).format(value);
}

function getAnalysis(datasetText, queryX, queryY, k) {
  try {
    const dataset = parseKnnDataset(datasetText);
    const query = {
      x: parseFiniteInput(queryX, dataset.featureNames[0]),
      y: parseFiniteInput(queryY, dataset.featureNames[1])
    };
    const numericK = Number(k);
    const classification = classifyKnn(dataset, query, numericK);
    const evaluation = calculateLeaveOneOut(dataset, numericK);
    return { dataset, classification, evaluation, error: "" };
  } catch (error) {
    return { dataset: null, classification: null, evaluation: null, error: error.message };
  }
}

export default function MlModelLab() {
  const [datasetText, setDatasetText] = useState(EXAMPLE_DATA);
  const [queryX, setQueryX] = useState(EXAMPLE_QUERY.x);
  const [queryY, setQueryY] = useState(EXAMPLE_QUERY.y);
  const [k, setK] = useState("3");
  const analysis = useMemo(
    () => getAnalysis(datasetText, queryX, queryY, k),
    [datasetText, k, queryX, queryY]
  );

  function loadExample() {
    setDatasetText(EXAMPLE_DATA);
    setQueryX(EXAMPLE_QUERY.x);
    setQueryY(EXAMPLE_QUERY.y);
    setK("3");
  }

  function reset() {
    setDatasetText("");
    setQueryX("");
    setQueryY("");
    setK("3");
  }

  const featureNames = analysis.dataset?.featureNames || ["Feature x", "Feature y"];

  return (
    <section className="lab10-knn" aria-labelledby="lab10-title">
      <header className="lab10-heading">
        <div>
          <h2 id="lab10-title">ML Model Lab</h2>
          <p>
            Explore how k-nearest-neighbours classifies a new point from two numeric features.
          </p>
        </div>
        <p className="lab10-model-note">
          Educational local simulation — not a trained production ML model or decision system.
        </p>
      </header>

      <form className="lab10-controls" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="lab10-dataset">
          Training data
          <textarea
            id="lab10-dataset"
            value={datasetText}
            onChange={(event) => setDatasetText(event.target.value)}
            rows="10"
            spellCheck="false"
            aria-describedby="lab10-data-help lab10-validation"
            placeholder={"feature_one,feature_two,label\n1,2,Class A\n3,4,Class B"}
          />
        </label>
        <p id="lab10-data-help" className="lab10-help">
          First row: two feature names and a label name. Then add {knnLimits.minRows}–{knnLimits.maxRows}
          {" "}comma-separated rows. Quoted or comma-containing cells are not supported.
        </p>

        <fieldset>
          <legend>Query point and neighbour count</legend>
          <label htmlFor="lab10-query-x">
            {featureNames[0]}
            <input
              id="lab10-query-x"
              type="number"
              step="any"
              value={queryX}
              onChange={(event) => setQueryX(event.target.value)}
              aria-describedby="lab10-validation"
            />
          </label>
          <label htmlFor="lab10-query-y">
            {featureNames[1]}
            <input
              id="lab10-query-y"
              type="number"
              step="any"
              value={queryY}
              onChange={(event) => setQueryY(event.target.value)}
              aria-describedby="lab10-validation"
            />
          </label>
          <label htmlFor="lab10-k">
            k neighbours
            <input
              id="lab10-k"
              type="number"
              min="1"
              max={analysis.dataset?.rows.length || knnLimits.maxRows}
              step="1"
              value={k}
              onChange={(event) => setK(event.target.value)}
              aria-describedby="lab10-k-help lab10-validation"
            />
          </label>
          <p id="lab10-k-help" className="lab10-help">Use a whole number no larger than the row count.</p>
        </fieldset>

        <div className="lab10-actions">
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      <p
        id="lab10-validation"
        className="lab10-validation"
        role={analysis.error ? "alert" : "status"}
        aria-live="polite"
      >
        {analysis.error || `${analysis.dataset.rows.length} rows ready. Results update as you type.`}
      </p>

      {!analysis.error && (
        <div className="lab10-results">
          <section className="lab10-prediction" aria-labelledby="lab10-prediction-title">
            <h3 id="lab10-prediction-title">Prediction</h3>
            <p>
              Predicted <strong>{analysis.dataset.labelName}</strong>:{" "}
              <output>{analysis.classification.prediction}</output>
            </p>
            <p>
              The {analysis.classification.k} nearest standardized points vote. Ties are resolved by
              lowest summed distance, then label alphabetically.
            </p>
          </section>

          <section aria-labelledby="lab10-neighbours-title">
            <h3 id="lab10-neighbours-title">Nearest neighbours</h3>
            <div className="lab10-table-wrap">
              <table>
                <caption>Distance-ranked neighbours used in this prediction</caption>
                <thead>
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">{analysis.dataset.featureNames[0]}</th>
                    <th scope="col">{analysis.dataset.featureNames[1]}</th>
                    <th scope="col">{analysis.dataset.labelName}</th>
                    <th scope="col">Standardized distance</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.classification.neighbours.map((neighbour, index) => (
                    <tr key={neighbour.id}>
                      <td>{index + 1}</td>
                      <td>{formatNumber(neighbour.x)}</td>
                      <td>{formatNumber(neighbour.y)}</td>
                      <th scope="row">{neighbour.label}</th>
                      <td>{formatNumber(neighbour.distance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="lab10-votes-title">
            <h3 id="lab10-votes-title">Vote summary</h3>
            <ul className="lab10-votes">
              {analysis.classification.votes.map((vote) => (
                <li key={vote.label}>
                  <strong>{vote.label}</strong>: {vote.count} vote{vote.count === 1 ? "" : "s"},
                  {" "}distance total {formatNumber(vote.distanceTotal)}
                </li>
              ))}
            </ul>
          </section>

          <details className="lab10-method">
            <summary>How distance is calculated</summary>
            <p>
              Each feature is standardized with the training-data mean and population standard
              deviation before Euclidean distance is calculated. This keeps a large-number feature
              from dominating only because of its units. A constant feature uses scale 1 and adds no
              relative separation.
            </p>
            <dl>
              <div>
                <dt>{analysis.dataset.featureNames[0]}</dt>
                <dd>
                  Mean {formatNumber(analysis.classification.stats.means.x)}; standard deviation{" "}
                  {formatNumber(analysis.classification.stats.standardDeviations.x)}
                </dd>
              </div>
              <div>
                <dt>{analysis.dataset.featureNames[1]}</dt>
                <dd>
                  Mean {formatNumber(analysis.classification.stats.means.y)}; standard deviation{" "}
                  {formatNumber(analysis.classification.stats.standardDeviations.y)}
                </dd>
              </div>
            </dl>
          </details>

          <section aria-labelledby="lab10-evaluation-title">
            <h3 id="lab10-evaluation-title">Leave-one-out check</h3>
            <p>
              Correctly classified {analysis.evaluation.correct} of {analysis.evaluation.total} rows
              {" "}({formatPercent(analysis.evaluation.accuracy)}) using k={analysis.evaluation.k}.
              This is a learning diagnostic, not proof of real-world model quality.
            </p>
            <div className="lab10-table-wrap">
              <table>
                <caption>Confusion summary: actual labels by predicted labels</caption>
                <thead>
                  <tr>
                    <th scope="col">Actual \ Predicted</th>
                    {analysis.dataset.labels.map((label) => <th scope="col" key={label}>{label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {analysis.evaluation.confusion.map((row) => (
                    <tr key={row.actual}>
                      <th scope="row">{row.actual}</th>
                      {analysis.dataset.labels.map((label) => <td key={label}>{row.counts[label]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
