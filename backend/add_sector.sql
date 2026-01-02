-- Add sector column to stocks table
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS sector text;

-- Add sector column to stock_cache table
ALTER TABLE stock_cache ADD COLUMN IF NOT EXISTS sector text;
