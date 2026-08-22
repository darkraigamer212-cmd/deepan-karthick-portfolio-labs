import React, { useMemo, useState } from "react";
import {
  analyzePrompt,
  PROMPT_EXAMPLE_INPUT,
  PROMPT_RESET_INPUT
} from "./promptWorkbench.js";

const fields = [
  { key: "role", label: "Role", rows: 2, placeholder: "Who should the assistant act as?" },
  { key: "task", label: "Task", rows: 3, placeholder: "What exact outcome should it produce?" },
  { key: "context", label: "Context", rows: 3, placeholder: "Audience, situation, and relevant background" },
  { key: "constraints", label: "Constraints", rows: 4, placeholder: "Enter one boundary per line" },
  { key: "example", label: "Reference example", rows: 3, placeholder: "A short example of the desired response" },
  { key: "outputFormat", label: "Output format", rows: 3, placeholder: "Required structure, fields, or sections" }
];

export default function PromptWorkbench() {
  const [input, setInput] = useState({ ...PROMPT_RESET_INPUT });
  const [copyStatus, setCopyStatus] = useState("");
  const result = useMemo(() => analyzePrompt(input), [input]);
  const update = (key) => (event) => {
    setCopyStatus("");
    setInput((current) => ({ ...current, [key]: event.target.value }));
  };

  const copyPrompt = async () => {
    if (!result.valid || !navigator.clipboard) {
      setCopyStatus("Copy is unavailable. Select the prompt text and copy it manually.");
      return;
    }
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopyStatus("Prompt copied.");
    } catch {
      setCopyStatus("Copy failed. Select the prompt text and copy it manually.");
    }
  };

  return (
    <section className="interactive-lab prompt-workbench" aria-labelledby="prompt-workbench-title">
      <header className="lab-tool-header">
        <h2 id="prompt-workbench-title">Prompt Workbench</h2>
        <p>Build and inspect a structured prompt entirely in your browser. No model or external API is called.</p>
      </header>

      <div className="lab-workspace">
        <form className="lab-control-panel" onSubmit={(event) => event.preventDefault()}>
          {fields.map((field) => (
            <label key={field.key} htmlFor={`prompt-${field.key}`}>
              {field.label}
              <textarea id={`prompt-${field.key}`} rows={field.rows} value={input[field.key]} placeholder={field.placeholder} onChange={update(field.key)} />
            </label>
          ))}
          <div className="lab-actions">
            <button type="button" onClick={() => { setInput({ ...PROMPT_EXAMPLE_INPUT }); setCopyStatus(""); }}>Load example</button>
            <button type="button" onClick={() => { setInput({ ...PROMPT_RESET_INPUT }); setCopyStatus(""); }}>Reset</button>
          </div>
        </form>

        <section className="lab-output" aria-labelledby="prompt-result-title">
          <div className="prompt-score-row">
            <h3 id="prompt-result-title">Prompt quality</h3>
            <output aria-label={`Prompt quality score ${result.score} out of 100`}>{result.score}/100 — {result.band}</output>
          </div>

          <ul className="prompt-checks" aria-label="Local prompt quality checks">
            {result.checks.map((check) => <li key={check.id} data-pass={check.pass}>{check.pass ? "Pass" : "Improve"}: {check.label}</li>)}
          </ul>

          {result.suggestions.length > 0 && (
            <div className="prompt-suggestions">
              <h4>Suggested improvements</h4>
              <ul>{result.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul>
            </div>
          )}

          {!result.valid ? (
            <div className="lab-errors" role="alert"><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div>
          ) : (
            <>
              <label htmlFor="assembled-prompt">Assembled prompt</label>
              <textarea id="assembled-prompt" className="assembled-prompt" rows="20" readOnly value={result.prompt} onFocus={(event) => event.target.select()} />
              <button type="button" onClick={copyPrompt}>Copy prompt</button>
              <p className="copy-status" role="status" aria-live="polite">{copyStatus}</p>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

