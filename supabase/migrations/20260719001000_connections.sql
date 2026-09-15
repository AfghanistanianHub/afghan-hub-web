create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status public.connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint connections_no_self check (requester_id <> recipient_id),
  constraint connections_unique_direction unique (requester_id, recipient_id)
);

create trigger connections_set_updated_at
before update on public.connections
for each row execute function public.set_updated_at();
