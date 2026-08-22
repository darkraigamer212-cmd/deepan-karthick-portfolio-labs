import React, { useMemo, useState } from "react";
import {
  attentionLimits,
  calculateAttention,
  tokenizeSequence,
  validateAttentionInput
} from "./attention-text-explorer.js";

const EXAMPLE_TEXT = "The curious robot studies language patterns carefully";
const EXAMPLE_FOCUS = "language";

function formatPercent(value) {
  return new Intl.NumberFormat("en", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

function formatScore(value) {
  return value.toFixed(3);
}

function scoreAriaLabel(row) {
  return `${row.token}, attention weight ${formatPercent(row.weight)}`;
}

export default function AttentionTextExplorer() {
  const [sequence, setSequence] = useState(EXAMPLE_TEXT);
  const [focusToken, setFocusToken] = useState(EXAMPLE_FOCUS);
  const tokens = useMemo(() => tokenizeSequence(sequence), [sequence]);
  const validationMessage = validateAttentionInput(tokens, focusToken);
  const result = useMemo(() => {
    if (validationMessage) return null;
    return calculateAttention(tokens, focusToken);
  }, [focusToken, tokens, validationMessage]);

  function loadExample() {
    setSequence(EXAMPLE_TEXT);
    setFocusToken(EXAMPLE_FOCUS);
  }

  function reset() {
    setSequence("");
    setFocusToken("");
  }

  return (
    <section className="lab05-attention" aria-labelledby="lab05-title">
      <div className="lab05-heading">
        <div>
          <h2 id="lab05-title">Attention Text Explorer</h2>
          <p>
            Compare how strongly each token relates to one focus token using a small,
            deterministic scaled dot-product-style simulation.
          </p>
        </div>
        <p className="lab05-model-note">
          Educational attention visualization — not a language model and not generated AI output.
        </p>
      </div>

      <form className="lab05-controls" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="lab05-sequence">
          Token sequence
          <textarea
            id="lab05-sequence"
            value={sequence}
            onChange={(event) => setSequence(event.target.value)}
            rows="3"
            aria-describedby="lab05-sequence-help lab05-validation"
            placeholder="Enter a short sentence"
          />
        </label>
        <p id="lab05-sequence-help" className="lab05-help">
          Separate tokens with spaces. Maximum {attentionLimits.maxTokens} tokens.
        </p>

        <label htmlFor="lab05-focus">
          Focus token
          <input
            id="lab05-focus"
            type="text"
            list="lab05-token-options"
            value={focusToken}
            maxLength={attentionLimits.maxTokenLength}
            onChange={(event) => setFocusToken(event.target.value)}
            aria-describedby="lab05-focus-help lab05-validation"
            placeholder="Choose or type a token"
          />
        </label>
        <datalist id="lab05-token-options">
          {tokens.map((token, index) => <option value={token} key={`${token}-${index}`} />)}
        </datalist>
        <p id="lab05-focus-help" className="lab05-help">
          Choose a sequence token or type a new query. A new query is anchored at the sequence centre.
        </p>

        <div className="lab05-actions">
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      <p
        id="lab05-validation"
        className="lab05-validation"
        role={validationMessage ? "alert" : "status"}
        aria-live="polite"
      >
        {validationMessage || `${tokens.length} tokens ready. Weights update as you type.`}
      </p>

      {result && (
        <div className="lab05-results">
          <section aria-labelledby="lab05-heat-title">
            <h3 id="lab05-heat-title">Attention across the sequence</h3>
            <div className="lab05-heat-sequence" role="list" aria-label="Attention heat sequence">
              {result.rows.map((row) => (
                <span
                  role="listitem"
                  className="lab05-heat-token"
                  key={`${row.token}-${row.index}`}
                  style={{ "--attention-strength": Math.max(0.12, row.weight / result.topWeight) }}
                  aria-label={scoreAriaLabel(row)}
                  title={`${row.token}: ${formatPercent(row.weight)}`}
                >
                  <strong>{row.token}</strong>
                  <small>{formatPercent(row.weight)}</small>
                </span>
              ))}
            </div>
          </section>

          <section className="lab05-summary" aria-labelledby="lab05-summary-title">
            <h3 id="lab05-summary-title">What this result means</h3>
            <p>
              With <strong>{result.focusToken}</strong> as the query, <strong>{result.topToken}</strong>
              {" "}receives the most attention at {formatPercent(result.topWeight)}. Tokens score higher
              when their simple features are similar to the focus and when they are nearer its position.
            </p>
            {!result.focusInSequence && (
              <p>The typed focus is not in the sequence, so its position bias uses the centre token.</p>
            )}
          </section>

          <section aria-labelledby="lab05-ranking-title">
            <h3 id="lab05-ranking-title">Ranked weights</h3>
            <ol className="lab05-ranking">
              {result.ranked.map((row) => (
                <li key={`${row.token}-${row.index}`}>
                  <span>{row.token}</span>
                  <meter min="0" max="1" value={row.weight}>{formatPercent(row.weight)}</meter>
                  <strong>{formatPercent(row.weight)}</strong>
                </li>
              ))}
            </ol>
          </section>

          <details className="lab05-method">
            <summary>Show the score calculation</summary>
            <p>
              Each token becomes three visible features: normalized length, vowel ratio, and a
              deterministic character signal. Similarity is query · key ÷ √3. A position bias of
              0.35 ÷ (distance + 1) is added, then softmax normalizes all raw scores to 100%.
            </p>
            <div className="lab05-table-wrap">
              <table>
                <caption>Transparent score components for every token</caption>
                <thead>
                  <tr>
                    <th scope="col">Token</th>
                    <th scope="col">Features (length / vowels / characters)</th>
                    <th scope="col">Similarity</th>
                    <th scope="col">Distance</th>
                    <th scope="col">Position bias</th>
                    <th scope="col">Raw score</th>
                    <th scope="col">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={`${row.token}-${row.index}`}>
                      <th scope="row">{row.token}</th>
                      <td>{row.features.map(formatScore).join(" / ")}</td>
                      <td>{formatScore(row.similarityScore)}</td>
                      <td>{row.distance}</td>
                      <td>{formatScore(row.positionBias)}</td>
                      <td>{formatScore(row.rawScore)}</td>
                      <td>{formatPercent(row.weight)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
