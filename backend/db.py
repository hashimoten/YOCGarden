import os
import json
import datetime
import math
from supabase import create_client, Client
from dotenv import load_dotenv
import yfinance as yf

# Load environment variables from .env or ../.env
load_dotenv()
if not os.getenv("SUPABASE_URL"):
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# Initialize Supabase client
supabase: Client = create_client(url, key) if url and key else None

def get_stock_data_with_cache(code: str):
    """
    Orchestrates fetching stock data.
    1. Checks Supabase cache.
    2. If missing or stale (> 1 month), fetches from yfinance.
    3. Updates cache.
    4. Returns formatted data.
    """
    symbol = f"{code}.T"
    
    # 1. Check Cache
    if supabase:
        try:
            response = supabase.table('stock_cache').select("*").eq('symbol', symbol).execute()
            if response.data:
                cached_data = response.data[0]
                last_updated_str = cached_data.get('last_updated')
                if last_updated_str:
                    # Parse timestamp (Supabase returns ISO string)
                    last_updated = datetime.datetime.fromisoformat(last_updated_str.replace('Z', '+00:00'))
                    
                    # Check if stale (older than 30 days)
                    if datetime.datetime.now(datetime.timezone.utc) - last_updated < datetime.timedelta(days=30):
                        print(f"Returning cached data for {symbol}")
                        return {
                            'symbol': symbol,
                            'current_price': cached_data['price'],
                            'annual_dividend': cached_data.get('annual_dividend', 0),
                            'dividend_history': cached_data.get('dividend_history_log', []),
                            'sector': cached_data.get('sector')
                        }
        except Exception as e:
            print(f"Cache lookup failed: {e}")

    # 2. Fetch from yfinance
    print(f"Fetching fresh data for {symbol}")
    try:
        stock = yf.Ticker(symbol)
        
        # Get Price
        current_price = stock.fast_info.last_price
        
        # Get Index Data (Sector etc)
        # Note: accessing .info triggers a separate request and can be slow/rate limited
        # We try to fetch it safely.
        sector = None
        try:
           sector = stock.info.get('sector')
        except Exception as e:
           print(f"Failed to fetch sector info: {e}")

        # Get Dividends
        dividends = stock.dividends
        if dividends.empty:
             return {
                'symbol': symbol,
                'current_price': current_price,
                'annual_dividend': 0,
                'dividend_history': [],
                'sector': sector
            }

        # 3. Process Dividends & Increase Detection
        dividend_history_log = _process_dividend_history(dividends)
        
        # Calculate latest annual dividend (TTM)
        now = datetime.datetime.now()
        start_date_1y = (now - datetime.timedelta(days=365)).replace(tzinfo=dividends.index.dtype.tz)
        annual_dividend_sum = dividends[dividends.index >= start_date_1y].sum()

        # 4. Update Cache
        if supabase:
            data = {
                'symbol': symbol,
                'price': current_price,
                'annual_dividend': float(annual_dividend_sum),
                'dividends': json.loads(dividends.to_json(date_format='iso')),
                'dividend_history_log': dividend_history_log,
                'sector': sector,
                'last_updated': datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
            try:
                supabase.table('stock_cache').upsert(data).execute()
            except Exception as e:
                print(f"Cache update failed: {e}")

        return {
            'symbol': symbol,
            'current_price': current_price,
            'annual_dividend': annual_dividend_sum,
            'dividend_history': dividend_history_log,
            'sector': sector
        }

    except Exception as e:
        print(f"Error in yfinance fetch: {e}")
        # If fetch fails, try to return stale cache if available? 
        # For now just re-raise or return error
        raise e

def _process_dividend_history(dividends_series):
    """
    Process raw dividend series into a history log with 'increase' detection.
    """
    # Force timezone naive for simpler comparison if needed, or keep aware.
    # yfinance dates are usually aware.
    
    dividends_series = dividends_series.sort_index()
    
    # Filter for last 5 years
    now = datetime.datetime.now(datetime.timezone.utc)
    cutoff = now - datetime.timedelta(days=365*30)
    
    if dividends_series.index.tz:
         try:
             cutoff = cutoff.replace(tzinfo=dividends_series.index.tz)
         except:
             pass 

    recent_dividends = dividends_series[dividends_series.index >= cutoff]
    
    processed_data = []
    
    # Iterate recent dividends (newest to oldest or vice versa)
    # We'll iterate newest to oldest for the list
    
    # Sort descending for processing? No, iterating items() gives chronological.
    # Let's use the full series for lookups.
    
    for date, amount in recent_dividends.items():
        # Find comparison dividend (approx 1 year ago)
        target_date = date - datetime.timedelta(days=365)
        
        # Window: +/- 45 days
        lower_bound = target_date - datetime.timedelta(days=45)
        upper_bound = target_date + datetime.timedelta(days=45)
        
        mask = (dividends_series.index >= lower_bound) & (dividends_series.index <= upper_bound)
        candidates = dividends_series[mask]
        
        comparison_amount = 0
        is_increase = False
        change_pct = 0.0
        
        if not candidates.empty:
            comparison_amount = candidates.iloc[0]
            if comparison_amount > 0:
                diff = amount - comparison_amount
                if diff > 0:
                    is_increase = True
                    change_pct = round((diff / comparison_amount) * 100, 1)
        
        item = {
            'date_str': date.strftime('%Y/%m'),
            'amount': float(amount),
            'comparison_amount': float(comparison_amount) if comparison_amount > 0 else None,
            'is_increase': is_increase,
            'change_pct': change_pct
        }
        processed_data.append(item)
        
    # Sort descending date
    processed_data.sort(key=lambda x: x['date_str'], reverse=True)
    return processed_data
