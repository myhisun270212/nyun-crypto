'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ViewTradePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [trade, setTrade] = useState<any>(null)

  useEffect(() => {
    fetchTrade()
  }, [params.id])

  const fetchTrade = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: tradeData, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (error || !tradeData) {
        router.push('/trades')
        return
      }

      setTrade(tradeData)
    } catch (error) {
      console.error('Error fetching trade:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trade?')) return

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', params.id)
        .eq('user_id', user.id)

      if (error) throw error

      router.push('/trades')
    } catch (error) {
      console.error('Error deleting trade:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!trade) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Trade not found</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/trades')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Trade Details</h1>
            <p className="text-sm md:text-base text-muted-foreground">View your trade information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/trades/${trade.id}/edit`}>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete} className="flex-1 sm:flex-none">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{new Date(trade.trade_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pair:</span>
              <span className="font-medium">{trade.pair}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Direction:</span>
              <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                trade.direction === 'Long' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {trade.direction}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Setup:</span>
              <span className="font-medium">{trade.setup}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Market Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">BTC Context:</span>
              <span className="font-medium">{trade.btc_context}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">OI Condition:</span>
              <span className="font-medium">{trade.oi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Funding:</span>
              <span className="font-medium">{trade.funding}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trigger:</span>
              <span className="font-medium">{trade.trigger}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Trade Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Margin:</span>
              <span className="font-medium">${trade.margin} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leverage:</span>
              <span className="font-medium">{trade.leverage}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk/Reward:</span>
              <span className="font-medium">{trade.rr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk %:</span>
              <span className="font-medium">{trade.risk_percent}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Result %:</span>
              <span className={`font-medium ${Number(trade.result_percent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Number(trade.result_percent) >= 0 ? '+' : ''}{trade.result_percent}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Result USDT:</span>
              <span className={`font-medium ${Number(trade.result_usdt) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${Number(trade.result_usdt) >= 0 ? '+' : ''}{trade.result_usdt}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan Followed:</span>
              <span className="font-medium">{trade.plan_followed ? <span className="text-green-500">✓ Yes</span> : <span className="text-red-500">✗ No</span>}</span>
            </div>
            {trade.mistake && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mistake:</span>
                <span className="font-medium text-red-500">{trade.mistake}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {trade.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-muted-foreground">{trade.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
