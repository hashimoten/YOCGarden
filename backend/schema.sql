-- Create a table to cache stock data
create table if not exists stock_cache (
  symbol text primary key,
  price numeric,
  annual_dividend numeric, -- Cached annual dividend
  dividends jsonb, -- Store full dividend history or processed data
  dividend_history_log jsonb, -- Simplified log for frontend: [{year: 2025, amount: 50, is_increase: true}, ...]
  last_updated timestamp with time zone default now()
);

-- Enable RLS (Row Level Security) if needed, but for now we'll allow public access or service role access
alter table stock_cache enable row level security;

-- Create a policy to allow anyone to read (if using specific client key)
-- create policy "Public Access" on stock_cache for select using (true);
-- For backend service role, it bypasses RLS.
