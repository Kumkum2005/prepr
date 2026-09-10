create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  mode text not null default 'behavioral',
  title text,
  archived boolean not null default false,
  transcript jsonb not null,
  images text[] not null default '{}'
);

alter table sessions enable row level security;

create policy "Users can read their own sessions"
  on sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on sessions for delete
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('session-images', 'session-images', true);

create policy "Users can upload their own session images"
  on storage.objects for insert
  with check (bucket_id = 'session-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own session images"
  on storage.objects for delete
  using (bucket_id = 'session-images' and (storage.foldername(name))[1] = auth.uid()::text);
