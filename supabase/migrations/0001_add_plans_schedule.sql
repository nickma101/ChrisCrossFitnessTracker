-- Adds the `schedule` column to an existing `plans` table.
-- Needed for databases created before the schedule feature, because
-- schema.sql uses "create table if not exists" and won't alter an
-- existing table. Safe to run more than once.

alter table public.plans
  add column if not exists schedule jsonb not null default '[]'::jsonb;

-- Refresh PostgREST's schema cache so the new column is usable immediately.
notify pgrst, 'reload schema';
