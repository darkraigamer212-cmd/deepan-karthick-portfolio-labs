import React, { useMemo, useState } from "react";
import {
  AZURE_HANDOFF_EXAMPLE_INPUT,
  AZURE_HANDOFF_RESET_INPUT,
  simulateAzureAccessHandoff
} from "./azureAccessHandoff.js";

export default function AzureAccessHandoffSimulator() {
  const [accessLines, setAccessLines] = useState(AZURE_HANDOFF_RESET_INPUT);
  const [copyStatus, setCopyStatus] = useState("");
  const result = useMemo(() => simulateAzureAccessHandoff(accessLines), [accessLines]);
  const copyChecklist = async () => {
    if (!result.valid || !navigator.clipboard) return setCopyStatus("Copy unavailable; select the checklist manually.");
    try { await navigator.clipboard.writeText(result.checklistText); setCopyStatus("Manager and security checklist copied."); }
    catch { setCopyStatus("Copy failed; select the checklist manually."); }
  };

  return (
    <section className="interactive-lab azure-access-handoff" aria-labelledby="azure-handoff-title">
      <header className="lab-tool-header">
        <h2 id="azure-handoff-title">Azure Access Handoff Simulator</h2>
        <p>Rehearse joining, moving, and leaving access decisions from a small team list. This local tool never connects to or changes an Azure tenant.</p>
      </header>

      <div className="lab-workspace">
        <form className="lab-control-panel" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="azure-access-lines">People and access, one record per line</label>
          <p id="azure-line-help"><code>name | status | role | resourceScope | privilegeLevel | sharedCredential | lastReviewDays</code></p>
          <textarea id="azure-access-lines" rows="12" aria-describedby="azure-line-help" value={accessLines} onChange={(event) => { setAccessLines(event.target.value); setCopyStatus(""); }} placeholder="Asha|new|developer|resource-group: demo|contributor|no|0" />
          <p>Status: new, active, role-change, or exiting. Privilege: reader, contributor, or owner. Shared credential: yes or no.</p>
          <div className="lab-actions">
            <button type="button" onClick={() => { setAccessLines(AZURE_HANDOFF_EXAMPLE_INPUT); setCopyStatus(""); }}>Load example</button>
            <button type="button" onClick={() => { setAccessLines(AZURE_HANDOFF_RESET_INPUT); setCopyStatus(""); }}>Reset</button>
          </div>
        </form>

        <section className="lab-output" aria-labelledby="azure-handoff-output" aria-live="polite">
          <h3 id="azure-handoff-output">Handoff-day plan</h3>
          {!result.valid ? <div className="lab-errors" role="alert"><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : (
            <>
              <p><strong>{result.findings.length}</strong> access risks found across <strong>{result.records.length}</strong> supplied people.</p>
              <section aria-labelledby="access-findings"><h4 id="access-findings">Findings</h4>{result.findings.length ? result.findings.map((item) => (
                <article className="access-finding" key={item.id} data-severity={item.severity}>
                  <h5>{item.person}: {item.type.replaceAll("-", " ")}</h5>
                  <p>{item.summary}</p><p><strong>Action:</strong> {item.action}</p><p><strong>Owner:</strong> {item.owner}</p><p><strong>Evidence:</strong> {item.evidence}</p>
                </article>
              )) : <p>No supplied record crossed the simulator's deterministic risk rules.</p>}</section>

              <section aria-labelledby="ordered-handoff"><h4 id="ordered-handoff">Ordered actions</h4><ol>{result.plan.map((item, index) => (
                <li key={`${item.person}-${index}`}><strong>P{item.priority} · {item.person}</strong><p>{item.action}</p><p>Owner: {item.owner}<br />Evidence: {item.evidence}</p></li>
              ))}</ol></section>

              <section aria-labelledby="handoff-checklist"><h4 id="handoff-checklist">Manager and security checklist</h4><ul>{result.checklist.map((item) => <li key={item}><label><input type="checkbox" /> {item}</label></li>)}</ul>
                <label htmlFor="copyable-access-checklist">Copyable checklist</label><textarea id="copyable-access-checklist" rows="10" readOnly value={result.checklistText} onFocus={(event) => event.target.select()} />
                <button type="button" onClick={copyChecklist}>Copy checklist</button><p role="status">{copyStatus}</p>
              </section>
              <p className="learning-note">{result.limitation}</p>
              <h4>Official Microsoft references</h4><ul>{result.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
