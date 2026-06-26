ALTER TABLE matches
ADD COLUMN IF NOT EXISTS api_football_fixture_id INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS unique_matches_api_football_fixture_id
ON matches (api_football_fixture_id)
WHERE api_football_fixture_id IS NOT NULL;
