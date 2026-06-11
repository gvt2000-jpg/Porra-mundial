export function isMissingAchievementColumns(error) {
  const message = String(error?.message || error || '')
  return [
    'passed_group',
    'group_finish_position',
    'phases_advanced',
    'reached_round_of_32',
    'reached_round_of_16',
    'reached_quarter_final',
    'reached_semi_final',
    'reached_final',
    'finalist',
    'third_place',
    'champion'
  ].some((column) =>
    message.includes(column)
  )
}

export const ACHIEVEMENT_COLUMNS_SQL = `ALTER TABLE teams
ADD COLUMN IF NOT EXISTS passed_group BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS group_finish_position INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS phases_advanced INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reached_round_of_32 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reached_round_of_16 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reached_quarter_final BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reached_semi_final BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reached_final BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS finalist BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS third_place BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS champion BOOLEAN DEFAULT FALSE;

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

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'teams_phases_advanced_non_negative'
  ) THEN
    ALTER TABLE teams
    ADD CONSTRAINT teams_phases_advanced_non_negative CHECK (phases_advanced >= 0);
  END IF;
END $$;`
