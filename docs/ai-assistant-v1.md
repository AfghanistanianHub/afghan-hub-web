# Afghan Hub AI Community Navigator — V1

## Goal

Build a multilingual, read-only community navigation assistant that helps signed-in Afghan Hub members find relevant people, organizations, businesses, opportunities and events using natural-language requests.

The V1 should improve discovery without introducing autonomous writes, new production database privileges, or a paid-model dependency before cost approval.

## Product promise

A member should be able to ask questions such as:

- "Find Afghan software professionals in Vancouver."
- "Show me volunteer opportunities."
- "What community events are coming up?"
- "Find organizations that can help with employment."
- "Show me opportunities related to design."

The assistant should return grounded Afghan Hub results with links to the underlying records. It must not invent listings or claim eligibility for a program, job, legal process or immigration pathway.

## V1 scope

### Included

1. Authenticated, read-only retrieval.
2. Search across:
   - public/onboarded member profiles;
   - published organizations;
   - published businesses;
   - active published opportunities;
   - upcoming published events.
3. Grounded result cards that link to Afghan Hub records.
4. English-first UI with a language architecture ready for Dari and Pashto.
5. Explicit "read-only" operating mode.
6. Query/result limits and server-side validation.
7. Privacy-safe use of the existing search contract.

### Not included in V1

- sending connection requests;
- sending messages;
- saving opportunities;
- creating/editing listings;
- event RSVP;
- legal or immigration eligibility determinations;
- autonomous web browsing;
- production schema changes;
- paid LLM calls without explicit cost approval.

## Architecture

```text
Assistant UI
   |
   v
POST /api/assistant/search
   |
   v
Authenticated Supabase client
   |
   v
search_afghan_hub(...)
   |
   +--> Profiles
   +--> Organizations
   +--> Businesses
   +--> Opportunities
   +--> Events
```

The first implementation deliberately separates retrieval from generation. This gives Afghan Hub a safe, measurable discovery kernel before an LLM is introduced.

A later provider adapter can add intent extraction and answer synthesis while keeping retrieval as the source of truth:

```text
User question
   -> language / intent layer
   -> Afghan Hub retrieval tools
   -> grounded response with citations/links
```

## Safety and trust

- Never expose service-role credentials to the assistant route.
- Never allow the V1 route to mutate data.
- Respect existing RLS and authenticated search permissions.
- Do not display email as a member-title fallback.
- Do not describe a verified listing as endorsed or guaranteed.
- For legal, immigration, medical, financial or other high-stakes questions, the future generative layer should provide informational navigation only and direct users to authoritative sources.
- Avoid sending unnecessary profile fields to a model provider.
- Log product metrics without storing raw sensitive prompts unless a retention policy is explicitly approved.

## Multilingual plan

Phase 1: English UI and language-neutral retrieval.

Phase 2:
- Dari interface strings;
- Pashto interface strings;
- multilingual intent examples;
- translated query expansion where useful;
- evaluation set for English/Dari/Pashto search quality.

The model layer should preserve the user's language while result titles remain as stored in Afghan Hub.

## Success metrics

Pilot metrics:

- assistant searches per active member;
- search-to-result click-through rate;
- percentage of sessions producing at least one relevant result;
- organization/opportunity/event/member discovery by assistant;
- repeat assistant usage;
- user-reported helpfulness;
- zero unauthorized write actions;
- zero confirmed private-field disclosures.

## Delivery sequence

1. Read-only retrieval endpoint — started in this branch.
2. Unit/static safety tests — started in this branch.
3. Assistant shell/command entry integrated with the visual system after PR #337 settles.
4. Grounded result cards and suggested prompts.
5. Anonymous/public policy decision if needed; default remains signed-in only.
6. English/Dari/Pashto UX.
7. Optional model provider adapter after explicit cost/privacy review.
8. Action tools only after V1 metrics and permission design are proven.

## Design direction

The assistant should feel native to Afghan Hub, not like a generic support bubble.

Recommended surfaces:

- desktop: `⌘ K — Ask Afghan Hub` command entry plus optional assistant panel;
- mobile: compact `Ask Hub ✦` trigger;
- contextual prompts on Opportunity, Event, Organization and Network pages;
- subtle use of the existing Afghan/BC-inspired geometric visual language;
- reduced-motion support and full keyboard accessibility.

## Cost discipline

The retrieval kernel uses infrastructure Afghan Hub already operates. Adding a generative model is a separate decision and should be implemented behind a provider adapter with:

- per-user/request limits;
- model selection by task;
- token/cost telemetry;
- server-side secrets only;
- a deterministic non-AI fallback.

This lets the product gather real discovery metrics before committing to recurring AI inference costs.
