-- Google OAuth support
ALTER TABLE users ADD COLUMN google_id TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
-- make password_hash nullable for OAuth users (SQLite: recreate if needed, but allow empty string for now)
-- Ensure google_id unique where not null
CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_idx ON users(google_id) WHERE google_id IS NOT NULL;
-- Update sessions to have longer expiry handling already ok

-- For existing users, keep password_hash as is; Google users will have password_hash = 'google_oauth'
