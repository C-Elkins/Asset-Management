-- V5__Add_Scheduled_Reports.sql
-- Migration to add scheduled reports functionality

CREATE TABLE report_schedules (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- 'ASSET_LIST', 'MAINTENANCE_DUE', 'WARRANTY_EXPIRING', 'CUSTOM'
    frequency VARCHAR(20) NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY'
    day_of_week INTEGER, -- 1-7 (Monday-Sunday) for WEEKLY frequency
    day_of_month INTEGER, -- 1-31 for MONTHLY frequency
    time_of_day TIME NOT NULL DEFAULT '09:00:00', -- Time to run the report
    format VARCHAR(10) NOT NULL DEFAULT 'CSV', -- 'CSV' or 'PDF'
    enabled BOOLEAN NOT NULL DEFAULT true,
    filters JSONB, -- Store dynamic filters as JSON
    recipient_emails TEXT[], -- Array of additional email addresses
    include_charts BOOLEAN DEFAULT false, -- Include charts in PDF reports
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    
    CONSTRAINT fk_report_schedule_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT check_day_of_week CHECK (day_of_week IS NULL OR (day_of_week >= 1 AND day_of_week <= 7)),
    CONSTRAINT check_day_of_month CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)),
    CONSTRAINT check_format CHECK (format IN ('CSV', 'PDF'))
);

-- Create index for efficient queries
CREATE INDEX idx_report_schedules_user_id ON report_schedules(user_id);
CREATE INDEX idx_report_schedules_enabled ON report_schedules(enabled);
CREATE INDEX idx_report_schedules_next_run ON report_schedules(next_run_at) WHERE enabled = true;

-- Add comments for documentation
COMMENT ON TABLE report_schedules IS 'Stores scheduled report configurations for automated report generation';
COMMENT ON COLUMN report_schedules.report_type IS 'Type of report: ASSET_LIST, MAINTENANCE_DUE, WARRANTY_EXPIRING, CUSTOM';
COMMENT ON COLUMN report_schedules.frequency IS 'How often the report runs: DAILY, WEEKLY, MONTHLY';
COMMENT ON COLUMN report_schedules.day_of_week IS 'Day of week (1=Monday, 7=Sunday) for WEEKLY reports';
COMMENT ON COLUMN report_schedules.day_of_month IS 'Day of month (1-31) for MONTHLY reports';
COMMENT ON COLUMN report_schedules.filters IS 'JSON object containing filter criteria for the report';
COMMENT ON COLUMN report_schedules.recipient_emails IS 'Additional email addresses to send the report to';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_report_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER trigger_update_report_schedule_updated_at
    BEFORE UPDATE ON report_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_report_schedule_updated_at();
