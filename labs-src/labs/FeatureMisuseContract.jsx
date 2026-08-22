import React, { useState } from "react";
import {
  DATA_CATEGORIES,
  MISUSE_EXAMPLE,
  MISUSE_RESET,
  OWASP_REFERENCES,
  buildFeatureMisuseContract,
  misuseLimits
} from "./feature-misuse-contract.js";

export default function FeatureMisuseContract() {
  const [form, setForm] = useState({ ...MISUSE_RESET, boundaries: MISUSE_RESET.boundaries.map((item) => ({ ...item })) });
  const [result, setResult] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const errors = result?.errors ?? {};

  function updateText(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setCopyStatus("");
  }

  function toggleData(event) {
    const { value, checked } = event.target;
    setForm((current) => ({
      ...current,
      dataCategories: checked
        ? (value === "none" ? ["none"] : [...current.dataCategories.filter((category) => category !== "none"), value])
        : current.dataCategories.filter((category) => category !== value)
    }));
    setCopyStatus("");
  }

  function updateBoundary(index, field, value) {
    setForm((current) => ({
      ...current,
      boundaries: current.boundaries.map((boundary, boundaryIndex) => boundaryIndex === index ? { ...boundary, [field]: value } : boundary)
    }));
    setCopyStatus("");
  }

  function addBoundary() {
    setForm((current) => current.boundaries.length >= misuseLimits.maxBoundaries ? current : ({
      ...current,
      boundaries: [...current.boundaries, { from: "", to: "", action: "" }]
    }));
  }

  function removeBoundary(index) {
    setForm((current) => current.boundaries.length === 1 ? current : ({
      ...current,
      boundaries: current.boundaries.filter((_, boundaryIndex) => boundaryIndex !== index)
    }));
  }

  function submit(event) {
    event.preventDefault();
    setResult(buildFeatureMisuseContract(form));
    setCopyStatus("");
  }

  function loadExample() {
    const example = { ...MISUSE_EXAMPLE, dataCategories: [...MISUSE_EXAMPLE.dataCategories], boundaries: MISUSE_EXAMPLE.boundaries.map((item) => ({ ...item })) };
    setForm(example);
    setResult(buildFeatureMisuseContract(example));
    setCopyStatus("");
  }

  function reset() {
    setForm({ ...MISUSE_RESET, dataCategories: [], boundaries: MISUSE_RESET.boundaries.map((item) => ({ ...item })) });
    setResult(null);
    setCopyStatus("");
  }

  async function copyContract() {
    if (!result?.valid || !navigator.clipboard) {
      setCopyStatus("Copy is unavailable. Select the contract and copy it manually.");
      return;
    }
    try {
      await navigator.clipboard.writeText(result.acceptanceContract);
      setCopyStatus("PR acceptance contract copied.");
    } catch {
      setCopyStatus("Copy failed. Select the contract and copy it manually.");
    }
  }

  return (
    <section className="lab24-misuse-contract" aria-labelledby="lab24-title">
      <header className="lab24-heading">
        <div>
          <h2 id="lab24-title">Feature Misuse Contract</h2>
          <p>Turn one customer promise into tracked negative acceptance tests before shipping the feature.</p>
        </div>
        <p className="lab24-limit">Design-time planning only. No scanning, exploitation, credentials, attack code, CVSS scores, or target URLs.</p>
      </header>

      <form className="lab24-controls" onSubmit={submit} noValidate>
        <label htmlFor="lab24-promise">
          Feature and customer promise
          <textarea id="lab24-promise" name="promise" rows="4" maxLength="320" value={form.promise} onChange={updateText} aria-invalid={Boolean(errors.promise)} placeholder="Who can do what, and what must customers be able to trust?" />
          {errors.promise && <small role="alert">{errors.promise}</small>}
        </label>

        <label htmlFor="lab24-roles">
          Actor roles
          <textarea id="lab24-roles" name="actorRoles" rows="3" value={form.actorRoles} onChange={updateText} aria-invalid={Boolean(errors.actorRoles)} placeholder="Owner, Admin, Member, Support agent" />
          <small>Separate 2–{misuseLimits.maxRoles} roles with commas or new lines. Put the most privileged role first.</small>
          {errors.actorRoles && <small role="alert">{errors.actorRoles}</small>}
        </label>

        <fieldset aria-describedby={errors.dataCategories ? "lab24-data-error" : undefined}>
          <legend>Sensitive data categories</legend>
          {Object.entries(DATA_CATEGORIES).map(([value, label]) => (
            <label key={value}>
              <input type="checkbox" value={value} checked={form.dataCategories.includes(value)} onChange={toggleData} />
              {label}
            </label>
          ))}
          {errors.dataCategories && <small id="lab24-data-error" role="alert">{errors.dataCategories}</small>}
        </fieldset>

        <fieldset>
          <legend>Trust-boundary actions</legend>
          <p>Describe each feature action that crosses from one actor, client, service, or store to another.</p>
          {form.boundaries.map((boundary, index) => (
            <fieldset className="lab24-boundary-row" key={`boundary-${index}`}>
              <legend>Boundary {index + 1}</legend>
              <label>
                From
                <input type="text" value={boundary.from} maxLength="80" onChange={(event) => updateBoundary(index, "from", event.target.value)} />
              </label>
              <label>
                To
                <input type="text" value={boundary.to} maxLength="80" onChange={(event) => updateBoundary(index, "to", event.target.value)} />
              </label>
              <label>
                Action
                <input type="text" value={boundary.action} maxLength="140" onChange={(event) => updateBoundary(index, "action", event.target.value)} />
              </label>
              <button type="button" onClick={() => removeBoundary(index)} disabled={form.boundaries.length === 1}>Remove boundary {index + 1}</button>
            </fieldset>
          ))}
          <button type="button" onClick={addBoundary} disabled={form.boundaries.length >= misuseLimits.maxBoundaries}>Add boundary</button>
          {errors.boundaries && <small role="alert">{errors.boundaries}</small>}
        </fieldset>

        <div className="lab24-actions">
          <button type="submit">Build misuse contract</button>
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {result && !result.valid && (
        <div className="lab24-errors" role="alert" aria-live="assertive">
          <h3>Complete the feature contract</h3>
          <ul>{Object.values(result.errors).map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}

      {result?.valid && (
        <div className="lab24-results" aria-live="polite">
          <section aria-labelledby="lab24-stories-title">
            <h3 id="lab24-stories-title">Prioritized defensive misuse stories</h3>
            <p>{result.stories.length} feature-specific stories. Priority is a planning order, not a CVSS or vulnerability claim.</p>
            <ol className="lab24-story-list">{result.stories.map((story) => (
              <li key={story.id}>
                <article>
                  <header><h4>{story.id} · {story.priority}</h4><a href={story.category.url} target="_blank" rel="noreferrer">{story.category.id} {story.category.title}</a></header>
                  <p><strong>Broken promise:</strong> {story.promiseBroken}</p>
                  <p><strong>Safe misuse scenario:</strong> {story.scenario}</p>
                  <p><strong>Negative acceptance test:</strong> {story.test}</p>
                  <p><strong>Observable pass condition:</strong> {story.passCondition}</p>
                  <dl><div><dt>Control owner</dt><dd>{story.owner}</dd></div><div><dt>Required evidence</dt><dd>{story.evidence}</dd></div></dl>
                </article>
              </li>
            ))}</ol>
          </section>

          <section aria-labelledby="lab24-assumptions-title">
            <h3 id="lab24-assumptions-title">Assumptions and limits</h3>
            <ul>{result.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
            <p>{result.limits}</p>
          </section>

          <section aria-labelledby="lab24-pr-title">
            <h3 id="lab24-pr-title">Copyable PR acceptance contract</h3>
            <label htmlFor="lab24-contract">Generated pull-request checklist</label>
            <textarea id="lab24-contract" rows="28" readOnly value={result.acceptanceContract} onFocus={(event) => event.target.select()} />
            <button type="button" onClick={copyContract}>Copy PR contract</button>
            <p role="status" aria-live="polite">{copyStatus}</p>
          </section>
        </div>
      )}

      <aside className="lab24-references" aria-labelledby="lab24-references-title">
        <h3 id="lab24-references-title">Official OWASP grounding</h3>
        <ul>{OWASP_REFERENCES.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a></li>)}</ul>
        <p>OWASP categories organize discussion; they are not proof of coverage or a substitute for professional review.</p>
      </aside>
    </section>
  );
}
