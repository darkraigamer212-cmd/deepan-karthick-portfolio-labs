import React, { useState } from "react";
import {
  DATA_READINESS,
  DEPLOYMENT_CONTEXT,
  LIFECYCLE_EXAMPLE,
  RISK_IMPACT,
  buildLifecyclePlan
} from "./genAiLifecycleExplorer.js";

const EMPTY_FORM = { useCase: "", dataReadiness: "", riskImpact: "", deploymentContext: "" };

export default function GenAiLifecycleExplorer() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    setResult(buildLifecyclePlan(form));
  };

  const loadExample = () => {
    setForm(LIFECYCLE_EXAMPLE);
    setResult(buildLifecyclePlan(LIFECYCLE_EXAMPLE));
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setResult(null);
  };

  const errors = result?.errors ?? {};

  return (
    <section className="lab-tool" aria-labelledby="lifecycle-explorer-title">
      <div className="intro">
        <h2 id="lifecycle-explorer-title">GenAI Lifecycle Explorer</h2>
        <p>Create an educational project plan from explicit rules. This tool does not call an AI model or external API.</p>
      </div>

      <form className="controls lab-form" onSubmit={submit} noValidate>
        <label>
          GenAI use case
          <textarea
            name="useCase"
            value={form.useCase}
            onChange={updateField}
            rows="4"
            aria-invalid={Boolean(errors.useCase)}
            aria-describedby={errors.useCase ? "lifecycle-use-case-error" : undefined}
            placeholder="Who will use it, and what outcome should it support?"
          />
          {errors.useCase && <small id="lifecycle-use-case-error" role="alert">{errors.useCase}</small>}
        </label>

        <Choice label="Data readiness" name="dataReadiness" value={form.dataReadiness} options={DATA_READINESS} error={errors.dataReadiness} onChange={updateField} />
        <Choice label="Risk and impact" name="riskImpact" value={form.riskImpact} options={RISK_IMPACT} error={errors.riskImpact} onChange={updateField} />
        <Choice label="Deployment context" name="deploymentContext" value={form.deploymentContext} options={DEPLOYMENT_CONTEXT} error={errors.deploymentContext} onChange={updateField} />

        <div className="button-row">
          <button type="submit">Build lifecycle plan</button>
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice">
            <h3>Readiness: {result.score}/100</h3>
            <p><strong>{result.readiness}</strong></p>
            <progress max="100" value={result.score}>{result.score}%</progress>
          </section>

          {result.blockers.length > 0 && (
            <section className="implementation-notice">
              <h3>Blockers to resolve</h3>
              <ul>{result.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>
            </section>
          )}

          <section className="implementation-notice">
            <h3>Six-stage lifecycle</h3>
            <ol>
              {result.stages.map((stage) => (
                <li key={stage.name}>
                  <h4>{stage.name}</h4>
                  <p>{stage.decision}</p>
                  <p><strong>Exit artifact:</strong> {stage.exitArtifact}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="implementation-notice">
            <h3>Required project artifacts</h3>
            <ul>{result.artifacts.map((artifact) => <li key={artifact}>{artifact}</li>)}</ul>
          </section>
        </div>
      )}
    </section>
  );
}

function Choice({ label, name, value, options, error, onChange }) {
  return (
    <label>
      {label}
      <select name={name} value={value} onChange={onChange} aria-invalid={Boolean(error)}>
        <option value="">Choose one</option>
        {Object.entries(options).map(([optionValue, option]) => <option key={optionValue} value={optionValue}>{option.label}</option>)}
      </select>
      {error && <small role="alert">{error}</small>}
    </label>
  );
}

export { buildLifecyclePlan } from "./genAiLifecycleExplorer.js";
