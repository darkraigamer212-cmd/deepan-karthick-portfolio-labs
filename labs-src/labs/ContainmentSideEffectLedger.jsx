import React, { useMemo, useState } from "react";
import { buildContainmentLedger, CONTAINMENT_EXAMPLE, CONTAINMENT_RESET } from "./containmentSideEffectLedger.js";

export default function ContainmentSideEffectLedger() {
  const [input, setInput] = useState({ ...CONTAINMENT_RESET }), [copyStatus, setCopyStatus] = useState("");
  const result = useMemo(() => buildContainmentLedger(input), [input]);
  const update = (key) => (event) => { setCopyStatus(""); setInput((current) => ({ ...current, [key]: event.target.value })); };
  const copyHandoff = async () => { if (!result.valid || !navigator.clipboard) return setCopyStatus("Copy unavailable; select the handoff manually."); try { await navigator.clipboard.writeText(result.handoff); setCopyStatus("Analyst handoff copied."); } catch { setCopyStatus("Copy failed; select the handoff manually."); } };
  return <section className="interactive-lab containment-side-effect-ledger" aria-labelledby="containment-title">
    <header className="lab-tool-header"><h2 id="containment-title">Containment Side-Effect Ledger</h2><p>Help a junior SOC analyst decide what needs escalation before containment. Enter defensive metadata only—never telemetry, indicators, credentials, payloads, queries, URLs, or executable steps.</p></header>
    <div className="lab-workspace"><form className="lab-control-panel" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="containment-claim">Alert claim<textarea id="containment-claim" rows="3" value={input.alertClaim} onChange={update("alertClaim")} /></label>
      <label htmlFor="containment-promise">Affected service or customer promise<textarea id="containment-promise" rows="3" value={input.affectedPromise} onChange={update("affectedPromise")} /></label>
      <label htmlFor="containment-evidence">Evidence metadata, one row per fact<textarea id="containment-evidence" rows="7" value={input.evidenceRows} onChange={update("evidenceRows")} placeholder="fact|source category|confidence" /></label>
      <p>Sources: endpoint, identity, application, network, customer-report, change-record. Confidence: low, medium, high.</p>
      <label htmlFor="containment-actions">Candidate action labels<textarea id="containment-actions" rows="7" value={input.actionRows} onChange={update("actionRows")} placeholder="action|reversibility|service harm|owner" /></label>
      <p>Reversibility: reversible, partial, irreversible. Harm: low, medium, high. Owner must be a role, not contact details.</p>
      <div className="lab-actions"><button type="button" onClick={() => setInput({ ...CONTAINMENT_EXAMPLE })}>Load example</button><button type="button" onClick={() => setInput({ ...CONTAINMENT_RESET })}>Reset</button></div>
    </form><section className="lab-output" aria-labelledby="containment-output" aria-live="polite"><h3 id="containment-output">Escalation ledger</h3>
      {!result.valid ? <div className="lab-errors" role="alert"><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : <>
        <h4>Evidence gaps and uncertainty</h4><ul>{result.evidenceGaps.map((item) => <li key={item}>{item}</li>)}</ul>
        {result.ledger.map((item) => <article className="containment-ledger-entry" key={item.id} data-disposition={item.disposition}><h4>{item.action}</h4><p><strong>Disposition:</strong> {item.disposition}</p><p><strong>Owner:</strong> {item.owner}</p><p><strong>Customer side effect:</strong> {item.customerSideEffect}</p><p><strong>Evidence gate:</strong> {item.evidenceGate}</p><h5>Collect before action</h5><ul>{item.evidenceBeforeAction.map((gate) => <li key={gate}>{gate}</li>)}</ul><p><strong>Rollback/recovery proof:</strong> {item.rollbackRecoveryProof}</p><p><strong>Escalation trigger:</strong> {item.escalationTrigger}</p></article>)}
        <label htmlFor="containment-handoff">Copyable analyst handoff</label><textarea id="containment-handoff" rows="24" readOnly value={result.handoff} onFocus={(event) => event.target.select()} /><button type="button" onClick={copyHandoff}>Copy handoff</button><p role="status">{copyStatus}</p>
        <p className="learning-note">{result.limitation}</p><h4>Official source</h4><ul>{result.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
      </>}
    </section></div>
  </section>;
}

