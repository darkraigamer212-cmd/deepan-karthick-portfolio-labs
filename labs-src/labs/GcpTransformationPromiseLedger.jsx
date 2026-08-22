import React, { useState } from "react";
import {
  GCP_EVIDENCE_REFERENCES,
  PROMISE_EXAMPLE,
  PROMISE_OPTIONS,
  PROMISE_RESET,
  buildPromiseLedger,
  promiseLimits
} from "./gcp-promise-ledger.js";

const FIELD_LABELS = {
  sensitivity: "Data sensitivity",
  downtime: "Downtime tolerance",
  dependencies: "Dependency complexity",
  skill: "Team cloud skill",
  modernization: "Modernization intent"
};

function Choice({ name, value, error, onChange }) {
  return (
    <label htmlFor={`lab14-${name}`}>
      {FIELD_LABELS[name]}
      <select
        id={`lab14-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `lab14-${name}-error` : undefined}
      >
        <option value="">Choose one</option>
        {Object.entries(PROMISE_OPTIONS[name]).map(([optionValue, label]) => (
          <option value={optionValue} key={optionValue}>{label}</option>
        ))}
      </select>
      {error && <small id={`lab14-${name}-error`} role="alert">{error}</small>}
    </label>
  );
}

export default function GcpTransformationPromiseLedger() {
  const [form, setForm] = useState({ ...PROMISE_RESET });
  const [result, setResult] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const errors = result?.errors ?? {};

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    setCopyStatus("");
    setResult(buildPromiseLedger(form));
  }

  function loadExample() {
    const example = { ...PROMISE_EXAMPLE };
    setForm(example);
    setResult(buildPromiseLedger(example));
    setCopyStatus("");
  }

  function reset() {
    setForm({ ...PROMISE_RESET });
    setResult(null);
    setCopyStatus("");
  }

  async function copyMemo() {
    if (!result?.valid || !navigator.clipboard) {
      setCopyStatus("Copy is unavailable. Select the memo and copy it manually.");
      return;
    }
    try {
      await navigator.clipboard.writeText(result.memo);
      setCopyStatus("Sponsor memo copied.");
    } catch {
      setCopyStatus("Copy failed. Select the memo and copy it manually.");
    }
  }

  return (
    <section className="lab14-promise-ledger" aria-labelledby="lab14-title">
      <header className="lab14-heading">
        <div>
          <h2 id="lab14-title">GCP Transformation Promise Ledger</h2>
          <p>Challenge an executive cloud promise before the organization commits to it.</p>
        </div>
        <p className="lab14-limit">
          Planning-only evidence aid. It does not approve architecture, security, cost, migration,
          or a guaranteed result or date.
        </p>
      </header>

      <form className="lab14-controls" onSubmit={submit} noValidate>
        <label htmlFor="lab14-promise">
          Executive promise
          <textarea
            id="lab14-promise"
            name="promiseStatement"
            rows="4"
            maxLength={promiseLimits.statement}
            value={form.promiseStatement}
            onChange={updateField}
            placeholder="What cloud outcome is being promised, and to whom?"
            aria-invalid={Boolean(errors.promiseStatement)}
            aria-describedby={errors.promiseStatement ? "lab14-promise-error" : "lab14-promise-help"}
          />
          <small id="lab14-promise-help">Write a claim that evidence could prove wrong.</small>
          {errors.promiseStatement && <small id="lab14-promise-error" role="alert">{errors.promiseStatement}</small>}
        </label>

        <fieldset className="lab14-metric-fields">
          <legend>Claimed measurable change</legend>
          <label htmlFor="lab14-metric">
            Target metric
            <input id="lab14-metric" name="metricName" type="text" maxLength={promiseLimits.metric} value={form.metricName} onChange={updateField} aria-invalid={Boolean(errors.metricName)} />
            {errors.metricName && <small role="alert">{errors.metricName}</small>}
          </label>
          <label htmlFor="lab14-baseline">
            Current baseline
            <input id="lab14-baseline" name="baseline" type="number" step="any" value={form.baseline} onChange={updateField} aria-invalid={Boolean(errors.baseline)} />
            {errors.baseline && <small role="alert">{errors.baseline}</small>}
          </label>
          <label htmlFor="lab14-target">
            Claimed target
            <input id="lab14-target" name="target" type="number" step="any" value={form.target} onChange={updateField} aria-invalid={Boolean(errors.target)} />
            {errors.target && <small role="alert">{errors.target}</small>}
          </label>
        </fieldset>

        <label htmlFor="lab14-workloads">
          Workload count
          <input id="lab14-workloads" name="workloadCount" type="number" min="1" max={promiseLimits.workloads} step="1" value={form.workloadCount} onChange={updateField} aria-invalid={Boolean(errors.workloadCount)} />
          {errors.workloadCount && <small role="alert">{errors.workloadCount}</small>}
        </label>

        {Object.keys(FIELD_LABELS).map((name) => (
          <Choice name={name} value={form[name]} error={errors[name]} onChange={updateField} key={name} />
        ))}

        <div className="lab14-actions">
          <button type="submit">Challenge the promise</button>
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {result && !result.valid && (
        <div className="lab14-errors" role="alert" aria-live="assertive">
          <h3>Complete the evidence brief</h3>
          <ul>{Object.values(result.errors).map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}

      {result?.valid && (
        <div className="lab14-results" aria-live="polite">
          <section aria-labelledby="lab14-hypothesis-title">
            <h3 id="lab14-hypothesis-title">Falsifiable hypothesis</h3>
            <p>{result.hypothesis}</p>
          </section>

          <section aria-labelledby="lab14-pilot-title">
            <h3 id="lab14-pilot-title">Smallest reversible pilot</h3>
            <p>{result.pilot.summary}</p>
            <h4>Evidence required to call the pilot successful</h4>
            <ul>{result.pilot.successEvidence.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section aria-labelledby="lab14-assumptions-title">
            <h3 id="lab14-assumptions-title">Assumption ledger</h3>
            <div className="lab14-table-wrap">
              <table>
                <caption>Claims that must become evidence before commitment</caption>
                <thead><tr><th scope="col">ID</th><th scope="col">Assumption</th><th scope="col">Evidence needed</th><th scope="col">Owner</th><th scope="col">Status</th></tr></thead>
                <tbody>{result.assumptions.map((item) => (
                  <tr key={item.id}><th scope="row">{item.id}</th><td>{item.assumption}</td><td>{item.evidence}</td><td>{item.owner}</td><td>{item.status}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="lab14-gates-title">
            <h3 id="lab14-gates-title">30 / 60 / 90 evidence gates</h3>
            <p>These are review horizons, not promised completion dates.</p>
            <ol className="lab14-gates">{result.gates.map((gate) => (
              <li key={gate.horizon}>
                <h4>{gate.horizon}</h4>
                <p>{gate.purpose}</p>
                <ul>{gate.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
                <p><strong>Gate decision:</strong> {gate.decision}</p>
              </li>
            ))}</ol>
          </section>

          <section className="lab14-triggers" aria-labelledby="lab14-triggers-title">
            <h3 id="lab14-triggers-title">Stop / continue triggers</h3>
            <div><h4>Continue only when</h4><ul>{result.continueTriggers.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><h4>Stop or revise when</h4><ul>{result.stopTriggers.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </section>

          <section aria-labelledby="lab14-risks-title">
            <h3 id="lab14-risks-title">Owned risk register</h3>
            <div className="lab14-table-wrap"><table>
              <caption>Risk ownership required before sponsor approval</caption>
              <thead><tr><th scope="col">ID</th><th scope="col">Risk</th><th scope="col">Owner</th><th scope="col">Required response</th></tr></thead>
              <tbody>{result.risks.map((item) => <tr key={item.id}><th scope="row">{item.id}</th><td>{item.risk}</td><td>{item.owner}</td><td>{item.response}</td></tr>)}</tbody>
            </table></div>
          </section>

          <section aria-labelledby="lab14-inventory-title">
            <h3 id="lab14-inventory-title">Next-step evidence inventory</h3>
            <ul className="lab14-checklist">{result.evidenceInventory.map((item) => <li key={item}><label><input type="checkbox" /> {item}</label></li>)}</ul>
          </section>

          <section aria-labelledby="lab14-memo-title">
            <h3 id="lab14-memo-title">Copyable sponsor review memo</h3>
            <label htmlFor="lab14-memo">Generated evidence memo</label>
            <textarea id="lab14-memo" rows="22" readOnly value={result.memo} onFocus={(event) => event.target.select()} />
            <button type="button" onClick={copyMemo}>Copy sponsor memo</button>
            <p role="status" aria-live="polite">{copyStatus}</p>
          </section>
        </div>
      )}

      <aside className="lab14-references" aria-labelledby="lab14-references-title">
        <h3 id="lab14-references-title">Official evidence-planning references</h3>
        <ul>{GCP_EVIDENCE_REFERENCES.map((reference) => (
          <li key={reference.url}>
            <a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a>: {reference.purpose}
          </li>
        ))}</ul>
        <p>No pricing, service recommendation, or current-product claim is produced by this tool.</p>
      </aside>
    </section>
  );
}
