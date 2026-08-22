import React, { useMemo, useState } from "react";
import {
  AWS_DEPENDENCY_CATEGORIES,
  AWS_STORYBOARD_EXAMPLE_INPUT,
  AWS_STORYBOARD_RESET_INPUT,
  generateOutageStoryboard
} from "./awsOutageStoryboard.js";

export default function AwsCustomerJourneyOutageStoryboard() {
  const [input, setInput] = useState({ ...AWS_STORYBOARD_RESET_INPUT, dependencies: [...AWS_STORYBOARD_RESET_INPUT.dependencies] });
  const result = useMemo(() => generateOutageStoryboard(input), [input]);
  const update = (key) => (event) => setInput((current) => ({ ...current, [key]: event.target.value }));
  const toggleDependency = (key) => setInput((current) => ({
    ...current,
    dependencies: current.dependencies.includes(key) ? current.dependencies.filter((item) => item !== key) : [...current.dependencies, key]
  }));
  const load = (value) => setInput({ ...value, dependencies: [...value.dependencies] });

  return (
    <section className="interactive-lab aws-outage-storyboard" aria-labelledby="aws-storyboard-title">
      <header className="lab-tool-header">
        <h2 id="aws-storyboard-title">AWS Customer-Journey Outage Storyboard</h2>
        <p>Rehearse how failures look to customers before launch. This local exercise creates discussion cards; it never connects to AWS or injects a fault.</p>
      </header>

      <div className="lab-workspace">
        <form className="lab-control-panel" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="aws-journey">Customer journey steps, one per line</label>
          <textarea id="aws-journey" rows="7" value={input.journeySteps} onChange={update("journeySteps")} placeholder="Open app&#10;Sign in&#10;Complete checkout" />

          <fieldset>
            <legend>Architecture dependency categories</legend>
            {Object.entries(AWS_DEPENDENCY_CATEGORIES).map(([key, label]) => (
              <label key={key}><input type="checkbox" checked={input.dependencies.includes(key)} onChange={() => toggleDependency(key)} /> {label}</label>
            ))}
          </fieldset>

          <label htmlFor="aws-recovery-priority">Recovery priority</label>
          <select id="aws-recovery-priority" value={input.recoveryPriority} onChange={update("recoveryPriority")}>
            <option value="restore-core-journey">Restore the core journey</option>
            <option value="protect-data">Protect and reconcile data first</option>
            <option value="communicate-first">Communicate impact first</option>
          </select>

          <label htmlFor="aws-traffic-shape">Traffic shape</label>
          <select id="aws-traffic-shape" value={input.trafficShape} onChange={update("trafficShape")}>
            <option value="steady">Steady</option><option value="variable">Variable</option><option value="launch-spike">Launch spike</option>
          </select>

          <label htmlFor="aws-data-criticality">Data criticality</label>
          <select id="aws-data-criticality" value={input.dataCriticality} onChange={update("dataCriticality")}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>

          <div className="lab-actions">
            <button type="button" onClick={() => load(AWS_STORYBOARD_EXAMPLE_INPUT)}>Load example</button>
            <button type="button" onClick={() => load(AWS_STORYBOARD_RESET_INPUT)}>Reset</button>
          </div>
        </form>

        <section className="lab-output" aria-labelledby="aws-stories-title" aria-live="polite">
          <h3 id="aws-stories-title">Failure rehearsal stories</h3>
          {!result.valid ? <div className="lab-errors" role="alert"><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : (
            <>
              {result.cards.map((card) => (
                <article className="failure-story-card" key={card.id}>
                  <h4>{card.sequence}. {card.title}</h4>
                  <p><strong>Journey moment:</strong> {card.journeyStep}</p>
                  <p><strong>Customer-visible symptom:</strong> {card.customerSymptom}</p>
                  <h5>Detection evidence</h5><ul>{card.detectionEvidence.map((item) => <li key={item}>{item}</li>)}</ul>
                  <p><strong>Containment:</strong> {card.containment}</p>
                  <p><strong>Fallback:</strong> {card.fallback}</p>
                  <h5>Recovery proof</h5><ul>{card.recoveryProof.map((item) => <li key={item}>{item}</li>)}</ul>
                  <p><strong>AWS mapping:</strong> {card.awsConcept}</p>
                  <small>{card.rule}</small>
                </article>
              ))}
              <section aria-labelledby="gameday-checklist"><h4 id="gameday-checklist">GameDay facilitator checklist</h4><ol>{result.checklist.map((item) => <li key={item}><label><input type="checkbox" /> {item}</label></li>)}</ol></section>
              <p className="learning-note">{result.limitation}</p>
              <h4>Official AWS references</h4><ul>{result.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
