import React, { useState } from "react";
import { NETWORK_CHANGE_EXAMPLE, analyzeNetworkChange } from "./networkChangeRollback.js";

const EMPTY_FORM = { changeGoal: "", downtimeWindow: "", beforeInventory: "", proposedInventory: "" };

export default function NetworkChangeRollbackComposer() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    setCopied(false);
    setResult(analyzeNetworkChange(form));
  };
  const loadExample = () => {
    setForm(NETWORK_CHANGE_EXAMPLE);
    setCopied(false);
    setResult(analyzeNetworkChange(NETWORK_CHANGE_EXAMPLE));
  };
  const reset = () => {
    setForm(EMPTY_FORM);
    setResult(null);
    setCopied(false);
  };
  const copySummary = async () => {
    await navigator.clipboard.writeText(result.stakeholderSummary);
    setCopied(true);
  };
  const errors = result?.errors ?? {};

  return (
    <section className="lab-tool" aria-labelledby="network-rollback-title">
      <div className="intro">
        <h2 id="network-rollback-title">Network Change Rollback Composer</h2>
        <p>Compare before and proposed IPv4 inventories, stop unsafe changes, and produce a platform-neutral rollback plan.</p>
      </div>
      <form className="controls lab-form" onSubmit={submit} noValidate>
        <label>
          Change goal
          <textarea name="changeGoal" rows="3" value={form.changeGoal} onChange={updateField} aria-invalid={Boolean(errors.changeGoal)} />
          {errors.changeGoal && <small role="alert">{errors.changeGoal}</small>}
        </label>
        <label>
          Downtime window
          <input name="downtimeWindow" value={form.downtimeWindow} onChange={updateField} placeholder="Saturday 22:00–23:00 IST" aria-invalid={Boolean(errors.downtimeWindow)} />
          {errors.downtimeWindow && <small role="alert">{errors.downtimeWindow}</small>}
        </label>
        <InventoryField label="Before inventory" name="beforeInventory" value={form.beforeInventory} error={errors.beforeInventory} onChange={updateField} />
        <InventoryField label="Proposed inventory" name="proposedInventory" value={form.proposedInventory} error={errors.proposedInventory} onChange={updateField} />
        <div className="button-row">
          <button type="submit">Compose safe change</button>
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice">
            <h3>{result.blocked ? "Change blocked" : "Controlled change ready"}</h3>
            {result.findings.length ? <ul>{result.findings.map((finding) => <li key={`${finding.type}-${finding.message}`}><strong>{finding.severity}:</strong> {finding.message}</li>)}</ul> : <p>No deterministic overlap, capacity, growth, or boundary finding.</p>}
          </section>
          {Object.entries(result.runbook).map(([phase, steps]) => (
            <section className="implementation-notice" key={phase}>
              <h3>{phase[0].toUpperCase() + phase.slice(1)}</h3>
              <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
            </section>
          ))}
          <section className="implementation-notice">
            <h3>Copyable stakeholder summary</h3>
            <textarea readOnly rows="14" value={result.stakeholderSummary} aria-label="Generated network change stakeholder summary" />
            <button type="button" onClick={copySummary}>Copy stakeholder summary</button>
            <span role="status">{copied ? " Summary copied." : ""}</span>
          </section>
        </div>
      )}
    </section>
  );
}

function InventoryField({ label, name, value, error, onChange }) {
  return (
    <label>
      {label}
      <textarea name={name} rows="7" value={value} onChange={onChange} placeholder="name,CIDR,requiredHosts" aria-invalid={Boolean(error)} />
      <small>One line per network: name,CIDR,requiredHosts. Maximum 20 rows.</small>
      {error && <ul role="alert">{error.map((message) => <li key={message}>{message}</li>)}</ul>}
    </label>
  );
}

export { analyzeNetworkChange, parseCidr, parseInventory } from "./networkChangeRollback.js";
