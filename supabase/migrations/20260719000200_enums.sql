create type public.user_role as enum ('member', 'moderator', 'admin');

create type public.profile_status as enum (
  'available',
  'looking_for_work',
  'hiring',
  'mentoring',
  'open_to_collaboration',
  'not_available'
);

create type public.entity_status as enum ('draft', 'published', 'suspended');

create type public.opportunity_type as enum (
  'job',
  'volunteer',
  'scholarship',
  'mentorship',
  'investment',
  'housing',
  'event',
  'education'
);

create type public.opportunity_status as enum (
  'draft',
  'published',
  'closed',
  'expired'
);

create type public.connection_status as enum (
  'pending',
  'accepted',
  'declined',
  'blocked'
);
