<<<<<<< HEAD
-- Migration: allow anonymous submitters by making user_id nullable and adding submitter_name
-- Run this in Supabase SQL editor

ALTER TABLE picks
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE picks
  ADD COLUMN IF NOT EXISTS submitter_name text;

-- Ensure uniqueness per submitter name (so the same public name can't submit duplicate ranks)
CREATE UNIQUE INDEX IF NOT EXISTS idx_picks_submitter_rank ON picks(submitter_name, rank);
CREATE UNIQUE INDEX IF NOT EXISTS idx_picks_submitter_team ON picks(submitter_name, team_id);

-- Optional: add index for lookups by submitter
CREATE INDEX IF NOT EXISTS idx_picks_submitter ON picks(submitter_name);

-- Note: If your original table had NOT NULL constraint or named constraints, you may need to drop them first.
=======
-- Migration: allow anonymous submitters by making user_id nullable and adding submitter_name
-- Run this in Supabase SQL editor

ALTER TABLE picks
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE picks
  ADD COLUMN IF NOT EXISTS submitter_name text;

-- Ensure uniqueness per submitter name (so the same public name can't submit duplicate ranks)
CREATE UNIQUE INDEX IF NOT EXISTS idx_picks_submitter_rank ON picks(submitter_name, rank);
CREATE UNIQUE INDEX IF NOT EXISTS idx_picks_submitter_team ON picks(submitter_name, team_id);

-- Optional: add index for lookups by submitter
CREATE INDEX IF NOT EXISTS idx_picks_submitter ON picks(submitter_name);

-- Note: If your original table had NOT NULL constraint or named constraints, you may need to drop them first.
>>>>>>> f84f3f17b3d1d09e667e64e5fdd030f9dd1d3ae4
