import React, { useMemo, useState } from "react";
import {
  DEFAULT_AGING_MINUTES,
  QUEUE_REPLAY_EXAMPLE,
  QUEUE_REPLAY_RESET,
  replayQueueFairness
} from "./queueFairnessReplay.js";

function StrategyResult({ title, result }) {
  return (
    <section className="queue-strategy" aria-label={title}>
      <h4>{title}</h4>
      <dl>
        <div><dt>Average wait</dt><dd>{result.metrics.averageWait} min</dd></div>
        <div><dt>Maximum wait</dt><dd>{result.metrics.maxWait} min</dd></div>
        <div><dt>Fairness</dt><dd>{result.metrics.fairness}/100</dd></div>
        <div><dt>Starvation flags</dt><dd>{result.metrics.starvationCount}</dd></div>
      </dl>
      <div className="lab-table-wrap" tabIndex="0" role="region" aria-label={`${title} dequeue table; scroll horizontally if needed`}>
        <table>
          <caption>{title} dequeue replay</caption>
          <thead><tr><th scope="col">Order</th><th scope="col">Case</th><th scope="col">Wait</th><th scope="col">Start–finish</th><th scope="col">Aged urgency</th><th scope="col">Flag</th></tr></thead>
          <tbody>{result.rows.map((row) => <tr key={row.id}><td>{row.dequeuePosition}</td><th scope="row">{row.id}</th><td>{row.waitMinutes} min</td><td>{row.startMinute}–{row.finishMinute}</td><td>{row.effectiveUrgency}</td><td>{row.starved ? "Starvation" : "—"}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

export default function QueueFairnessReplay() {
  const [cases, setCases] = useState(QUEUE_REPLAY_RESET);
  const [agingMinutes, setAgingMinutes] = useState(DEFAULT_AGING_MINUTES);
  const [copyStatus, setCopyStatus] = useState("");
  const result = useMemo(() => replayQueueFairness(cases, agingMinutes), [cases, agingMinutes]);
  const copyContract = async () => {
    if (!result.valid || !navigator.clipboard) return setCopyStatus("Copy unavailable; select the C contract manually.");
    try { await navigator.clipboard.writeText(result.cContract); setCopyStatus("C contract copied."); }
    catch { setCopyStatus("Copy failed; select the C contract manually."); }
  };

  return (
    <section className="interactive-lab queue-fairness-replay" aria-labelledby="queue-replay-title">
      <header className="lab-tool-header"><h2 id="queue-replay-title">Queue Fairness Replay</h2><p>Replay one bounded service workload under FIFO and priority-with-aging, then inspect who waits—not just the animation order.</p></header>
      <div className="lab-workspace">
        <form className="lab-control-panel" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="queue-cases">Cases, one per line</label>
          <p id="queue-format"><code>id | arrival minute | urgency 1-5 | service minutes</code></p>
          <textarea id="queue-cases" rows="10" aria-describedby="queue-format" value={cases} onChange={(event) => { setCases(event.target.value); setCopyStatus(""); }} placeholder="CASE-01|0|3|8" />
          <label htmlFor="aging-minutes">Priority aging interval (minutes)</label>
          <input id="aging-minutes" type="number" min="1" max="120" step="1" value={agingMinutes} onChange={(event) => setAgingMinutes(event.target.value)} />
          <div className="lab-actions"><button type="button" onClick={() => { setCases(QUEUE_REPLAY_EXAMPLE); setAgingMinutes(DEFAULT_AGING_MINUTES); }}>Load example</button><button type="button" onClick={() => { setCases(QUEUE_REPLAY_RESET); setAgingMinutes(DEFAULT_AGING_MINUTES); }}>Reset</button></div>
        </form>

        <section className="lab-output" aria-labelledby="queue-comparison" aria-live="polite">
          <h3 id="queue-comparison">Policy comparison</h3>
          {!result.valid ? <div className="lab-errors" role="alert"><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : <>
            <StrategyResult title="FIFO" result={result.fifo} />
            <StrategyResult title="Priority with aging" result={result.priorityAging} />
            <p>{result.fairnessNote}</p><p className="learning-note">{result.limitation}</p>
            <label htmlFor="queue-c-contract">Copyable C struct and deterministic test contract</label>
            <textarea id="queue-c-contract" rows="22" readOnly value={result.cContract} onFocus={(event) => event.target.select()} />
            <button type="button" onClick={copyContract}>Copy C contract</button><p role="status">{copyStatus}</p>
          </>}
        </section>
      </div>
    </section>
  );
}
