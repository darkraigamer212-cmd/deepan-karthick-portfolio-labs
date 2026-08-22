import React, { useMemo, useState } from "react";
import { composeRecoveryDrill, RECOVERY_DRILL_EXAMPLE, RECOVERY_DRILL_RESET, RECOVERY_SCENARIOS } from "./accountRecoveryDrill.js";

export default function AccountRecoveryDrillComposer() {
  const [rows, setRows] = useState(RECOVERY_DRILL_RESET), [scenarios, setScenarios] = useState(["device-loss"]);
  const result = useMemo(() => composeRecoveryDrill(rows, scenarios), [rows, scenarios]);
  const toggle = (key) => setScenarios((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  return <section className="interactive-lab account-recovery-drill" aria-labelledby="recovery-drill-title">
    <header className="lab-tool-header"><h2 id="recovery-drill-title">Account Recovery Drill Composer</h2><p>Plan a no-secrets tabletop exercise for a family or small team. Never enter usernames, addresses, passwords, codes, answers, or keys.</p></header>
    <div className="lab-workspace"><form className="lab-control-panel" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="recovery-rows">Account-method categories, one row per account</label><p id="recovery-format"><code>account label | importance | primary MFA | recovery methods | notification channel</code></p>
      <textarea id="recovery-rows" rows="10" aria-describedby="recovery-format" value={rows} onChange={(event) => setRows(event.target.value)} placeholder="Family email|critical|authenticator-app|saved-code,backup-device|push" />
      <p>Allowed methods: saved-code, backup-device, recovery-email, recovery-phone, recovery-contact, provider-support.</p>
      <fieldset><legend>Loss scenarios</legend>{Object.entries(RECOVERY_SCENARIOS).map(([key, label]) => <label key={key}><input type="checkbox" checked={scenarios.includes(key)} onChange={() => toggle(key)} /> {label}</label>)}</fieldset>
      <div className="lab-actions"><button type="button" onClick={() => { setRows(RECOVERY_DRILL_EXAMPLE); setScenarios(["device-loss", "phone-loss", "email-loss"]); }}>Load example</button><button type="button" onClick={() => { setRows(RECOVERY_DRILL_RESET); setScenarios(["device-loss"]); }}>Reset</button></div>
    </form><section className="lab-output" aria-labelledby="recovery-output" aria-live="polite"><h3 id="recovery-output">Recovery tabletop package</h3>
      {!result.valid ? <div className="lab-errors" role="alert"><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : <>
        <h4>Correlated risks</h4>{result.findings.length ? result.findings.map((item) => <article key={item.id} className="recovery-finding" data-severity={item.severity}><h5>{item.account}: {item.issue}</h5><p>{item.detail}</p><p><strong>Next action:</strong> {item.action}</p></article>) : <p>No deterministic correlation rule fired; provider-specific review is still required.</p>}
        <h4>Safe drill steps</h4><ol>{result.drillSteps.map((step) => <li key={step}>{step}</li>)}</ol>
        <h4>Verification and notification checklist</h4><ul>{result.checklist.map((item) => <li key={item}><label><input type="checkbox" /> {item}</label></li>)}</ul>
        <h4>Emergency cards without secrets</h4>{result.emergencyCards.map((card) => <article key={card.id} className="emergency-card"><h5>{card.account} · {card.scenario}</h5><p><strong>First safe action:</strong> {card.firstAction}</p><p><strong>Surviving method categories:</strong> {card.survivingMethods.join(", ") || "None declared"}</p><p><strong>Notification check:</strong> {card.notificationCheck}</p></article>)}
        <h4>Owned next actions</h4><ul>{result.nextActions.map((item, index) => <li key={`${item.account}-${index}`}><strong>{item.account}:</strong> {item.action}<br />Owner: {item.owner}<br />Evidence: {item.evidence}</li>)}</ul>
        <p className="learning-note">{result.limitation}</p><h4>Official safety references</h4><ul>{result.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
      </>}
    </section></div>
  </section>;
}
