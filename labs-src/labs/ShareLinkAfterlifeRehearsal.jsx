import React, { useState } from "react";
import { SHARE_AFTERLIFE_EXAMPLE, rehearseShareAfterlife } from "./shareLinkAfterlife.js";

const EMPTY_FORM = {
  artifactLabel: "", classification: "", recipientRows: "", accessMode: "", permission: "", expiryDays: "",
  residue: { download: false, copy: false, screenshot: true, cache: false, forwardedNotification: false }
};
const RESIDUE_LABELS = {
  download: "Recipients can download",
  copy: "Recipients can copy content",
  screenshot: "Screenshot or camera capture is possible",
  cache: "A cached or indexed preview may remain",
  forwardedNotification: "A notification may be forwarded"
};

export default function ShareLinkAfterlifeRehearsal() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateResidue = (event) => setForm((current) => ({ ...current, residue: { ...current.residue, [event.target.name]: event.target.checked } }));
  const submit = (event) => { event.preventDefault(); setCopied(false); setResult(rehearseShareAfterlife(form)); };
  const loadExample = () => { setForm(SHARE_AFTERLIFE_EXAMPLE); setCopied(false); setResult(rehearseShareAfterlife(SHARE_AFTERLIFE_EXAMPLE)); };
  const reset = () => { setForm(EMPTY_FORM); setResult(null); setCopied(false); };
  const copyContract = async () => { await navigator.clipboard.writeText(result.contract); setCopied(true); };
  const errors = result?.errors ?? {};

  return (
    <section className="lab-tool" aria-labelledby="share-afterlife-title">
      <div className="intro"><h2 id="share-afterlife-title">Share-Link Afterlife Rehearsal</h2><p>Decide what remains after revocation before sharing. Enter generic policy metadata only—never a URL, file, identity, token, or file content.</p></div>
      <form className="controls lab-form" onSubmit={submit} noValidate>
        <label>Generic artifact label<input name="artifactLabel" value={form.artifactLabel} onChange={updateField} aria-invalid={Boolean(errors.artifactLabel)} />{errors.artifactLabel && <small role="alert">{errors.artifactLabel}</small>}</label>
        <Choice label="Classification" name="classification" value={form.classification} onChange={updateField} error={errors.classification} options={[['internal','Internal'],['confidential','Confidential'],['restricted','Restricted']]} />
        <label>Recipient-role needs<textarea name="recipientRows" rows="7" value={form.recipientRows} onChange={updateField} placeholder="role|business need|view/edit|required days" aria-invalid={Boolean(errors.recipientRows)} /><small>Use generic roles, not names or addresses. Maximum 12 rows.</small>{errors.recipientRows && <ul role="alert">{errors.recipientRows.map((error) => <li key={error}>{error}</li>)}</ul>}</label>
        <Choice label="Provider access mode" name="accessMode" value={form.accessMode} onChange={updateField} error={errors.accessMode} options={[['specific','Specific recipients'],['organization','Anyone in the organization'],['anyone','Anyone with the link']]} />
        <Choice label="Provider permission" name="permission" value={form.permission} onChange={updateField} error={errors.permission} options={[['view','View'],['edit','Edit']]} />
        <label>Provider expiry days<input type="number" min="1" max="365" step="1" name="expiryDays" value={form.expiryDays} onChange={updateField} aria-invalid={Boolean(errors.expiryDays)} />{errors.expiryDays && <small role="alert">{errors.expiryDays}</small>}</label>
        <fieldset><legend>Residue capabilities</legend>{Object.entries(RESIDUE_LABELS).map(([name, label]) => <label key={name}><input type="checkbox" name={name} checked={form.residue[name]} onChange={updateResidue} /> {label}</label>)}</fieldset>
        <div className="button-row"><button type="submit">Rehearse afterlife</button><button type="button" onClick={loadExample}>Load example</button><button type="button" onClick={reset}>Reset</button></div>
      </form>
      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice"><h3>Gate: {result.decision.gate.replaceAll('-', ' ')}</h3><p>{result.decision.gateReason}</p><ul>{result.decision.corrections.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section className="implementation-notice"><h3>Revocable and non-revocable afterlife ledger</h3><ul>{result.ledger.map((item) => <li key={item.kind}><strong>{item.kind}: {item.revocable}</strong><p>{item.residue}</p><p>Owner: {item.owner} · Evidence: {item.evidence}</p></li>)}</ul></section>
          <section className="implementation-notice"><h3>Expiry and revocation verification</h3><ol>{result.verification.map((step) => <li key={step}>{step}</li>)}</ol></section>
          <section className="implementation-notice"><h3>Copyable pre-share and expiry contract</h3><textarea readOnly rows="24" value={result.contract} aria-label="Generated pre-share and expiry contract" /><button type="button" onClick={copyContract}>Copy contract</button><span role="status">{copied ? " Contract copied." : ""}</span></section>
        </div>
      )}
    </section>
  );
}

function Choice({ label, name, value, onChange, error, options }) {
  return <label>{label}<select name={name} value={value} onChange={onChange} aria-invalid={Boolean(error)}><option value="">Choose one</option>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select>{error && <small role="alert">{error}</small>}</label>;
}

export { parseRecipientRoles, rehearseShareAfterlife } from "./shareLinkAfterlife.js";
