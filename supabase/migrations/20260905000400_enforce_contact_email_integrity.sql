-- Keep public contact email fields valid even when clients bypass
-- server actions and write through Supabase directly.

alter table public.businesses
  drop constraint if exists businesses_email_format,
  add constraint businesses_email_format
    check (
      email is null
      or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    );

alter table public.organizations
  drop constraint if exists organizations_email_format,
  add constraint organizations_email_format
    check (
      email is null
      or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    );

alter table public.opportunities
  drop constraint if exists opportunities_contact_email_format,
  add constraint opportunities_contact_email_format
    check (
      contact_email is null
      or contact_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    );
