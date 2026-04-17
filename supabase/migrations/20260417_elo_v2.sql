-- Reset all existing vote and matchup data for fresh v2 start
DELETE FROM voice_flags;
DELETE FROM votes;
DELETE FROM matchups;
DELETE FROM elo_ratings;

-- Reset match_count on voices
UPDATE voices SET win_count = 0, match_count = 0;

-- Add elo_rating column to voices table (1500 = standard starting ELO)
ALTER TABLE voices ADD COLUMN IF NOT EXISTS elo_rating integer DEFAULT 1500 NOT NULL;

-- Drop win_count (replaced by elo_rating)
ALTER TABLE voices DROP COLUMN IF EXISTS win_count;
