import React, { useState } from "react";
import {
  CLOUD_PREMORTEM_EXAMPLE,
  RISK_LEVELS,
  buildCloudPremortem,
  formatMoney
} from "./cloudRegretPremortem.js";

const EMPTY_FORM = {
  migrationGoal: "",
  currency: "INR",
  currentMonthlyCost: "",
  cloudMonthlyCost: "",
  migrationCost: "",
  horizonMonths: 24,
  portabilityRisk: "",
  lockInRisk: "",
  skillsRisk: "",
  downtimeRisk: "",
  exportRisk: ""
};

const COST_CONTROLS = [
  ["currentMonthlyCost", "Current monthly operating cost"],
  ["cloudMonthlyCost", "Expected cloud monthly cost"],
  ["migrationCost", "One-time migration cost"]
];

const RISK_CONTROLS = [
  ["portabilityRisk", "Workload portability risk"],
  ["lockInRisk", "Provider lock-in risk"],
  ["skillsRisk", "Team skills risk"],
  ["downtimeRisk", "Downtime risk"],
  ["exportRisk", "Data export risk"]
];

export default function CloudRegretPremortem() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };
  const submit = (event) => {
    event.preventDefault();
    setCopied(false);
    setResult(buildCloudPremortem(form));
  };
  const loadExample = () => {
    setForm(CLOUD_PREMORTEM_EXAMPLE);
    setCopied(false);
    setResult(buildCloudPremortem(CLOUD_PREMORTEM_EXAMPLE));
  };
  const reset = () => {
    setForm(EMPTY_FORM);
    setResult(null);
    setCopied(false);
  };
  const copyMemo = async () => {
    await navigator.clipboard.writeText(result.decisionMemo);
    setCopied(true);
  };
  const errors = result?.errors ?? {};

  return (
    <section className="lab-tool" aria-labelledby="cloud-premortem-title">
      <div className="intro">
        <h2 id="cloud-premortem-title">Cloud Regret Pre-Mortem</h2>
        <p>Imagine the migration failed, then define a pilot you can safely reverse. Cost values are your planning assumptions—not provider quotes.</p>
      </div>
      <form className="controls lab-form" onSubmit={submit} noValidate>
        <label>
          Migration decision
          <textarea name="migrationGoal" rows="3" value={form.migrationGoal} onChange={updateField} aria-invalid={Boolean(errors.migrationGoal)} />
          {errors.migrationGoal && <small role="alert">{errors.migrationGoal}</small>}
        </label>
        <label>
          Currency
          <select name="currency" value={form.currency} onChange={updateField} aria-invalid={Boolean(errors.currency)}>
            {['INR', 'USD', 'EUR', 'GBP'].map((currency) => <option key={currency}>{currency}</option>)}
          </select>
          {errors.currency && <small role="alert">{errors.currency}</small>}
        </label>
        {COST_CONTROLS.map(([name, label]) => (
          <label key={name}>
            {label}
            <input type="number" min="0" max="100000000" step="any" name={name} value={form[name]} onChange={updateField} aria-invalid={Boolean(errors[name])} />
            {errors[name] && <small role="alert">{errors[name]}</small>}
          </label>
        ))}
        <label>
          Planning horizon (12–36 months)
          <input type="number" min="12" max="36" step="1" name="horizonMonths" value={form.horizonMonths} onChange={updateField} aria-invalid={Boolean(errors.horizonMonths)} />
          {errors.horizonMonths && <small role="alert">{errors.horizonMonths}</small>}
        </label>
        {RISK_CONTROLS.map(([name, label]) => (
          <label key={name}>
            {label}
            <select name={name} value={form[name]} onChange={updateField} aria-invalid={Boolean(errors[name])}>
              <option value="">Choose risk</option>
              {Object.entries(RISK_LEVELS).map(([value, risk]) => <option key={value} value={value}>{risk.label}</option>)}
            </select>
            {errors[name] && <small role="alert">{errors[name]}</small>}
          </label>
        ))}
        <div className="button-row">
          <button type="submit">Run pre-mortem</button>
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice">
            <h3>Planning position</h3>
            <p>Stay: <strong>{formatMoney(result.summary.stayTco, form.currency)}</strong> · Migrate: <strong>{formatMoney(result.summary.migrateTco, form.currency)}</strong></p>
            <p>{result.summary.recommendation}</p>
          </section>
          <section className="implementation-notice">
            <h3>Five regret scenarios</h3>
            <ol>{result.scenarios.map((scenario) => <li key={scenario.title}><strong>{scenario.title}</strong><p>{scenario.warning}</p><p>{scenario.reversal}</p></li>)}</ol>
          </section>
          <section className="implementation-notice">
            <h3>Copyable decision memo</h3>
            <textarea readOnly rows="22" value={result.decisionMemo} aria-label="Generated cloud decision memo" />
            <button type="button" onClick={copyMemo}>Copy decision memo</button>
            <span role="status">{copied ? " Memo copied." : ""}</span>
          </section>
        </div>
      )}
    </section>
  );
}

export { buildCloudPremortem, formatDecisionMemo } from "./cloudRegretPremortem.js";
