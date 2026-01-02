-- Run this if the table already exists but is missing columns
-- Ensure we have the correct columns for the new history format

DO $$
BEGIN
    -- Add date_str if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dividend_history' AND column_name = 'date_str') THEN
        ALTER TABLE dividend_history ADD COLUMN date_str text;
    END IF;

    -- Add is_increase if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dividend_history' AND column_name = 'is_increase') THEN
        ALTER TABLE dividend_history ADD COLUMN is_increase boolean;
    END IF;

    -- Add change_pct if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dividend_history' AND column_name = 'change_pct') THEN
        ALTER TABLE dividend_history ADD COLUMN change_pct numeric;
    END IF;

    -- Add comparison_amount if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dividend_history' AND column_name = 'comparison_amount') THEN
        ALTER TABLE dividend_history ADD COLUMN comparison_amount numeric;
    END IF;
    
    -- Ensure amount is numeric (it likely was, but just in case)
    -- ALTER TABLE dividend_history ALTER COLUMN amount TYPE numeric;

END $$;
