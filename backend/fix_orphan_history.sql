-- 1. Clean up existing orphan data (history items pointing to non-existent stocks)
DELETE FROM dividend_history
WHERE stock_id NOT IN (SELECT id FROM stocks);

-- 2. Drop existing foreign key constraint
-- Note: Constraint name might vary. We try to drop by finding it or assume a standard name.
-- Often named 'dividend_history_stock_id_fkey'. 
-- IF NOT EXISTS is not supported for DROP CONSTRAINT in standard SQL but safe to try if we know the name.
-- Since we don't know the exact name, we can try to alter the column directly or recreate table if small.
-- Better approach for Supabase/Postgres:

DO $$
DECLARE
    r record;
BEGIN
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'dividend_history' 
        AND constraint_type = 'FOREIGN KEY'
    )
    LOOP
        EXECUTE 'ALTER TABLE dividend_history DROP CONSTRAINT ' || r.constraint_name;
    END LOOP;
END $$;

-- 3. Add new foreign key with ON DELETE CASCADE
ALTER TABLE dividend_history
ADD CONSTRAINT dividend_history_stock_id_fkey
FOREIGN KEY (stock_id) REFERENCES stocks(id)
ON DELETE CASCADE;
