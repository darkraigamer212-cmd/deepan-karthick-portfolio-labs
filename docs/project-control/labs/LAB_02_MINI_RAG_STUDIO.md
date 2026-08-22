# Lab 02 - Mini RAG Studio

## Certificate connection

Generative AI with Large Language Models: demonstrates the retrieval and grounding stages commonly placed around an LLM.

## Workflow

The user pastes a small source corpus and asks a question. The model creates overlapping passages, tokenizes them, ranks lexical evidence, and composes an extractive answer with passage citations.

## Implementation

`miniRagStudio.js` contains tokenization, chunking, retrieval, scoring, and answer composition. `MiniRagStudio.jsx` provides the local-only interface.

## Tests

Tests cover deterministic chunk overlap, evidence ranking, stable tie-breaking, cited sample answers, and invalid input.

## Limitations

This is lexical retrieval rather than embedding search, and the answer only extracts source sentences. It is not a production RAG system or a generative language model.
