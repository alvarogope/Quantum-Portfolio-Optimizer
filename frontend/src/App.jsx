import { useState } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const API_URL = 'http://127.0.0.1:8000'

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'JPM', name: 'JPMorgan' },
  { symbol: 'GS', name: 'Goldman Sachs' },
  { symbol: 'MS', name: 'Morgan Stanley' },
  { symbol: 'BAC', name: 'Bank of America' },
  { symbol: 'C', name: 'Citigroup' },
  { symbol: 'HSBC', name: 'HSBC' },
  { symbol: 'BCS', name: 'Barclays' },
  { symbol: 'V', name: 'Visa' },
]

const COLORS = ['#fff', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b']

function App() {
  const [selected, setSelected] = useState([])
  const [riskFactor, setRiskFactor] = useState(0.5)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleStock = (symbol) => {
    setSelected(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(s => s !== symbol)
      }
      if (prev.length >= 9) {
        showToast('Maximum 9 stocks allowed', 'error')
        return prev
      }
      return [...prev, symbol]
    })
  }

  const optimize = async () => {
    if (selected.length < 2) {
      showToast('Select at least 2 stocks', 'error')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${API_URL}/optimize`, {
        symbols: selected,
        risk_factor: riskFactor
      })
      setResult(response.data)
      showToast('Optimization complete!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Optimization failed')
      showToast('Optimization failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && selected.length >= 2 && !loading) {
      optimize()
    }
  }

  const chartData = result
    ? Object.entries(result.allocations)
        .filter(([_, weight]) => weight > 0)
        .map(([symbol, weight]) => ({
          name: symbol,
          value: Math.round(weight * 100)
        }))
    : []

  const getRiskLabel = () => {
    if (riskFactor < 0.3) return 'Aggressive'
    if (riskFactor > 0.7) return 'Conservative'
    return 'Balanced'
  }

  return (
    <div
      className="min-h-screen bg-[#0a0a0f] text-white antialiased outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Toast */}
      <div className={`fixed top-6 right-6 z-50 transition-all duration-500 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className={`px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm ${
          toast?.type === 'error'
            ? 'bg-red-500/90 text-white'
            : 'bg-white text-black'
        }`}>
          <div className="flex items-center gap-3">
            {toast?.type === 'error' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="font-medium">{toast?.message}</span>
          </div>
        </div>
      </div>

      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚛️</span>
              <span className="text-lg font-medium tracking-tight">Quantum Portfolio</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="px-2 py-1 rounded bg-white/5 border border-white/5">QAOA</span>
              <span className="px-2 py-1 rounded bg-white/5 border border-white/5">Qiskit</span>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-semibold tracking-tight mb-4">
              Quantum Portfolio Optimizer
            </h1>
            <p className="text-lg text-white/40 max-w-xl mx-auto">
              Leverage quantum computing to find optimal asset allocation using QAOA algorithm
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Panel */}
            <div className="lg:col-span-3 space-y-6">
              {/* Stock Selection */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Select Assets</h2>
                    <div className="group relative">
                      <svg className="w-4 h-4 text-white/30 hover:text-white/60 cursor-help transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Select 2-9 assets for optimization
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-white/40">{selected.length} of 9</span>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {STOCKS.map(stock => (
                    <button
                      key={stock.symbol}
                      onClick={() => toggleStock(stock.symbol)}
                      className={`group relative p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        selected.includes(stock.symbol)
                          ? 'bg-white/10 ring-1 ring-white/20'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] ring-1 ring-white/[0.06]'
                      }`}
                    >
                      <p className="text-sm font-semibold">{stock.symbol}</p>
                      <p className="text-xs text-white/40 mt-0.5 truncate">{stock.name}</p>
                      {selected.includes(stock.symbol) && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Control */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/40">Risk Level</span>
                    <div className="group relative">
                      <svg className="w-4 h-4 text-white/30 hover:text-white/60 cursor-help transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Higher risk = potential for higher returns
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/5">{getRiskLabel()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={riskFactor}
                  onChange={e => setRiskFactor(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
                <div className="flex justify-between mt-2 text-xs text-white/30">
                  <span>High Risk</span>
                  <span>Low Risk</span>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={optimize}
                disabled={loading || selected.length < 2}
                className={`w-full py-4 rounded-xl text-base font-medium transition-all duration-200 ${
                  loading || selected.length < 2
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-white/90 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running Quantum Optimization...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Run Optimization
                    <kbd className="text-xs px-1.5 py-0.5 rounded bg-black/10 text-black/40">↵</kbd>
                  </span>
                )}
              </button>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Results</h2>
                  {result && (
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Optimized
                    </div>
                  )}
                </div>

                {result ? (
                  <div className="space-y-6">
                    {/* Chart */}
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={4}
                            strokeWidth={0}
                          >
                            {chartData.map((_, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#18181b',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            formatter={(value) => [`${value}%`]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Allocation Pills */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {chartData.map((item, index) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-transform hover:scale-105"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm text-white/40">{item.value}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Metrics */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/40">Expected Return</span>
                          <div className="relative">
                            <svg className="w-3.5 h-3.5 text-white/30 hover:text-white/60 cursor-help transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              Projected annual return based on historical data
                            </div>
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-emerald-400">
                          +{(result.expected_return * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/40">Volatility</span>
                          <div className="relative">
                            <svg className="w-3.5 h-3.5 text-white/30 hover:text-white/60 cursor-help transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              Standard deviation of returns (risk measure)
                            </div>
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-amber-400">
                          {(result.risk * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/40">QAOA Energy</span>
                          <div className="relative">
                            <svg className="w-3.5 h-3.5 text-white/30 hover:text-white/60 cursor-help transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              Lower energy = better optimization solution
                            </div>
                          </div>
                        </div>
                        <span className="text-base font-mono text-white/60">
                          {result.energy.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-72 flex flex-col items-center justify-center text-white/20">
                    {loading ? (
                      <>
                        <div className="space-y-3 w-full max-w-[200px]">
                          <div className="h-32 rounded-full bg-white/5 animate-pulse mx-auto w-32" />
                          <div className="h-4 rounded bg-white/5 animate-pulse" />
                          <div className="h-4 rounded bg-white/5 animate-pulse w-3/4 mx-auto" />
                        </div>
                      </>
                    ) : (
                      <>
                        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-sm">Run optimization to see results</p>
                        <p className="text-xs text-white/10 mt-1">Press Enter or click button</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-white/30">
            <span>Built with Qiskit + QAOA</span>
            <span>Quantum Portfolio Optimizer</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App