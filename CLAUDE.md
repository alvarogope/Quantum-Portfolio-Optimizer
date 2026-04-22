# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Sensitive Files - DO NOT READ OR OUTPUT

Never read, display, or include contents from:
- `.env`, `.env.local`, `.env.*` — API keys and secrets
- `secrets.json`, `credentials.json` — credentials
- Any file containing API keys, passwords, or tokens

## Project Overview

Full-stack Quantum Portfolio Optimizer that uses QAOA to solve asset allocation as a QUBO problem.

| Layer | Tech | Status |
|-------|------|--------|
| Backend | FastAPI + Qiskit | In progress |
| Frontend | React + Vite | Not started |
| Quantum | QAOA via Qiskit | In progress |

## Commands

**Backend** (from `backend/`):

```bash
# Install dependencies
uv sync

# Run dev server (hot-reload)
uv run uvicorn server:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)
```

**Frontend** (from `frontend/` — not yet set up):

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Architecture
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│                     localhost:5173                           │
└─────────────────────────┬───────────────────────────────────┘
│ HTTP
┌─────────────────────────▼───────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│                    localhost:8000                            │
├─────────────────────────────────────────────────────────────┤
│  server.py          │  stock_data.py    │  optimizer.py     │
│  - CORS middleware  │  - yfinance       │  - QUBO builder   │
│  - API endpoints    │  - returns/cov    │  - QAOA solver    │
│  - Request routing  │  - sample stocks  │  - allocations    │
└─────────────────────────────────────────────────────────────┘

## File Descriptions

**`backend/server.py`** — FastAPI app with CORS for React frontend. Currently has `/` and `/health` endpoints. Optimization endpoints still needed.

**`backend/stock_data.py`** — Fetches historical prices via yfinance, computes annualized returns (252-day) and covariance matrix. `get_sample_stocks()` returns 10 default tickers.

**`backend/optimizer.py`** — `QuantumPortfolioOptimizer` converts portfolio selection into QUBO, solves with Qiskit's QAOA + COBYLA optimizer. Returns `OptimizationResult` dataclass.

## Key Constraints

- **Grid size limit**: 9 qubits max (9 stocks) due to statevector simulation memory limits
- **Risk factor**: 0.0 = maximize return only, 1.0 = minimize risk only, 0.5 = balanced

## What's Left to Build

1. Backend: `/optimize` endpoint wiring stock_data → optimizer
2. Backend: `/stocks` endpoint to return available stocks
3. Frontend: React + Vite setup
4. Frontend: Stock selection UI
5. Frontend: Allocation pie chart visualization
6. Frontend: Risk/return controls