-- Multi-Tenant Support Migration
-- This migration adds tenant support to enable SaaS multi-tenancy with complete data isolation

-- Create tenants table
CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subdomain VARCHAR(63) NOT NULL UNIQUE,
    description TEXT,
    contact_email VARCHAR(255) NOT NULL,
    contact_name VARCHAR(100),
    phone_number VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT true,
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'FREE',
    max_users INTEGER DEFAULT 5,
    max_assets INTEGER DEFAULT 100,
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    logo_url VARCHAR(255),
    primary_color VARCHAR(50) DEFAULT '#6366f1',
    custom_domain VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_subdomain_format CHECK (subdomain ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$'),
    CONSTRAINT chk_subscription_tier CHECK (subscription_tier IN ('FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE')),
    CONSTRAINT chk_max_users CHECK (max_users > 0),
    CONSTRAINT chk_max_assets CHECK (max_assets > 0)
);

-- Create indexes for tenants table
CREATE INDEX idx_tenant_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenant_active ON tenants(active);
CREATE INDEX idx_tenant_created ON tenants(created_at);

-- Add tenant_id column to users table
ALTER TABLE users ADD COLUMN tenant_id BIGINT;

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_user_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Create index for tenant queries
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- Add tenant_id column to categories table
ALTER TABLE categories ADD COLUMN tenant_id BIGINT;

-- Add foreign key constraint
ALTER TABLE categories ADD CONSTRAINT fk_category_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX idx_categories_tenant ON categories(tenant_id);

-- Add tenant_id column to assets table
ALTER TABLE assets ADD COLUMN tenant_id BIGINT;

-- Add foreign key constraint
ALTER TABLE assets ADD CONSTRAINT fk_asset_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX idx_assets_tenant ON assets(tenant_id);

-- Add tenant_id column to maintenance_records table
ALTER TABLE maintenance_records ADD COLUMN tenant_id BIGINT;

-- Add foreign key constraint
ALTER TABLE maintenance_records ADD CONSTRAINT fk_maintenance_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX idx_maintenance_tenant ON maintenance_records(tenant_id);

-- Add tenant_id column to api_keys table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
        
        ALTER TABLE api_keys ADD CONSTRAINT fk_apikey_tenant 
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id);
    END IF;
END $$;

-- Add tenant_id column to webhooks table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhooks') THEN
        ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
        
        ALTER TABLE webhooks ADD CONSTRAINT fk_webhook_tenant 
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_webhooks_tenant ON webhooks(tenant_id);
    END IF;
END $$;

-- Add tenant_id column to report_schedules table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_schedules') THEN
        ALTER TABLE report_schedules ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
        
        ALTER TABLE report_schedules ADD CONSTRAINT fk_report_schedule_tenant 
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_report_schedules_tenant ON report_schedules(tenant_id);
    END IF;
END $$;

-- Refresh tokens should be tied to tenant through user relationship
-- No direct tenant_id needed as they reference users

-- Create a default tenant for existing data migration
INSERT INTO tenants (name, subdomain, contact_email, active, subscription_tier, max_users, max_assets, created_at)
VALUES ('Default Organization', 'default', 'admin@example.com', true, 'ENTERPRISE', 999999, 999999, CURRENT_TIMESTAMP);

-- Get the default tenant ID
DO $$
DECLARE
    default_tenant_id BIGINT;
BEGIN
    SELECT id INTO default_tenant_id FROM tenants WHERE subdomain = 'default';
    
    -- Update existing records with default tenant
    UPDATE users SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE categories SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE assets SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE maintenance_records SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    
    -- Update other tables if they exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        EXECUTE 'UPDATE api_keys SET tenant_id = $1 WHERE tenant_id IS NULL' USING default_tenant_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhooks') THEN
        EXECUTE 'UPDATE webhooks SET tenant_id = $1 WHERE tenant_id IS NULL' USING default_tenant_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_schedules') THEN
        EXECUTE 'UPDATE report_schedules SET tenant_id = $1 WHERE tenant_id IS NULL' USING default_tenant_id;
    END IF;
END $$;

-- Make tenant_id NOT NULL after migration
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE categories ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE assets ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE maintenance_records ALTER COLUMN tenant_id SET NOT NULL;

-- Create a function to automatically set tenant_id on insert (Row-Level Security helper)
CREATE OR REPLACE FUNCTION set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Get tenant_id from session variable if not explicitly set
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := current_setting('app.current_tenant_id', true)::BIGINT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic tenant_id assignment
CREATE TRIGGER trg_users_tenant_id
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER trg_categories_tenant_id
    BEFORE INSERT ON categories
    FOR EACH ROW
    EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER trg_assets_tenant_id
    BEFORE INSERT ON assets
    FOR EACH ROW
    EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER trg_maintenance_tenant_id
    BEFORE INSERT ON maintenance_records
    FOR EACH ROW
    EXECUTE FUNCTION set_tenant_id();

-- Enable Row-Level Security (RLS) on all tenant-aware tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
-- Users can only see data from their own tenant
CREATE POLICY tenant_isolation_policy ON users
    USING (tenant_id = current_setting('app.current_tenant_id', true)::BIGINT);

CREATE POLICY tenant_isolation_policy ON categories
    USING (tenant_id = current_setting('app.current_tenant_id', true)::BIGINT);

CREATE POLICY tenant_isolation_policy ON assets
    USING (tenant_id = current_setting('app.current_tenant_id', true)::BIGINT);

CREATE POLICY tenant_isolation_policy ON maintenance_records
    USING (tenant_id = current_setting('app.current_tenant_id', true)::BIGINT);

-- Optional: Create policies for api_keys, webhooks, report_schedules if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        EXECUTE 'ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY';
        EXECUTE 'CREATE POLICY tenant_isolation_policy ON api_keys 
                 USING (tenant_id = current_setting(''app.current_tenant_id'', true)::BIGINT)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhooks') THEN
        EXECUTE 'ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY';
        EXECUTE 'CREATE POLICY tenant_isolation_policy ON webhooks 
                 USING (tenant_id = current_setting(''app.current_tenant_id'', true)::BIGINT)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_schedules') THEN
        EXECUTE 'ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY';
        EXECUTE 'CREATE POLICY tenant_isolation_policy ON report_schedules 
                 USING (tenant_id = current_setting(''app.current_tenant_id'', true)::BIGINT)';
    END IF;
END $$;

-- Create a view for tenant statistics
CREATE OR REPLACE VIEW tenant_statistics AS
SELECT 
    t.id,
    t.name,
    t.subdomain,
    t.subscription_tier,
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT a.id) as asset_count,
    COUNT(DISTINCT c.id) as category_count,
    COUNT(DISTINCT m.id) as maintenance_record_count,
    t.max_users,
    t.max_assets,
    t.created_at
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
LEFT JOIN assets a ON t.id = a.tenant_id
LEFT JOIN categories c ON t.id = c.tenant_id
LEFT JOIN maintenance_records m ON t.id = m.tenant_id
GROUP BY t.id, t.name, t.subdomain, t.subscription_tier, t.max_users, t.max_assets, t.created_at;

-- Comment for documentation
COMMENT ON TABLE tenants IS 'Multi-tenant SaaS organizations with complete data isolation';
COMMENT ON COLUMN tenants.subdomain IS 'Unique subdomain for tenant access (e.g., acme.yourdomain.com)';
COMMENT ON COLUMN tenants.subscription_tier IS 'Subscription level: FREE, BASIC, PROFESSIONAL, ENTERPRISE';
