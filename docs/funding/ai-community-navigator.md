# Afghan Hub — AI Community Navigator Funding Package (Working Draft)

## Project title

**Afghan Hub Multilingual AI Community Navigator**

## One-line description

A multilingual, AI-enabled community navigation layer that helps Afghan Canadians and other underserved users discover people, organizations, services, opportunities and events through natural-language interaction.

## Problem

Community information is fragmented across websites, organizations, social channels and informal networks. Users may know what they need but not the name of the service, organization, program or platform section where it is located.

Language, unfamiliar terminology and limited professional networks can increase that friction. A conventional directory still requires users to understand categories, filters and institutional vocabulary.

Afghan Hub's proposed Community Navigator reduces that discovery burden by allowing users to describe their goal in ordinary language and receive grounded, relevant results from the platform.

## Target users

Primary pilot users:

- Afghan community members in British Columbia and Canada;
- newcomers and established community members looking for services or opportunities;
- professionals seeking peers, collaborators or mentors;
- community organizations seeking volunteers, participants or talent;
- users who benefit from English, Dari or Pashto navigation.

The product should remain useful beyond newcomers; Afghan Hub is a broader community and professional network.

## Proposed solution

The project adds a multilingual Community Navigator to Afghan Hub.

Users can ask questions such as:

- "I am looking for volunteer work in Vancouver."
- "Find organizations supporting employment."
- "Who works in film or technology?"
- "What events are happening this month?"
- "Show me current opportunities for students."

The system retrieves relevant Afghan Hub records and links users to the underlying profiles, organizations, businesses, opportunities and events.

The pilot begins read-only. It does not autonomously submit applications, send messages, make legal determinations or modify user data.

## Innovation

The innovation is not a generic chatbot. It is a community-specific navigation layer connected to structured, permission-aware Afghan Hub data.

Key characteristics:

- natural-language discovery;
- multilingual accessibility;
- grounded answers based on platform records;
- privacy-aware authenticated retrieval;
- measurable community-navigation outcomes;
- architecture that can later support carefully permissioned actions.

## Public benefit

Expected benefits include:

1. reduced time and complexity in finding community resources;
2. increased discovery of organizations and services;
3. increased participation in events and volunteering;
4. improved access to employment and professional-network opportunities;
5. improved usability for users facing language or terminology barriers;
6. stronger connections among community members and organizations.

## Pilot outputs

- production-ready read-only assistant retrieval layer;
- native Afghan Hub assistant interface;
- English, Dari and Pashto interface support;
- contextual discovery prompts;
- privacy/safety guardrails;
- analytics for discovery outcomes;
- user evaluation and pilot report.

## Outcomes and KPIs

### Access and discovery

- percentage of assistant sessions returning at least one relevant result;
- result click-through rate;
- number of member, organization, opportunity and event discoveries;
- percentage of users who reach a useful destination after an assistant query.

### Engagement

- repeat assistant usage;
- opportunities saved or visited after assistant discovery;
- event-detail visits after assistant discovery;
- connection/profile visits initiated from assistant results.

### Inclusion

- usage by interface language;
- successful search rate for English, Dari and Pashto;
- reported ease-of-use among multilingual users.

### Trust and safety

- unauthorized write actions: target 0;
- confirmed private-field disclosures: target 0;
- high-stakes responses that bypass source/limitation rules: target 0.

## Evaluation design

Baseline:
- measure current search/discovery behavior before assistant launch.

Pilot:
- instrument assistant sessions, result clicks and destination categories;
- collect lightweight helpful/not-helpful feedback;
- run structured usability sessions in English, Dari and Pashto.

Post-pilot:
- compare discovery completion and time-to-resource against baseline;
- publish a concise impact report suitable for funders and partners.

## Responsible AI approach

- retrieval grounded in Afghan Hub records;
- human-readable links to source records;
- no autonomous legal or immigration decisions;
- no autonomous user-data writes in the pilot;
- minimum-data principle for any future model provider;
- server-side API credentials only;
- documented retention policy before storing AI conversation history;
- evaluation for multilingual accuracy and harmful hallucinations.

## Work plan

### Workstream 1 — Product and engineering
- read-only retrieval API;
- assistant interaction shell;
- result cards and contextual prompts;
- multilingual UI;
- analytics and evaluation instrumentation;
- accessibility and mobile QA.

### Workstream 2 — Community validation
- recruit pilot users and organizations;
- usability testing;
- multilingual feedback sessions;
- refine prompts, terminology and onboarding.

### Workstream 3 — Responsible AI and privacy
- data-flow review;
- prompt/data minimization;
- high-stakes-content rules;
- retention and deletion decisions;
- misuse and incident-response workflow.

### Workstream 4 — Impact and sustainability
- KPI reporting;
- partner/funder reporting;
- ongoing operating-cost model;
- roadmap for permissioned actions and additional communities.

## Working pilot budget

This is a planning budget and should be adapted to each funder's eligible-cost rules.

| Category | Working amount (CAD) |
| --- | ---: |
| Product/engineering implementation | $24,000 |
| Multilingual UX, translation and evaluation | $8,000 |
| Community testing and participant support | $6,000 |
| Privacy/responsible-AI review | $5,000 |
| Analytics, impact measurement and reporting | $4,000 |
| Project coordination/administration | $6,000 |
| **Working total** | **$53,000** |

A smaller micro-grant version can fund one defined component, such as multilingual community testing, inclusion-focused onboarding or an initial navigator pilot.

## Funding positioning

Use different emphasis by funder:

### AI / innovation funders
Lead with:
- responsible AI adoption;
- structured retrieval;
- measurable user outcomes;
- multilingual AI accessibility;
- reusable community-navigation architecture.

### Settlement / newcomer funders
Lead with:
- information and referral;
- service navigation;
- economic and social participation;
- multilingual access;
- reduction of navigation barriers.

### Community / inclusion funders
Lead with:
- community connection;
- participation;
- belonging;
- volunteer and event discovery;
- accessible multilingual digital infrastructure.

## Core grant narrative

**Afghan Hub is developing a multilingual AI-powered Community Navigator that reduces information, language and network-access barriers. Instead of requiring users to understand institutional categories or navigate multiple directories, the Navigator lets them describe what they need in ordinary language and connects them to relevant people, organizations, opportunities, events and community resources. The pilot is designed around responsible AI principles: grounded retrieval, privacy-aware access controls, transparent links to source records and no autonomous high-stakes decisions or user-data writes.**

## Evidence to collect before larger applications

- monthly active users;
- baseline search/discovery completion;
- pilot user interviews;
- partner letters of support;
- examples of real discovery barriers;
- multilingual usability evidence;
- early assistant click-through and success rates;
- operating-cost estimates;
- governance and privacy policy decisions.

## Immediate next actions

1. Complete the read-only assistant pilot.
2. Integrate the assistant UI after the active visual PR settles.
3. Define English/Dari/Pashto evaluation prompts.
4. Add privacy-safe analytics events.
5. Identify 3–5 community organizations for pilot feedback/letters.
6. Tailor this package to each live funding opportunity rather than submitting one generic proposal.
