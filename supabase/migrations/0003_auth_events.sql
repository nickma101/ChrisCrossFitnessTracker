-- Audit log of sign-in / sign-out events. Run in the Supabase SQL Editor.

create table if not exists public.auth_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  event      text not null check (event in ('sign_in', 'sign_out')),
  created_at timestamptz not null default now()
);

create index if not exists auth_events_user_id_idx on public.auth_events (user_id);

alter table public.auth_events enable row level security;

drop policy if exists "auth events are owned by their user" on public.auth_events;
create policy "auth events are owned by their user"
  on public.auth_events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
