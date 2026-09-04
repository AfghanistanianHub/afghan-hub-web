-- Add covering indexes for moderation foreign keys used by joins and deletes.

create index if not exists businesses_moderated_by_idx
  on public.businesses (moderated_by);

create index if not exists organizations_moderated_by_idx
  on public.organizations (moderated_by);

create index if not exists opportunities_moderated_by_idx
  on public.opportunities (moderated_by);

create index if not exists events_moderated_by_idx
  on public.events (moderated_by);
