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

interface PairPerformanceData {
  wins: number
  total: number
  profit: number
}

interface PairPerformanceChartProps {
  pairPerformance: Record<string, PairPerformanceData>
}

export default function PairPerformanceChart({
  pairPerformance,
}: PairPerformanceChartProps) {
  const chartData = useMemo(() => {
    if (
      !pairPerformance ||
      Object.keys(pairPerformance).length === 0
    ) {
      return []
    }

    return Object.entries(pairPerformance)
      .map(([pair, data]) => ({
        pair,
        profit: Number(data.profit.toFixed(2)),
        total: data.total,
        wins: data.wins,
        winRate:
          data.total > 0
            ? Number(((data.wins / data.total) * 100).toFixed(1))
            : 0,
      }))
      .filter((item) => item.total >= 1)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10)
  }, [pairPerformance])

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
          tickFormatter={(value) =>
            `$${Math.round(Number(value))}`
          }
        />

        <YAxis
          type="category"
          dataKey="pair"
          width={70}
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
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
          formatter={(value: number, _name, props) => [
            `$${value.toFixed(2)}`,
            `Profit | ${props.payload.total} Trades | ${props.payload.winRate}% WR`,
          ]}
        />

        <Bar
          dataKey="profit"
          barSize={28}
          radius={[6, 6, 6, 6]}
        >
          {chartData.map((entry) => (
            <Cell
              key={`cell-${entry.pair}`}
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