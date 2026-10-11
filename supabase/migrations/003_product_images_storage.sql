-- Public product image storage for the browser-based product catalog.
-- Apply this migration before enabling Supabase-backed image uploads.
-- The public bucket lets product cards render images without signed URLs. The
-- upload policy is anonymous to match this demo's public-anon-key setup; add
-- authentication and tighter quotas before using it for an unrestricted store.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

drop policy if exists "Visitors can upload product images" on storage.objects;
create policy "Visitors can upload product images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'product-images');
