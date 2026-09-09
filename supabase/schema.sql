create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  mode text not null default 'behavioral',
  transcript jsonb not null
);

alter table sessions enable row level security;

create policy "Users can read their own sessions"
  on sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on sessions for insert
  with check (auth.uid() = user_id);
