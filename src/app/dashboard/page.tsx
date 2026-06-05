'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, TrendingUp, TrendingDown, Target, Wallet, Percent } from 'lucide-react'
import EquityCurveChart from '@/components/charts/EquityCurveChart'
import MonthlyPerformanceChart from '@/components/charts/MonthlyPerformanceChart'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState({
    total_trades: 0,
    total_wins: 0,
    total_losses: 0,
    win_rate: 0,
    total_profit_percent: 0,
    total_profit_usdt: 0,
    average_rr: 0,
    profit_factor: 0,
  })
  const [accountSettings, setAccountSettings] = useState<{ starting_balance: number }>({ starting_balance: 0 })
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchAccountSettings()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: tradesData } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)

      if (!tradesData || tradesData.length === 0) {
        setStats({
          total_trades: 0,
          total_wins: 0,
          total_losses: 0,
          win_rate: 0,
          total_profit_percent: 0,
          total_profit_usdt: 0,
          average_rr: 0,
          profit_factor: 0,
        })
        setTrades([])
        setLoading(false)
        return
      }

      const totalTrades = tradesData.length
      const wins = tradesData.filter(t => t.result_percent > 0).length
      const losses = tradesData.filter(t => t.result_percent < 0).length
      const winRate = (wins / totalTrades) * 100
      const totalProfitPercent = tradesData.reduce((sum, t) => sum + Number(t.result_percent), 0)
      const totalProfitUsdt = tradesData.reduce((sum, t) => sum + Number(t.result_usdt), 0)
      const averageRr = tradesData.reduce((sum, t) => sum + Number(t.rr), 0) / totalTrades

      const grossProfit = tradesData
        .filter(t => t.result_percent > 0)
        .reduce((sum, t) => sum + Number(t.result_usdt), 0)
      const grossLoss = Math.abs(
        tradesData
          .filter(t => t.result_percent < 0)
          .reduce((sum, t) => sum + Number(t.result_usdt), 0)
      )
      const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss

      setStats({
        total_trades: totalTrades,
        total_wins: wins,
        total_losses: losses,
        win_rate: Math.round(winRate * 100) / 100,
        total_profit_percent: Math.round(totalProfitPercent * 100) / 100,
        total_profit_usdt: Math.round(totalProfitUsdt * 100) / 100,
        average_rr: Math.round(averageRr * 100) / 100,
        profit_factor: Math.round(profitFactor * 100) / 100,
      })
      setTrades(tradesData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAccountSettings = async () => {
    try {
      const response = await fetch('/api/account-settings')
      if (!response.ok) throw new Error('Failed to fetch account settings')
      const data = await response.json()
      setAccountSettings(data)
    } catch (error) {
      console.error('Error fetching account settings:', error)
    }
  }

  // Calculate account growth metrics
  const startingBalance = accountSettings.starting_balance || 0
  const saldoAkhir = startingBalance > 0 ? startingBalance + stats.total_profit_usdt : 0
  const growthPersen = startingBalance > 0 ? (stats.total_profit_usdt / startingBalance) * 100 : 0

  const statCards = [
    {
      title: 'Saldo Akhir',
      value: `$${saldoAkhir.toFixed(2)}`,
      icon: Wallet,
      color: saldoAkhir >= startingBalance ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'Growth %',
      value: `${growthPersen >= 0 ? '+' : ''}${growthPersen.toFixed(2)}%`,
      icon: Percent,
      color: growthPersen >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'Total Trades',
      value: stats.total_trades,
      icon: BookOpen,
      color: 'text-blue-500',
    },
    {
      title: 'Total Wins',
      value: stats.total_wins,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Total Losses',
      value: stats.total_losses,
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      title: 'Win Rate',
      value: `${stats.win_rate}%`,
      icon: Target,
      color: 'text-purple-500',
    },
    {
      title: 'Total Profit %',
      value: `${stats.total_profit_percent}%`,
      icon: TrendingUp,
      color: stats.total_profit_percent >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'Total Profit USDT',
      value: `$${stats.total_profit_usdt}`,
      icon: TrendingUp,
      color: stats.total_profit_usdt >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'Average RR',
      value: stats.average_rr.toFixed(2),
      icon: Target,
      color: 'text-yellow-500',
    },
    {
      title: 'Profit Factor',
      value: stats.profit_factor.toFixed(2),
      icon: TrendingUp,
      color: stats.profit_factor >= 1 ? 'text-green-500' : 'text-red-500',
    },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Overview of your trading performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Equity Curve</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] md:h-[400px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Loading...
              </div>
            ) : (
              <EquityCurveChart trades={trades} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[240px] md:h-[320px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Loading...
              </div>
            ) : (
              <MonthlyPerformanceChart trades={trades} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
