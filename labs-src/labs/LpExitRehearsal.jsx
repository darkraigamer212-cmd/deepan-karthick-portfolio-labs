import React, { useMemo, useState } from "react";
import { LP_EXIT_EXAMPLE, LP_EXIT_RESET, modelLpExit } from "./lpExitRehearsal.js";

const fields = [
  ["initialReserveX", "Initial reserve X"], ["initialReserveY", "Initial reserve Y"], ["depositX", "Proposed deposit X"], ["depositY", "Proposed deposit Y"],
  ["feePercent", "Pool swap fee assumption (%)"], ["priceMultiplier", "Adverse external price multiplier"], ["withdrawalPercent", "Percent of your LP position withdrawn"]
];

export default function LpExitRehearsal() {
  const [input, setInput] = useState({ ...LP_EXIT_RESET });
  const [copyStatus, setCopyStatus] = useState("");
  const result = useMemo(() => modelLpExit(input), [input]);
  const copyMemo = async () => {
    if (!result.valid || !navigator.clipboard) return setCopyStatus("Copy unavailable; select the memo manually.");
    try { await navigator.clipboard.writeText(result.memo); setCopyStatus("Pre-commitment memo copied."); } catch { setCopyStatus("Copy failed; select the memo manually."); }
  };
  return <section className="interactive-lab lp-exit-rehearsal" aria-labelledby="lp-exit-title">
    <header className="lab-tool-header"><h2 id="lp-exit-title">LP Exit Rehearsal</h2><p>Stress-test a simplified constant-product liquidity position before a club or DAO treasury decision. No wallet, transaction, or live price is used.</p></header>
    <div className="lab-workspace"><form className="lab-control-panel" onSubmit={(event) => event.preventDefault()}>
      {fields.map(([key, label]) => <label key={key} htmlFor={`lp-${key}`}>{label}<input id={`lp-${key}`} type="number" step="any" value={input[key]} onChange={(event) => setInput((current) => ({ ...current, [key]: event.target.value }))} /></label>)}
      <div className="lab-actions"><button type="button" onClick={() => setInput({ ...LP_EXIT_EXAMPLE })}>Load example</button><button type="button" onClick={() => setInput({ ...LP_EXIT_RESET })}>Reset</button></div>
    </form><section className="lab-output" aria-labelledby="lp-result" aria-live="polite"><h3 id="lp-result">Exit scenario</h3>
      {!result.valid ? <div className="lab-errors" role="alert"><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : <>
        <dl><div><dt>LP ownership</dt><dd>{result.ownershipPercent}%</dd></div><div><dt>Rebalanced reserves</dt><dd>{result.rebalancedReserves.x} X / {result.rebalancedReserves.y} Y</dd></div><div><dt>Withdrawal</dt><dd>{result.withdrawal.x} X + {result.withdrawal.y} Y</dd></div><div><dt>Hold benchmark</dt><dd>{result.holdBenchmark.valueY} Y</dd></div><div><dt>Impermanent loss</dt><dd>{result.ilValueY} Y ({result.ilPercent}%)</dd></div><div><dt>Fee break-even needed</dt><dd>{result.breakEvenFeesY} Y ({result.breakEvenFeePercentOfLp}%)</dd></div><div><dt>Curve price impact</dt><dd>{result.sampleSwap.priceImpactPercent}%</dd></div><div><dt>Execution gap including fee</dt><dd>{result.sampleSwap.executionGapPercent}%</dd></div></dl>
        <h4>Stop triggers</h4><ul>{result.stopTriggers.map((item) => <li key={item}>{item}</li>)}</ul>
        <label htmlFor="lp-memo">Pre-commitment memo</label><textarea id="lp-memo" rows="20" readOnly value={result.memo} onFocus={(event) => event.target.select()} /><button type="button" onClick={copyMemo}>Copy memo</button><p role="status">{copyStatus}</p>
        <p className="learning-note">{result.limitation}</p><h4>Official Uniswap references</h4><ul>{result.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
      </>}
    </section></div>
  </section>;
}
