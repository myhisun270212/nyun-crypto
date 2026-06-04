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
  trade_date: string
  result_percent: number
}

interface MonthlyPerformanceChartProps {
  trades: Trade[]
}

export default function MonthlyPerformanceChart({
  trades,
}: MonthlyPerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!trades || trades.length === 0) {
      return []
    }

    const monthlyData = new Map<
      string,
      {
        profit: number
        timestamp: number
      }
    >()

    trades.forEach((trade) => {
      const date = new Date(trade.trade_date)

      if (isNaN(date.getTime())) return

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`

      const label = date.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      })

      if (!monthlyData.has(key)) {
        monthlyData.set(key, {
          profit: 0,
          timestamp: new Date(
            date.getFullYear(),
            date.getMonth(),
            1
          ).getTime(),
        })
      }

      const current = monthlyData.get(key)!

      current.profit += Number(trade.result_percent || 0)

      monthlyData.set(key, current)
    })

    return Array.from(monthlyData.entries())
      .map(([key, data]) => ({
        key,
        month: new Date(data.timestamp).toLocaleDateString(
          'en-US',
          {
            month: 'short',
            year: '2-digit',
          }
        ),
        profit: Number(data.profit.toFixed(2)),
        timestamp: data.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-12)
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
        margin={{
          top: 5,
          right: 5,
          left: -15,
          bottom: 0,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          opacity={0.15}
          vertical={false}
        />

        <ReferenceLine
          y={0}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />

        <XAxis
          dataKey="month"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) =>
            `${Math.round(Number(value))}%`
          }
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
            'Monthly Profit',
          ]}
        />

        <Bar
          dataKey="profit"
          radius={[6, 6, 0, 0]}
          maxBarSize={50}
        >
          {chartData.map((entry) => (
            <Cell
              key={`cell-${entry.month}`}
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