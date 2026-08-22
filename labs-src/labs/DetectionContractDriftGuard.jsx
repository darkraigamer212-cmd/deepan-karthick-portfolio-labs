import React, { useMemo, useState } from "react";
import { analyzeDetectionDrift, DRIFT_GUARD_EXAMPLE, DRIFT_GUARD_RESET } from "./detectionContractDriftGuard.js";

export default function DetectionContractDriftGuard() {
  const [input, setInput] = useState({ ...DRIFT_GUARD_RESET }), [copyStatus, setCopyStatus] = useState("");
  const result = useMemo(() => analyzeDetectionDrift(input), [input]);
  const update = (key) => (event) => { setCopyStatus(""); setInput((current) => ({ ...current, [key]: event.target.value })); };
  const copyHarness = async () => { if (!result.valid || !navigator.clipboard) return setCopyStatus("Copy unavailable; select the Python harness manually."); try { await navigator.clipboard.writeText(result.pythonHarness); setCopyStatus("Python schema-contract harness copied."); } catch { setCopyStatus("Copy failed; select the harness manually."); } };
  return <section className="interactive-lab detection-contract-drift-guard" aria-labelledby="drift-title">
    <header className="lab-tool-header"><h2 id="drift-title">Detection Contract Drift Guard</h2><p>Compare rule assumptions with old and new schema metadata. Do not paste logs: this tool accepts field names, requiredness, types, and unit categories only.</p></header>
    <div className="lab-workspace"><form className="lab-control-panel" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="drift-claim">Detection claim<textarea id="drift-claim" rows="3" value={input.detectionClaim} onChange={update("detectionClaim")} /></label>
      <label htmlFor="drift-assumptions">Rule assumptions<textarea id="drift-assumptions" rows="7" value={input.assumptionRows} onChange={update("assumptionRows")} placeholder="field|required yes/no|type|unit" /></label>
      <label htmlFor="drift-old">Old schema metadata<textarea id="drift-old" rows="7" value={input.oldSchemaRows} onChange={update("oldSchemaRows")} placeholder="field|type|unit" /></label>
      <label htmlFor="drift-new">New schema metadata<textarea id="drift-new" rows="7" value={input.newSchemaRows} onChange={update("newSchemaRows")} placeholder="field or field?|type|unit" /></label>
      <p>A trailing <code>?</code> marks a newly optional field. Types: string, number, boolean, timestamp. Units: none, count, bytes, milliseconds, seconds, percent, identifier, utc-iso8601.</p>
      <div className="lab-actions"><button type="button" onClick={() => setInput({ ...DRIFT_GUARD_EXAMPLE })}>Load example</button><button type="button" onClick={() => setInput({ ...DRIFT_GUARD_RESET })}>Reset</button></div>
    </form><section className="lab-output" aria-labelledby="drift-output" aria-live="polite"><h3 id="drift-output">Detection contract review</h3>
      {!result.valid ? <div className="lab-errors" role="alert"><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : <>
        <h4>Drift impacts</h4>{result.impacts.length ? result.impacts.map((item) => <article className="drift-impact" data-classification={item.classification} key={item.id}><h5>{item.field}: {item.classification}</h5><p><strong>Change:</strong> {item.change}</p><p>{item.impact}</p><p><strong>Affected claim:</strong> {item.affectedClaim}</p></article>) : <p>No declared metadata drift found.</p>}
        <h4>Repair contract</h4><ol>{result.repairContract.map((item, index) => <li key={`${item.field}-${index}`}><strong>{item.field} · {item.classification}</strong><p>{item.action}</p><p>Proof: {item.proof}</p></li>)}</ol>
        <h4>Regression vectors</h4><ul>{result.vectors.map((item) => <li key={item.id}>{item.label} — expect {item.expectValid ? "valid" : "invalid"}</li>)}</ul>
        <label htmlFor="drift-python">Copyable standard-library Python contract harness</label><textarea id="drift-python" rows="26" readOnly value={result.pythonHarness} onFocus={(event) => event.target.select()} /><button type="button" onClick={copyHarness}>Copy Python harness</button><p role="status">{copyStatus}</p>
        <p className="learning-note">{result.limitation}</p><h4>Official references</h4><ul>{result.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
      </>}
    </section></div>
  </section>;
}

