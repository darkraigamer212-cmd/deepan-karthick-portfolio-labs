import React, { useState } from "react";
import {
  DUPLICATE_POLICIES,
  FAILURE_POLICIES,
  OPERATION_LABELS,
  PYTHON_AUTOMATOR_EXAMPLE,
  buildPythonAutomation
} from "./exceptionFirstPythonAutomator.js";

const EMPTY_FORM = { taskName: "", sourcePattern: "", destinationPattern: "", operation: "", failurePolicy: "", duplicatePolicy: "" };

export default function ExceptionFirstPythonAutomator() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    setCopied(false);
    setResult(buildPythonAutomation(form));
  };
  const loadExample = () => {
    setForm(PYTHON_AUTOMATOR_EXAMPLE);
    setCopied(false);
    setResult(buildPythonAutomation(PYTHON_AUTOMATOR_EXAMPLE));
  };
  const reset = () => {
    setForm(EMPTY_FORM);
    setResult(null);
    setCopied(false);
  };
  const copyCode = async () => {
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
  };
  const errors = result?.errors ?? {};

  return (
    <section className="lab-tool" aria-labelledby="python-automator-title">
      <div className="intro">
        <h2 id="python-automator-title">Exception-First Python Automator</h2>
        <p>Generate a reviewable stdlib-only file-task scaffold. This lab never executes code or reads, writes, copies, or moves your files.</p>
      </div>
      <form className="controls lab-form" onSubmit={submit} noValidate>
        <TextField label="Repeated task" name="taskName" value={form.taskName} error={errors.taskName} onChange={updateField} />
        <TextField label="Source glob" name="sourcePattern" value={form.sourcePattern} error={errors.sourcePattern} onChange={updateField} placeholder="C:/Incoming/**/*.pdf" />
        <TextField label="Destination pattern" name="destinationPattern" value={form.destinationPattern} error={errors.destinationPattern} onChange={updateField} placeholder="C:/Archive/{date}/{name}" />
        <Choice label="Operation" name="operation" value={form.operation} options={OPERATION_LABELS} error={errors.operation} onChange={updateField} />
        <Choice label="Failure policy" name="failurePolicy" value={form.failurePolicy} options={FAILURE_POLICIES} error={errors.failurePolicy} onChange={updateField} />
        <Choice label="Duplicate policy" name="duplicatePolicy" value={form.duplicatePolicy} options={DUPLICATE_POLICIES} error={errors.duplicatePolicy} onChange={updateField} />
        <div className="button-row">
          <button type="submit">Generate safe scaffold</button>
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>
      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice">
            <h3>Python scaffold</h3>
            <p><strong>Dry-run is on by default.</strong> The generated script uses only Python’s standard library and writes an audit manifest when you run it.</p>
            <textarea readOnly rows="28" value={result.code} aria-label="Generated Python automation scaffold" spellCheck="false" />
            <button type="button" onClick={copyCode}>Copy Python scaffold</button><span role="status">{copied ? " Code copied." : ""}</span>
          </section>
          <section className="implementation-notice">
            <h3>Test-run checklist</h3>
            <ol>{result.checklist.map((item) => <li key={item}>{item}</li>)}</ol>
          </section>
        </div>
      )}
    </section>
  );
}

function TextField({ label, name, value, error, onChange, placeholder }) {
  return <label>{label}<input name={name} value={value} onChange={onChange} placeholder={placeholder} aria-invalid={Boolean(error)} />{error && <small role="alert">{error}</small>}</label>;
}

function Choice({ label, name, value, options, error, onChange }) {
  return <label>{label}<select name={name} value={value} onChange={onChange} aria-invalid={Boolean(error)}><option value="">Choose one</option>{Object.entries(options).map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select>{error && <small role="alert">{error}</small>}</label>;
}

export { buildPythonAutomation, validateAutomationPlan } from "./exceptionFirstPythonAutomator.js";
