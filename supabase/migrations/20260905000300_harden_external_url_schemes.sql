-- Prevent user-controlled public links from using executable URL schemes.
-- Existing production URLs already use http:// or https://.

alter table public.profiles
  drop constraint if exists profiles_website_url_http,
  add constraint profiles_website_url_http
    check (website_url is null or website_url ~* '^https?://'),
  drop constraint if exists profiles_linkedin_url_http,
  add constraint profiles_linkedin_url_http
    check (linkedin_url is null or linkedin_url ~* '^https?://');

alter table public.businesses
  drop constraint if exists businesses_website_url_http,
  add constraint businesses_website_url_http
    check (website_url is null or website_url ~* '^https?://');

alter table public.organizations
  drop constraint if exists organizations_website_url_http,
  add constraint organizations_website_url_http
    check (website_url is null or website_url ~* '^https?://');

alter table public.opportunities
  drop constraint if exists opportunities_external_url_http,
  add constraint opportunities_external_url_http
    check (external_url is null or external_url ~* '^https?://');

alter table public.events
  drop constraint if exists events_online_url_http,
  add constraint events_online_url_http
    check (online_url is null or online_url ~* '^https?://');
