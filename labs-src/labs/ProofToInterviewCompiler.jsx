import React, { useState } from "react";
import { PROOF_COMPILER_EXAMPLE, compileProofToInterview } from "./proofToInterviewCompiler.js";

const EMPTY_FORM = { targetRole: "", taskStatements: "", situation: "", action: "", outcome: "", artifactRows: "", skillClaims: "" };

export default function ProofToInterviewCompiler() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => { event.preventDefault(); setCopied(false); setResult(compileProofToInterview(form)); };
  const loadExample = () => { setForm(PROOF_COMPILER_EXAMPLE); setCopied(false); setResult(compileProofToInterview(PROOF_COMPILER_EXAMPLE)); };
  const reset = () => { setForm(EMPTY_FORM); setResult(null); setCopied(false); };
  const copyPacket = async () => { await navigator.clipboard.writeText(result.evidencePacket); setCopied(true); };
  const errors = result?.errors ?? {};

  return (
    <section className="lab-tool" aria-labelledby="proof-compiler-title">
      <div className="intro"><h2 id="proof-compiler-title">Proof-to-Interview Compiler</h2><p>Compile generic project evidence into internship material without inventing employers, metrics, outcomes, links, or hiring promises.</p></div>
      <form className="controls lab-form" onSubmit={submit} noValidate>
        <Field label="Target cybersecurity role" name="targetRole" value={form.targetRole} onChange={updateField} error={errors.targetRole} />
        <Area label="Target task statements" name="taskStatements" rows="5" value={form.taskStatements} onChange={updateField} error={errors.taskStatements} help="One generic task per line; maximum 8." />
        <Area label="Project situation" name="situation" rows="3" value={form.situation} onChange={updateField} error={errors.situation} />
        <Area label="Project action" name="action" rows="3" value={form.action} onChange={updateField} error={errors.action} />
        <Area label="Project outcome" name="outcome" rows="3" value={form.outcome} onChange={updateField} error={errors.outcome} />
        <Area label="Artifact evidence" name="artifactRows" rows="7" value={form.artifactRows} onChange={updateField} error={errors.artifactRows} help="artifact-id|type code/test/report/demo|what it proves. Maximum 16; no links." />
        <Area label="Candidate skill claims" name="skillClaims" rows="6" value={form.skillClaims} onChange={updateField} error={errors.skillClaims} help="One claim per line; maximum 12." />
        <div className="button-row"><button type="submit">Compile evidence</button><button type="button" onClick={loadExample}>Load example</button><button type="button" onClick={reset}>Reset</button></div>
      </form>
      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice"><h3>Claim evidence ledger</h3><ul>{result.claims.map((item) => <li key={item.claim}><strong>{item.status}: {item.claim}</strong><p>{item.reason} {item.citations.length ? `Citations: ${item.citations.join(', ')}.` : "Claim withheld."}</p></li>)}</ul></section>
          <section className="implementation-notice"><h3>NICE-aligned task evidence map</h3><ul>{result.taskMap.map((item) => <li key={item.task}><strong>{item.status}:</strong> {item.task} {item.citations.length ? `[${item.citations.join(', ')}]` : "[evidence needed]"}</li>)}</ul></section>
          <section className="implementation-notice"><h3>Citation-bearing resume bullets</h3>{result.resumeBullets.length ? <ul>{result.resumeBullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : <p>No bullet released; add evidence first.</p>}</section>
          <section className="implementation-notice"><h3>STAR answer</h3><pre>{result.starAnswer}</pre></section>
          <section className="implementation-notice"><h3>One gap drill</h3><p>{result.gapDrill}</p></section>
          <section className="implementation-notice"><h3>Interviewer evidence packet</h3><textarea readOnly rows="24" value={result.evidencePacket} aria-label="Generated interviewer evidence packet" /><button type="button" onClick={copyPacket}>Copy evidence packet</button><span role="status">{copied ? " Packet copied." : ""}</span></section>
        </div>
      )}
    </section>
  );
}

function Field({ label, name, value, onChange, error }) {
  return <label>{label}<input name={name} value={value} onChange={onChange} aria-invalid={Boolean(error)} />{error && <Error error={error} />}</label>;
}
function Area({ label, name, value, onChange, error, rows, help }) {
  return <label>{label}<textarea name={name} value={value} onChange={onChange} rows={rows} aria-invalid={Boolean(error)} />{help && <small>{help}</small>}{error && <Error error={error} />}</label>;
}
function Error({ error }) {
  return Array.isArray(error) ? <ul role="alert">{error.map((item) => <li key={item}>{item}</li>)}</ul> : <small role="alert">{error}</small>;
}

export { compileProofToInterview, parseArtifacts } from "./proofToInterviewCompiler.js";
