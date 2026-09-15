insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'business-media',
    'business-media',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'organization-media',
    'organization-media',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  );

create policy storage_public_read
on storage.objects for select
to anon, authenticated
using (bucket_id in ('avatars', 'business-media', 'organization-media'));

create policy storage_avatar_insert_own_folder
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy storage_avatar_update_own_folder
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy storage_avatar_delete_own_folder
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy storage_business_media_insert_owner
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = (storage.foldername(name))[1]
      and b.owner_id = (select auth.uid())
  )
);

create policy storage_business_media_update_owner
on storage.objects for update
to authenticated
using (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = (storage.foldername(name))[1]
      and b.owner_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = (storage.foldername(name))[1]
      and b.owner_id = (select auth.uid())
  )
);

create policy storage_business_media_delete_owner
on storage.objects for delete
to authenticated
using (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = (storage.foldername(name))[1]
      and b.owner_id = (select auth.uid())
  )
);

create policy storage_organization_media_insert_owner
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'organization-media'
  and exists (
    select 1
    from public.organizations o
    where o.id::text = (storage.foldername(name))[1]
      and o.owner_id = (select auth.uid())
  )
);

create policy storage_organization_media_update_owner
on storage.objects for update
to authenticated
using (
  bucket_id = 'organization-media'
  and exists (
    select 1
    from public.organizations o
    where o.id::text = (storage.foldername(name))[1]
      and o.owner_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'organization-media'
  and exists (
    select 1
    from public.organizations o
    where o.id::text = (storage.foldername(name))[1]
      and o.owner_id = (select auth.uid())
  )
);

create policy storage_organization_media_delete_owner
on storage.objects for delete
to authenticated
using (
  bucket_id = 'organization-media'
  and exists (
    select 1
    from public.organizations o
    where o.id::text = (storage.foldername(name))[1]
      and o.owner_id = (select auth.uid())
  )
);
