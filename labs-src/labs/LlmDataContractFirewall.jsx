import React, { useState } from "react";
import { DATA_FIREWALL_EXAMPLE, buildDataFirewall } from "./llmDataContractFirewall.js";

const EMPTY_FORM = { targetTask: "", purpose: "", fieldRows: "" };

export default function LlmDataContractFirewall() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState("");
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    setCopied("");
    setResult(buildDataFirewall(form));
  };
  const loadExample = () => {
    setForm(DATA_FIREWALL_EXAMPLE);
    setCopied("");
    setResult(buildDataFirewall(DATA_FIREWALL_EXAMPLE));
  };
  const reset = () => {
    setForm(EMPTY_FORM);
    setResult(null);
    setCopied("");
  };
  const copy = async (value, label) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
  };
  const errors = result?.errors ?? {};

  return (
    <section className="lab-tool" aria-labelledby="data-firewall-title">
      <div className="intro">
        <h2 id="data-firewall-title">LLM Data Contract Firewall</h2>
        <p>Decide which support-data fields may cross an LLM boundary. This lab never ingests record values or calls a model.</p>
      </div>
      <form className="controls lab-form" onSubmit={submit} noValidate>
        <label>Target LLM task<textarea name="targetTask" rows="3" value={form.targetTask} onChange={updateField} aria-invalid={Boolean(errors.targetTask)} />{errors.targetTask && <small role="alert">{errors.targetTask}</small>}</label>
        <label>Dataset purpose<select name="purpose" value={form.purpose} onChange={updateField} aria-invalid={Boolean(errors.purpose)}><option value="">Choose purpose</option><option value="training">Training</option><option value="retrieval">Retrieval</option><option value="evaluation">Evaluation</option></select>{errors.purpose && <small role="alert">{errors.purpose}</small>}</label>
        <label>Field contracts<textarea name="fieldRows" rows="9" value={form.fieldRows} onChange={updateField} placeholder="field|classification|allowed use|retention days" aria-invalid={Boolean(errors.fieldRows)} /><small>Allowed use is a comma-separated subset of training,retrieval,evaluation. Maximum 20 rows.</small>{errors.fieldRows && <ul role="alert">{errors.fieldRows.map((error) => <li key={error}>{error}</li>)}</ul>}</label>
        <div className="button-row"><button type="submit">Apply firewall</button><button type="button" onClick={loadExample}>Load example</button><button type="button" onClick={reset}>Reset</button></div>
      </form>
      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice"><h3>Field decisions</h3><ul>{result.decisions.map((field) => <li key={field.name}><strong>{field.name}: {field.action.toUpperCase()}</strong> — {field.reason}</li>)}</ul></section>
          <section className="implementation-notice"><h3>Least-data pipeline</h3><ol>{result.stages.map((stage) => <li key={stage}>{stage}</li>)}</ol></section>
          <section className="implementation-notice"><h3>Leakage tests</h3><ul>{result.leakageTests.map((test) => <li key={test}>{test}</li>)}</ul></section>
          <section className="implementation-notice"><h3>JSONL record schema contract</h3><textarea readOnly rows="18" value={result.jsonlSchema} aria-label="Generated JSONL schema contract" /><button type="button" onClick={() => copy(result.jsonlSchema, "schema")}>Copy schema</button></section>
          <section className="implementation-notice"><h3>Dataset card contract</h3><textarea readOnly rows="16" value={result.datasetCard} aria-label="Generated dataset card contract" /><button type="button" onClick={() => copy(result.datasetCard, "card")}>Copy dataset card</button><span role="status">{copied ? ` ${copied} copied.` : ""}</span></section>
        </div>
      )}
    </section>
  );
}

export { buildDataFirewall, decideField, parseFieldContract } from "./llmDataContractFirewall.js";
