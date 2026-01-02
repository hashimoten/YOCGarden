from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/stock/<code>', methods=['GET'])
def get_stock_data(code):
    try:
        from db import get_stock_data_with_cache
        data = get_stock_data_with_cache(code)
        return jsonify(data)

    except Exception as e:
        print(f"Error fetching data for {code}: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
