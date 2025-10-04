-- V9: Align maintenance_records table with JPA entity fields
-- Adds missing columns if they do not exist and sets safe defaults

-- Add description column (TEXT NOT NULL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'maintenance_records' AND column_name = 'description'
    ) THEN
        ALTER TABLE maintenance_records ADD COLUMN description TEXT;
        -- Backfill empty descriptions to avoid null constraint violations
        UPDATE maintenance_records SET description = COALESCE(notes, '');
        ALTER TABLE maintenance_records ALTER COLUMN description SET NOT NULL;
    END IF;
END $$;

-- Add status column with default 'SCHEDULED'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'maintenance_records' AND column_name = 'status'
    ) THEN
        ALTER TABLE maintenance_records ADD COLUMN status VARCHAR(20) DEFAULT 'SCHEDULED';
        UPDATE maintenance_records SET status = 'SCHEDULED' WHERE status IS NULL;
        ALTER TABLE maintenance_records ALTER COLUMN status SET NOT NULL;
    END IF;
END $$;

-- Add priority column with default 'MEDIUM'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'maintenance_records' AND column_name = 'priority'
    ) THEN
        ALTER TABLE maintenance_records ADD COLUMN priority VARCHAR(20) DEFAULT 'MEDIUM';
        UPDATE maintenance_records SET priority = 'MEDIUM' WHERE priority IS NULL;
        ALTER TABLE maintenance_records ALTER COLUMN priority SET NOT NULL;
    END IF;
END $$;

-- Add vendor column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'maintenance_records' AND column_name = 'vendor'
    ) THEN
        ALTER TABLE maintenance_records ADD COLUMN vendor VARCHAR(100);
    END IF;
END $$;

-- Add parts_used column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'maintenance_records' AND column_name = 'parts_used'
    ) THEN
        ALTER TABLE maintenance_records ADD COLUMN parts_used TEXT;
    END IF;
END $$;
