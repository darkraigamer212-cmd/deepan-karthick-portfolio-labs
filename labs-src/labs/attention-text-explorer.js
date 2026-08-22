const MAX_TOKENS = 12;
const MAX_TOKEN_LENGTH = 24;
const FEATURE_COUNT = 3;

/**
 * Split a short sequence into display tokens while keeping common punctuation.
 * The result is deterministic and intentionally does not use a tokenizer model.
 */
export function tokenizeSequence(input) {
  if (typeof input !== "string") return [];
  return input.trim().split(/\s+/u).filter(Boolean);
}

export function validateAttentionInput(tokens, focusToken) {
  if (!Array.isArray(tokens) || tokens.length < 2) {
    return "Enter at least two tokens so there is something to compare.";
  }
  if (tokens.length > MAX_TOKENS) {
    return `Use ${MAX_TOKENS} tokens or fewer for a readable visualization.`;
  }
  if (tokens.some((token) => typeof token !== "string" || token.length > MAX_TOKEN_LENGTH)) {
    return `Keep every token at ${MAX_TOKEN_LENGTH} characters or fewer.`;
  }
  if (tokens.some((token) => !cleanToken(token))) {
    return "Every token needs at least one letter or number.";
  }
  if (typeof focusToken !== "string" || !focusToken.trim()) {
    return "Choose a token from the sequence or type a short focus token.";
  }
  if (focusToken.trim().length > MAX_TOKEN_LENGTH) {
    return `Keep the focus token at ${MAX_TOKEN_LENGTH} characters or fewer.`;
  }
  if (!cleanToken(focusToken)) {
    return "The focus token needs at least one letter or number.";
  }
  return "";
}

function cleanToken(token) {
  return token.toLocaleLowerCase("en").replace(/[^a-z0-9]/gu, "");
}

/**
 * Three intentionally simple, visible token features in the range 0..1.
 * They stand in for learned query/key vectors in a real attention model.
 */
export function tokenFeatures(token) {
  const cleaned = cleanToken(String(token));
  if (!cleaned) return [0, 0, 0];

  const length = Math.min(cleaned.length / MAX_TOKEN_LENGTH, 1);
  const vowelCount = [...cleaned].filter((character) => "aeiou".includes(character)).length;
  const vowelRatio = vowelCount / cleaned.length;
  const characterSignal = [...cleaned].reduce(
    (total, character) => total + (character.charCodeAt(0) % 31) / 30,
    0
  ) / cleaned.length;

  return [length, vowelRatio, characterSignal];
}

export function scaledDotProduct(queryFeatures, keyFeatures) {
  if (
    !Array.isArray(queryFeatures)
    || !Array.isArray(keyFeatures)
    || queryFeatures.length !== keyFeatures.length
    || queryFeatures.length === 0
  ) {
    throw new TypeError("Query and key features must be non-empty vectors of the same length.");
  }

  const dotProduct = queryFeatures.reduce(
    (total, queryValue, index) => total + queryValue * keyFeatures[index],
    0
  );
  return dotProduct / Math.sqrt(queryFeatures.length);
}

export function softmax(values) {
  if (!Array.isArray(values) || values.length === 0) return [];
  if (values.some((value) => !Number.isFinite(value))) {
    throw new TypeError("Softmax values must be finite numbers.");
  }

  const maximum = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - maximum));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

function findFocusIndex(tokens, focusToken) {
  const normalizedFocus = cleanToken(focusToken);
  const exactIndex = tokens.findIndex((token) => cleanToken(token) === normalizedFocus);
  return exactIndex >= 0 ? exactIndex : Math.floor((tokens.length - 1) / 2);
}

export function calculateAttention(tokens, focusToken) {
  const validationMessage = validateAttentionInput(tokens, focusToken);
  if (validationMessage) throw new RangeError(validationMessage);

  const normalizedFocus = focusToken.trim();
  const focusFeatures = tokenFeatures(normalizedFocus);
  const focusIndex = findFocusIndex(tokens, normalizedFocus);
  const focusInSequence = tokens.some((token) => cleanToken(token) === cleanToken(normalizedFocus));

  const rows = tokens.map((token, index) => {
    const keyFeatures = tokenFeatures(token);
    const similarityScore = scaledDotProduct(focusFeatures, keyFeatures);
    const distance = Math.abs(index - focusIndex);
    const positionProximity = 1 / (distance + 1);
    const positionBias = positionProximity * 0.35;

    return {
      index,
      token,
      features: keyFeatures,
      similarityScore,
      distance,
      positionProximity,
      positionBias,
      rawScore: similarityScore + positionBias
    };
  });

  const weights = softmax(rows.map((row) => row.rawScore));
  const weightedRows = rows.map((row, index) => ({ ...row, weight: weights[index] }));
  const ranked = [...weightedRows].sort((left, right) => right.weight - left.weight || left.index - right.index);

  return {
    focusToken: normalizedFocus,
    focusIndex,
    focusInSequence,
    focusFeatures,
    rows: weightedRows,
    ranked,
    topToken: ranked[0].token,
    topWeight: ranked[0].weight
  };
}

export const attentionLimits = Object.freeze({
  maxTokens: MAX_TOKENS,
  maxTokenLength: MAX_TOKEN_LENGTH,
  featureCount: FEATURE_COUNT
});
