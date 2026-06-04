ALTER TABLE matches
ADD COLUMN IF NOT EXISTS bracket_order INTEGER,
ADD COLUMN IF NOT EXISTS home_source TEXT,
ADD COLUMN IF NOT EXISTS away_source TEXT,
ADD COLUMN IF NOT EXISTS winner_team_id UUID REFERENCES teams(id);

CREATE UNIQUE INDEX IF NOT EXISTS unique_matches_bracket_order
ON matches (bracket_order)
WHERE bracket_order IS NOT NULL;
