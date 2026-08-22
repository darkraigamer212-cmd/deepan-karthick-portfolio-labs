import React, { useState } from "react";
import {
  AI_WORKFLOW_EXAMPLE,
  REVIEW_LABELS,
  TASK_LABELS,
  buildAIWorkflow
} from "./aiWorkflowCanvas.js";

const EMPTY_FORM = { goal: "", dataSource: "", aiTask: "", reviewLevel: "" };

export default function AIWorkflowCanvas() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    setResult(buildAIWorkflow(form));
  };

  const loadExample = () => {
    setForm(AI_WORKFLOW_EXAMPLE);
    setResult(buildAIWorkflow(AI_WORKFLOW_EXAMPLE));
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setResult(null);
  };

  const errors = result?.errors ?? {};

  return (
    <section className="lab-tool" aria-labelledby="workflow-canvas-title">
      <div className="intro">
        <h2 id="workflow-canvas-title">AI Workflow Canvas</h2>
        <p>Map a useful AI idea into a source-aware workflow with human accountability.</p>
      </div>

      <form className="controls lab-form" onSubmit={submit} noValidate>
        <label>
          Goal
          <textarea
            name="goal"
            value={form.goal}
            onChange={updateField}
            rows="3"
            aria-describedby={errors.goal ? "workflow-goal-error" : undefined}
            aria-invalid={Boolean(errors.goal)}
            placeholder="What useful outcome should this workflow produce?"
          />
          {errors.goal && <small id="workflow-goal-error" role="alert">{errors.goal}</small>}
        </label>

        <label>
          Data source
          <textarea
            name="dataSource"
            value={form.dataSource}
            onChange={updateField}
            rows="3"
            aria-describedby={errors.dataSource ? "workflow-source-error" : undefined}
            aria-invalid={Boolean(errors.dataSource)}
            placeholder="Describe the files, records, or text available."
          />
          {errors.dataSource && <small id="workflow-source-error" role="alert">{errors.dataSource}</small>}
        </label>

        <label>
          AI task
          <select name="aiTask" value={form.aiTask} onChange={updateField} aria-invalid={Boolean(errors.aiTask)}>
            <option value="">Choose a task</option>
            {Object.entries(TASK_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          {errors.aiTask && <small role="alert">{errors.aiTask}</small>}
        </label>

        <label>
          Human review
          <select name="reviewLevel" value={form.reviewLevel} onChange={updateField} aria-invalid={Boolean(errors.reviewLevel)}>
            <option value="">Choose a review level</option>
            {Object.entries(REVIEW_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          {errors.reviewLevel && <small role="alert">{errors.reviewLevel}</small>}
        </label>

        <div className="button-row">
          <button type="submit">Build workflow</button>
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice">
            <h3>Ordered workflow</h3>
            <p>{result.summary}</p>
            <ol>
              {result.steps.map((step) => (
                <li key={step.title}><strong>{step.title}</strong><p>{step.detail}</p></li>
              ))}
            </ol>
          </section>

          <section className="implementation-notice">
            <h3>Risk register</h3>
            <ul>
              {result.risks.map((risk) => (
                <li key={risk.title}><strong>{risk.level}: {risk.title}</strong> — {risk.mitigation}</li>
              ))}
            </ul>
          </section>

          <section className="implementation-notice">
            <h3>Ready-to-run checklist</h3>
            <ul>{result.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        </div>
      )}
    </section>
  );
}

export { buildAIWorkflow } from "./aiWorkflowCanvas.js";
