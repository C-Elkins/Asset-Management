-- V8__Add_User_Consent_Privacy_Tables.sql
-- GDPR/CCPA Compliance: Add user consent management tables

-- Create user_consents table for privacy consent tracking
CREATE TABLE user_consents (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    tenant_id               BIGINT NOT NULL,
    marketing_emails        BOOLEAN NOT NULL DEFAULT FALSE,
    analytics               BOOLEAN NOT NULL DEFAULT FALSE,
    data_processing         BOOLEAN NOT NULL DEFAULT TRUE,
    consent_version         VARCHAR(20) NOT NULL DEFAULT '1.0',
    consent_ip_address      VARCHAR(45),
    consent_user_agent      VARCHAR(500),
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_consents_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_consents_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Unique constraint to ensure one consent record per user per tenant
    CONSTRAINT uk_user_consents_user_tenant 
        UNIQUE (user_id, tenant_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_consents_user ON user_consents(user_id);
CREATE INDEX idx_user_consents_tenant ON user_consents(tenant_id);
CREATE INDEX idx_user_consents_user_tenant ON user_consents(user_id, tenant_id);
CREATE INDEX idx_user_consents_created_at ON user_consents(created_at);
CREATE INDEX idx_user_consents_updated_at ON user_consents(updated_at);
CREATE INDEX idx_user_consents_marketing ON user_consents(tenant_id, marketing_emails) WHERE marketing_emails = TRUE;
CREATE INDEX idx_user_consents_analytics ON user_consents(tenant_id, analytics) WHERE analytics = TRUE;

-- Add comments for documentation
COMMENT ON TABLE user_consents IS 'Tracks user consent preferences for GDPR/CCPA compliance';
COMMENT ON COLUMN user_consents.user_id IS 'Reference to the user who gave consent';
COMMENT ON COLUMN user_consents.tenant_id IS 'Reference to the tenant (for multi-tenancy)';
COMMENT ON COLUMN user_consents.marketing_emails IS 'User consent for marketing email communications';
COMMENT ON COLUMN user_consents.analytics IS 'User consent for analytics and performance tracking';
COMMENT ON COLUMN user_consents.data_processing IS 'Essential data processing consent (always TRUE for app functionality)';
COMMENT ON COLUMN user_consents.consent_version IS 'Version of privacy policy when consent was given';
COMMENT ON COLUMN user_consents.consent_ip_address IS 'IP address from which consent was given (audit trail)';
COMMENT ON COLUMN user_consents.consent_user_agent IS 'User agent string when consent was given (audit trail)';

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_consents_updated_at
    BEFORE UPDATE ON user_consents
    FOR EACH ROW
    EXECUTE FUNCTION update_user_consents_updated_at();

-- Insert default consent records for existing users
-- This ensures all existing users have a consent record with default (minimal) permissions
INSERT INTO user_consents (user_id, tenant_id, marketing_emails, analytics, data_processing, consent_version)
SELECT 
    u.id,
    u.tenant_id,
    FALSE,  -- marketing_emails - default to FALSE (opt-in required)
    FALSE,  -- analytics - default to FALSE (opt-in required)  
    TRUE,   -- data_processing - default to TRUE (required for app functionality)
    '1.0'   -- consent_version
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_consents uc 
    WHERE uc.user_id = u.id AND uc.tenant_id = u.tenant_id
);

-- Log migration completion
-- Ensure migration_log exists on fresh databases
CREATE TABLE IF NOT EXISTS public.migration_log (
    version TEXT PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.migration_log (version, description, applied_at) 
VALUES ('V8', 'Add user consent privacy tables for GDPR/CCPA compliance', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
