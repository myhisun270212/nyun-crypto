interface Trade {
  trade_date: string
  pair: string
  setup: string
  result_percent: number
  result_usdt: number
  rr: number
}

interface SetupPerformanceData {
  wins: number
  total: number
  profit: number
}

interface PairPerformanceData {
  wins: number
  total: number
  profit: number
}

interface AnalyticsResult {
  total_trades: number
  win_rate: number
  profit_percent: number
  profit_usdt: number
  average_rr: number
  profit_factor: number
  best_setup: string
  worst_setup: string
  best_pair: string
  worst_pair: string
  setupPerformance: Record<string, SetupPerformanceData>
  pairPerformance: Record<string, PairPerformanceData>
}

export function calculateAnalytics(trades: Trade[]): AnalyticsResult {
  if (!trades || trades.length === 0) {
    return {
      total_trades: 0,
      win_rate: 0,
      profit_percent: 0,
      profit_usdt: 0,
      average_rr: 0,
      profit_factor: 0,
      best_setup: 'N/A',
      worst_setup: 'N/A',
      best_pair: 'N/A',
      worst_pair: 'N/A',
      setupPerformance: {},
      pairPerformance: {},
    }
  }

  // Single-pass loop to calculate all metrics
  let totalTrades = 0
  let wins = 0
  let totalProfitPercent = 0
  let totalProfitUsdt = 0
  let totalRR = 0
  let grossProfit = 0
  let grossLoss = 0

  const setupPerf: Record<string, SetupPerformanceData> = {}
  const pairPerf: Record<string, PairPerformanceData> = {}

  for (const trade of trades) {
    const resultPercent = Number(trade.result_percent || 0)
    const resultUsdt = Number(trade.result_usdt || 0)
    const rr = Number(trade.rr || 0)
    const setup = trade.setup?.trim() || 'Unknown'
    const pair = trade.pair?.trim() || 'Unknown'

    totalTrades++
    totalProfitPercent += resultPercent
    totalProfitUsdt += resultUsdt
    totalRR += rr

    if (resultPercent > 0) {
      wins++
      grossProfit += resultUsdt
    } else {
      grossLoss += Math.abs(resultUsdt)
    }

    // Setup performance
    if (!setupPerf[setup]) {
      setupPerf[setup] = { wins: 0, total: 0, profit: 0 }
    }
    setupPerf[setup].total++
    if (resultPercent > 0) setupPerf[setup].wins++
    setupPerf[setup].profit += resultUsdt

    // Pair performance
    if (!pairPerf[pair]) {
      pairPerf[pair] = { wins: 0, total: 0, profit: 0 }
    }
    pairPerf[pair].total++
    if (resultPercent > 0) pairPerf[pair].wins++
    pairPerf[pair].profit += resultUsdt
  }

  // Safe division guards
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
  const averageRR = totalTrades > 0 ? totalRR / totalTrades : 0
  const profitFactor = grossLoss === 0 ? (grossProfit === 0 ? 0 : grossProfit) : grossProfit / grossLoss

  // Calculate best/worst setup (minimum 1 trade)
  let bestSetup = 'N/A'
  let worstSetup = 'N/A'
  let bestSetupWinRate = -1
  let worstSetupWinRate = 101

  Object.entries(setupPerf).forEach(([setup, data]) => {
    if (data.total >= 1) {
      const currentWinRate = (data.wins / data.total) * 100
      if (currentWinRate > bestSetupWinRate) {
        bestSetupWinRate = currentWinRate
        bestSetup = setup
      }
      if (currentWinRate < worstSetupWinRate) {
        worstSetupWinRate = currentWinRate
        worstSetup = setup
      }
    }
  })

  // Calculate best/worst pair (minimum 1 trade)
  let bestPair = 'N/A'
  let worstPair = 'N/A'
  let bestPairWinRate = -1
  let worstPairWinRate = 101

  Object.entries(pairPerf).forEach(([pair, data]) => {
    if (data.total >= 1) {
      const currentWinRate = (data.wins / data.total) * 100
      if (currentWinRate > bestPairWinRate) {
        bestPairWinRate = currentWinRate
        bestPair = pair
      }
      if (currentWinRate < worstPairWinRate) {
        worstPairWinRate = currentWinRate
        worstPair = pair
      }
    }
  })

  // Limit chart data size (top 10 pairs only)
  const limitedPairPerf: Record<string, PairPerformanceData> = {}
  const sortedPairs = Object.entries(pairPerf)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
  sortedPairs.forEach(([pair, data]) => {
    limitedPairPerf[pair] = data
  })

  return {
    total_trades: totalTrades,
    win_rate: Math.round(winRate * 100) / 100,
    profit_percent: Math.round(totalProfitPercent * 100) / 100,
    profit_usdt: Math.round(totalProfitUsdt * 100) / 100,
    average_rr: Math.round(averageRR * 100) / 100,
    profit_factor: Math.round(profitFactor * 100) / 100,
    best_setup: bestSetup,
    worst_setup: worstSetup,
    best_pair: bestPair,
    worst_pair: worstPair,
    setupPerformance: setupPerf,
    pairPerformance: limitedPairPerf,
  }
}
