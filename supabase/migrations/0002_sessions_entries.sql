-- Lets a workout (session) store its own snapshot of exercises + logged sets,
-- independent of the plan it started from (exercises can be added/removed per
-- workout without affecting the plan). Run in the Supabase SQL Editor.

alter table public.sessions
  add column if not exists plan_name text,
  add column if not exists entries jsonb not null default '[]'::jsonb;

-- Refresh PostgREST's schema cache so the new columns are usable immediately.
notify pgrst, 'reload schema';
