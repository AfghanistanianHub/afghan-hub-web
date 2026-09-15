select set_config('request.jwt.claim.role','service_role',true);
update public.organizations o
set status = 'published'::public.entity_status
where o.logo_url like 'supabase://organization-media/%'
  and split_part(substr(o.logo_url,length('supabase://organization-media/')+1),'/',1)=o.id::text
  and exists (
    select 1 from storage.objects so
    where so.bucket_id='organization-media'
      and (storage.foldername(so.name))[1]=o.id::text
      and 'supabase://organization-media/' || so.name = o.logo_url
  );