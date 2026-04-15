-- Add win_count and match_count columns directly on the voices table
ALTER TABLE voices ADD COLUMN IF NOT EXISTS win_count integer DEFAULT 0 NOT NULL;
ALTER TABLE voices ADD COLUMN IF NOT EXISTS match_count integer DEFAULT 0 NOT NULL;

-- Add 'preferred' to votes category constraint so we can store simplified votes
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_category_check;
ALTER TABLE votes ADD CONSTRAINT votes_category_check
  CHECK (category = ANY (ARRAY['appeal', 'empathy', 'authority', 'energy', 'preferred']));
