# Batch 2 Report - Applied Labs 01-05

Date: 2026-08-22

## Outcome

The first five certificate projects are functional, local-first, and lazy-loaded from stable Applied Labs routes. Each project accepts realistic input, produces a deterministic output, validates mistakes, and provides example/reset actions without requiring an account, API key, or remote service.

## Delivered labs

1. AI Workflow Canvas - maps an AI goal, data source, task, and review level into an ordered workflow, risk register, and readiness checklist.
2. Mini RAG Studio - chunks a local corpus, retrieves matching evidence, and creates an extractive answer with citations.
3. GAN Latent Gallery - maps two latent coordinates, a seed, and a style to deterministic SVG artwork and nearby variations.
4. CNN Feature Explorer - applies a selectable 3 × 3 kernel to an editable 5 × 5 grayscale grid and displays the resulting feature map.
5. Attention Text Explorer - calculates transparent token features, scaled similarity, positional bias, softmax attention weights, and ranking.

## Verification

- Canonical manifest: valid with 30 labs and 2 flagships.
- Automated tests: 30 passed overall; 21 directly cover Batch 2.
- Production builds: portfolio, Applied Labs, and Timber passed.
- Code splitting: each of the five new lab components builds as its own lazy-loaded chunk.
- Browser: all five direct hash routes rendered meaningful content.
- Browser interactions: examples, resets, kernel selection, latent variation, retrieval evidence, and attention recomputation passed.
- Responsive QA: Attention Text Explorer passed at 390 × 844.
- Console: no warnings or errors in the accepted flows.
- Privacy/security: all five workflows run locally; no credentials or uploaded data leave the browser.

## Limitations

- GAN Latent Gallery is a deterministic latent-space simulation, not a trained GAN.
- CNN Feature Explorer performs one educational convolution pass, not neural-network inference.
- Mini RAG Studio uses lexical retrieval and extractive composition, not embeddings or a generative model.
- Attention Text Explorer uses three transparent token features and positional bias, not learned transformer weights.
- Final visual direction and portfolio polish remain scheduled for Batch 8.
