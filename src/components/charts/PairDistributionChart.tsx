'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface Trade {
  pair: string
}

interface PairDistributionChartProps {
  trades: Trade[]
}

const COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#ec4899',
  '#6366f1',
]

export default function PairDistributionChart({
  trades,
}: PairDistributionChartProps) {
  const chartData = useMemo(() => {
    if (!trades || trades.length === 0) {
      return []
    }

    const pairCount: Record<string, number> = {}

    trades.forEach((trade) => {
      const pair = trade.pair?.trim() || 'Unknown'

      if (!pairCount[pair]) {
        pairCount[pair] = 0
      }

      pairCount[pair]++
    })

    const totalTrades = trades.length

    return Object.entries(pairCount)
      .map(([pair, count]) => ({
        pair,
        count,
        percentage: Number(
          ((count / totalTrades) * 100).toFixed(1)
        ),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [trades])

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No trading data available
      </div>
    )
  }

  const totalTrades = trades.length

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="pair"
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={120}
            paddingAngle={2}
            stroke="transparent"
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '12px',
            }}
            labelStyle={{
              color: 'hsl(var(--foreground))',
              fontWeight: 600,
            }}
            itemStyle={{
              color: 'hsl(var(--foreground))',
            }}
            formatter={(value: number, _name, props) => [
              `${value} Trades (${props.payload.percentage}%)`,
              props.payload.pair,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
          Total
        </span>

        <span className="text-2xl md:text-3xl font-bold">
          {totalTrades}
        </span>

        <span className="text-[10px] text-muted-foreground">
          Trades
        </span>
      </div>
    </div>
  )
}