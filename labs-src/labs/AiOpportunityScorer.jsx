import React, { useMemo, useState } from "react";
import {
  OPPORTUNITY_EXAMPLE_INPUT,
  OPPORTUNITY_FACTORS,
  OPPORTUNITY_RESET_INPUT,
  scoreAiOpportunity
} from "./aiOpportunityScorer.js";

const scaleLabels = ["Very low", "Low", "Medium", "High", "Very high"];

export default function AiOpportunityScorer() {
  const [input, setInput] = useState({ ...OPPORTUNITY_RESET_INPUT });
  const result = useMemo(() => scoreAiOpportunity(input), [input]);
  const update = (key) => (event) => setInput((current) => ({ ...current, [key]: event.target.value }));

  return (
    <section className="interactive-lab ai-opportunity-scorer" aria-labelledby="opportunity-title">
      <header className="lab-tool-header">
        <h2 id="opportunity-title">AI Opportunity Scorer</h2>
        <p>Evaluate a business task with a transparent weighted formula. This is a planning aid, not an automatic investment decision.</p>
      </header>

      <div className="lab-workspace">
        <form className="lab-control-panel" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="opportunity-task">Business task</label>
          <input id="opportunity-task" type="text" maxLength="120" value={input.taskName} onChange={update("taskName")} placeholder="Example: triage support tickets" />

          {Object.entries(OPPORTUNITY_FACTORS).map(([key, factor]) => (
            <fieldset className="rating-control" key={key}>
              <legend>{factor.label}</legend>
              <label htmlFor={`opportunity-${key}`}>
                Rating {input[key]} of 5 — {scaleLabels[Number(input[key]) - 1]}
              </label>
              <input id={`opportunity-${key}`} type="range" min="1" max="5" step="1" value={input[key]} onChange={update(key)} />
              <small>{factor.direction === "inverse" ? "Higher risk reduces the opportunity score." : `Contributes up to ${factor.weight} points.`}</small>
            </fieldset>
          ))}

          <div className="lab-actions">
            <button type="button" onClick={() => setInput({ ...OPPORTUNITY_EXAMPLE_INPUT })}>Load example</button>
            <button type="button" onClick={() => setInput({ ...OPPORTUNITY_RESET_INPUT })}>Reset</button>
          </div>
        </form>

        <section className="lab-output" aria-labelledby="opportunity-result" aria-live="polite">
          <h3 id="opportunity-result">Opportunity assessment</h3>
          {!result.valid ? (
            <div className="lab-errors" role="alert"><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div>
          ) : (
            <>
              <output className="score-output" aria-label={`Opportunity score ${result.score} out of 100`}>{result.score}<span>/100</span></output>
              <h4>{result.band.label}</h4>
              <p>{result.band.recommendation}</p>

              <table className="score-breakdown">
                <caption>Weighted score breakdown</caption>
                <thead><tr><th scope="col">Factor</th><th scope="col">Rating</th><th scope="col">Weight</th><th scope="col">Points</th></tr></thead>
                <tbody>{result.breakdown.map((item) => (
                  <tr key={item.key}><th scope="row">{item.label}</th><td>{item.value}/5</td><td>{item.weight}%</td><td>{item.points}</td></tr>
                ))}</tbody>
              </table>
              <p className="formula-note"><strong>Formula:</strong> {result.formula}</p>
              <h4>Required guardrails</h4>
              <ul>{result.guardrails.map((guardrail) => <li key={guardrail}>{guardrail}</li>)}</ul>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

