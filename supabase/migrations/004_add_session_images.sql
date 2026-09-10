alter table sessions add column images text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('session-images', 'session-images', true);

create policy "Users can upload their own session images"
  on storage.objects for insert
  with check (bucket_id = 'session-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own session images"
  on storage.objects for delete
  using (bucket_id = 'session-images' and (storage.foldername(name))[1] = auth.uid()::text);
