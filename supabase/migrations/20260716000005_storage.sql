-- Trainer photos storage bucket: public read, admin-only write.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trainer-photos',
  'trainer-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "trainer_photos_public_read"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'trainer-photos');

create policy "trainer_photos_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'trainer-photos' and public.is_admin());

create policy "trainer_photos_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'trainer-photos' and public.is_admin())
  with check (bucket_id = 'trainer-photos' and public.is_admin());

create policy "trainer_photos_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'trainer-photos' and public.is_admin());
