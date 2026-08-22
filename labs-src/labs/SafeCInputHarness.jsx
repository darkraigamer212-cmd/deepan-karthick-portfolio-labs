import React, { useMemo, useState } from "react";
import {
  generateSafeCInputHarness,
  SAFE_C_INPUT_EXAMPLE,
  SAFE_C_INPUT_RESET
} from "./safeCInputHarness.js";

export default function SafeCInputHarness() {
  const [specification, setSpecification] = useState(SAFE_C_INPUT_RESET);
  const [copyStatus, setCopyStatus] = useState("");
  const result = useMemo(() => generateSafeCInputHarness(specification), [specification]);
  const copyCode = async () => {
    if (!result.valid || !navigator.clipboard) return setCopyStatus("Copy unavailable; select the C skeleton manually.");
    try { await navigator.clipboard.writeText(result.code); setCopyStatus("C input skeleton copied."); }
    catch { setCopyStatus("Copy failed; select the C skeleton manually."); }
  };

  return (
    <section className="interactive-lab safe-c-input-harness" aria-labelledby="safe-c-title">
      <header className="lab-tool-header"><h2 id="safe-c-title">Safe C Input Harness</h2><p>Specify bounded console fields and generate reviewable <code>fgets</code> plus <code>strtol</code>/<code>strtod</code> scaffolding—without compiling or executing code.</p></header>
      <div className="lab-workspace">
        <form className="lab-control-panel" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="c-field-spec">Field specifications, one per line</label>
          <p id="c-field-format"><code>name | type | min..max or text max length | required yes/no</code></p>
          <textarea id="c-field-spec" rows="10" aria-describedby="c-field-format" value={specification} onChange={(event) => { setSpecification(event.target.value); setCopyStatus(""); }} placeholder="age|integer|0..120|yes" />
          <div className="lab-actions"><button type="button" onClick={() => setSpecification(SAFE_C_INPUT_EXAMPLE)}>Load example</button><button type="button" onClick={() => setSpecification(SAFE_C_INPUT_RESET)}>Reset</button></div>
        </form>

        <section className="lab-output" aria-labelledby="safe-c-output" aria-live="polite">
          <h3 id="safe-c-output">Generated input contract</h3>
          {!result.valid ? <div className="lab-errors" role="alert"><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : <>
            <dl><div><dt>Shared input buffer</dt><dd>{result.stackBudget.inputBufferBytes} bytes</dd></div><div><dt>Persistent fields</dt><dd>≈ {result.stackBudget.persistentFieldBytes} bytes</dd></div><div><dt>Estimated total</dt><dd>≈ {result.stackBudget.estimatedTotalBytes} bytes</dd></div></dl>
            <p>{result.stackBudget.note}</p>
            <label htmlFor="safe-c-code">Generated C skeleton</label><textarea id="safe-c-code" rows="24" readOnly value={result.code} onFocus={(event) => event.target.select()} />
            <button type="button" onClick={copyCode}>Copy C skeleton</button><p role="status">{copyStatus}</p>
            <section aria-labelledby="c-test-vectors"><h4 id="c-test-vectors">Boundary and invalid test vectors</h4><div className="lab-table-wrap" tabIndex="0" role="region" aria-label="Boundary test vectors; scroll horizontally if needed"><table><thead><tr><th scope="col">Field</th><th scope="col">Case</th><th scope="col">Input</th><th scope="col">Expected</th></tr></thead><tbody>{result.testVectors.map((vector, index) => <tr key={`${vector.field}-${index}`}><th scope="row">{vector.field}</th><td>{vector.case}</td><td>{vector.input}</td><td>{vector.expected}</td></tr>)}</tbody></table></div></section>
            <section aria-labelledby="c-review-list"><h4 id="c-review-list">Reviewer checklist</h4><ul>{result.checklist.map((item) => <li key={item}><label><input type="checkbox" /> {item}</label></li>)}</ul></section>
            <p className="learning-note">{result.limitation}</p>
          </>}
        </section>
      </div>
    </section>
  );
}
