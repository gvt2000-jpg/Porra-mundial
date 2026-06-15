-- Migration: Add stats columns to teams table for scoring calculation
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS goals_for INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goals_against INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS group_points INTEGER DEFAULT 0;

-- Ensure group_standings is properly set up for admin entry.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_group_standings_team'
  ) THEN
    ALTER TABLE group_standings
    ADD CONSTRAINT fk_group_standings_team
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
END $$;
