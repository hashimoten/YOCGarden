-- Add acquisition_date column to stocks table
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS acquisition_date date;

-- Optional: Set default value for existing records (e.g., today or a specific past date if unknown)
-- UPDATE stocks SET acquisition_date = CURRENT_DATE WHERE acquisition_date IS NULL;
