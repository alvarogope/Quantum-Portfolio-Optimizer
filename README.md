# Quantum Portfolio Optimizer

![Qiskit](https://img.shields.io/badge/Qiskit-6929C4?style=flat&logo=qiskit&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

A full-stack Quantum Portfolio Optimizer that uses the Quantum Approximate Optimization Algorithm (QAOA) to solve asset allocation as a QUBO problem. Users select stocks, adjust risk tolerance, and the app returns optimal allocation percentages with expected return, volatility, and Sharpe ratio.

The approach is hybrid quantum-classical: QAOA determines which stocks to include, and scipy mean-variance optimization determines how much to allocate to each.

---

## 📸 Preview

![Quantum Portfolio Optimizer](https://github.com/alvarogope/Quantum-Portfolio-Optimizer/blob/master/assets/Preview.png)

---

## ✨ Features

-  **QAOA Stock Selection** - Quantum circuit determines optimal stock inclusion via QUBO encoding
-  **Classical Weight Optimization** - scipy mean-variance optimization allocates capital across selected stocks
-  **Real-Time Stock Data** - Live price and returns data from Yahoo Finance via yfinance
-  **Risk Tolerance Slider** - Conservative, Balanced, and Aggressive profiles
-  **GBP Allocation** - Investment amount input with per-stock GBP breakdown
-  **Portfolio Metrics** - Expected Return, Volatility, Sharpe Ratio, and QAOA Energy
-  **Circuit Visualization** - View the actual QAOA quantum circuit used for optimization
-  **Mobile Responsive** - Glassmorphism UI that works across screen sizes
-  **Keyboard Shortcut** - Press Enter to run optimization
-  **Toast Notifications** - Real-time feedback on optimization status
-  **Metric Tooltips** - Inline explanations for each financial metric

---

## 🏗️ Architecture

```
┌─────────────────────┐         ┌──────────────────────────┐
│   React (Vite)      │ ──────▶ │   FastAPI (Python)       │
│   Tailwind CSS      │         │   Uvicorn ASGI server    │
│   Recharts          │         │   /optimize endpoint     │
└─────────────────────┘         └──────────┬───────────────┘
                                            │
                          ┌─────────────────┴──────────────────┐
                          ▼                                     ▼
                  Qiskit QAOA Solver                       yfinance
              (quantum stock selection)            (real-time stock data)
                          │
                          ▼
                  scipy Optimizer
              (classical weight allocation)
```

**Hybrid quantum-classical flow:**

1. QAOA selects which stocks to include by solving a QUBO problem using quantum superposition
2. scipy mean-variance optimization determines the exact allocation weight for each selected stock

---

## ⚛️ How QAOA Works

Each stock is encoded as a binary qubit (include or exclude). The QUBO cost function encodes two objectives:

- **Objective:** minimise risk - lambda x return
- **Constraint:** select an appropriate number of assets

```
|0⟩ ──[H]──[Cost U(γ,C)]──[Mixer U(β,B)]──[Cost U(γ,C)]──[Mixer U(β,B)]──[Measure]──
|0⟩ ──[H]──[Cost U(γ,C)]──[Mixer U(β,B)]──[Cost U(γ,C)]──[Mixer U(β,B)]──[Measure]──
...
       └──── COBYLA tunes γ, β ────┘
```

The circuit creates a superposition of all 2^n possible portfolios simultaneously, iteratively amplifies high-quality selections via cost and mixer layers, and collapses to the optimal stock subset on measurement.

| Step | Operation | Description |
|---|---|---|
| 1 | **Hadamard (H)** | Superposition of all possible stock combinations |
| 2 | **Cost Layer U(γ,C)** | Encodes portfolio risk and return as phase rotations |
| 3 | **Mixer Layer U(β,B)** | Explores the solution space |
| 4 | **COBYLA Optimizer** | Classical tuning of γ, β parameters |
| 5 | **Measurement** | Collapses to optimal stock selection |
| 6 | **scipy** | Allocates weights across selected stocks |

> **Memory limit:** Maximum 9 stocks (9 qubits) due to statevector simulation constraints.

---

## 🗂️ Project Structure

```
quantum-portfolio-optimizer/
├── backend/
│   ├── server.py       # FastAPI app, CORS config, /optimize endpoint
│   ├── optimizer.py    # QuantumPortfolioOptimizer class, QUBO builder, QAOA + scipy
│   ├── stock_data.py   # yfinance integration, returns and covariance calculation
│   └── pyproject.toml  # Python dependencies (managed by uv)
├── frontend/
│   └── src/
│       ├── App.jsx     # Main React component
│       └── index.css   # Tailwind CSS imports
├── vite.config.js      # Vite config with host binding
└── package.json        # npm dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv) for Python package management

### Backend

```bash
cd backend
uv run uvicorn server:app --reload
```

API available at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

App available at `http://localhost:5173`

---

## 📡 API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/optimize` | Run QAOA optimization for selected stocks and risk profile |

**Request body:**
```json
{
  "tickers": ["AAPL", "MSFT", "GOOGL"],
  "risk_tolerance": "balanced",
  "investment_amount": 10000
}
```

**Response:**
```json
{
  "allocations": { "AAPL": 0.45, "MSFT": 0.35, "GOOGL": 0.20 },
  "expected_return": 0.18,
  "volatility": 0.12,
  "sharpe_ratio": 1.08,
  "qaoa_energy": -3.42,
  "circuit_diagram": "..."
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.12, Uvicorn |
| Quantum | Qiskit, Qiskit-Aer, Qiskit-Algorithms, Qiskit-Optimization |
| Optimization | QAOA (quantum), scipy mean-variance (classical) |
| Market Data | yfinance (Yahoo Finance) |
| Package Management | uv (backend), npm (frontend) |

---

## 📊 Available Stocks

| Sector | Tickers |
|---|---|
| Tech Giants | AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA |
| Major Banks | JPM, GS, MS, BAC, WFC, C, BRK-B, V |

> Up to 9 stocks can be selected per optimization run due to quantum memory constraints (9 qubits max).

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
