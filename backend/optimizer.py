"""
Quantum Portfolio Optimizer using QAOA
"""

import numpy as np
from dataclasses import dataclass
from typing import List
from scipy.optimize import minimize

from qiskit_optimization import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit_algorithms import QAOA
from qiskit_algorithms.optimizers import COBYLA
from qiskit.primitives import StatevectorSampler


@dataclass
class OptimizationResult:
    allocations: dict
    expected_return: float
    risk: float
    energy: float
    sharpe_ratio: float


class QuantumPortfolioOptimizer:
    def __init__(
        self,
        returns: np.ndarray,
        covariance: np.ndarray,
        symbols: List[str],
        num_assets: int = 3,
        risk_factor: float = 0.5,
        qaoa_reps: int = 1
    ):
        self.returns = returns
        self.covariance = covariance
        self.symbols = symbols
        self.num_assets = num_assets
        self.risk_factor = risk_factor
        self.qaoa_reps = qaoa_reps
        self.n = len(symbols)

    def _build_qubo(self) -> QuadraticProgram:
        qp = QuadraticProgram("portfolio")

        for symbol in self.symbols:
            qp.binary_var(symbol)

        linear = {}
        for i, symbol in enumerate(self.symbols):
            linear[symbol] = -(1 - self.risk_factor) * self.returns[i]

        quadratic = {}
        for i in range(self.n):
            for j in range(i, self.n):
                if i == j:
                    linear[self.symbols[i]] += self.risk_factor * self.covariance[i, j]
                else:
                    key = (self.symbols[i], self.symbols[j])
                    quadratic[key] = 2 * self.risk_factor * self.covariance[i, j]

        penalty = 10.0
        for i, sym_i in enumerate(self.symbols):
            linear[sym_i] += penalty * (1 - 2 * self.num_assets)
            for j, sym_j in enumerate(self.symbols):
                if i < j:
                    key = (sym_i, sym_j)
                    quadratic[key] = quadratic.get(key, 0) + 2 * penalty

        qp.minimize(linear=linear, quadratic=quadratic)
        return qp

    def optimize(self) -> OptimizationResult:
        qp = self._build_qubo()

        sampler = StatevectorSampler()
        optimizer = COBYLA(maxiter=100)
        qaoa = QAOA(sampler=sampler, optimizer=optimizer, reps=self.qaoa_reps)

        solver = MinimumEigenOptimizer(qaoa)
        result = solver.solve(qp)

        selected = [sym for sym in self.symbols if result.variables_dict[sym] > 0.5]

        if not selected:
            selected = self.symbols[:1]

        sel_idx = [self.symbols.index(s) for s in selected]
        sel_returns = self.returns[sel_idx]
        sel_cov = self.covariance[np.ix_(sel_idx, sel_idx)]
        n_sel = len(selected)

        def objective(w):
            port_risk = float(np.sqrt(w @ sel_cov @ w))
            port_return = float(w @ sel_returns)
            return self.risk_factor * port_risk - (1 - self.risk_factor) * port_return

        mvo = minimize(
            objective,
            x0=np.ones(n_sel) / n_sel,
            method="SLSQP",
            bounds=[(0.0, 1.0)] * n_sel,
            constraints={"type": "eq", "fun": lambda w: w.sum() - 1},
        )

        opt_weights = mvo.x if mvo.success else np.ones(n_sel) / n_sel
        allocations = {sym: 0.0 for sym in self.symbols}
        for sym, w in zip(selected, opt_weights):
            allocations[sym] = float(w)

        weights = np.array([allocations[sym] for sym in self.symbols])
        expected_return = float(np.dot(weights, self.returns))
        risk = float(np.sqrt(np.dot(weights.T, np.dot(self.covariance, weights))))

        # Sharpe Ratio (assuming 5% risk-free rate)
        risk_free_rate = 0.05
        sharpe_ratio = (expected_return - risk_free_rate) / risk if risk > 0 else 0

        return OptimizationResult(
            allocations=allocations,
            expected_return=expected_return,
            risk=risk,
            energy=result.fval,
            sharpe_ratio=sharpe_ratio
        )