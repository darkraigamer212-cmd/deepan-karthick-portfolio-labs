import React, { useState } from "react";
import {
  ACTIVATION_LABELS,
  NEURON_EXAMPLE,
  predictBinaryGrid,
  runNeuron
} from "./neuralNetworkPlayground.js";

const EMPTY_FORM = {
  input1: "",
  input2: "",
  weight1: "",
  weight2: "",
  bias: "",
  activation: ""
};

const NUMBER_CONTROLS = [
  ["input1", "Input 1"],
  ["input2", "Input 2"],
  ["weight1", "Weight 1"],
  ["weight2", "Weight 2"],
  ["bias", "Bias"]
];

export default function NeuralNetworkPlayground() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setResult(null);
  };

  const submit = (event) => {
    event.preventDefault();
    setResult(runNeuron(form));
  };

  const loadExample = () => {
    setForm(NEURON_EXAMPLE);
    setResult(runNeuron(NEURON_EXAMPLE));
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setResult(null);
  };

  const errors = result?.errors ?? {};
  const grid = result && !Object.keys(errors).length ? predictBinaryGrid(form) : [];

  return (
    <section className="lab-tool" aria-labelledby="neuron-playground-title">
      <div className="intro">
        <h2 id="neuron-playground-title">Neural Network Playground</h2>
        <p>Explore one transparent neuron. This educational calculator uses fixed arithmetic—no training service, AI model, or API.</p>
      </div>

      <form className="controls lab-form" onSubmit={submit} noValidate>
        {NUMBER_CONTROLS.map(([name, label]) => (
          <label key={name}>
            {label}
            <input
              type="number"
              name={name}
              value={form[name]}
              onChange={updateField}
              step="any"
              aria-invalid={Boolean(errors[name])}
              aria-describedby={errors[name] ? `neuron-${name}-error` : undefined}
            />
            {errors[name] && <small id={`neuron-${name}-error`} role="alert">{errors[name]}</small>}
          </label>
        ))}

        <label>
          Activation
          <select name="activation" value={form.activation} onChange={updateField} aria-invalid={Boolean(errors.activation)}>
            <option value="">Choose an activation</option>
            {Object.entries(ACTIVATION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          {errors.activation && <small role="alert">{errors.activation}</small>}
        </label>

        <div className="button-row">
          <button type="submit">Run neuron</button>
          <button type="button" onClick={loadExample}>Load OR-gate example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice">
            <h3>Decision calculation</h3>
            <p><strong>Output: {result.output.toFixed(4)}</strong></p>
            <p><code>{result.equation}</code></p>
            <p>{result.explanation}</p>
            <dl>
              {result.contributions.map((item) => (
                <div key={item.label}><dt>{item.label}</dt><dd>{item.value.toFixed(4)}</dd></div>
              ))}
            </dl>
          </section>

          <section className="implementation-notice">
            <h3>Binary sample predictions</h3>
            <table>
              <caption>Current weights, bias, and activation applied to four input pairs</caption>
              <thead><tr><th scope="col">Input 1</th><th scope="col">Input 2</th><th scope="col">Output</th></tr></thead>
              <tbody>
                {grid.map((row) => (
                  <tr key={`${row.input1}-${row.input2}`}><td>{row.input1}</td><td>{row.input2}</td><td>{row.output.toFixed(4)}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </section>
  );
}

export { applyActivation, predictBinaryGrid, runNeuron } from "./neuralNetworkPlayground.js";
