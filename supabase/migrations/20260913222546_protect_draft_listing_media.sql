-- Migrate the single existing published organization logo from a permanent public URL
-- to an application-level storage reference before making listing-media buckets private.
update public.organizations o
set logo_url = 'supabase://organization-media/' || so.name,
    updated_at = now()
from storage.objects so
where so.bucket_id = 'organization-media'
  and (storage.foldername(so.name))[1] = o.id::text
  and so.name ~ '/logo\.[A-Za-z0-9]+$'
  and o.logo_url like 'http%';

update storage.buckets
set public = false
where id in ('business-media','organization-media');

-- Preserve avatar behavior while removing unconditional listing-media reads.
drop policy if exists storage_public_read on storage.objects;
create policy storage_public_read
on storage.objects for select to anon, authenticated
using (bucket_id = 'avatars');

-- Published listing media is readable by anyone; draft/suspended media is owner-only.
drop policy if exists storage_business_media_select_status_aware on storage.objects;
create policy storage_business_media_select_status_aware
on storage.objects for select to anon, authenticated
using (
  bucket_id = 'business-media'
  and exists (
    select 1 from public.businesses b
    where b.id::text = (storage.foldername(objects.name))[1]
      and (b.status = 'published'::public.entity_status or b.owner_id = auth.uid())
  )
);

drop policy if exists storage_organization_media_select_owner on storage.objects;
drop policy if exists storage_organization_media_select_status_aware on storage.objects;
create policy storage_organization_media_select_status_aware
on storage.objects for select to anon, authenticated
using (
  bucket_id = 'organization-media'
  and exists (
    select 1 from public.organizations o
    where o.id::text = (storage.foldername(objects.name))[1]
      and (o.status = 'published'::public.entity_status or o.owner_id = auth.uid())
  )
);