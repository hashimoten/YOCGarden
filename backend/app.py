from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/stock/<code>', methods=['GET'])
def get_stock_data(code):
    try:
        # Append .T for Tokyo Stock Exchange if not present (simple assumption for this app)
        ticker_symbol = f"{code}.T"
        stock = yf.Ticker(ticker_symbol)
        
        # Get current info (price)
        # fast_info is often faster/more reliable for current price than .info
        current_price = stock.fast_info.last_price
        
        if current_price is None:
             return jsonify({'error': 'Could not retrieve current price'}), 404

        # Get dividend history for the last 3 years
        # yfinance actions or dividends
        dividends = stock.dividends
        
        # Filter for the last 3 years
        now = datetime.datetime.now()
        three_years_ago = now - datetime.timedelta(days=365 * 3)
        # dividends series index is localized timestamp
        start_date = three_years_ago.replace(tzinfo=dividends.index.dtype.tz)
        
        recent_dividends = dividends[dividends.index >= start_date]
        
        # Group by year to get annual dividend sums
        annual_dividends = {}
        for date, value in recent_dividends.items():
            year = date.year
            annual_dividends[year] = annual_dividends.get(year, 0) + value
            
        # Format dividend history
        dividend_history = []
        for year in sorted(annual_dividends.keys(), reverse=True):
            dividend_history.append({
                'year': year,
                'amount': annual_dividends[year]
            })

        # Calculate latest annual dividend (approximation based on last year or sum of trailing 12 months)
        # For simplicity, let's take the sum of the dividends in the last 365 days
        one_year_ago = now - datetime.timedelta(days=365)
        start_date_1y = one_year_ago.replace(tzinfo=dividends.index.dtype.tz)
        trailing_dividends = dividends[dividends.index >= start_date_1y]
        annual_dividend_sum = trailing_dividends.sum()

        response_data = {
            'symbol': code,
            'current_price': current_price,
            'annual_dividend': annual_dividend_sum,
            'dividend_history': dividend_history
        }
        
        return jsonify(response_data)

    except Exception as e:
        print(f"Error fetching data for {code}: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
