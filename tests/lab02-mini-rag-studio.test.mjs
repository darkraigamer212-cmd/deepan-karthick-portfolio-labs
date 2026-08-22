import test from "node:test";
import assert from "node:assert/strict";
import {
  MINI_RAG_EXAMPLE,
  chunkCorpus,
  retrieveEvidence,
  runMiniRag,
  tokenize
} from "../labs-src/labs/miniRagStudio.js";

test("tokenization and overlapping chunking are deterministic", () => {
  assert.deepEqual(tokenize("Books, BOOKS & cards!"), ["books", "books", "cards"]);

  const corpus = Array.from({ length: 35 }, (_, index) => `word${index + 1}`).join(" ");
  const chunks = chunkCorpus(corpus, { chunkSize: 20, overlap: 5 });

  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].startWord, 1);
  assert.equal(chunks[0].endWord, 20);
  assert.equal(chunks[1].startWord, 16);
  assert.match(chunks[1].text, /^word16 /);
});

test("retrieval ranks matching passages and breaks ties by source order", () => {
  const chunks = [
    { id: 1, text: "The library opens at nine.", startWord: 1, endWord: 6 },
    { id: 2, text: "Members renew a borrowed book twice.", startWord: 7, endWord: 13 },
    { id: 3, text: "A book may be renewed when it is not reserved.", startWord: 14, endWord: 24 }
  ];
  const evidence = retrieveEvidence(chunks, "When can a book be renewed?", 2);

  assert.deepEqual(evidence.map((item) => item.id), [3, 2]);
  assert.ok(evidence[0].score > evidence[1].score);
});

test("example RAG run returns source-grounded answer and citations", () => {
  const result = runMiniRag(MINI_RAG_EXAMPLE, { chunkSize: 35, overlap: 8, topK: 3 });

  assert.deepEqual(result.errors, {});
  assert.ok(result.chunks.length >= 3);
  assert.ok(result.evidence.length >= 1);
  assert.match(result.answer, /21 days/i);
  assert.match(result.answer, /\[1\]/);
  assert.ok(result.citations.length >= 1);
});

test("RAG validation rejects an empty corpus and vague question", () => {
  const result = runMiniRag({ corpus: "too short", question: "why" });

  assert.deepEqual(Object.keys(result.errors).sort(), ["corpus", "question"]);
  assert.deepEqual(result.evidence, []);
});
