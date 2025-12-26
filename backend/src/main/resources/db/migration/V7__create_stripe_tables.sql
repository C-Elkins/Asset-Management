-- Add stripe_customer_id to tenants table
ALTER TABLE tenants ADD COLUMN stripe_customer_id VARCHAR(255) UNIQUE;
CREATE INDEX idx_tenant_stripe_customer ON tenants(stripe_customer_id);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_price_id VARCHAR(255),
    plan_name VARCHAR(50) NOT NULL,
    billing_cycle VARCHAR(20),
    status VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    asset_limit INTEGER,
    user_limit INTEGER,
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'usd',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_subscription_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscription_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscription_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscription_status ON subscriptions(status);

-- Create invoices table
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    amount_due DECIMAL(10, 2),
    amount_paid DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'usd',
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,
    billing_reason VARCHAR(100),
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoice_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoice_stripe_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoice_customer ON invoices(stripe_customer_id);
CREATE INDEX idx_invoice_subscription ON invoices(stripe_subscription_id);
CREATE INDEX idx_invoice_status ON invoices(status);
CREATE INDEX idx_invoice_created ON invoices(created_at DESC);

-- Create payment_methods table
CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    card_brand VARCHAR(50),
    card_last4 VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    billing_email VARCHAR(255),
    billing_name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_method_tenant ON payment_methods(tenant_id);
CREATE INDEX idx_payment_method_stripe_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_method_customer ON payment_methods(stripe_customer_id);
CREATE INDEX idx_payment_method_default ON payment_methods(is_default);

-- Create usage_records table
CREATE TABLE usage_records (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    stripe_subscription_id VARCHAR(255),
    stripe_usage_record_id VARCHAR(255),
    asset_count INTEGER NOT NULL,
    overage_count INTEGER,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reported_to_stripe BOOLEAN DEFAULT FALSE,
    report_timestamp TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_usage_tenant ON usage_records(tenant_id);
CREATE INDEX idx_usage_subscription ON usage_records(stripe_subscription_id);
CREATE INDEX idx_usage_recorded ON usage_records(recorded_at DESC);
CREATE INDEX idx_usage_reported ON usage_records(reported_to_stripe);

-- Add comments for documentation
COMMENT ON TABLE subscriptions IS 'Stores Stripe subscription information for each tenant';
COMMENT ON TABLE invoices IS 'Stores invoice history from Stripe';
COMMENT ON TABLE payment_methods IS 'Stores customer payment methods from Stripe';
COMMENT ON TABLE usage_records IS 'Tracks asset usage for metered billing';
