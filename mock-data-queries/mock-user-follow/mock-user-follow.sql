-- Script PostgreSQL create 10,000 accounts.
-- 10,000 accounts will follow user "admin".
-- Note: You must have a user with username "admin" in the database before running this script.
-- Note: This script should be run on the user-service database.

INSERT INTO "user" (
    id,
    username,
    display_name,
    password_digest,
    gender,
    role,
    status,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    'testuser_' || EXTRACT(EPOCH FROM NOW())::bigint || '_' || i as username,
    'Test User ' || i as display_name,
    '$2b$10$91NgemaEaS96MRXjeKsOUO.pYKBblxg3FSnFC2qYsvVnBeALMPB7q' as password_digest,
    (random() * 2)::int as gender,
    0 as role,
    0 as status,
    NOW() - (random() * interval '30 days') as created_at,
    NOW() as updated_at
FROM generate_series(1, 10000) as i;

DO $$
DECLARE
    admin_id uuid;
    user_ids uuid[];
BEGIN
    -- Select ID of user "admin"
    SELECT id INTO admin_id FROM "user" WHERE username = 'admin' LIMIT 1;

    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Cannot find user with username "admin"';
    END IF;
    
    -- Select all IDs of the 10,000 newly created users
    SELECT ARRAY(SELECT id FROM "user" WHERE username LIKE 'testuser_%' ORDER BY username) INTO user_ids;
    
    -- Create follow records: all users follow admin
    INSERT INTO "follow" (id, follower_id, following_id, created_at)
    SELECT 
        gen_random_uuid(),
        unnest(user_ids),
        admin_id,
        NOW() - (random() * interval '30 days')
    ON CONFLICT DO NOTHING;
END $$;
