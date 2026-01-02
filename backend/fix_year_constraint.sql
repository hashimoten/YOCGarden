-- Make year column nullable since we now primarily use date_str
ALTER TABLE dividend_history ALTER COLUMN year DROP NOT NULL;
