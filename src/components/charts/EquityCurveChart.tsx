'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface Trade {
  trade_date: string
  result_percent: number
}

interface EquityCurveChartProps {
  trades: Trade[]
}

export default function EquityCurveChart({
  trades,
}: EquityCurveChartProps) {
  const chartData = useMemo(() => {
    if (!trades || trades.length === 0) {
      return []
    }

    const sortedTrades = [...trades].sort(
      (a, b) =>
        new Date(a.trade_date).getTime() -
        new Date(b.trade_date).getTime()
    )

    let cumulativeEquity = 0

    return sortedTrades.map((trade, index) => {
      cumulativeEquity += Number(trade.result_percent || 0)

      return {
        trade: index + 1,
        date: new Date(trade.trade_date).toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
          }
        ),
        equity: Number(cumulativeEquity.toFixed(2)),
      }
    })
  }, [trades])

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No trading data available
      </div>
    )
  }

  const finalEquity =
    chartData[chartData.length - 1]?.equity ?? 0

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
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
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
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
              stroke: 'hsl(var(--primary))',
              strokeWidth: 1,
              strokeDasharray: '4 4',
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
              'Equity',
            ]}
          />

          <Line
            type="monotone"
            dataKey="equity"
            stroke={
              finalEquity >= 0
                ? '#22c55e'
                : '#ef4444'
            }
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 5,
              strokeWidth: 2,
              fill:
                finalEquity >= 0
                  ? '#22c55e'
                  : '#ef4444',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}