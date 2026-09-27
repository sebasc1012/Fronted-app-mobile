-- RLS del bucket `finchoApp` (HU-02, CA-12). Ejecutar en Supabase → SQL Editor.
-- Lectura pública por URL (bucket público). Escritura solo en la carpeta propia `finchoApp/avatars/{userId}/`.
-- `remove()` de Supabase Storage exige SELECT además de DELETE, por eso hay política de SELECT.

-- 1) Revisar políticas existentes sobre el bucket: cualquier otra más permisiva anula estas.
-- select policyname, cmd, qual, with_check from pg_policies
--  where schemaname = 'storage' and tablename = 'objects';

drop policy if exists "avatars_select_own" on storage.objects;
drop policy if exists "avatars_insert_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;

create policy "avatars_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'finchoApp' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = (select auth.uid())::text);

create policy "avatars_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'finchoApp' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = (select auth.uid())::text);

create policy "avatars_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'finchoApp' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = (select auth.uid())::text)
  with check (bucket_id = 'finchoApp' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = (select auth.uid())::text);

create policy "avatars_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'finchoApp' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = (select auth.uid())::text);
