-- HerCycle AI — Add `public.users` and Cascading Deletes

-- 1. Create the public.users table to mirror Clerk users
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add foreign key constraints to existing tables with ON DELETE CASCADE

-- Remove any existing constraint if present (in case script is run multiple times)
ALTER TABLE public.cycles
  DROP CONSTRAINT IF EXISTS cycles_user_id_fkey;

ALTER TABLE public.daily_logs
  DROP CONSTRAINT IF EXISTS daily_logs_user_id_fkey;

-- Add the new cascade constraints
ALTER TABLE public.cycles
  ADD CONSTRAINT cycles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.daily_logs
  ADD CONSTRAINT daily_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id)
  ON DELETE CASCADE;

-- Note: Ensure that existing `user_id`s in `cycles` and `daily_logs` are inserted into `public.users`
-- before running this script, or the ALTER TABLE will fail due to referential integrity.
-- Example: INSERT INTO public.users (id) SELECT DISTINCT user_id FROM public.cycles ON CONFLICT DO NOTHING;
-- Example: INSERT INTO public.users (id) SELECT DISTINCT user_id FROM public.daily_logs ON CONFLICT DO NOTHING;
