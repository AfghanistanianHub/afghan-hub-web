# Afghan Hub Assistant — Privacy-Minimal Analytics

## Purpose

Measure whether the Assistant improves discovery without storing raw user questions or profile data.

## Events

### assistant_open
Measures Assistant discovery entry.

Fields:
- language
- anonymous per-tab/session UUID

### assistant_language_change
Measures English/Dari/Pashto interface usage.

Fields:
- language
- anonymous per-tab/session UUID

### assistant_search
Measures successful/unsuccessful discovery.

Fields:
- language
- inferred intent
- inferred entity type
- result count
- whether at least one result was returned
- anonymous per-tab/session UUID

**Not stored:** raw query text.

### assistant_result_click
Measures whether a user reaches an Afghan Hub destination.

Fields:
- language
- result entity type
- anonymous per-tab/session UUID

### assistant_recovery_click
Measures which browse destination a user chooses after a zero-result search.

Fields:
- language
- broad destination category only
- anonymous per-tab/session UUID

Raw search text and destination record IDs are not included.

## Deliberately excluded

The analytics endpoint does not emit:

- user ID;
- email;
- member/profile attributes;
- result titles;
- result IDs/slugs;
- raw search text;
- legal/immigration/health content;
- IP-derived location in the application payload.

Hosting infrastructure may still have its own ordinary request logs; this document only describes application-emitted telemetry.

## Current storage model

V1 emits structured events to application logs only. It does not add a Supabase analytics table or new production database privileges.

This is intentional while privacy/retention policy remains under review.

## KPI mapping

From these events we can compute or estimate:

- Assistant opens;
- searches;
- result-producing search rate;
- zero-result rate;
- result click-through;
- recovery click-through after zero results;
- destination mix by entity type;
- language mix;
- session-level repeat use.

## Next durability decision

Before grant reporting or longer pilots, decide one of:

1. short-retention aggregated metrics store;
2. privacy-reviewed analytics provider;
3. periodic aggregate export from application logs.

Any durable per-session storage should have a documented retention period and deletion policy before production rollout.
