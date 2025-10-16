-- Run this script in novel-service database after getting user IDs from get-all-test-user-id.sql.
-- Replace the placeholder USER_ID_1, USER_ID_2, ... with actual user IDs.

-- Create a temporary table to hold user IDs
CREATE TEMP TABLE temp_user_ids (
    user_id varchar
);

-- Insert user IDs into the temp table (replace this part with actual results from get-all-test-user-id.sql)
INSERT INTO temp_user_ids (user_id) VALUES 
('USER_ID_1'),
('USER_ID_2'),
('USER_ID_3');

-- Create random reviews for novels using DO loop for true randomization
DO $$
DECLARE
    novel_record RECORD;
    users_to_select INTEGER;
BEGIN
    FOR novel_record IN SELECT id FROM "novel" WHERE is_published = true
    LOOP
        -- Random number of reviews for each novel (10-60 reviews)
        users_to_select := (random() * 50 + 10)::INTEGER;
        
        INSERT INTO "review" (novel_id, user_id, content, rating, created_at, updated_at)
        SELECT 
            novel_record.id,
            u.user_id,
            'Đây là một bài đánh giá được tạo tự động. Tiểu thuyết này ' || 
            CASE 
                WHEN r.rand <= 0.4 THEN 'thực sự xuất sắc và đáng đọc!'  -- 40% rating 5
                WHEN r.rand <= 0.7 THEN 'rất hay và hấp dẫn!'            -- 30% rating 4  
                WHEN r.rand <= 0.9 THEN 'khá ổn, đáng đọc.'              -- 20% rating 3
                ELSE 'có một số điểm cần cải thiện.'                       -- 10% rating 2-1
            END as content,
            CASE 
                WHEN r.rand <= 0.4 THEN 5                               -- 40% rating 5
                WHEN r.rand <= 0.7 THEN 4                               -- 30% rating 4
                WHEN r.rand <= 0.9 THEN 3                               -- 20% rating 3
                ELSE GREATEST(1, (r.rand * 2 + 1)::int)                 -- 10% rating 1-2
            END as rating,
            NOW() - (random() * interval '30 days') as created_at,
            NOW() as updated_at
        FROM (
            SELECT user_id
            FROM temp_user_ids
            ORDER BY random()
            LIMIT users_to_select
        ) u
        CROSS JOIN LATERAL (SELECT random() AS rand) r
        ON CONFLICT (novel_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Novel % - Created reviews for % users', novel_record.id, users_to_select;
    END LOOP;
END $$;

-- Update numberOfReviews and totalReviewPoints for novels
UPDATE "novel" SET
    number_of_reviews = subquery.review_count,
    total_review_points = subquery.total_points,
    average_rating = CASE 
        WHEN subquery.review_count > 0 
        THEN ROUND(subquery.total_points::decimal / subquery.review_count, 1)
        ELSE 0 
    END
FROM (
    SELECT 
        novel_id,
        COUNT(*) as review_count,
        SUM(rating) as total_points
    FROM "review" 
    GROUP BY novel_id
) as subquery
WHERE "novel".id = subquery.novel_id;

-- Create random votes for chapters using DO loop for true randomization
DO $$
DECLARE
    chapter_record RECORD;
    users_to_select INTEGER;
BEGIN
    FOR chapter_record IN SELECT id FROM "chapter" WHERE is_published = true
    LOOP
        -- Random number of votes for each chapter (50-170 votes)
        users_to_select := (random() * 120 + 50)::INTEGER;
        
        INSERT INTO "chapter_vote" (user_id, chapter_id)
        SELECT 
            u.user_id,
            chapter_record.id
        FROM (
            SELECT user_id 
            FROM temp_user_ids 
            ORDER BY random() 
            LIMIT users_to_select
        ) u
        ON CONFLICT (user_id, chapter_id) DO NOTHING;
        
        RAISE NOTICE 'Chapter % - Created votes for % users', chapter_record.id, users_to_select;
    END LOOP;
END $$;

-- Update numberOfVotes for chapters
UPDATE "chapter" SET 
    number_of_votes = subquery.vote_count
FROM (
    SELECT 
        chapter_id,
        COUNT(*) as vote_count
    FROM "chapter_vote" 
    GROUP BY chapter_id
) as subquery
WHERE "chapter".id = subquery.chapter_id;

-- Update total numberOfVotes for novels
UPDATE "novel" SET 
    number_of_votes = subquery.total_votes
FROM (
    SELECT 
        c.novel_id,
        SUM(c.number_of_votes) as total_votes
    FROM "chapter" c
    GROUP BY c.novel_id
) as subquery
WHERE "novel".id = subquery.novel_id;

-- Display summary of created reviews and votes
SELECT 
    'Reviews created' as metric,
    COUNT(*) as count
FROM "review"

UNION ALL

SELECT 
    'Chapter votes created',
    COUNT(*)
FROM "chapter_vote";