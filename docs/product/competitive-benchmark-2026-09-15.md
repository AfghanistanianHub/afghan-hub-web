# Afghan Hub competitive benchmark — 2026-09-15

## Purpose

This benchmark compares Afghan Hub with diaspora, professional-network, community, and Afghan-specific products. The goal is not to copy competitors. It is to identify proven interaction patterns that improve discovery, trust, activation, and recurring community utility while preserving Afghan Hub's modern, minimal, light identity.

## Product position

Afghan Hub should not become a smaller LinkedIn or a short-video social network. Its strongest position is:

> One global hub for Afghan people, organizations, opportunities, businesses, events, and communities.

The differentiator is the combination of professional identity and practical community infrastructure in one Afghan-focused product.

## Benchmarks

### YEP — Ethiopian Professionals Network

Useful patterns:
- lightweight joining flow;
- member directory by profession/location/expertise;
- profile completion as an activation mechanism;
- direct messaging;
- jobs, events, business directory, mentorship, and forum in one professional community;
- clearer member benefit as a profile becomes more complete.

Decision for Afghan Hub:
- adopt progressive profile completion and next-step guidance;
- keep signup lightweight;
- improve task-based discovery before adding more modules.

### Afghanistan Professionals Center (APC)

Useful patterns:
- Afghan professional identity;
- searchable expertise;
- connection, mentorship, projects, events, and knowledge exchange.

Decision for Afghan Hub:
- preserve broader scope: Afghan Hub is not only a professional-expert registry;
- professional discovery remains one core layer among organizations, opportunities, businesses, and events.

### Mahallify

Useful patterns:
- diaspora-specific practical utility;
- Q&A, circles, professionals, jobs, housing, marketplace, events, and travel;
- community context beyond a generic professional network.

Decision for Afghan Hub:
- future community/circle and Q&A concepts are promising;
- do not add housing/marketplace breadth until current discovery and activation loops are strong.

### Terrilink

Useful patterns:
- member directory and geographic discovery;
- events, messaging, jobs, membership infrastructure;
- network search and privacy controls.

Decision for Afghan Hub:
- geographic/member discovery is strategically valuable;
- privacy must remain explicit and default-safe before any map-style member discovery.

### Afronex

Useful patterns:
- profiles organized around professional opportunity;
- jobs, tenders, mentors, projects, companies, and events;
- strong global-diaspora framing.

Decision for Afghan Hub:
- strengthen cross-module discovery rather than creating isolated directories;
- future mentorship can connect members to opportunities and organizations.

### Omek

Useful patterns:
- bicultural professional identity;
- community programs and events;
- talent/community framing instead of a generic social feed.

Decision for Afghan Hub:
- keep the product community/professional-first;
- avoid entertainment-first engagement mechanics.

### AfghanSpot

Useful patterns:
- Afghan business discovery by category and location;
- practical local utility;
- business listing value is immediately understandable.

Decision for Afghan Hub:
- Afghan Hub already has a business directory; improve its discoverability and integration instead of building a separate marketplace now.

### AfghanG

Useful patterns:
- high-engagement social/chat model;
- jobs and marketplace alongside social content.

Decision for Afghan Hub:
- do not pursue a TikTok-style entertainment feed in the current roadmap;
- if a feed is introduced, it should be community/professional activity rather than passive entertainment.

### Immigrant Networks

Useful patterns:
- newcomer and professional networking;
- mentorship, jobs, workshops, matching.

Decision for Afghan Hub:
- user intent should eventually influence recommendations and onboarding;
- first ship better profile signals and task-oriented navigation using existing data.

### TheDiaspora / diaspora-network products

Useful patterns:
- trust signals;
- discovery across geography and professional/community context;
- diaspora identity as the organizing layer.

Decision for Afghan Hub:
- trust and verification should be visible where it changes user decisions;
- verification should never imply identity or credential claims that Afghan Hub has not actually checked.

## What Afghan Hub already has

The current product already includes:
- member profiles and directory;
- connections;
- realtime messaging and notifications;
- organizations;
- opportunities;
- events and RSVPs;
- businesses;
- saved items;
- cross-platform search;
- moderation;
- public explore/listing surfaces;
- listing verification infrastructure;
- privacy/security hardening.

Therefore this benchmark does **not** justify duplicating those capabilities.

## Implementation priorities

### Now — activation and discovery

1. Profile strength and actionable completion guidance.
2. Dashboard guidance based on what the member has not completed yet.
3. Clearer task language: find people, find an opportunity, attend an event, discover an Afghan business, contribute an organization/listing.
4. Keep public positioning focused on a global Afghan community/professional hub rather than a generic directory.
5. Make existing trust/verification signals understandable without overstating what is verified.

### Next — relevance

1. User intent/preferences for what they want from Afghan Hub.
2. Better recommendations using profession, skills, location, and explicit interests.
3. Cross-module related content (people ↔ organizations ↔ opportunities ↔ events).
4. Optional mentorship layer built on existing profiles/connections/messages.

### Later — community depth

1. Circles/communities.
2. Community Q&A.
3. Geographic discovery with privacy-safe controls.
4. Additional practical diaspora verticals only after evidence of demand.

## Deliberately deferred

- entertainment-first short-video feed;
- a broad marketplace/housing product;
- large new schema surface solely to match competitors;
- paid infrastructure or vendor dependencies without a demonstrated need;
- cosmetic redesign of already strong screens.

## First shipped implementation on this branch

The first implementation is a reusable profile-completeness model plus a `ProfileStrength` component. It uses existing profile data only and adds:
- completion percentage;
- progress indicator;
- actionable missing-profile steps;
- a reusable compact/full presentation;
- no database migration and no new paid dependency.

This addresses activation and discoverability before adding product breadth.
