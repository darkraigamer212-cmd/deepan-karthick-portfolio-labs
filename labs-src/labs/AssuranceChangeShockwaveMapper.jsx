import React, { useState } from "react";
import {
  ASSURANCE_EXAMPLE,
  ASSURANCE_REFERENCES,
  ASSURANCE_RESET,
  CHANGE_CATEGORIES,
  assuranceLimits,
  mapAssuranceChangeShockwave
} from "./assuranceChangeShockwave.js";

export default function AssuranceChangeShockwaveMapper() {
  const [form, setForm] = useState({ ...ASSURANCE_RESET });
  const [result, setResult] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const errors = result?.errors ?? {};

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setCopyStatus("");
  }

  function submit(event) {
    event.preventDefault();
    setResult(mapAssuranceChangeShockwave(form));
    setCopyStatus("");
  }

  function loadExample() {
    const example = { ...ASSURANCE_EXAMPLE };
    setForm(example);
    setResult(mapAssuranceChangeShockwave(example));
    setCopyStatus("");
  }

  function reset() {
    setForm({ ...ASSURANCE_RESET });
    setResult(null);
    setCopyStatus("");
  }

  async function copyMemo() {
    if (!result?.valid || !navigator.clipboard) {
      setCopyStatus("Copy is unavailable. Select the memo and copy it manually.");
      return;
    }
    try {
      await navigator.clipboard.writeText(result.executiveMemo);
      setCopyStatus("Executive change memo copied.");
    } catch {
      setCopyStatus("Copy failed. Select the memo and copy it manually.");
    }
  }

  return (
    <section className="lab30-assurance-shockwave" aria-labelledby="lab30-title">
      <header className="lab30-heading">
        <div>
          <h2 id="lab30-title">Assurance Change Shockwave</h2>
          <p>Trace which customer-facing control claims need evidence renewed after a vendor, system, configuration, or owner change.</p>
        </div>
        <p className="lab30-limit">Metadata-only planning. It never inspects a system, certifies compliance, approves an audit, or automatically accepts risk.</p>
      </header>

      <form className="lab30-controls" onSubmit={submit} noValidate>
        <label htmlFor="lab30-category">
          Change event category
          <select id="lab30-category" name="changeCategory" value={form.changeCategory} onChange={update} aria-invalid={Boolean(errors.changeCategory)}>
            <option value="">Choose one</option>
            {Object.entries(CHANGE_CATEGORIES).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          {errors.changeCategory && <small role="alert">{errors.changeCategory}</small>}
        </label>

        <label htmlFor="lab30-description">
          Generic change description
          <textarea id="lab30-description" name="changeDescription" rows="3" maxLength="280" value={form.changeDescription} onChange={update} aria-invalid={Boolean(errors.changeDescription)} placeholder="Describe what changed without system data, URLs, or credentials." />
          {errors.changeDescription && <small role="alert">{errors.changeDescription}</small>}
        </label>

        <label htmlFor="lab30-claims">
          Control-claim rows
          <textarea id="lab30-claims" name="claimRows" rows="8" value={form.claimRows} onChange={update} spellCheck="false" aria-invalid={Boolean(errors.claimRows)} aria-describedby="lab30-claims-help" />
          <small id="lab30-claims-help"><code>claim-id|customer/business promise|owner|review cadence days</code> — maximum {assuranceLimits.claims} rows.</small>
          {errors.claimRows && <small role="alert">{errors.claimRows}</small>}
        </label>

        <label htmlFor="lab30-evidence">
          Evidence dependency rows
          <textarea id="lab30-evidence" name="evidenceRows" rows="10" value={form.evidenceRows} onChange={update} spellCheck="false" aria-invalid={Boolean(errors.evidenceRows)} aria-describedby="lab30-evidence-help" />
          <small id="lab30-evidence-help"><code>evidence-id|claim-id|evidence type|age days|vendor,system,config,owner</code> — maximum {assuranceLimits.evidence} rows.</small>
          {errors.evidenceRows && <small role="alert">{errors.evidenceRows}</small>}
        </label>

        <label htmlFor="lab30-risks">
          Accepted-risk decision rows (optional)
          <textarea id="lab30-risks" name="acceptedRiskRows" rows="5" value={form.acceptedRiskRows} onChange={update} spellCheck="false" aria-invalid={Boolean(errors.acceptedRiskRows)} aria-describedby="lab30-risks-help" />
          <small id="lab30-risks-help"><code>risk-id|claim-id|days until expiry</code>. Zero or negative means expired; 1–30 means due soon.</small>
          {errors.acceptedRiskRows && <small role="alert">{errors.acceptedRiskRows}</small>}
        </label>

        <div className="lab30-actions">
          <button type="submit">Map the change shockwave</button>
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {result && !result.valid && (
        <div className="lab30-errors" role="alert" aria-live="assertive">
          <h3>Complete the metadata contract</h3>
          <ul>{Object.values(result.errors).map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}

      {result?.valid && (
        <div className="lab30-results" aria-live="polite">
          <section aria-labelledby="lab30-summary-title">
            <h3 id="lab30-summary-title">Claim impact summary</h3>
            <dl>
              <div><dt>Invalidated evidence chain</dt><dd>{result.summary.invalidated}</dd></div>
              <div><dt>Needs cadence review</dt><dd>{result.summary.needsReview}</dd></div>
              <div><dt>Current from supplied metadata</dt><dd>{result.summary.current}</dd></div>
            </dl>
            <p>A category dependency invalidates evidence, not the control itself. “Current” is not a compliance certification.</p>
          </section>

          <section aria-labelledby="lab30-claims-title">
            <h3 id="lab30-claims-title">Claim disposition</h3>
            <div className="lab30-table-wrap"><table>
              <caption>Change and cadence result for every customer or business promise</caption>
              <thead><tr><th scope="col">Claim</th><th scope="col">Promise</th><th scope="col">Owner</th><th scope="col">State</th><th scope="col">Evidence needed</th></tr></thead>
              <tbody>{result.claims.map((claim) => <tr key={claim.id}><th scope="row">{claim.id}</th><td>{claim.promise}</td><td>{claim.owner}</td><td>{claim.status}</td><td>{claim.evidenceNeeded}</td></tr>)}</tbody>
            </table></div>
          </section>

          <section aria-labelledby="lab30-evidence-title">
            <h3 id="lab30-evidence-title">Evidence dependency shockwave</h3>
            <div className="lab30-table-wrap"><table>
              <caption>Why each evidence record remains current or needs action</caption>
              <thead><tr><th scope="col">Evidence</th><th scope="col">Claim</th><th scope="col">Type</th><th scope="col">Dependencies</th><th scope="col">Age / cadence</th><th scope="col">State and reason</th></tr></thead>
              <tbody>{result.evidence.map((item) => <tr key={item.id}><th scope="row">{item.id}</th><td>{item.claimId}</td><td>{item.type}</td><td>{item.dependsOn.join(", ")}</td><td>{item.ageDays} / {item.cadenceDays} days</td><td><strong>{item.state}</strong>: {item.reason}</td></tr>)}</tbody>
            </table></div>
          </section>

          <section aria-labelledby="lab30-renewal-title">
            <h3 id="lab30-renewal-title">Transparent renewal order</h3>
            <p>Order: invalidated before needs-review before current; then expired/due-soon decisions, overdue cadence, and claim ID.</p>
            <ol>{result.renewalOrder.map((item) => <li key={item.claimId}><strong>{item.claimId} · {item.owner} · {item.status}</strong><p>{item.evidenceNeeded}</p></li>)}</ol>
          </section>

          <section aria-labelledby="lab30-risk-title">
            <h3 id="lab30-risk-title">Accepted-risk decision windows</h3>
            {result.riskDecisions.length ? <ul>{result.riskDecisions.map((risk) => <li key={risk.id}><strong>{risk.id} · {risk.claimId} · {risk.status}</strong>: {risk.decision}</li>)}</ul> : <p>No accepted-risk rows were supplied. The tool does not infer or accept risk.</p>}
          </section>

          <section aria-labelledby="lab30-assumptions-title">
            <h3 id="lab30-assumptions-title">Assumptions and limits</h3>
            <ul>{result.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
            <p>{result.limits}</p>
          </section>

          <section aria-labelledby="lab30-memo-title">
            <h3 id="lab30-memo-title">Executive change memo</h3>
            <label htmlFor="lab30-memo">Copyable change and evidence decision memo</label>
            <textarea id="lab30-memo" rows="24" readOnly value={result.executiveMemo} onFocus={(event) => event.target.select()} />
            <button type="button" onClick={copyMemo}>Copy executive memo</button>
            <p role="status" aria-live="polite">{copyStatus}</p>
          </section>
        </div>
      )}

      <aside className="lab30-references" aria-labelledby="lab30-references-title">
        <h3 id="lab30-references-title">NIST grounding</h3>
        <ul>{ASSURANCE_REFERENCES.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a></li>)}</ul>
        <p>The mapper borrows assessment and continuous-monitoring concepts; it does not claim NIST conformance.</p>
      </aside>
    </section>
  );
}
