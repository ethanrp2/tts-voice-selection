-- Update elo_ratings category check: replace 'overall' with 'appeal'
ALTER TABLE elo_ratings DROP CONSTRAINT elo_ratings_category_check;
DELETE FROM elo_ratings WHERE category = 'overall';
ALTER TABLE elo_ratings ADD CONSTRAINT elo_ratings_category_check
  CHECK (category = ANY (ARRAY['appeal', 'empathy', 'authority', 'energy']));

-- Update votes category check: add 'appeal'
ALTER TABLE votes DROP CONSTRAINT votes_category_check;
ALTER TABLE votes ADD CONSTRAINT votes_category_check
  CHECK (category = ANY (ARRAY['appeal', 'empathy', 'authority', 'energy']));

-- Seed 'appeal' ELO rating rows for all existing voices
INSERT INTO elo_ratings (voice_id, category, rating, match_count, win_count)
SELECT id, 'appeal', 1200, 0, 0
FROM voices
WHERE id NOT IN (
  SELECT voice_id FROM elo_ratings WHERE category = 'appeal'
);
