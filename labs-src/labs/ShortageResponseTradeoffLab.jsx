import React, { useState } from "react";
import { SHORTAGE_EXAMPLE, compareShortageResponses } from "./shortageResponseTradeoff.js";

const EMPTY_FORM = { essentialItem: "", demandRows: "", availableUnits: "", baselinePrice: "", unitCost: "", candidatePrice: "", purchaseCap: "" };
const NUMBER_FIELDS = [["availableUnits", "Available units", 1], ["baselinePrice", "Baseline price per unit", 0], ["unitCost", "Cost per unit", 0], ["candidatePrice", "Candidate price per unit", 0], ["purchaseCap", "Purchase cap per buyer", 1]];

export default function ShortageResponseTradeoffLab() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    setCopied(false);
    setResult(compareShortageResponses(form));
  };
  const loadExample = () => {
    setForm(SHORTAGE_EXAMPLE);
    setCopied(false);
    setResult(compareShortageResponses(SHORTAGE_EXAMPLE));
  };
  const reset = () => {
    setForm(EMPTY_FORM);
    setResult(null);
    setCopied(false);
  };
  const copyMemo = async () => {
    await navigator.clipboard.writeText(result.memo);
    setCopied(true);
  };
  const errors = result?.errors ?? {};

  return (
    <section className="lab-tool" aria-labelledby="shortage-tradeoff-title">
      <div className="intro"><h2 id="shortage-tradeoff-title">Shortage Response Trade-off Lab</h2><p>Compare access and spending consequences of two explicit allocation policies. This is not pricing advice and uses no external market data.</p></div>
      <form className="controls lab-form" onSubmit={submit} noValidate>
        <label>Essential item<input name="essentialItem" value={form.essentialItem} onChange={updateField} aria-invalid={Boolean(errors.essentialItem)} />{errors.essentialItem && <small role="alert">{errors.essentialItem}</small>}</label>
        <label>Demand segments<textarea name="demandRows" rows="8" value={form.demandRows} onChange={updateField} placeholder="segment|buyers|max units per buyer|willingness to pay" aria-invalid={Boolean(errors.demandRows)} /><small>Maximum 12 segments. Do not enter personal records.</small>{errors.demandRows && <ul role="alert">{errors.demandRows.map((error) => <li key={error}>{error}</li>)}</ul>}</label>
        {NUMBER_FIELDS.map(([name, label, min]) => <label key={name}>{label}<input type="number" min={min} step={name === "availableUnits" || name === "purchaseCap" ? 1 : "any"} name={name} value={form[name]} onChange={updateField} aria-invalid={Boolean(errors[name])} />{errors[name] && <small role="alert">{errors[name]}</small>}</label>)}
        <div className="button-row"><button type="submit">Compare responses</button><button type="button" onClick={loadExample}>Load example</button><button type="button" onClick={reset}>Reset</button></div>
      </form>
      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice"><h3>Policy comparison</h3><div className="lab-table-wrap"><table><thead><tr><th scope="col">Measure</th><th scope="col">Candidate price</th><th scope="col">Purchase cap</th></tr></thead><tbody><Metric label="Revenue" candidate={result.candidate.revenue.toFixed(2)} capped={result.capped.revenue.toFixed(2)} /><Metric label="Gross-margin proxy" candidate={result.candidate.grossMarginProxy.toFixed(2)} capped={result.capped.grossMarginProxy.toFixed(2)} /><Metric label="Served buyers" candidate={result.candidate.servedBuyers} capped={result.capped.servedBuyers} /><Metric label="Unmet baseline units" candidate={result.candidate.unmetUnits} capped={result.capped.unmetUnits} /><Metric label="Average spend per served buyer" candidate={result.candidate.averageSpendPerServedBuyer.toFixed(2)} capped={result.capped.averageSpendPerServedBuyer.toFixed(2)} /><Metric label="Access coverage" candidate={`${(result.candidate.accessCoverage * 100).toFixed(1)}%`} capped={`${(result.capped.accessCoverage * 100).toFixed(1)}%`} /><Metric label="Segment access gap" candidate={`${(result.candidate.segmentAccessGap * 100).toFixed(1)}%`} capped={`${(result.capped.segmentAccessGap * 100).toFixed(1)}%`} /></tbody></table></div></section>
          <section className="implementation-notice"><h3>Transparent assumptions</h3><ul>{result.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul></section>
          <section className="implementation-notice"><h3>Copyable owner policy memo</h3><textarea readOnly rows="18" value={result.memo} aria-label="Generated shortage response owner memo" /><button type="button" onClick={copyMemo}>Copy owner memo</button><span role="status">{copied ? " Memo copied." : ""}</span></section>
        </div>
      )}
    </section>
  );
}

function Metric({ label, candidate, capped }) {
  return <tr><th scope="row">{label}</th><td>{candidate}</td><td>{capped}</td></tr>;
}

export { compareShortageResponses, parseDemandSegments } from "./shortageResponseTradeoff.js";
