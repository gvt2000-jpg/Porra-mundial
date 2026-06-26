ALTER TABLE teams
ADD COLUMN IF NOT EXISTS group_finish_position INTEGER DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'teams_group_finish_position_valid'
  ) THEN
    ALTER TABLE teams
    ADD CONSTRAINT teams_group_finish_position_valid CHECK (group_finish_position >= 0 AND group_finish_position <= 3);
  END IF;
END $$;
