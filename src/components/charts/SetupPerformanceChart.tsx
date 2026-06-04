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
} from 'recharts'

interface SetupPerformanceData {
  wins: number
  total: number
  profit: number
}

interface SetupPerformanceChartProps {
  setupPerformance: Record<string, SetupPerformanceData>
}

export default function SetupPerformanceChart({
  setupPerformance,
}: SetupPerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!setupPerformance || Object.keys(setupPerformance).length === 0) {
      return []
    }

    return Object.entries(setupPerformance)
      .map(([setup, data]) => ({
        setup,
        winRate:
          data.total >= 1
            ? Number(((data.wins / data.total) * 100).toFixed(1))
            : 0,
        total: data.total,
      }))
      .filter((item) => item.total >= 1)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 8)
  }, [setupPerformance])

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
          domain={[0, 100]}
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
            `${value.toFixed(1)}% (${props.payload.total} trades)`,
            'Win Rate',
          ]}
        />

        <Bar
          dataKey="winRate"
          barSize={28}
          radius={[6, 6, 6, 6]}
        >
          {chartData.map((entry) => (
            <Cell
              key={`cell-${entry.setup}`}
              fill={
                entry.winRate >= 60
                  ? '#22c55e'
                  : entry.winRate >= 40
                    ? '#f59e0b'
                    : '#ef4444'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}