const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "could", "for", "from", "how", "in", "is", "it",
  "may", "of", "on", "or", "that", "the", "this", "to", "was", "what", "when", "where", "which", "who", "why", "with"
]);

export const MINI_RAG_EXAMPLE = {
  corpus: `The City Library opens at 9:00 AM from Monday to Saturday. It closes at 7:00 PM on weekdays and at 5:00 PM on Saturday. The library is closed on Sunday and public holidays.

Members may borrow up to five books for 21 days. A book can be renewed twice when no other member has reserved it. Reference books and newspapers must remain inside the library.

Membership is free for city residents who provide a photo ID and proof of address. Non-residents pay an annual fee of 500 rupees. Lost cards can be replaced at the service desk for 100 rupees.`,
  question: "How long can a member keep a book, and when can it be renewed?"
};

export function tokenize(text) {
  return String(text ?? "").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function chunkCorpus(corpus, options = {}) {
  const chunkSize = Math.max(12, Number(options.chunkSize) || 48);
  const overlap = Math.min(chunkSize - 1, Math.max(0, Number(options.overlap) || 10));
  const words = String(corpus ?? "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const chunks = [];
  const stride = chunkSize - overlap;
  for (let start = 0; start < words.length; start += stride) {
    const slice = words.slice(start, start + chunkSize);
    chunks.push({
      id: chunks.length + 1,
      text: slice.join(" "),
      startWord: start + 1,
      endWord: start + slice.length
    });
    if (start + chunkSize >= words.length) break;
  }
  return chunks;
}

function normalizeSearchTerm(term) {
  return term.length > 3 && term.endsWith("s") && !term.endsWith("ss") ? term.slice(0, -1) : term;
}

function meaningfulTerms(text) {
  return [...new Set(tokenize(text)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term))
    .map(normalizeSearchTerm))];
}

export function retrieveEvidence(chunks, question, topK = 3) {
  const queryTerms = meaningfulTerms(question);
  if (!queryTerms.length) return [];

  return chunks
    .map((chunk) => {
      const tokens = tokenize(chunk.text).map(normalizeSearchTerm);
      const tokenSet = new Set(tokens);
      const matchedTerms = queryTerms.filter((term) => tokenSet.has(term));
      const coverage = matchedTerms.length / queryTerms.length;
      const frequency = matchedTerms.reduce((total, term) => total + tokens.filter((token) => token === term).length, 0);
      const score = coverage + Math.min(frequency / Math.max(tokens.length, 1), 0.1);
      return { ...chunk, score, matchedTerms };
    })
    .filter((chunk) => chunk.matchedTerms.length > 0)
    .sort((left, right) => right.score - left.score || left.id - right.id)
    .slice(0, Math.max(1, Number(topK) || 3));
}

function sentenceCandidates(text) {
  return text.match(/[^.!?]+[.!?]?/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
}

export function composeExtractiveAnswer(question, evidence) {
  const queryTerms = meaningfulTerms(question);
  const candidates = evidence.flatMap((passage, evidenceIndex) =>
    sentenceCandidates(passage.text).map((sentence, sentenceIndex) => {
      const terms = new Set(tokenize(sentence).map(normalizeSearchTerm));
      const matches = queryTerms.filter((term) => terms.has(term)).length;
      return { sentence, matches, evidenceIndex, sentenceIndex, passageId: passage.id };
    })
  );

  const chosen = candidates
    .filter((candidate) => candidate.matches > 0)
    .sort((left, right) => right.matches - left.matches || left.evidenceIndex - right.evidenceIndex || left.sentenceIndex - right.sentenceIndex)
    .filter((candidate, index, all) => all.findIndex((item) => item.sentence === candidate.sentence) === index)
    .slice(0, 2);

  if (!chosen.length) {
    return { answer: "No grounded answer was found in the supplied text.", citations: [] };
  }

  const citationNumbers = new Map();
  evidence.forEach((passage, index) => citationNumbers.set(passage.id, index + 1));
  return {
    answer: chosen.map((item) => `${item.sentence} [${citationNumbers.get(item.passageId)}]`).join(" "),
    citations: [...new Set(chosen.map((item) => item.passageId))].map((passageId) => ({
      number: citationNumbers.get(passageId),
      passageId
    }))
  };
}

export function validateRagInput(input = {}) {
  const errors = {};
  if (String(input.corpus ?? "").trim().length < 40) errors.corpus = "Add at least 40 characters of source text.";
  if (String(input.question ?? "").trim().length < 6) errors.question = "Ask a specific question using at least 6 characters.";
  return errors;
}

export function runMiniRag(input, options = {}) {
  const errors = validateRagInput(input);
  if (Object.keys(errors).length) return { errors, chunks: [], evidence: [], answer: "", citations: [] };

  const chunks = chunkCorpus(input.corpus, options);
  const evidence = retrieveEvidence(chunks, input.question, options.topK ?? 3);
  const response = composeExtractiveAnswer(input.question, evidence);
  return { errors: {}, chunks, evidence, ...response };
}
