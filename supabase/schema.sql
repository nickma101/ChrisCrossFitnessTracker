-- CrisCross Fitness Tracker — database schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: it uses "if not exists" / "drop policy if exists".

-- ---------------------------------------------------------------------------
-- plans
-- A reusable training plan template owned by one user. The exercises for a
-- plan are stored as JSONB, because a plan is always read and written as a
-- whole unit (never queried exercise-by-exercise). Each element looks like:
--   { "id": "...", "name": "Bench Press", "sets": 4, "reps": 8, "notes": "..." }
-- ---------------------------------------------------------------------------
create table if not exists public.plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null,
  exercises  jsonb not null default '[]'::jsonb,
  -- Weekday codes this plan is scheduled on, e.g. ["Mon","Wed","Fri"].
  schedule   jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists plans_user_id_idx on public.plans (user_id);

alter table public.plans enable row level security;

drop policy if exists "plans are owned by their user" on public.plans;
create policy "plans are owned by their user"
  on public.plans
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- sessions  (for the upcoming "My Training" workout log)
-- A single performed workout, optionally started from a plan.
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan_id      uuid references public.plans (id) on delete set null,
  -- Snapshot of the plan name + logged exercises/sets at workout time, so the
  -- workout is independent of later plan edits or deletion.
  plan_name    text,
  entries      jsonb not null default '[]'::jsonb,
  performed_at timestamptz not null default now(),
  notes        text
);

create index if not exists sessions_user_id_idx on public.sessions (user_id);

alter table public.sessions enable row level security;

drop policy if exists "sessions are owned by their user" on public.sessions;
create policy "sessions are owned by their user"
  on public.sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- logged_sets  (for the upcoming "My Training" workout log)
-- One performed set within a session. Relational (not JSONB) so the Stats
-- page can aggregate volume, reps, and PRs across time with plain SQL.
-- ---------------------------------------------------------------------------
create table if not exists public.logged_sets (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.sessions (id) on delete cascade,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exercise_name text not null,
  set_number    int not null,
  reps          int,
  weight        numeric
);

create index if not exists logged_sets_session_id_idx on public.logged_sets (session_id);
create index if not exists logged_sets_user_id_idx on public.logged_sets (user_id);

alter table public.logged_sets enable row level security;

drop policy if exists "logged sets are owned by their user" on public.logged_sets;
create policy "logged sets are owned by their user"
  on public.logged_sets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
