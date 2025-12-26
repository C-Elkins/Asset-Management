-- V10: Create tables for Webhooks and Webhook Events

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(512) NOT NULL,
    secret VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id BIGINT,
    last_triggered_at TIMESTAMP,
    failure_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,

    CONSTRAINT fk_webhook_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index for tenant filtering matching @Index(name = "idx_webhooks_tenant", columnList = "tenant_id")
CREATE INDEX IF NOT EXISTS idx_webhooks_tenant ON webhooks(tenant_id);

-- Optional uniqueness to prevent duplicate names per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uq_webhooks_tenant_name ON webhooks(tenant_id, name);

-- Create collection table for events enum
CREATE TABLE IF NOT EXISTS webhook_events (
    webhook_id BIGINT NOT NULL,
    event VARCHAR(100) NOT NULL,
    CONSTRAINT fk_webhook_events_webhook FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook ON webhook_events(webhook_id);
