# Lab 05 - Attention Text Explorer

## Certificate connection

Natural Language Processing with Attention Models: shows how a focus query can assign normalized weights across a token sequence.

## Workflow

The user enters up to 12 tokens and chooses a focus token. Each token receives transparent length, vowel-ratio, and character features. Scaled dot-product-style similarity plus positional bias is normalized with stable softmax and shown as a heat sequence, ranking, and score table.

## Implementation

`attention-text-explorer.js` contains tokenization, validation, features, softmax, and attention calculations. `AttentionTextExplorer.jsx` renders the interactive explanation.

## Tests

Tests cover tokenization, limits, feature repeatability, softmax stability, ranking, normalization, and an out-of-sequence focus query.

## Limitations

The weights are educational and deterministic, not learned transformer attention. The lab is not a language model and does not generate text.
