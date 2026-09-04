drop policy if exists "storage_business_media_insert_owner" on storage.objects;
create policy "storage_business_media_insert_owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = (storage.foldername(objects.name))[1]
      and b.owner_id = (select auth.uid())
  )
);

drop policy if exists "storage_business_media_update_owner" on storage.objects;
create policy "storage_business_media_update_owner"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = (storage.foldername(objects.name))[1]
      and b.owner_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = (storage.foldername(objects.name))[1]
      and b.owner_id = (select auth.uid())
  )
);

drop policy if exists "storage_business_media_delete_owner" on storage.objects;
create policy "storage_business_media_delete_owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = (storage.foldername(objects.name))[1]
      and b.owner_id = (select auth.uid())
  )
);
