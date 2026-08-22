import React, { useState } from "react";
import { RESPONSIVE_HANDOFF_EXAMPLE, buildResponsiveHandoff } from "./responsiveConstraintHandoff.js";

const EMPTY_FORM = { screenTask: "", viewportWidths: "", componentInventory: "" };

export default function ResponsiveConstraintHandoff() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    setCopied(false);
    setResult(buildResponsiveHandoff(form));
  };
  const loadExample = () => {
    setForm(RESPONSIVE_HANDOFF_EXAMPLE);
    setCopied(false);
    setResult(buildResponsiveHandoff(RESPONSIVE_HANDOFF_EXAMPLE));
  };
  const reset = () => {
    setForm(EMPTY_FORM);
    setResult(null);
    setCopied(false);
  };
  const copyCss = async () => {
    await navigator.clipboard.writeText(result.cssStarter);
    setCopied(true);
  };
  const errors = result?.errors ?? {};

  return (
    <section className="lab-tool" aria-labelledby="responsive-handoff-title">
      <div className="intro">
        <h2 id="responsive-handoff-title">Responsive Constraint Handoff</h2>
        <p>Turn component constraints into explicit reflow, visibility, focus-order, and QA decisions—not another breakpoint preview.</p>
      </div>
      <form className="controls lab-form" onSubmit={submit} noValidate>
        <label>
          Screen and primary task
          <textarea name="screenTask" rows="3" value={form.screenTask} onChange={updateField} aria-invalid={Boolean(errors.screenTask)} />
          {errors.screenTask && <small role="alert">{errors.screenTask}</small>}
        </label>
        <label>
          Viewport widths in pixels
          <input name="viewportWidths" value={form.viewportWidths} onChange={updateField} placeholder="360, 768, 1024, 1440" aria-invalid={Boolean(errors.viewportWidths)} />
          {errors.viewportWidths && <ErrorList items={errors.viewportWidths} />}
        </label>
        <label>
          Component inventory
          <textarea name="componentInventory" rows="9" value={form.componentInventory} onChange={updateField} placeholder="name|priority|minimum width|interaction type" aria-invalid={Boolean(errors.componentInventory)} />
          <small>Priority: critical/high/medium/low. Interaction: navigation/input/action/content/decorative. Maximum 20 rows.</small>
          {errors.componentInventory && <ErrorList items={errors.componentInventory} />}
        </label>
        <div className="button-row">
          <button type="submit">Generate handoff</button>
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice">
            <h3>Viewport decisions</h3>
            {result.layouts.map((layout) => (
              <article key={layout.viewport}>
                <h4>{layout.viewport}px — {layout.feasible ? `${layout.rows.length} reflow row(s)` : "collision requires redesign"}</h4>
                {layout.collisionWarnings.length > 0 && <ErrorList items={layout.collisionWarnings} />}
                <ol>{layout.decisions.map((item) => <li key={item.name}><strong>{item.name}:</strong> {item.decision}</li>)}</ol>
              </article>
            ))}
          </section>
          <section className="implementation-notice">
            <h3>Keyboard and focus order</h3>
            <ol>{result.focusOrder.map((item) => <li key={item.name}>{item.name} ({item.interaction})</li>)}</ol>
          </section>
          <section className="implementation-notice">
            <h3>CSS Grid starter</h3>
            <textarea readOnly rows="14" value={result.cssStarter} aria-label="Generated CSS Grid starter" />
            <button type="button" onClick={copyCss}>Copy CSS starter</button><span role="status">{copied ? " CSS copied." : ""}</span>
          </section>
          <section className="implementation-notice">
            <h3>QA handoff checklist</h3>
            <ul>{result.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        </div>
      )}
    </section>
  );
}

function ErrorList({ items }) {
  return <ul role="alert">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export { buildResponsiveHandoff, parseComponentInventory, parseViewportWidths } from "./responsiveConstraintHandoff.js";
