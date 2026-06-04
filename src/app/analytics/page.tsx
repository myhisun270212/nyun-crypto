'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import SetupPerformanceChart from '@/components/charts/SetupPerformanceChart'
import SetupProfitabilityChart from '@/components/charts/SetupProfitabilityChart'
import PairPerformanceChart from '@/components/charts/PairPerformanceChart'
import PairDistributionChart from '@/components/charts/PairDistributionChart'
import { calculateAnalytics } from '@/lib/utils/calculateAnalytics'

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pair, setPair] = useState('all')
  const [setup, setSetup] = useState('all')
  const [analytics, setAnalytics] = useState({
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
  })
  const [setupPerformance, setSetupPerformance] = useState<Record<string, { wins: number; total: number; profit: number }>>({})
  const [pairPerformance, setPairPerformance] = useState<Record<string, { wins: number; total: number; profit: number }>>({})
  const [filteredTrades, setFilteredTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    handleQuickDate(30)
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [startDate, endDate, pair, setup])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)

      if (startDate) {
        query = query.gte('trade_date', startDate)
      }

      if (endDate) {
        query = query.lte('trade_date', endDate)
      }

      const { data: trades } = await query

      if (!trades || trades.length === 0) {
        setAnalytics({
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
        })
        setSetupPerformance({})
        setPairPerformance({})
        setFilteredTrades([])
        setLoading(false)
        return
      }

      const filteredTrades = trades.filter((t: any) => {
        if (pair !== 'all' && t.pair !== pair) return false
        if (setup !== 'all' && t.setup !== setup) return false
        return true
      })

      setFilteredTrades(filteredTrades)

      // Use helper function for analytics calculation
      const analyticsResult = calculateAnalytics(filteredTrades)

      setAnalytics({
        total_trades: analyticsResult.total_trades,
        win_rate: analyticsResult.win_rate,
        profit_percent: analyticsResult.profit_percent,
        profit_usdt: analyticsResult.profit_usdt,
        average_rr: analyticsResult.average_rr,
        profit_factor: analyticsResult.profit_factor,
        best_setup: analyticsResult.best_setup,
        worst_setup: analyticsResult.worst_setup,
        best_pair: analyticsResult.best_pair,
        worst_pair: analyticsResult.worst_pair,
      })

      setSetupPerformance(analyticsResult.setupPerformance)
      setPairPerformance(analyticsResult.pairPerformance)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDate = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  const handleThisMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(now.toISOString().split('T')[0])
  }

  const handleLastMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  const handleAllTime = () => {
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-sm md:text-base text-muted-foreground">Deep dive into your trading performance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickDate(7)}>
                Last 7 days
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickDate(30)}>
                Last 30 days
              </Button>
              <Button variant="outline" size="sm" onClick={handleThisMonth}>
                This month
              </Button>
              <Button variant="outline" size="sm" onClick={handleLastMonth}>
                Last month
              </Button>
              <Button variant="outline" size="sm" onClick={handleAllTime}>
                All time
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pair">Pair</Label>
                <Select value={pair} onValueChange={setPair}>
                  <SelectTrigger>
                    <SelectValue placeholder="All pairs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All pairs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setup">Setup</Label>
                <Select value={setup} onValueChange={setSetup}>
                  <SelectTrigger>
                    <SelectValue placeholder="All setups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All setups</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="endDate" 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
            
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-1 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm text-muted-foreground">
              Best Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-lg md:text-2xl font-bold text-green-500 truncate">
              {analytics.best_setup}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm text-muted-foreground">
              Worst Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-lg md:text-2xl font-bold text-red-500 truncate">
              {analytics.worst_setup}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm text-muted-foreground">
              Best Pair
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-lg md:text-2xl font-bold text-green-500 truncate">
              {analytics.best_pair}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm text-muted-foreground">
              Worst Pair
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-lg md:text-2xl font-bold text-red-500 truncate">
              {analytics.worst_pair}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm md:text-base">
              Setup Win Rate
            </CardTitle>
          </CardHeader>

          <CardContent className="h-[380px] p-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Loading...
              </div>
            ) : (
              <SetupPerformanceChart setupPerformance={setupPerformance} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm md:text-base">
              Setup Profitability
            </CardTitle>
          </CardHeader>

          <CardContent className="h-[380px] p-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Loading...
              </div>
            ) : (
              <SetupProfitabilityChart trades={filteredTrades} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm md:text-base">
              Pair Performance
            </CardTitle>
          </CardHeader>

          <CardContent className="h-[380px] p-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Loading...
              </div>
            ) : (
              <PairPerformanceChart pairPerformance={pairPerformance} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm md:text-base">
              Trade Distribution By Pair
            </CardTitle>
          </CardHeader>

          <CardContent className="h-[420px] p-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Loading...
              </div>
            ) : (
              <PairDistributionChart trades={filteredTrades} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
