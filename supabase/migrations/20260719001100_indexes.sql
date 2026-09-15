create index profiles_display_name_idx on public.profiles(display_name);

create index profiles_city_idx on public.profiles(city);

create index profiles_country_idx on public.profiles(country);

create index profiles_profession_idx on public.profiles(profession);

create index profiles_public_idx on public.profiles(is_public);

create index profiles_skills_gin_idx on public.profiles using gin(skills);

create index businesses_owner_id_idx on public.businesses(owner_id);

create index businesses_category_idx on public.businesses(category);

create index businesses_city_idx on public.businesses(city);

create index businesses_country_idx on public.businesses(country);

create index businesses_status_idx on public.businesses(status);

create index organizations_owner_id_idx on public.organizations(owner_id);

create index organizations_type_idx on public.organizations(organization_type);

create index organizations_city_idx on public.organizations(city);

create index organizations_country_idx on public.organizations(country);

create index organizations_status_idx on public.organizations(status);

create index opportunities_author_id_idx on public.opportunities(author_id);

create index opportunities_business_id_idx on public.opportunities(business_id);

create index opportunities_organization_id_idx on public.opportunities(organization_id);

create index opportunities_type_idx on public.opportunities(type);

create index opportunities_city_idx on public.opportunities(city);

create index opportunities_country_idx on public.opportunities(country);

create index opportunities_status_idx on public.opportunities(status);

create index opportunities_deadline_idx on public.opportunities(deadline);

create index opportunities_created_at_idx on public.opportunities(created_at desc);

create index saved_opportunities_opportunity_id_idx on public.saved_opportunities(opportunity_id);

create index events_creator_id_idx on public.events(creator_id);

create index events_starts_at_idx on public.events(starts_at);

create index events_city_idx on public.events(city);

create index events_country_idx on public.events(country);

create index events_status_idx on public.events(status);

create index conversation_members_profile_id_idx on public.conversation_members(profile_id);

create index messages_conversation_id_created_at_idx
  on public.messages(conversation_id, created_at desc);

create index messages_sender_id_idx on public.messages(sender_id);

create index connections_recipient_id_idx on public.connections(recipient_id);

create index connections_status_idx on public.connections(status);
