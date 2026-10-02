# Afghan Hub Assistant — Multilingual Evaluation Set

## Purpose

Create a repeatable baseline for English, Dari and Pashto discovery-intent routing before adding a generative model.

This evaluation measures deterministic intent routing only. It does not claim semantic search relevance or LLM answer quality.

## Coverage

15 baseline queries:

- 5 English
- 5 Dari
- 5 Pashto

Across:

- people
- organizations
- businesses
- opportunities
- events

## Pass criteria

For the V1 intent layer:

- expected intent must match;
- expected entity type must match;
- no query should trigger a write/action intent;
- all three languages should have representation in each discovery category.

## Why this matters

The assistant is intended to reduce language and terminology barriers. A multilingual claim should therefore be backed by a repeatable test set rather than UI translation alone.

For grant/pilot reporting, this set can later expand into:

- paraphrases;
- spelling variants;
- mixed Dari/English and Pashto/English queries;
- location phrases;
- natural newcomer terminology;
- ambiguous queries;
- zero-result recovery cases.

## Current limitation

The deterministic keyword router is intentionally simple. Passing this baseline does not mean the system fully understands Dari or Pashto. It only verifies that common pilot discovery phrases are routed to the expected read-only search category.

The next stage should measure retrieval quality using real, consented pilot feedback and a larger curated evaluation set.
