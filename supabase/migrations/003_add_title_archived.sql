alter table sessions add column title text;
alter table sessions add column archived boolean not null default false;

create policy "Users can update their own sessions"
  on sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on sessions for delete
  using (auth.uid() = user_id);
