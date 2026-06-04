'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'

interface Trade {
  setup: string
  result_percent: number
}

interface SetupProfitabilityChartProps {
  trades: Trade[]
}

export default function SetupProfitabilityChart({
  trades,
}: SetupProfitabilityChartProps) {
  const chartData = useMemo(() => {
    if (!trades || trades.length === 0) return []

    const setupProfit: Record<string, number> = {}

    trades.forEach((trade) => {
      const setup = trade.setup?.trim() || 'Unknown'

      if (!setupProfit[setup]) {
        setupProfit[setup] = 0
      }

      setupProfit[setup] += Number(trade.result_percent || 0)
    })

    return Object.entries(setupProfit)
      .map(([setup, profit]) => ({
        setup,
        profit: Number(profit.toFixed(2)),
      }))
      .sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit))
      .slice(0, 8)
  }, [trades])

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No trading data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{
          top: 0,
          right: 8,
          left: -10,
          bottom: 0,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          opacity={0.15}
          horizontal={false}
        />

        <XAxis
          type="number"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${Math.round(Number(value))}%`}
        />

        <YAxis
          type="category"
          dataKey="setup"
          width={95}
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: string) =>
            value.length > 15
              ? `${value.slice(0, 15)}...`
              : value
          }
        />

        <ReferenceLine
          x={0}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />

        <Tooltip
          cursor={{
            fill: 'hsl(var(--muted) / 0.15)',
          }}
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
          formatter={(value: number) => [
            `${value.toFixed(2)}%`,
            'Profit',
          ]}
        />

        <Bar
          dataKey="profit"
          barSize={28}
          radius={[6, 6, 6, 6]}
        >
          {chartData.map((entry) => (
            <Cell
              key={`cell-${entry.setup}`}
              fill={
                entry.profit >= 0
                  ? '#22c55e'
                  : '#ef4444'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}