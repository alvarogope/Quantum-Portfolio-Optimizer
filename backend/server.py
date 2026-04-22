from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np

from stock_data import fetch_stock_data, get_sample_stocks
from optimizer import QuantumPortfolioOptimizer
from qiskit.circuit.library import QAOAAnsatz
from qiskit_optimization.converters import QuadraticProgramToQubo

app = FastAPI(title="Quantum Portfolio Optimizer")

# CORS must be first
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OptimizeRequest(BaseModel):
    symbols: List[str]
    risk_factor: float = 0.5


@app.get("/")
def root():
    return {"status": "Quantum Portfolio Optimizer API running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/stocks")
def stocks():
    return {"stocks": get_sample_stocks()}


@app.post("/optimize")
def optimize(request: OptimizeRequest):
    if len(request.symbols) < 2:
        raise HTTPException(status_code=400, detail="Select at least 2 stocks")

    if len(request.symbols) > 9:
        raise HTTPException(status_code=400, detail="Maximum 9 stocks (qubit limit)")

    data = fetch_stock_data(request.symbols)

    if not data["success"]:
        raise HTTPException(status_code=500, detail=data.get("error", "Failed to fetch stock data"))

    opt = QuantumPortfolioOptimizer(
        returns=np.array(data["expected_returns"]),
        covariance=np.array(data["covariance"]),
        symbols=request.symbols,
        num_assets=len(request.symbols),
        risk_factor=request.risk_factor
    )

    result = opt.optimize()

    try:
        from qiskit_optimization import QuadraticProgram
        qp = QuadraticProgram("portfolio")
        for sym in request.symbols:
            qp.binary_var(sym)
        qubo_converter = QuadraticProgramToQubo()
        qubo = qubo_converter.convert(qp)
        operator, _ = qubo.to_ising()
        circuit = QAOAAnsatz(operator, reps=1)
        circuit_drawing = circuit.draw(outpu='text').single_string()
    except:
        circuit_drawing = None

    return {
        "allocations": result.allocations,
        "expected_return": result.expected_return,
        "risk": result.risk,
        "energy": result.energy,
        "sharpe_ratio": result.sharpe_ratio,
        "current_prices": data["current_prices"]
    }