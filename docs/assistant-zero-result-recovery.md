# Afghan Hub Assistant — Zero-Result Recovery Design

## Goal

A zero-result search should not be a dead end.

The Assistant should help the user reformulate or broaden the request while preserving the read-only, grounded-search model.

## V1 recovery sequence

### 1. Explain the result state

Do not say:
- "Nothing exists."
- "There are no opportunities."

Say:
- "I couldn't find a matching Afghan Hub result for that search yet."

This distinction matters because a zero result may reflect wording, indexing or current catalogue coverage rather than true absence.

### 2. Offer one-click broader searches

Examples:

**People**
- Broaden to all professionals
- Search by city only
- Try a related field

**Organizations**
- Show all organizations
- Search related services
- Browse organizations by category

**Opportunities**
- Show all active opportunities
- Search volunteer opportunities
- Search jobs
- Search scholarships/mentorship

**Events**
- Show all upcoming events
- Search events in the same city
- Browse community events

**Businesses**
- Show all businesses
- Search by service/category
- Search nearby city terms

## No silent query rewriting

The Assistant should not silently change the user's query and present the results as exact matches.

If a broadened query is used:
- make the change visible;
- label it as a broader search;
- require a user click for materially different searches.

## Multilingual UX

Recovery copy and actions must exist in:
- English
- Dari
- Pashto

Do not translate stored listing titles unless a separate translation feature is explicitly implemented.

## Privacy

Raw query text remains excluded from analytics.

Useful zero-result metrics:
- language;
- inferred intent;
- zero-result event;
- recovery action selected;
- whether the recovery produced results.

A future analytics extension can record a bounded recovery action identifier such as:
- broaden_entity
- browse_all
- try_related_category

It should not record the rewritten text.

## Retrieval strategy

V1 should prefer deterministic recovery:

1. exact/current search;
2. user-visible broaden action;
3. existing public catalogue or Assistant entity-specific search.

Do not introduce semantic/vector retrieval solely to hide zero results.

## Future generative layer

A model may later propose a reformulation such as:

"Would you like me to try 'software' instead of 'IT support'?"

But:
- it must be clearly presented as a suggestion;
- the user chooses whether to run it;
- underlying results still come from permission-aware Afghan Hub retrieval.

## Success metrics

- zero-result rate;
- recovery-action click rate;
- percentage of recovery actions producing results;
- destination click-through after recovery;
- recovery success by language.

## Implementation order

1. merge contextual prompts;
2. merge multilingual evaluation baseline;
3. add localized zero-result recovery copy;
4. add deterministic recovery actions;
5. extend analytics with bounded recovery-action identifiers;
6. test English/Dari/Pashto recovery flows;
7. include recovery metrics in pilot reporting.
