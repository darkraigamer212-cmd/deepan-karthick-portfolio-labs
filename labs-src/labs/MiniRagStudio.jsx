import React, { useState } from "react";
import { MINI_RAG_EXAMPLE, runMiniRag } from "./miniRagStudio.js";

const EMPTY_FORM = { corpus: "", question: "" };

export default function MiniRagStudio() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    setResult(runMiniRag(form));
  };

  const loadExample = () => {
    setForm(MINI_RAG_EXAMPLE);
    setResult(runMiniRag(MINI_RAG_EXAMPLE));
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setResult(null);
  };

  const errors = result?.errors ?? {};

  return (
    <section className="lab-tool" aria-labelledby="mini-rag-title">
      <div className="intro">
        <h2 id="mini-rag-title">Mini RAG Studio</h2>
        <p>Retrieve evidence and build a cited answer entirely inside your browser. No text is uploaded.</p>
      </div>

      <form className="controls lab-form" onSubmit={submit} noValidate>
        <label>
          Source text
          <textarea
            name="corpus"
            value={form.corpus}
            onChange={updateField}
            rows="10"
            aria-describedby={errors.corpus ? "rag-corpus-error" : "rag-corpus-help"}
            aria-invalid={Boolean(errors.corpus)}
            placeholder="Paste notes, policies, or another small text collection."
          />
          <small id="rag-corpus-help">The source is split into overlapping passages for local retrieval.</small>
          {errors.corpus && <small id="rag-corpus-error" role="alert">{errors.corpus}</small>}
        </label>

        <label>
          Question
          <input
            name="question"
            value={form.question}
            onChange={updateField}
            aria-invalid={Boolean(errors.question)}
            aria-describedby={errors.question ? "rag-question-error" : undefined}
            placeholder="What should the evidence answer?"
          />
          {errors.question && <small id="rag-question-error" role="alert">{errors.question}</small>}
        </label>

        <div className="button-row">
          <button type="submit">Retrieve answer</button>
          <button type="button" onClick={loadExample}>Load example</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {result && !Object.keys(errors).length && (
        <div className="lab-results" aria-live="polite">
          <section className="implementation-notice">
            <h3>Extractive answer</h3>
            <p>{result.answer}</p>
            <p><strong>{result.chunks.length}</strong> passages indexed; <strong>{result.evidence.length}</strong> retrieved.</p>
          </section>

          <section className="implementation-notice">
            <h3>Top evidence</h3>
            {result.evidence.length ? (
              <ol>
                {result.evidence.map((passage) => (
                  <li key={passage.id}>
                    <p><strong>Passage {passage.id} · score {(passage.score * 100).toFixed(1)}</strong></p>
                    <blockquote>{passage.text}</blockquote>
                    <p>Matched: {passage.matchedTerms.join(", ")}</p>
                  </li>
                ))}
              </ol>
            ) : <p>No passage shares meaningful terms with the question. Try a question closer to the source wording.</p>}
          </section>
        </div>
      )}
    </section>
  );
}

export {
  chunkCorpus,
  composeExtractiveAnswer,
  retrieveEvidence,
  runMiniRag,
  tokenize
} from "./miniRagStudio.js";
