-- Run this script to update the number_of_views for chapters and novels
-- Note: This script must be run in novel-service database

-- Update number_of_views for chapters with random values between 0 and 5000
UPDATE chapter
SET number_of_views = floor(random() * 5000);

-- Update number_of_views for novels based on their chapters
UPDATE novel n
SET number_of_views = sub.total_views
FROM (
  SELECT novel_id, COALESCE(SUM(number_of_views), 0) AS total_views
  FROM chapter
  GROUP BY novel_id
) AS sub
WHERE n.id = sub.novel_id;

-- Set number_of_views to 0 for novels without chapters
UPDATE novel
SET number_of_views = 0
WHERE id NOT IN (SELECT DISTINCT novel_id FROM chapter);
