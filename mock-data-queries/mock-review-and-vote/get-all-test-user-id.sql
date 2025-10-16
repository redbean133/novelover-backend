-- Run this script in user-service database to get user IDs.
-- Copy the output and paste into novel-service-seed.sql to replace USER_IDS_HERE.
SELECT 
    '(' || string_agg('''' || id || '''', '),
(') || ')' as values_format
FROM "user" 
WHERE username LIKE 'testuser_%';