-- V4: Add OAuth2 authentication support
-- This migration adds columns to support Google and Microsoft OAuth2 authentication

-- Add OAuth2 provider IDs
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN microsoft_id VARCHAR(255) UNIQUE;

-- Add auth provider column (LOCAL, GOOGLE, MICROSOFT)
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';

-- Add profile picture URL from OAuth2 provider
ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR(500);

-- Make password nullable for OAuth2 users (they don't have local passwords)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Create indexes for OAuth2 lookups
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_microsoft_id ON users(microsoft_id) WHERE microsoft_id IS NOT NULL;
CREATE INDEX idx_users_auth_provider ON users(auth_provider);

-- Add comments for documentation
COMMENT ON COLUMN users.google_id IS 'Unique Google account identifier for OAuth2 authentication';
COMMENT ON COLUMN users.microsoft_id IS 'Unique Microsoft/Azure AD identifier for OAuth2 authentication';
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider: LOCAL (username/password), GOOGLE (Google OAuth2), or MICROSOFT (Microsoft/Azure AD OAuth2)';
COMMENT ON COLUMN users.profile_picture_url IS 'URL to user profile picture from OAuth2 provider';
