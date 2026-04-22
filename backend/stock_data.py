"""
Fetch real stock data using yfinance
"""

import yfinance as yf
import numpy as np
from typing import List


def fetch_stock_data(symbols: List[str], period: str = "1y") -> dict:
    """
    Fetch historical stock data and calculate returns + covariance.
    """
    try:
        # Download data
        data = yf.download(symbols, period=period, progress=False, group_by='ticker')

        if data.empty:
            return {"success": False, "error": "No data returned from Yahoo Finance"}

        # Handle single vs multiple symbols differently
        if len(symbols) == 1:
            close_prices = data["Close"].to_frame(name=symbols[0])
        else:
            # Extract Close prices for each symbol
            close_prices = {}
            for symbol in symbols:
                if symbol in data.columns.get_level_values(0):
                    close_prices[symbol] = data[symbol]["Close"]
            close_prices = yf.download(symbols, period=period, progress=False)["Close"]

        # Calculate daily returns
        daily_returns = close_prices.pct_change().dropna()

        if daily_returns.empty:
            return {"success": False, "error": "Could not calculate returns"}

        # Annualized expected returns (252 trading days)
        expected_returns = (daily_returns.mean() * 252).tolist()

        # Annualized covariance matrix
        covariance = (daily_returns.cov() * 252).values.tolist()

        # Get current prices
        current_prices = close_prices.iloc[-1].to_dict()

        return {
            "symbols": symbols,
            "expected_returns": expected_returns,
            "covariance": covariance,
            "current_prices": current_prices,
            "period": period,
            "data_points": len(daily_returns),
            "success": True
        }

    except Exception as e:
        return {
            "symbols": symbols,
            "success": False,
            "error": str(e)
        }


def get_sample_stocks() -> List[dict]:
    """Return a list of popular stocks for the UI."""
    return [
        {"symbol": "AAPL", "name": "Apple Inc."},
        {"symbol": "GOOGL", "name": "Alphabet Inc."},
        {"symbol": "MSFT", "name": "Microsoft Corp."},
        {"symbol": "AMZN", "name": "Amazon.com Inc."},
        {"symbol": "NVDA", "name": "NVIDIA Corp."},
        {"symbol": "META", "name": "Meta Platforms Inc."},
        {"symbol": "TSLA", "name": "Tesla Inc."},
        {"symbol": "JPM", "name": "JPMorgan Chase"},
        {"symbol": "V", "name": "Visa Inc."},
        {"symbol": "JNJ", "name": "Johnson & Johnson"},
    ]